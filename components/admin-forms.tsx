"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {
  statusLabels,
  paymentLabels,
  stateLabels,
  type Cohort,
} from "@/lib/config";
export function RegistrationReview({
  id,
  status,
  payment,
}: {
  id: string;
  status: string;
  payment: string;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="form-panel"
      style={{ marginTop: 25 }}
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        try {
          const fields = Object.fromEntries(new FormData(form));
          const response = await fetch("/api/admin/registration", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ ...fields, id }),
          });
          const data = await response.json();
          setMessage(response.ok ? "حُفظ التعديل بنجاح." : data.error);
          if (response.ok) {
            (form.elements.namedItem("note") as HTMLTextAreaElement).value = "";
            router.refresh();
          }
        } catch {
          setMessage("تعذّر الاتصال.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>مراجعة الطلب</h2>
      <div className="form-grid">
        <label className="field">
          حالة التسجيل
          <select name="status" defaultValue={status}>
            {Object.entries(statusLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field">
          حالة الدفع
          <select name="payment" defaultValue={payment}>
            {Object.entries(paymentLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field full-width">
          ملاحظة داخلية جديدة
          <textarea name="note" maxLength={3000} />
        </label>
      </div>
      <p style={{ fontSize: 13, marginTop: 14 }}>
        تغيير الحالة إلى «مقبول» أو «قائمة الانتظار» يضيف إشعارًا إلى بريد
        الطالب. الملاحظات داخلية.
      </p>
      <button className="button" style={{ marginTop: 20 }} disabled={busy}>
        {busy ? "جارٍ الحفظ…" : "حفظ التعديل"}
      </button>
      {message && (
        <p role="status" style={{ marginTop: 15 }}>
          {message}
        </p>
      )}
    </form>
  );
}
export function CourseManagement({
  course,
  cohort,
}: {
  course: { name: string; description: string };
  cohort: Cohort;
}) {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  const numeric = new Set(["sessions", "session_minutes", "capacity", "price"]);
  const dates = new Set(["start_date", "end_date", "deadline"]);
  const fields = [
    ["start_date", "تاريخ البداية", "date"],
    ["end_date", "تاريخ النهاية", "date"],
    ["days", "أيام الجلسات", "text"],
    ["time", "وقت الجلسة", "time"],
    ["timezone", "المنطقة الزمنية (IANA)", "text"],
    ["sessions", "عدد الجلسات", "number"],
    ["session_minutes", "مدة الجلسة بالدقائق", "number"],
    ["capacity", "سعة الدفعة", "number"],
    ["deadline", "آخر موعد للتسجيل (UTC)", "datetime-local"],
    ["price", "الرسوم", "number"],
    ["meeting_url", "رابط اللقاء الخاص", "url"],
  ];
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const raw = Object.fromEntries(new FormData(e.currentTarget));
        const values: Record<string, unknown> = { ...raw };
        for (const key of numeric)
          values[key] = raw[key] === "" ? null : Number(raw[key]);
        for (const key of dates)
          values[key] =
            raw[key] === ""
              ? null
              : key === "deadline"
                ? String(raw[key]) + "Z"
                : raw[key];
        for (const key of [
          "registration_enabled",
          "waitlist_enabled",
          "support_enabled",
        ])
          values[key] = raw[key] === "on";
        try {
          const response = await fetch("/api/admin/course", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(values),
          });
          const data = await response.json();
          setMessage(
            response.ok
              ? "حُفظت إعدادات البرنامج وأصبحت ظاهرة على الموقع."
              : data.error,
          );
          if (response.ok) router.refresh();
        } catch {
          setMessage("تعذّر الاتصال.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <div className="form-grid">
        <label className="field full-width">
          اسم البرنامج
          <input
            name="name"
            defaultValue={course.name}
            required
            maxLength={160}
          />
        </label>
        <label className="field full-width">
          وصف البرنامج
          <textarea
            name="description"
            defaultValue={course.description}
            required
            maxLength={1000}
          />
        </label>
        {fields.map(([key, label, type]) => (
          <label className="field" key={key}>
            {label}
            <input
              type={type}
              name={key}
              defaultValue={
                key === "deadline"
                  ? cohort.deadline?.slice(0, 16) || ""
                  : String(cohort[key as keyof Cohort] ?? "")
              }
              min={numeric.has(key) ? (key === "price" ? 0 : 1) : undefined}
              step={key === "price" ? "0.01" : undefined}
              dir={type === "url" || key === "timezone" ? "ltr" : undefined}
            />
          </label>
        ))}
        <label className="field">
          العملة
          <select name="currency" defaultValue={cohort.currency}>
            {["ILS", "USD", "JOD", "EUR", "TRY", "SAR", "AED"].map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
        </label>
        <label className="field">
          حالة الدفعة
          <select name="state" defaultValue={cohort.state}>
            {Object.entries(stateLabels).map(([k, v]) => (
              <option key={k} value={k}>
                {v}
              </option>
            ))}
          </select>
        </label>
        <label className="field full-width">
          تعليمات الدفع اليدوي (تُرسل للمقبولين)
          <textarea
            name="payment_instructions"
            defaultValue={cohort.payment_instructions || ""}
            maxLength={3000}
          />
        </label>
      </div>
      {[
        ["registration_enabled", "تفعيل استقبال التسجيلات"],
        ["waitlist_enabled", "تفعيل قائمة الانتظار عند اكتمال السعة"],
        ["support_enabled", "إظهار طلب معرفة خيارات الدعم"],
      ].map(([key, label]) => (
        <label className="consent" key={key}>
          <input
            type="checkbox"
            name={key}
            defaultChecked={Boolean(cohort[key as keyof Cohort])}
          />
          {label}
        </label>
      ))}
      <p style={{ fontSize: 13 }}>
        لفتح التسجيل: اختر «التسجيل مفتوح» وفعّل استقبال التسجيلات. تُحجز السعة
        للطلبات قيد المراجعة والمقبولة. القيم الفارغة تظهر «تُعلن لاحقًا». رابط
        اللقاء خاص بالإدارة ولا يظهر للعامة.
      </p>
      <button className="button" style={{ marginTop: 22 }} disabled={busy}>
        {busy ? "جارٍ الحفظ…" : "حفظ معلومات البرنامج"}
      </button>
      {message && (
        <p role="status" style={{ marginTop: 18 }}>
          {message}
        </p>
      )}
    </form>
  );
}
