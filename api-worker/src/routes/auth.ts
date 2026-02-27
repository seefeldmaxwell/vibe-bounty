import { Hono } from "hono";
import type { Env } from "../index";
import { stripHtml } from "../middleware/sanitize";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

function toHex(buf: ArrayBuffer): string {
  return Array.from(new Uint8Array(buf)).map((b) => b.toString(16).padStart(2, "0")).join("");
}

async function hashPassword(password: string, salt?: string): Promise<string> {
  const encoder = new TextEncoder();
  const saltBytes = salt
    ? new Uint8Array(salt.match(/.{2}/g)!.map((h) => parseInt(h, 16)))
    : crypto.getRandomValues(new Uint8Array(16));
  const saltHex = salt || toHex(saltBytes.buffer);

  const keyMaterial = await crypto.subtle.importKey(
    "raw",
    encoder.encode(password),
    "PBKDF2",
    false,
    ["deriveBits"]
  );
  const derived = await crypto.subtle.deriveBits(
    { name: "PBKDF2", salt: saltBytes, iterations: 100_000, hash: "SHA-256" },
    keyMaterial,
    256
  );
  return `${saltHex}:${toHex(derived)}`;
}

async function verifyPassword(password: string, stored: string): Promise<boolean> {
  if (stored.includes(":")) {
    // PBKDF2 format: salt:hash
    const [salt] = stored.split(":");
    const computed = await hashPassword(password, salt);
    return computed === stored;
  }
  // Legacy SHA-256 format (no salt) — for backward compat
  const encoder = new TextEncoder();
  const hash = await crypto.subtle.digest("SHA-256", encoder.encode(password));
  return toHex(hash) === stored;
}

async function createSession(db: D1Database, userId: string): Promise<string> {
  const sessionId = generateId();
  const expiresAt = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString();
  await db
    .prepare("INSERT INTO sessions (id, user_id, expires_at) VALUES (?, ?, ?)")
    .bind(sessionId, userId, expiresAt)
    .run();
  return sessionId;
}

function stripSensitive(user: any) {
  if (!user) return user;
  const { password_hash, ...safe } = user;
  return safe;
}

