import "server-only";
import { createHmac } from "node:crypto";
import { headers } from "next/headers";
import { db } from "./db";
import { siteUrl } from "./config";
export async function guard(action: string, limit = 5) {
  const h = await headers();
  const origin = h.get("origin");
  if (origin !== new URL(siteUrl).origin) throw new Error("ORIGIN");
  if (!process.env.RATE_LIMIT_SECRET) throw new Error("SERVICE_UNAVAILABLE");
  // Vercel overwrites x-vercel-forwarded-for. On other hosts, use a trusted proxy
  // that strips user-supplied IP headers; otherwise requests share a safe global bucket.
  const ip = process.env.VERCEL
    ? h.get("x-vercel-forwarded-for") || "unknown"
    : "local-shared";
  const key = createHmac("sha256", process.env.RATE_LIMIT_SECRET)
    .update(action + ":" + ip)
    .digest("hex");
  const { data, error } = await db().rpc("consume_rate", {
    p_key: key,
    p_limit: limit,
    p_seconds: 900,
  });
  if (error) throw new Error("SERVICE_UNAVAILABLE");
  if (!data) throw new Error("RATE_LIMIT");
}
export { csvCell } from "./csv";
