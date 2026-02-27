import { Hono } from "hono";
import type { Env } from "../index";

function generateId() {
  return crypto.randomUUID().replace(/-/g, "").slice(0, 16);
}

export function uploadRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Upload submission files to R2
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

    const formData = await c.req.formData();
    const submissionId = formData.get("submission_id") as string;
    if (!submissionId) return c.json({ error: "Missing submission_id" }, 400);

    // Verify submission belongs to user
    const submission = await db
      .prepare("SELECT * FROM submissions WHERE id = ? AND builder_id = ?")
      .bind(submissionId, session.user_id)
      .first();
    if (!submission) return c.json({ error: "Submission not found" }, 404);

    const files = formData.getAll("files") as unknown as File[];
    if (files.length === 0) return c.json({ error: "No files uploaded" }, 400);

    const uploaded = [];

    for (const file of files) {
      const fileId = generateId();
      const r2Key = `submissions/${submissionId}/${file.name}`;

      // Upload to R2
      await c.env.R2.put(r2Key, file.stream(), {
        httpMetadata: {
          contentType: file.type || "application/octet-stream",
        },
      });

      // Save metadata
      await db
        .prepare(
          "INSERT INTO submission_files (id, submission_id, filename, path, size, content_type, r2_key) VALUES (?, ?, ?, ?, ?, ?, ?)"
        )
        .bind(fileId, submissionId, file.name, `/${file.name}`, file.size, file.type, r2Key)
        .run();

      uploaded.push({
        id: fileId,
        filename: file.name,
        size: file.size,
        r2_key: r2Key,
      });
    }

    // Update submission status to live
    await db
      .prepare(
        "UPDATE submissions SET status = 'live', deployed_at = datetime('now') WHERE id = ?"
      )
      .bind(submissionId)
      .run();

    return c.json({ uploaded, count: uploaded.length }, 201);
  });

  // Serve files from R2
  router.get("/files/:key{.+}", async (c) => {
    const key = c.req.param("key");
    const object = await c.env.R2.get(key);

    if (!object) return c.json({ error: "File not found" }, 404);

    const headers = new Headers();
    headers.set(
      "Content-Type",
      object.httpMetadata?.contentType || "application/octet-stream"
    );
    headers.set("Cache-Control", "public, max-age=3600");

    return new Response(object.body, { headers });
  });

  return router;
}