export function authRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Google OAuth callback
  router.post("/google", async (c) => {
    const { code, redirect_uri } = await c.req.json<{ code: string; redirect_uri: string }>();
    if (!code) return c.json({ error: "Missing code" }, 400);

    // Exchange code for access token
    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: c.env.GOOGLE_CLIENT_ID,
        client_secret: c.env.GOOGLE_CLIENT_SECRET,
        redirect_uri: redirect_uri || "",
        grant_type: "authorization_code",
      }),
    });

    const tokenData = await tokenRes.json<{ access_token?: string; error?: string }>();
    if (!tokenData.access_token) {
      return c.json({ error: "Google OAuth failed" }, 401);
    }

    // Get Google user info
    const userRes = await fetch("https://www.googleapis.com/oauth2/v2/userinfo", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const gUser = await userRes.json<{
      id: string;
      email: string;
      name: string;
      picture: string;
    }>();

    const db = c.env.DB;
    const googleId = gUser.id;

    // Check if user exists by google_id or email
    let user = await db
      .prepare("SELECT * FROM users WHERE google_id = ?")
      .bind(googleId)
      .first();

    if (!user && gUser.email) {
      user = await db
        .prepare("SELECT * FROM users WHERE email = ?")
        .bind(gUser.email)
        .first();
      if (user) {
        // Link Google account to existing user
        await db
          .prepare("UPDATE users SET google_id = ?, avatar_url = COALESCE(avatar_url, ?) WHERE id = ?")
          .bind(googleId, gUser.picture, user.id)
          .run();
        user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first();
      }
    }

    if (!user) {
      // Create new user
      const id = generateId();
      const username = gUser.email
        ? gUser.email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 39)
        : `user_${id.slice(0, 8)}`;
      await db
        .prepare(
          "INSERT INTO users (id, google_id, email, username, display_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(id, googleId, gUser.email, username, gUser.name || username, gUser.picture)
        .run();
      user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
    }

    const sessionToken = await createSession(db, user!.id as string);

    return c.json({ user: stripSensitive(user), token: sessionToken });
  });

  // Microsoft OAuth callback
  router.post("/microsoft", async (c) => {
    const { code, redirect_uri } = await c.req.json<{ code: string; redirect_uri: string }>();
    if (!code) return c.json({ error: "Missing code" }, 400);

    // Exchange code for access token
    const tokenRes = await fetch("https://login.microsoftonline.com/common/oauth2/v2.0/token", {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        code,
        client_id: c.env.MS_CLIENT_ID,
        client_secret: c.env.MS_CLIENT_SECRET,
        redirect_uri: redirect_uri || "",
        grant_type: "authorization_code",
        scope: "openid profile email User.Read",
      }),
    });

    const tokenData = await tokenRes.json<{ access_token?: string; error?: string }>();
    if (!tokenData.access_token) {
      return c.json({ error: "Microsoft OAuth failed" }, 401);
    }

    // Get Microsoft user info
    const userRes = await fetch("https://graph.microsoft.com/v1.0/me", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const msUser = await userRes.json<{
      id: string;
      displayName: string;
      mail: string;
      userPrincipalName: string;
    }>();

    const db = c.env.DB;
    const microsoftId = msUser.id;
    const email = msUser.mail || msUser.userPrincipalName;

    // Check if user exists by microsoft_id or email
    let user = await db
      .prepare("SELECT * FROM users WHERE microsoft_id = ?")
      .bind(microsoftId)
      .first();

    if (!user && email) {
      user = await db
        .prepare("SELECT * FROM users WHERE email = ?")
        .bind(email)
        .first();
      if (user) {
        // Link Microsoft account to existing user
        await db
          .prepare("UPDATE users SET microsoft_id = ? WHERE id = ?")
          .bind(microsoftId, user.id)
          .run();
        user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(user.id).first();
      }
    }

    if (!user) {
      // Create new user
      const id = generateId();
      const username = email
        ? email.split("@")[0].replace(/[^a-zA-Z0-9_-]/g, "_").slice(0, 39)
        : `user_${id.slice(0, 8)}`;
      const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`;
      await db
        .prepare(
          "INSERT INTO users (id, microsoft_id, email, username, display_name, avatar_url) VALUES (?, ?, ?, ?, ?, ?)"
        )
        .bind(id, microsoftId, email, username, msUser.displayName || username, avatarUrl)
        .run();
      user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
    }

    const sessionToken = await createSession(db, user!.id as string);

    return c.json({ user: stripSensitive(user), token: sessionToken });
  });

  // Email signup
  router.post("/signup", async (c) => {
    const { username, email, password, role } = await c.req.json<{
      username: string;
      email: string;
      password: string;
      role?: string;
    }>();

    if (!username || !email || !password) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Validate inputs
    if (username.length < 2 || username.length > 39) return c.json({ error: "Username must be 2-39 characters" }, 400);
    if (!/^[a-zA-Z0-9_-]+$/.test(username)) return c.json({ error: "Username can only contain letters, numbers, hyphens, and underscores" }, 400);
    if (password.length < 8) return c.json({ error: "Password must be at least 8 characters" }, 400);
    if (password.length > 128) return c.json({ error: "Password too long" }, 400);

    const db = c.env.DB;

    // Check uniqueness
    const existing = await db
      .prepare("SELECT id FROM users WHERE username = ? OR email = ?")
      .bind(username, email)
      .first();
    if (existing) {
      return c.json({ error: "Username or email already taken" }, 409);
    }

    const id = generateId();
    const passwordHash = await hashPassword(password);
    const userRole = role && ["poster", "builder", "both"].includes(role) ? role : "builder";
    const cleanUsername = stripHtml(username);
    const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${cleanUsername}`;

    await db
      .prepare(
        "INSERT INTO users (id, email, username, display_name, avatar_url, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(id, email, cleanUsername, cleanUsername, avatarUrl, userRole, passwordHash)
      .run();

    const user = await db.prepare("SELECT * FROM users WHERE id = ?").bind(id).first();
    const sessionToken = await createSession(db, id);

    return c.json({ user: stripSensitive(user), token: sessionToken }, 201);
  });

  // Email login
  router.post("/login", async (c) => {
    const { email, password } = await c.req.json<{
      email: string;
      password: string;
    }>();

    if (!email || !password) {
      return c.json({ error: "Missing credentials" }, 400);
    }

    const db = c.env.DB;

    const user = await db
      .prepare("SELECT * FROM users WHERE email = ?")
      .bind(email)
      .first();

    if (!user || !user.password_hash) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const valid = await verifyPassword(password, user.password_hash as string);
    if (!valid) {
      return c.json({ error: "Invalid credentials" }, 401);
    }

    const sessionToken = await createSession(db, user.id as string);
    return c.json({ user: stripSensitive(user), token: sessionToken });
  });

  // Get current user
  router.get("/me", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare("SELECT * FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(token)
      .first();

    if (!session) return c.json({ error: "Session expired" }, 401);

    const user = await db
      .prepare("SELECT id, google_id, microsoft_id, email, username, display_name, avatar_url, bio, role, reputation, total_earned, total_posted, github_url, portfolio_url, created_at FROM users WHERE id = ?")
      .bind(session.user_id)
      .first();

    return c.json(user);
  });

  return router;
}
