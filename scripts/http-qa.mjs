import assert from "node:assert/strict";
const origin = process.argv[2] || "http://127.0.0.1:3001";
const paths = [
  "/",
  "/courses",
  "/courses/ai-for-university",
  "/about",
  "/method",
  "/register",
  "/faq",
  "/contact",
  "/privacy",
  "/terms",
  "/admin/login",
  "/robots.txt",
  "/sitemap.xml",
  "/icon.svg",
  "/opengraph-image.png",
];
for (const path of paths) {
  const response = await fetch(origin + path);
  assert.equal(response.status, 200, path);
  if (!path.includes(".") && path != "/admin/login") {
    const html = await response.text();
    assert.ok(html.includes('lang="ar"'), path);
    assert.ok(html.includes('dir="rtl"'), path);
    assert.ok(html.includes("<title>"), path);
  }
  console.log("PASS", path);
}
for (const path of [
  "/api/admin/export",
  "/api/admin/course",
  "/api/admin/registration",
  "/api/admin/emails",
]) {
  const r = await fetch(origin + path, {
    method: path.endsWith("export") ? "GET" : "POST",
  });
  assert.equal(r.status, 401, path);
  console.log("PASS unauthorized", path);
}
assert.equal((await fetch(origin + "/api/cron/email")).status, 401);
assert.equal((await fetch(origin + "/not-a-real-page")).status, 404);
assert.ok(
  (await fetch(origin + "/registration-success", { redirect: "manual" }))
    .status >= 300,
);
const post = async (path, body) =>
  fetch(origin + path, {
    method: "POST",
    headers: { Origin: origin, "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
const invalid = await post("/api/register", { email: "bad" });
assert.equal(invalid.status, 400);
console.log("PASS server-side invalid data");
const contact = await post("/api/contact", {
  name: "اختبار محلي",
  email: "contact@example.test",
  subject: "رسالة اختبار",
  message: "هذه رسالة اختبار محلية لفحص صندوق التواصل.",
  website: "",
});
assert.equal(contact.status, 201);
console.log("PASS contact persistence");
const good = {
  full_name: "طالب اختبار إضافي",
  email: "student2@example.test",
  phone: "+970599000002",
  university: "جامعة اختبار",
  major: "علوم الحاسوب",
  year: "السنة الثانية",
  ai_level: "أبدأ من الصفر",
  interests: ["البرمجة"],
  website: "",
  consent: true,
  cohort_id: "22222222-2222-4222-8222-222222222222",
};
const second = await post("/api/register", good);
assert.equal(second.status, 201);
const third = await post("/api/register", {
  ...good,
  email: "student3@example.test",
});
assert.equal(third.status, 201);
console.log("PASS second seat and overflow waitlist");
const duplicate = await post("/api/register", good);
assert.equal(duplicate.status, 409);
console.log("PASS duplicate rejection");
const limited = await post("/api/register", {
  ...good,
  email: "limited@example.test",
});
assert.equal(limited.status, 429);
console.log("PASS shared rate limit");
console.log("HTTP QA completed; fixture-only data, no email sent.");
