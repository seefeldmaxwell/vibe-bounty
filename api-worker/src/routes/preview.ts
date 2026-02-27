import { Hono } from "hono";
import type { Env } from "../index";

export function previewRoutes() {
  const router = new Hono<{ Bindings: Env }>();

  // Serve submission preview files from R2
  // URL: /preview/{submission-id}/{path}
  router.get("/:submissionId/*", async (c) => {
    const submissionId = c.req.param("submissionId");
    const path = c.req.path.replace(`/preview/${submissionId}/`, "") || "index.html";
    const r2Key = `submissions/${submissionId}/${path}`;

    const object = await c.env.R2.get(r2Key);

    if (!object) {
      // Try index.html for directory requests
      if (!path.includes(".")) {
        const indexKey = `submissions/${submissionId}/${path ? path + "/" : ""}index.html`;
        const indexObject = await c.env.R2.get(indexKey);
        if (indexObject) {
          return new Response(indexObject.body, {
            headers: {
              "Content-Type": "text/html",
              "Cache-Control": "public, max-age=300",
            },
          });
        }
      }

      return new Response("File not found", { status: 404 });
    }

    // Determine content type
    const contentType = getContentType(path);

    return new Response(object.body, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=300",
        "Access-Control-Allow-Origin": "*",
      },
    });
  });

  // Bare submission root
  router.get("/:submissionId", async (c) => {
    const submissionId = c.req.param("submissionId");
    const r2Key = `submissions/${submissionId}/index.html`;
    const object = await c.env.R2.get(r2Key);

    if (!object) {
      return new Response(
        `<html><body style="background:#0a0a0a;color:#f0f0f0;font-family:monospace;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0"><div style="text-align:center"><h1 style="color:#8B5CF6">Preview Not Available</h1><p>This submission hasn't been deployed yet.</p></div></body></html>`,
        { headers: { "Content-Type": "text/html" }, status: 404 }
      );
    }

    return new Response(object.body, {
      headers: {
        "Content-Type": "text/html",
        "Cache-Control": "public, max-age=300",
      },
    });
  });

  return router;
}

function getContentType(path: string): string {
  const ext = path.split(".").pop()?.toLowerCase();
  const types: Record<string, string> = {
    html: "text/html",
    css: "text/css",
    js: "application/javascript",
    mjs: "application/javascript",
    json: "application/json",
    png: "image/png",
    jpg: "image/jpeg",
    jpeg: "image/jpeg",
    gif: "image/gif",
    svg: "image/svg+xml",
    ico: "image/x-icon",
    woff: "font/woff",
    woff2: "font/woff2",
    ttf: "font/ttf",
    eot: "application/vnd.ms-fontobject",
    webp: "image/webp",
    mp4: "video/mp4",
    webm: "video/webm",
    txt: "text/plain",
    xml: "application/xml",
    pdf: "application/pdf",
    zip: "application/zip",
    map: "application/json",
  };
  return types[ext || ""] || "application/octet-stream";
}
