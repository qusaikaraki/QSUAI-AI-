/** LOCAL QA ONLY. Real PostgreSQL engine; simulated Supabase transport/auth.
 * Never run this server for real students or expose it beyond loopback. */
if (process.env.NODE_ENV === "production")
  throw new Error("Test fixture cannot run in production");
import { PGlite } from "@electric-sql/pglite";
import { createServer } from "node:http";
import fs from "node:fs/promises";
import next from "next";
process.env.SUPABASE_URL = "http://127.0.0.1:54321";
process.env.SUPABASE_ANON_KEY = "local-test-anon";
process.env.SUPABASE_SERVICE_ROLE_KEY = "local-test-service";
process.env.RATE_LIMIT_SECRET = "local-test-only-secret-not-for-production";
process.env.NEXT_PUBLIC_SITE_URL = "http://127.0.0.1:3001";
process.env.ACADEMY_TEST_FIXTURE = "1";
delete process.env.RESEND_API_KEY;
const sql = new PGlite();
await sql.exec(
  "create role anon;create role authenticated;create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as 'select null::uuid';",
);
for (const file of ["001_academy.sql", "002_management.sql"])
  await sql.exec(
    (await fs.readFile("supabase/migrations/" + file, "utf8")).replace(
      "create extension if not exists pgcrypto;",
      "",
    ),
  );
const id = "33333333-3333-4333-8333-333333333333";
await sql.query("insert into auth.users values($1)", [id]);
await sql.query("insert into profiles(id,role) values($1,'admin')", [id]);
await sql.exec(
  "update cohorts set state='open',registration_enabled=true,waitlist_enabled=true,capacity=2,support_enabled=true",
);
const user = {
  id,
  email: "admin@example.test",
  role: "authenticated",
  aud: "authenticated",
  app_metadata: { provider: "email" },
  user_metadata: {},
  identities: [],
  created_at: new Date().toISOString(),
};
const jwt =
  [
    { alg: "HS256", typ: "JWT" },
    {
      sub: id,
      role: "authenticated",
      aud: "authenticated",
      exp: Math.floor(Date.now() / 1000) + 3600,
    },
  ]
    .map((v) => Buffer.from(JSON.stringify(v)).toString("base64url"))
    .join(".") + ".local-test-signature";
