import type { Context, Next } from "hono";

// Simple in-memory rate limiter (per-isolate)
// Effective for burst protection on Cloudflare Workers
const store = new Map<string, { count: number; resetAt: number }>();

export function rateLimit(options: {
  max: number;
  windowMs: number;
  keyPrefix?: string;
}) {
  return async (c: Context, next: Next) => {
    const ip =
      c.req.header("cf-connecting-ip") ||
      c.req.header("x-forwarded-for") ||
      "unknown";
    const key = `${options.keyPrefix || "rl"}:${ip}`;
    const now = Date.now();

    let entry = store.get(key);
    if (!entry || now > entry.resetAt) {
      entry = { count: 0, resetAt: now + options.windowMs };
      store.set(key, entry);
    }

    entry.count++;

    c.header("X-RateLimit-Limit", String(options.max));
    c.header(
      "X-RateLimit-Remaining",
      String(Math.max(0, options.max - entry.count))
    );
    c.header("X-RateLimit-Reset", String(Math.ceil(entry.resetAt / 1000)));

    if (entry.count > options.max) {
      return c.json(
        { error: "Too many requests. Please try again later." },
        429
      );
    }

    // Prune stale entries when map gets large
    if (store.size > 10000) {
      for (const [k, v] of store) {
        if (now > v.resetAt) store.delete(k);
      }
    }

    await next();
  };
}
