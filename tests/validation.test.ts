import { test } from "node:test";
import assert from "node:assert/strict";
import {
  registrationSchema,
  contactSchema,
  courseSchema,
} from "../lib/validation";
import { csvCell } from "../lib/csv";
import { emailTemplate } from "../lib/email-templates";
const valid = {
  full_name: "طالب اختبار",
  email: "STUDENT@example.test",
  phone: "+970 599 000 000",
  university: "جامعة اختبار",
  major: "الهندسة",
  year: "السنة الأولى",
  city: "",
  age: "",
  ai_level: "أبدأ من الصفر",
  interests: ["الدراسة"],
  motivation: "",
  support_requested: false,
  consent: true,
  website: "",
  cohort_id: "22222222-2222-4222-8222-222222222222",
};
test("Arabic registration accepts beginner without programming and normalizes email", () => {
  assert.equal(registrationSchema.parse(valid).email, "student@example.test");
});
test("invalid email, age, missing consent, unknown interests and spam are rejected", () => {
  for (const input of [
    { email: "bad" },
    { age: "12" },
    { consent: false },
    { interests: ["invalid"] },
    { website: "spam" },
    { full_name: "<script>" },
    { year: "" },
    { phone: "hello" },
    { phone: "--------" },
    { phone: "()()()()" },
    { phone: "+1 (23) 4567" },
    { phone: "+1234567890123456" },
  ])
    assert.equal(
      registrationSchema.safeParse({ ...valid, ...input }).success,
      false,
    );
});
test("phone formatting preserves a valid international digit count", () => {
  for (const phone of ["+970 (599) 000-000", "+123456789012345", "12345678"])
    assert.equal(
      registrationSchema.safeParse({ ...valid, phone }).success,
      true,
    );
});
test("contact input rejects short messages and markup", () => {
  assert.equal(
    contactSchema.safeParse({
      name: "اختبار",
      email: "test@example.test",
      subject: "استفسار",
      message: "قصير",
      website: "",
    }).success,
    false,
  );
});
test("CSV cells neutralize formulas and quote embedded delimiters", () => {
  assert.equal(csvCell("=1+1"), '"\'=1+1"');
  assert.equal(csvCell(" +cmd"), '"\' +cmd"');
  assert.equal(csvCell('a,"b"'), '"a,""b"""');
});
test("all RTL email templates escape untrusted student input", () => {
  for (const template of [
    "received",
    "approved",
    "waitlisted",
    "reminder",
    "starting",
    "admin",
  ]) {
    const result = emailTemplate(template, {
      name: "<img onerror=x>",
      course_name: "اختبار",
      registration_id: "test",
    });
    assert.ok(result.html.includes('dir="rtl"'));
    assert.ok(!result.html.includes("<img"));
    assert.ok(result.subject.length > 0);
  }
});
test("course management rejects reversed dates and insecure meeting links", () => {
  const base = {
    name: "برنامج اختبار",
    description: "وصف واضح ومفيد للبرنامج",
    start_date: "2026-10-10",
    end_date: "2026-10-01",
    days: "",
    time: "",
    timezone: "Asia/Hebron",
    sessions: null,
    session_minutes: null,
    capacity: 10,
    deadline: null,
    price: 0,
    currency: "ILS",
    state: "open",
    registration_enabled: true,
    waitlist_enabled: true,
    support_enabled: false,
    meeting_url: "",
    payment_instructions: "",
  };
  assert.equal(courseSchema.safeParse(base).success, false);
  assert.equal(
    courseSchema.safeParse({
      ...base,
      end_date: null,
      meeting_url: "http://bad.test",
    }).success,
    false,
  );
  assert.equal(
    courseSchema.safeParse({ ...base, end_date: null }).success,
    true,
  );
});
