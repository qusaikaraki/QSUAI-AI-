import "server-only";
import { createClient } from "@supabase/supabase-js";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { cache } from "react";
import { cohortDefault, courseDefault, type Cohort } from "./config";
export const configured = () =>
  !!(
    process.env.SUPABASE_URL &&
    process.env.SUPABASE_SERVICE_ROLE_KEY &&
    process.env.SUPABASE_ANON_KEY
  );
export function db() {
  if (!configured()) throw new Error("SERVICE_UNAVAILABLE");
  return createClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!,
    { auth: { persistSession: false, autoRefreshToken: false } },
  );
}
export async function auth() {
  const jar = await cookies();
  return createServerClient(
    process.env.SUPABASE_URL!,
    process.env.SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll: () => jar.getAll(),
        setAll(values) {
          try {
            values.forEach(({ name, value, options }) =>
              jar.set(name, value, {
                ...options,
                httpOnly: true,
                secure: process.env.NODE_ENV === "production",
                sameSite: "lax",
              }),
            );
          } catch {
            /* Server components cannot refresh cookies. Actions do. */
          }
        },
      },
    },
  );
}
export async function admin() {
  if (!configured()) return null;
  const client = await auth();
  const {
    data: { user },
  } = await client.auth.getUser();
  if (!user) return null;
  const { data } = await db()
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();
  return data?.role === "admin" ? user : null;
}
export const getProgram = cache(async () => {
  if (!configured())
    return { course: courseDefault, cohort: cohortDefault, connected: false };
  const client = db();
  const [{ data: course, error: a }, { data: cohort, error: b }] =
    await Promise.all([
      client
        .from("courses")
        .select("id,slug,name,description")
        .eq("id", courseDefault.id)
        .single(),
      client
        .from("cohorts")
        .select(
          "id,course_id,start_date,end_date,days,time,timezone,sessions,session_minutes,capacity,deadline,price,currency,state,registration_enabled,waitlist_enabled,support_enabled",
        )
        .eq("id", cohortDefault.id)
        .single(),
    ]);
  if (a || b)
    return { course: courseDefault, cohort: cohortDefault, connected: false };
  return {
    course: { ...courseDefault, ...course },
    cohort: cohort as Cohort,
    connected: true,
  };
});
