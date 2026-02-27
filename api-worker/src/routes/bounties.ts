import { Hono } from "hono";
import type { Env } from "../index";
import { stripHtml } from "../middleware/sanitize";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

const VALID_CATEGORIES = ["landing-page", "web-app", "mobile-app", "api", "cli-tool", "game", "chrome-ext", "other"];
const VALID_DIFFICULTIES = ["beginner", "intermediate", "advanced", "expert"];

export function bountyRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // List bounties with filters
  router.get("/", async (c) => {
    const db = c.env.DB;
    const status = c.req.query("status") || "open";
    const category = c.req.query("category");
    const difficulty = c.req.query("difficulty");
    const posterId = c.req.query("poster_id");
    const sort = c.req.query("sort") || "newest";
    const search = c.req.query("search");
    const limit = Math.min(parseInt(c.req.query("limit") || "20"), 100);
    const offset = parseInt(c.req.query("offset") || "0");

    let query = "SELECT b.*, u.username as poster_username, u.avatar_url as poster_avatar FROM bounties b LEFT JOIN users u ON b.poster_id = u.id WHERE 1=1";
    const params: string[] = [];

    if (posterId) {
      query += " AND b.poster_id = ?";
      params.push(posterId);
    }

    if (status !== "all") {
      query += " AND b.status = ?";
      params.push(status);
    }

    if (category) {
      query += " AND b.category = ?";
      params.push(category);
    }

    if (difficulty) {
      query += " AND b.difficulty = ?";
      params.push(difficulty);
    }

    if (search) {
      query += " AND (b.title LIKE ? OR b.brief LIKE ? OR b.tags LIKE ?)";
      const term = `%${search}%`;
      params.push(term, term, term);
    }

    switch (sort) {
      case "highest":
        query += " ORDER BY b.budget_max DESC";
        break;
      case "deadline":
        query += " ORDER BY b.deadline ASC";
        break;
      case "submissions":
        query += " ORDER BY b.submission_count DESC";
        break;
      default:
        query += " ORDER BY b.created_at DESC";
    }

    query += " LIMIT ? OFFSET ?";
    params.push(String(limit), String(offset));

    const stmt = db.prepare(query);
    const { results } = await stmt.bind(...params).all();

    const bounties = results.map((b: Record<string, unknown>) => ({
      ...b,
      tags: b.tags ? JSON.parse(b.tags as string) : [],
      tech_stack: b.tech_stack ? JSON.parse(b.tech_stack as string) : [],
    }));

    return c.json(bounties);
  });

  // Get single bounty
  router.get("/:id", async (c) => {
    const db = c.env.DB;
    const id = c.req.param("id");

    const bounty = await db
      .prepare(
        "SELECT b.*, u.username as poster_username, u.display_name as poster_display_name, u.avatar_url as poster_avatar, u.bio as poster_bio, u.reputation as poster_reputation, u.total_posted as poster_total_posted FROM bounties b LEFT JOIN users u ON b.poster_id = u.id WHERE b.id = ?"
      )
      .bind(id)
      .first();

    if (!bounty) return c.json({ error: "Bounty not found" }, 404);

    return c.json({
      ...bounty,
      tags: bounty.tags ? JSON.parse(bounty.tags as string) : [],
      tech_stack: bounty.tech_stack ? JSON.parse(bounty.tech_stack as string) : [],
    });
  });

  // Create bounty
  router.post("/", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(token)
      .first<{ user_id: string }>();
    if (!session) return c.json({ error: "Session expired" }, 401);

    const body = await c.req.json<{
      title: string;
      brief: string;
      detailed_spec?: string;
      budget_min: number;
      budget_max: number;
      deadline?: string;
      category?: string;
      tags?: string[];
      tech_stack?: string[];
      difficulty?: string;
      max_submissions?: number;
      visibility?: string;
    }>();

    if (!body.title || !body.brief || !body.budget_min || !body.budget_max) {
      return c.json({ error: "Missing required fields" }, 400);
    }

    // Input validation
    if (body.title.length > 200) return c.json({ error: "Title too long (max 200 chars)" }, 400);
    if (body.brief.length > 2000) return c.json({ error: "Brief too long (max 2000 chars)" }, 400);
    if (body.budget_min < 0) return c.json({ error: "Budget minimum must be positive" }, 400);
    if (body.budget_max < body.budget_min) return c.json({ error: "Budget max must be >= budget min" }, 400);
    if (body.budget_max > 1000000) return c.json({ error: "Budget max exceeds limit" }, 400);
    if (body.category && !VALID_CATEGORIES.includes(body.category)) {
      return c.json({ error: "Invalid category" }, 400);
    }
    if (body.difficulty && !VALID_DIFFICULTIES.includes(body.difficulty)) {
      return c.json({ error: "Invalid difficulty" }, 400);
    }
    if (body.deadline) {
      const deadline = new Date(body.deadline);
      if (isNaN(deadline.getTime())) return c.json({ error: "Invalid deadline format" }, 400);
    }

    const id = generateId();

    await db
      .prepare(
        `INSERT INTO bounties (id, poster_id, title, brief, detailed_spec, budget_min, budget_max, deadline, category, tags, tech_stack, difficulty, max_submissions, visibility)
         VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
      )
      .bind(
        id,
        session.user_id,
        stripHtml(body.title),
        stripHtml(body.brief),
        body.detailed_spec ? stripHtml(body.detailed_spec) : null,
        body.budget_min,
        body.budget_max,
        body.deadline || null,
        body.category || null,
        body.tags ? JSON.stringify(body.tags) : null,
        body.tech_stack ? JSON.stringify(body.tech_stack) : null,
        body.difficulty || null,
        body.max_submissions || 50,
        body.visibility || "public"
      )
      .run();

    const bounty = await db.prepare("SELECT * FROM bounties WHERE id = ?").bind(id).first();
    return c.json(bounty, 201);
  });

  // Update bounty
  router.put("/:id", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(token)
      .first<{ user_id: string }>();
    if (!session) return c.json({ error: "Session expired" }, 401);

    const id = c.req.param("id");
    const bounty = await db.prepare("SELECT * FROM bounties WHERE id = ?").bind(id).first();
    if (!bounty) return c.json({ error: "Bounty not found" }, 404);
    if (bounty.poster_id !== session.user_id) return c.json({ error: "Forbidden" }, 403);

    const body = await c.req.json<Record<string, unknown>>();

    const allowedFields = new Set(["title", "brief", "detailed_spec", "budget_min", "budget_max", "deadline", "category", "difficulty", "max_submissions", "visibility", "status"]);
    const jsonFields = new Set(["tags", "tech_stack"]);
    const updates: string[] = [];
    const values: unknown[] = [];

    for (const [key, value] of Object.entries(body)) {
      if (allowedFields.has(key)) {
        updates.push(`${key} = ?`);
        values.push(value);
      } else if (jsonFields.has(key)) {
        updates.push(`${key} = ?`);
        values.push(JSON.stringify(value));
      }
    }

    if (updates.length === 0) return c.json({ error: "Nothing to update" }, 400);

    updates.push("updated_at = datetime('now')");
    values.push(id);

    await db
      .prepare(`UPDATE bounties SET ${updates.join(", ")} WHERE id = ?`)
      .bind(...values)
      .run();

    const updated = await db.prepare("SELECT * FROM bounties WHERE id = ?").bind(id).first();
    return c.json(updated);
  });

  // Delete (cancel) bounty
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
    const bounty = await db.prepare("SELECT * FROM bounties WHERE id = ?").bind(id).first();
    if (!bounty) return c.json({ error: "Bounty not found" }, 404);
    if (bounty.poster_id !== session.user_id) return c.json({ error: "Forbidden" }, 403);
    if (bounty.status === "awarded") return c.json({ error: "Cannot cancel an awarded bounty" }, 400);

    await db
      .prepare("UPDATE bounties SET status = 'cancelled', updated_at = datetime('now') WHERE id = ?")
      .bind(id)
      .run();

    return c.json({ success: true });
  });

  // Award bounty to a submission
  router.post("/:id/award", async (c) => {
    const token = c.req.header("Authorization")?.replace("Bearer ", "");
    if (!token) return c.json({ error: "Not authenticated" }, 401);

    const db = c.env.DB;
    const session = await db
      .prepare("SELECT user_id FROM sessions WHERE id = ? AND expires_at > datetime('now')")
      .bind(token)
      .first<{ user_id: string }>();
    if (!session) return c.json({ error: "Session expired" }, 401);

    const bountyId = c.req.param("id");
    const { submission_id } = await c.req.json<{
      submission_id: string;
    }>();

    if (!submission_id) return c.json({ error: "Missing submission_id" }, 400);

    const bounty = await db.prepare("SELECT * FROM bounties WHERE id = ?").bind(bountyId).first();
    if (!bounty) return c.json({ error: "Bounty not found" }, 404);
    if (bounty.poster_id !== session.user_id) return c.json({ error: "Forbidden" }, 403);
    if (bounty.status === "awarded") return c.json({ error: "Bounty already awarded" }, 400);
    if (bounty.status === "cancelled") return c.json({ error: "Cannot award a cancelled bounty" }, 400);

    const submission = await db
      .prepare("SELECT * FROM submissions WHERE id = ? AND bounty_id = ?")
      .bind(submission_id, bountyId)
      .first();
    if (!submission) return c.json({ error: "Submission not found" }, 404);

    const awardAmount = bounty.budget_max as number;

    // Award the bounty using batch for atomicity
    await db.batch([
      db
        .prepare(
          "UPDATE bounties SET status = 'awarded', winner_id = ?, awarded_amount = ?, updated_at = datetime('now') WHERE id = ?"
        )
        .bind(submission_id, awardAmount, bountyId),
      db
        .prepare("UPDATE submissions SET status = 'winner', reviewed_at = datetime('now') WHERE id = ?")
        .bind(submission_id),
      db
        .prepare("UPDATE users SET total_earned = total_earned + ?, reputation = reputation + 100 WHERE id = ?")
        .bind(awardAmount, submission.builder_id),
      db
        .prepare("UPDATE users SET total_posted = total_posted + ? WHERE id = ?")
        .bind(awardAmount, session.user_id),
    ]);

    return c.json({ success: true, awarded_amount: awardAmount });
  });

  return router;
}
