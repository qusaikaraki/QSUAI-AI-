import assert from "node:assert/strict";
import { createServerClient } from "@supabase/ssr";
const jar = new Map();
const auth = createServerClient("http://127.0.0.1:54321", "local-test-anon", {
  cookies: {
    getAll: () => [...jar].map(([name, value]) => ({ name, value })),
    setAll: (values) =>
      values.forEach(({ name, value }) => jar.set(name, value)),
  },
});
const { error } = await auth.auth.signInWithPassword({
  email: "admin@example.test",
  password: "Local-test-only-2026!",
});
assert.equal(error, null);
const origin = "http://127.0.0.1:3001";
const headers = {
  Cookie: [...jar].map(([k, v]) => k + "=" + v).join("; "),
  Origin: origin,
  "Content-Type": "application/json",
};
const response = await fetch(
  origin + "/api/admin/export?registration_status=approved",
  { headers },
);
assert.equal(response.status, 200);
assert.ok(response.headers.get("content-type").includes("text/csv"));
assert.ok(
  response.headers.get("content-disposition").includes("registrations.csv"),
);
const bytes = new Uint8Array(await response.arrayBuffer());
assert.deepEqual([...bytes.slice(0, 3)], [239, 187, 191]);
const csv = new TextDecoder().decode(bytes);
assert.equal(csv.trim().split("\r\n").length, 2);
assert.ok(csv.includes("student1@example.test"));
const id = csv.split("\r\n")[1].split(",")[0].replaceAll('"', "");
console.log("PASS authenticated filtered CSV with UTF-8 BOM and correct row");
const result = await fetch(origin + "/api/admin/emails", {
  method: "POST",
  headers,
  body: JSON.stringify({
    registration_id: id,
    template: "reminder",
    instructions: "اختبار محلي: موعد الجلسة سيحدد في هذا المثال التجريبي.",
  }),
});
assert.equal(result.status, 200);
console.log("PASS approved-student reminder queued");
const forgedOrigin = await fetch(origin + "/api/admin/registration", {
  method: "POST",
  headers: { ...headers, Origin: "https://untrusted.example" },
  body: JSON.stringify({
    id,
    status: "approved",
    payment: "scholarship",
    note: "",
  }),
});
assert.ok(forgedOrigin.status >= 400);
console.log("PASS cross-origin mutation rejected");
const inbox = await fetch(origin + "/admin/messages", { headers });
assert.ok((await inbox.text()).includes("contact@example.test"));
console.log("PASS contact visible in protected inbox");
console.log("Admin HTTP QA complete.");
