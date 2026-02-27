import { Hono } from "hono";
import type { Env } from "../index";

export function userRoutes() {
  const router = new Hono<{ Bindings: Env }>();

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

  // Update own profile
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
    const updates: string[] = [];
    const values: unknown[] = [];

    const allowedFields = [
      "display_name",
      "bio",
      "avatar_url",
      "github_url",
      "portfolio_url",
      "role",
    ];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.includes(key)) {
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

  return router;
}
