import { Hono } from "hono";
import type { Env } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hash = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hash))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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

  // GitHub OAuth callback
  router.post("/github", async (c) => {
    const { code } = await c.req.json<{ code: string }>();
    if (!code) return c.json({ error: "Missing code" }, 400);

    // Exchange code for access token
    const tokenRes = await fetch("https://github.com/login/oauth/access_token", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify({
        client_id: c.env.GITHUB_CLIENT_ID,
        client_secret: c.env.GITHUB_CLIENT_SECRET,
        code,
      }),
    });

    const tokenData = await tokenRes.json<{ access_token?: string; error?: string }>();
    if (!tokenData.access_token) {
      return c.json({ error: "GitHub OAuth failed" }, 401);
    }

    // Get GitHub user info
    const userRes = await fetch("https://api.github.com/user", {
      headers: { Authorization: `Bearer ${tokenData.access_token}` },
    });
    const ghUser = await userRes.json<{
      id: number;
      login: string;
      name: string;
      avatar_url: string;
      bio: string;
      html_url: string;
    }>();

    const db = c.env.DB;
    const githubId = String(ghUser.id);

    // Check if user exists
    let user = await db
      .prepare("SELECT * FROM users WHERE github_id = ?")
      .bind(githubId)
      .first();

    if (!user) {
      // Create new user
      const id = generateId();
      await db
        .prepare(
          "INSERT INTO users (id, github_id, username, display_name, avatar_url, bio, github_url) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(id, githubId, ghUser.login, ghUser.name, ghUser.avatar_url, ghUser.bio, ghUser.html_url)
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
    const avatarUrl = `https://api.dicebear.com/9.x/bottts-neutral/svg?seed=${username}`;

    await db
      .prepare(
        "INSERT INTO users (id, email, username, display_name, avatar_url, role, password_hash) VALUES (?, ?, ?, ?, ?, ?, ?)"
      )
      .bind(id, email, username, username, avatarUrl, userRole, passwordHash)
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
    const passwordHash = await hashPassword(password);

    const user = await db
      .prepare("SELECT * FROM users WHERE email = ? AND password_hash = ?")
      .bind(email, passwordHash)
      .first();

    if (!user) {
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
      .prepare("SELECT * FROM users WHERE id = ?")
      .bind(session.user_id)
      .first();

    return c.json(stripSensitive(user));
  });

  return router;
}
