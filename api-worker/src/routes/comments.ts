import { Hono } from "hono";
import type { Env } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function commentRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // List comments for a bounty
  router.get("/:bountyId", async (c) => {
    const db = c.env.DB;
    const bountyId = c.req.param("bountyId");
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 200);
    const offset = parseInt(c.req.query("offset") || "0");

    const { results } = await db
      .prepare(
        "SELECT c.*, u.username, u.display_name, u.avatar_url FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.bounty_id = ? ORDER BY c.created_at ASC LIMIT ? OFFSET ?"
      )
      .bind(bountyId, limit, offset)
      .all();

    return c.json(results);
  });

  // Add comment
  router.post("/", async (c) => {
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

    const { bounty_id, submission_id, content } = await c.req.json<{
      bounty_id: string;
      submission_id?: string;
      content: string;
    }>();

    if (!bounty_id || !content) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    if (content.length > 5000) {
      return c.json({ error: "Comment too long (max 5000 chars)" }, 400);
    }

    // Verify bounty exists
    const bounty = await db.prepare("SELECT id, status FROM bounties WHERE id = ?").bind(bounty_id).first();
    if (!bounty) return c.json({ error: "Bounty not found" }, 404);

    const id = generateId();
    await db
      .prepare(
        "INSERT INTO comments (id, bounty_id, submission_id, user_id, content) VALUES (?, ?, ?, ?, ?)"
      )
      .bind(id, bounty_id, submission_id || null, session.user_id, content.trim())
      .run();

    const comment = await db
      .prepare(
        "SELECT c.*, u.username, u.display_name, u.avatar_url FROM comments c LEFT JOIN users u ON c.user_id = u.id WHERE c.id = ?"
      )
      .bind(id)
      .first();

    return c.json(comment, 201);
  });

  // Delete comment (owner only)
  router.delete("/:id", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(token)
      .first<{ user_id: string }>();
    if (!session) return c.json({ error: "Session expired" }, 401);

    const id = c.req.param("id");
    const comment = await db.prepare("SELECT * FROM comments WHERE id = ?").bind(id).first();
    if (!comment) return c.json({ error: "Comment not found" }, 404);
    if (comment.user_id !== session.user_id) return c.json({ error: "Forbidden" }, 403);

    await db.prepare("DELETE FROM comments WHERE id = ?").bind(id).run();
    return c.json({ success: true });
  });

  return router;
}