const tables = new Set([
  "profiles",
  "courses",
  "cohorts",
  "registrations",
  "contact_messages",
  "admin_notes",
  "email_outbox",
]);
const functions = new Set([
  "consume_rate",
  "submit_registration",
  "update_registration",
  "save_program",
  "claim_emails",
]);
const identifier = (v) => {
  if (!/^[a-z_]+$/.test(v)) throw new Error("invalid identifier");
  return '"' + v + '"';
};
createServer(async (req, res) => {
  const url = new URL(req.url, "http://127.0.0.1:54321");
  let body = "";
  for await (const chunk of req) body += chunk;
  const data = body ? JSON.parse(body) : {};
  const send = (status, payload, headers = {}) => {
    res.writeHead(status, { "Content-Type": "application/json", ...headers });
    res.end(req.method === "HEAD" ? "" : JSON.stringify(payload));
  };
  try {
    if (url.pathname === "/auth/v1/token") {
      if (
        data.email !== user.email ||
        data.password !== "Local-test-only-2026!"
      )
        return send(400, {
          error: "invalid_grant",
          error_description: "Invalid test credentials",
        });
      return send(200, {
        access_token: jwt,
        refresh_token: "local-refresh",
        expires_in: 3600,
        token_type: "bearer",
        user,
      });
    }
    if (url.pathname === "/auth/v1/user")
      return req.headers.authorization === `Bearer ${jwt}`
        ? send(200, user)
        : send(401, { message: "not authenticated" });
    if (url.pathname === "/auth/v1/logout") return send(200, {});
    if (url.pathname.startsWith("/rest/v1/rpc/")) {
      const name = url.pathname.split("/").pop();
      if (!functions.has(name)) return send(404, {});
      const keys = Object.keys(data);
      const values = keys.map((k) =>
        typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k],
      );
      const query = `select ${identifier(name)}(${keys.map((k, i) => `${identifier(k)} => $${i + 1}`).join(",")}) as result`;
      const result = await sql.query(query, values);
      return send(200, result.rows[0]?.result ?? null);
    }
    const table = url.pathname.split("/").pop();
    if (!tables.has(table)) return send(404, {});
    const values = [];
    const conditions = [];
    for (const [key, value] of url.searchParams) {
      if (["select", "order", "offset", "limit", "or"].includes(key)) continue;
      const dot = value.indexOf(".");
      const op = value.slice(0, dot),
        v = value.slice(dot + 1);
      if (op === "in") {
        const items = v.slice(1, -1).split(",");
        conditions.push(
          `${identifier(key)} in (${items
            .map((x) => {
              values.push(x);
              return "$" + values.length;
            })
            .join(",")})`,
        );
      } else {
        const operator = { eq: "=", gte: ">=", lte: "<=", ilike: "ilike" }[op];
        if (!operator) throw new Error("unsupported operator");
        values.push(v);
        conditions.push(`${identifier(key)} ${operator} $${values.length}`);
      }
    }
    const or = url.searchParams.get("or");
    if (or) {
      const parts = or
        .slice(1, -1)
        .split(",")
        .map((part) => {
          const [key, , ...rest] = part.split(".");
          values.push(rest.join("."));
          return `${identifier(key)} ilike $${values.length}`;
        });
      conditions.push("(" + parts.join(" or ") + ")");
    }
    const where = conditions.length ? " where " + conditions.join(" and ") : "";
    if (req.method === "POST") {
      const keys = Object.keys(data);
      const result = await sql.query(
        `insert into ${identifier(table)}(${keys.map(identifier)}) values(${keys.map((k, i) => "$" + (i + 1))}) returning *`,
        keys.map((k) =>
          typeof data[k] === "object" ? JSON.stringify(data[k]) : data[k],
        ),
      );
      return send(201, result.rows);
    }
    if (req.method === "PATCH") {
      const keys = Object.keys(data);
      const set = keys.map((k) => {
        values.push(data[k]);
        return `${identifier(k)}=$${values.length}`;
      });
      await sql.query(
        `update ${identifier(table)} set ${set.join(",")}${where}`,
        values,
      );
      return send(200, []);
    }
    const selected = url.searchParams.get("select") || "*";
    const columns =
      selected === "*" ? "*" : selected.split(",").map(identifier).join(",");
    const count = (
      await sql.query(
        `select count(*) as n from ${identifier(table)}${where}`,
        values,
      )
    ).rows[0].n;
    const order = url.searchParams.get("order");
    const orderSql = order
      ? ` order by ${identifier(order.split(".")[0])} ${order.includes(".desc") ? "desc" : "asc"}`
      : "";
    const offset = Number(url.searchParams.get("offset") || 0);
    const limit = Number(url.searchParams.get("limit") || 1000);
    const result = await sql.query(
      `select ${columns} from ${identifier(table)}${where}${orderSql} limit ${limit} offset ${offset}`,
      values,
    );
    const single = String(req.headers.accept).includes("vnd.pgrst.object");
    if (single && result.rows.length !== 1)
      return send(406, { message: "No single row" });
    return send(200, single ? result.rows[0] : result.rows, {
      "Content-Range": `${offset}-${Math.max(offset, offset + result.rows.length - 1)}/${count}`,
    });
  } catch (e) {
    return send(400, { message: e.message, code: e.code || "TEST_ERROR" });
  }
}).listen(54321, "127.0.0.1");
const app = next({
  dev: true,
  hostname: "127.0.0.1",
  port: 3001,
  webpack: true,
  conf: { distDir: ".next-fixture" },
});
await app.prepare();
createServer(app.getRequestHandler()).listen(3001, "127.0.0.1", () =>
  console.log("LOCAL TEST FIXTURE ONLY: http://127.0.0.1:3001"),
);
