import { Hono } from "hono";
import { cors } from "hono/cors";
import { authRoutes } from "./routes/auth";
import { bountyRoutes } from "./routes/bounties";
import { submissionRoutes } from "./routes/submissions";
import { commentRoutes } from "./routes/comments";
import { userRoutes } from "./routes/users";
import { uploadRoutes } from "./routes/upload";
import { previewRoutes } from "./routes/preview";

export type Env = {
  DB: D1Database;
  R2: R2Bucket;
  GITHUB_CLIENT_ID: string;
  GITHUB_CLIENT_SECRET: string;
  JWT_SECRET: string;
  FRONTEND_URL: string;
};

const app = new Hono<{ Bindings: Env }>();

// CORS
app.use(
  "*",
  cors({
    origin: ["http://localhost:3000", "https://vibe-bounty.pages.dev"],
    allowMethods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// Health check
app.get("/", (c) => c.json({ status: "ok", service: "vibe-bounty-api" }));

// Mount routes
app.route("/api/auth", authRoutes());
app.route("/api/bounties", bountyRoutes());
app.route("/api/submissions", submissionRoutes());
app.route("/api/comments", commentRoutes());
app.route("/api/users", userRoutes());
app.route("/api/upload", uploadRoutes());
app.route("/preview", previewRoutes());

// Stats endpoint
app.get("/api/stats", async (c) => {
  const db = c.env.DB;
  const [bounties, paid, builders, open] = await Promise.all([
    db.prepare("SELECT COUNT(*) as count FROM bounties").first<{ count: number }>(),
    db
      .prepare("SELECT COALESCE(SUM(awarded_amount), 0) as total FROM bounties WHERE awarded_amount IS NOT NULL")
      .first<{ total: number }>(),
    db
      .prepare("SELECT COUNT(DISTINCT builder_id) as count FROM submissions")
      .first<{ count: number }>(),
    db
      .prepare("SELECT COUNT(*) as count FROM bounties WHERE status = 'open'")
      .first<{ count: number }>(),
  ]);

  return c.json({
    total_bounties: bounties?.count || 0,
    total_paid_out: paid?.total || 0,
    active_builders: builders?.count || 0,
    open_bounties: open?.count || 0,
  });
});

// Leaderboard endpoint
app.get("/api/leaderboard", async (c) => {
  const db = c.env.DB;
  const type = c.req.query("type") || "builders";

  if (type === "builders") {
    const { results } = await db
      .prepare(
        "SELECT id, username, display_name, avatar_url, reputation, total_earned FROM users WHERE role IN ('builder', 'both') ORDER BY reputation DESC LIMIT 50"
      )
      .all();
    return c.json(results);
  } else {
    const { results } = await db
      .prepare(
        "SELECT id, username, display_name, avatar_url, reputation, total_posted FROM users WHERE role IN ('poster', 'both') ORDER BY total_posted DESC LIMIT 50"
      )
      .all();
    return c.json(results);
  }
});

// 404
app.notFound((c) => c.json({ error: "Not found" }, 404));

// Error handler
app.onError((err, c) => {
  console.error("API Error:", err);
  return c.json({ error: "Internal server error" }, 500);
});

export default app;
