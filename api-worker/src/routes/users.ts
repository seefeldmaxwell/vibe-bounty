import { Hono } from "hono";
import type { Env } from "../index";
import { stripHtml } from "../middleware/sanitize";

export function userRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Update own profile — must be before /:username to avoid route conflict
  router.put("/me", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare(
        "SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')"
      )
      .bind(token)
      .first<{ user_id: string }>();
    if (!session) return c.json({ error: "Session expired" }, 401);

    const body = await c.req.json<Record<string, unknown>>();

    // Validate lengths
    if (body.display_name && String(body.display_name).length > 100) return c.json({ error: "Display name too long (max 100 chars)" }, 400);
    if (body.bio && String(body.bio).length > 1000) return c.json({ error: "Bio too long (max 1000 chars)" }, 400);
    if (body.role && !["poster", "builder", "both"].includes(String(body.role))) return c.json({ error: "Invalid role" }, 400);

    const updates: string[] = [];
    const values: unknown[] = [];

    const textFields = new Set(["display_name", "bio"]);
    const urlFields = new Set(["avatar_url", "github_url", "portfolio_url"]);
    const enumFields = new Set(["role"]);

    for (const [key, value] of Object.entries(body)) {
      if (textFields.has(key) && typeof value === "string") {
        updates.push(`${key} = ?`);
        values.push(stripHtml(value));
      } else if (urlFields.has(key) && typeof value === "string") {
        updates.push(`${key} = ?`);
        values.push(value.trim());
      } else if (enumFields.has(key) && typeof value === "string") {
        updates.push(`${key} = ?`);
        values.push(value);
      }
    }

    if (updates.length === 0) return c.json({ error: "Nothing to update" }, 400);

    values.push(session.user_id);
    await db
      .prepare(`UPDATE users SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const user = await db
      .prepare("SELECT id, username, display_name, avatar_url, bio, role, reputation, total_earned, total_posted, github_url, portfolio_url, created_at FROM users WHERE id = ?")
      .bind(session.user_id)
      .first();
    return c.json(user);
  });

  // Get public profile
  router.get("/:username", async (c) => {
    const db = c.env.DB;
    const username = c.req.param("username");

    const user = await db
      .prepare(
        "SELECT id, username, display_name, avatar_url, bio, role, reputation, total_earned, total_posted, github_url, portfolio_url, created_at FROM users WHERE username = ?"
      )
      .bind(username)
      .first();

    if (!user) return c.json({ error: "User not found" }, 404);

    return c.json(user);
  });

  return router;
}
