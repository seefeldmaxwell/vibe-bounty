import { Hono } from "hono";
import type { Env } from "../index";
import { stripHtml } from "../middleware/sanitize";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function submissionRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // List submissions (by bounty or by user)
  router.get("/", async (c) => {
    const db = c.env.DB;
    const bountyId = c.req.query("bounty_id");
    const builderId = c.req.query("builder_id");
    const limit = Math.min(parseInt(c.req.query("limit") || "50"), 100);
    const offset = parseInt(c.req.query("offset") || "0");

    let query =
      "SELECT s.*, u.username as builder_username, u.display_name as builder_display_name, u.avatar_url as builder_avatar_url, b.title as bounty_title FROM submissions s LEFT JOIN users u ON s.builder_id = u.id LEFT JOIN bounties b ON s.bounty_id = b.id WHERE 1=1";
    const params: (string | number)[] = [];

    if (bountyId) {
      query += " AND s.bounty_id = ?";
      params.push(bountyId);
    }

    if (builderId) {
      query += " AND s.builder_id = ?";
      params.push(builderId);
    }

    query += " ORDER BY s.submitted_at DESC LIMIT ? OFFSET ?";
    params.push(limit, offset);

    const { results } = await db.prepare(query).bind(...params).all();

    const submissions = results.map((s: Record<string, unknown>) => ({
      ...s,
      tech_used: s.tech_used ? JSON.parse(s.tech_used as string) : [],
    }));

    return c.json(submissions);
  });

  // Get single submission
  router.get("/:id", async (c) => {
    const db = c.env.DB;
    const id = c.req.param("id");

    const submission = await db
      .prepare(
        "SELECT s.*, u.username as builder_username, u.display_name as builder_display_name, u.avatar_url as builder_avatar_url, u.reputation as builder_reputation, u.total_earned as builder_total_earned, b.title as bounty_title, b.budget_min as bounty_budget_min, b.budget_max as bounty_budget_max FROM submissions s LEFT JOIN users u ON s.builder_id = u.id LEFT JOIN bounties b ON s.bounty_id = b.id WHERE s.id = ?"
      )
      .bind(id)
      .first();

    if (!submission) return c.json({ error: "Submission not found" }, 404);

    return c.json({
      ...submission,
      tech_used: submission.tech_used
        ? JSON.parse(submission.tech_used as string)
        : [],
    });
  });

  // Create submission
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

    const body = await c.req.json<{
      bounty_id: string;
      title?: string;
      description?: string;
      repo_url?: string;
      preview_url?: string;
      tech_used?: string[];
    }>();

    if (!body.bounty_id) {
      return c.json({ error: "Missing bounty_id" }, 400);
    }

    // Input validation
    if (body.title && body.title.length > 200) return c.json({ error: "Title too long (max 200 chars)" }, 400);
    if (body.description && body.description.length > 5000) return c.json({ error: "Description too long" }, 400);

    // Check bounty exists and is open - use atomic update to prevent race condition
    const bounty = await db
      .prepare("SELECT * FROM bounties WHERE id = ?")
      .bind(body.bounty_id)
      .first();
    if (!bounty) return c.json({ error: "Bounty not found" }, 404);
    if (bounty.status !== "open")
      return c.json({ error: "Bounty is not accepting submissions" }, 400);
    if (
      (bounty.submission_count as number) >=
      (bounty.max_submissions as number)
    ) {
      return c.json({ error: "Bounty has reached max submissions" }, 400);
    }

    // Check for duplicate submission from same builder
    const existing = await db
      .prepare("SELECT id FROM submissions WHERE bounty_id = ? AND builder_id = ?")
      .bind(body.bounty_id, session.user_id)
      .first();
    if (existing) return c.json({ error: "You already submitted to this bounty" }, 409);

    const id = generateId();

    // Validate and use the request URL to construct preview URL
    let previewUrl: string | null = null;
    if (body.preview_url) {
      try {
        const parsed = new URL(body.preview_url);
        if (parsed.protocol === "https:" || parsed.protocol === "http:") {
          previewUrl = body.preview_url;
        }
      } catch {
        return c.json({ error: "Invalid preview URL" }, 400);
      }
    }
    if (!previewUrl) {
      const origin = new URL(c.req.url).origin;
      previewUrl = `${origin}/preview/${id}/`;
    }

    await db.batch([
      db
        .prepare(
          `INSERT INTO submissions (id, bounty_id, builder_id, title, description, repo_url, tech_used, preview_url, status)
           VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'pending')`
        )
        .bind(
          id,
          body.bounty_id,
          session.user_id,
          body.title ? stripHtml(body.title) : null,
          body.description ? stripHtml(body.description) : null,
          body.repo_url || null,
          body.tech_used ? JSON.stringify(body.tech_used) : null,
          previewUrl
        ),
      db
        .prepare(
          "UPDATE bounties SET submission_count = submission_count + 1, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(body.bounty_id),
    ]);

    const submission = await db
      .prepare("SELECT * FROM submissions WHERE id = ?")
      .bind(id)
      .first();
    return c.json(submission, 201);
  });

  // Update submission
  router.put("/:id", async (c) => {
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

    const id = c.req.param("id");
    const submission = await db
      .prepare("SELECT * FROM submissions WHERE id = ?")
      .bind(id)
      .first();
    if (!submission) return c.json({ error: "Submission not found" }, 404);
    if (submission.builder_id !== session.user_id)
      return c.json({ error: "Forbidden" }, 403);

    const body = await c.req.json<Record<string, unknown>>();
    const allowedFields = new Set(["title", "description", "repo_url", "preview_url"]);
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.has(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      } else if (key === "tech_used") {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      }
    }

    if (updates.length === 0) return c.json({ error: "Nothing to update" }, 400);

    values.push(id);
    await db
      .prepare(`UPDATE submissions SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await db
      .prepare("SELECT * FROM submissions WHERE id = ?")
      .bind(id)
      .first();
    return c.json(updated);
  });

  // Score a submission (poster only)
  router.post("/:id/score", async (c) => {
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

    const id = c.req.param("id");
    const { score, feedback } = await c.req.json<{
      score: number;
      feedback?: string;
    }>();

    if (typeof score !== "number" || score < 1 || score > 10)
      return c.json({ error: "Score must be between 1 and 10" }, 400);

    // Verify poster owns the bounty
    const submission = await db
      .prepare(
        "SELECT s.*, b.poster_id FROM submissions s JOIN bounties b ON s.bounty_id = b.id WHERE s.id = ?"
      )
      .bind(id)
      .first();

    if (!submission) return c.json({ error: "Submission not found" }, 404);
    if (submission.poster_id !== session.user_id)
      return c.json({ error: "Only the bounty poster can score submissions" }, 403);

    await db
      .prepare(
        "UPDATE submissions SET score = ?, feedback = ?, reviewed_at = datetime('now') WHERE id = ?"
      )
      .bind(score, feedback ? stripHtml(feedback) : null, id)
      .run();

    return c.json({ success: true });
  });

  return router;
}
