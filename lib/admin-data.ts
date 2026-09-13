import "server-only";
import { db } from "./db";
export type Filters = Record<string, string | undefined>;
export function registrationQuery(filters: Filters) {
  let q = db()
    .from("registrations")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false });
  const search = (filters.q || "").replace(/[%_,.()\\]/g, "").slice(0, 120);
  if (search) q = q.or(`full_name.ilike.%${search}%,email.ilike.%${search}%`);
  for (const key of [
    "university",
    "major",
    "year",
    "ai_level",
    "registration_status",
  ])
    if (filters[key]) q = q.eq(key, filters[key]!.slice(0, 160));
  if (filters.from && /^\d{4}-\d{2}-\d{2}$/.test(filters.from))
    q = q.gte("created_at", filters.from + "T00:00:00Z");
  if (filters.to && /^\d{4}-\d{2}-\d{2}$/.test(filters.to))
    q = q.lte("created_at", filters.to + "T23:59:59.999Z");
  return q;
}
