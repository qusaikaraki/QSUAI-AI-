import { test } from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { PGlite } from "@electric-sql/pglite";
test("real PostgreSQL migrations: admissions, capacity, RLS, outbox and admin transactions", async () => {
  const sql = new PGlite();
  await sql.exec(
    `create role anon; create role authenticated; create role service_role;create schema auth;create table auth.users(id uuid primary key);create function auth.uid() returns uuid language sql as 'select null::uuid';`,
  );
  for (const file of ["001_academy.sql", "002_management.sql"]) {
    const migration = await readFile(
      process.cwd() + "/supabase/migrations/" + file,
      "utf8",
    );
    await sql.exec(
      migration.replace(
        "create extension if not exists pgcrypto;",
        "-- UUID generation is built into PostgreSQL/PGlite.",
      ),
    );
  }
  const cohort = "22222222-2222-4222-8222-222222222222";
  const adminId = "33333333-3333-4333-8333-333333333333";
  const student = {
    full_name: "اختبار فقط",
    email: "test@example.test",
    phone: "+970599000000",
    university: "جامعة اختبار",
    major: "هندسة",
    year: "السنة الأولى",
    ai_level: "أبدأ من الصفر",
    interests: ["الدراسة"],
    cohort_id: cohort,
  };
  const submit = async (email: string) =>
    sql.query<{ id: string }>(
      "select submit_registration($1::jsonb,$2) as id",
      [JSON.stringify({ ...student, email }), "admin@example.test"],
    );
  assert.equal((await sql.query("select * from registrations")).rows.length, 0);
  await assert.rejects(() => submit("closed@example.test"), /CLOSED/);
  await sql.exec(
    "update cohorts set state='open',registration_enabled=true,capacity=1,waitlist_enabled=false",
  );
  const first = (await submit("one@example.test")).rows[0].id;
  assert.equal(
    (
      await sql.query<{ registration_status: string }>(
        "select registration_status from registrations where id=$1",
        [first],
      )
    ).rows[0].registration_status,
    "pending",
  );
  await assert.rejects(() => submit("two@example.test"), /FULL/);
  await sql.exec("update cohorts set waitlist_enabled=true");
  await submit("two@example.test");
  assert.equal(
    (
      await sql.query<{ registration_status: string }>(
        "select registration_status from registrations where email='two@example.test'",
      )
    ).rows[0].registration_status,
    "waitlisted",
  );
  await assert.rejects(() => submit("one@example.test"), /duplicate key/);
  assert.equal((await sql.query("select * from email_outbox")).rows.length, 4);
  await assert.rejects(
    () =>
      sql.query("select update_registration($1,$2,$3,$4,$5)", [
        first,
        "approved",
        "pending",
        adminId,
        "",
      ]),
    /FORBIDDEN/,
  );
  await sql.query("insert into auth.users(id) values($1)", [adminId]);
  await sql.query("insert into profiles(id,role) values($1,'admin')", [
    adminId,
  ]);
  await sql.query("select update_registration($1,$2,$3,$4,$5)", [
    first,
    "approved",
    "received",
    adminId,
    "ملاحظة اختبار",
  ]);
  assert.equal((await sql.query("select * from admin_notes")).rows.length, 1);
  const waitId = (
    await sql.query<{ id: string }>(
      "select id from registrations where email='two@example.test'",
    )
  ).rows[0].id;
  await assert.rejects(
    () =>
      sql.query("select update_registration($1,$2,$3,$4,$5)", [
        waitId,
        "approved",
        "pending",
        adminId,
        "",
      ]),
    /FULL/,
  );
  await sql.query("select update_registration($1,$2,$3,$4,$5)", [
    first,
    "cancelled",
    "received",
    adminId,
    "",
  ]);
  await sql.query("select update_registration($1,$2,$3,$4,$5)", [
    waitId,
    "approved",
    "free",
    adminId,
    "",
  ]);
  await sql.exec("update cohorts set state='waitlist',waitlist_enabled=false");
  await assert.rejects(() => submit("three@example.test"), /FULL/);
  await sql.exec(
    "update cohorts set state='open',waitlist_enabled=true,deadline=now()-interval '1 minute'",
  );
  await assert.rejects(() => submit("four@example.test"), /CLOSED/);
  const rates = await sql.query<{ allowed: boolean }>(
    "select consume_rate('test',1,900) as allowed",
  );
  assert.equal(rates.rows[0].allowed, true);
  assert.equal(
    (
      await sql.query<{ allowed: boolean }>(
        "select consume_rate('test',1,900) as allowed",
      )
    ).rows[0].allowed,
    false,
  );
  const jobs = await sql.query("select * from claim_emails()");
  assert.ok(jobs.rows.length > 0);
  assert.equal(
    (await sql.query("select * from claim_emails()")).rows.length,
    0,
  );
  await sql.exec(
    "insert into email_outbox(recipient,template,payload,status,attempts,locked_at) values('interrupted@example.test','received','{}','processing',5,now()-interval '11 minutes')",
  );
  assert.equal(
    (await sql.query("select * from claim_emails()")).rows.length,
    0,
  );
  assert.deepEqual(
    (
      await sql.query(
        "select status,last_error,locked_at from email_outbox where recipient='interrupted@example.test'",
      )
    ).rows[0],
    { status: "failed", last_error: "delivery_interrupted", locked_at: null },
  );
  await sql.exec("set role anon");
  await assert.rejects(
    () => sql.query("select * from registrations"),
    /permission denied/,
  );
  await assert.rejects(
    () => sql.query("select consume_rate('bypass',100,10)"),
    /permission denied/,
  );
  await sql.exec("reset role");
  await sql.close();
});
