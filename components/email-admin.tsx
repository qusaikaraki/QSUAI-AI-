"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
export function EmailActions() {
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);
  const router = useRouter();
  return (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        try {
          const response = await fetch("/api/admin/emails", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(
              Object.fromEntries(new FormData(e.currentTarget)),
            ),
          });
          const data = await response.json();
          setMessage(response.ok ? data.message : data.error);
          router.refresh();
        } catch {
          setMessage("تعذّر تنفيذ الطلب.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>تجهيز تذكير لطالب مقبول</h2>
      <p>أدخل رقم التسجيل والتفاصيل المعتمدة. يُرسل التذكير لهذا الطالب فقط.</p>
      <div className="form-grid">
        <label className="field">
          رقم التسجيل
          <input name="registration_id" required dir="ltr" />
        </label>
        <label className="field">
          نوع الرسالة
          <select name="template">
            <option value="reminder">تذكير بالجلسة</option>
            <option value="starting">البرنامج يبدأ قريبًا</option>
          </select>
        </label>
        <label className="field full-width">
          الموعد وتعليمات الانضمام
          <textarea
            name="instructions"
            required
            minLength={10}
            maxLength={3000}
          />
        </label>
      </div>
      <button className="button" style={{ marginTop: 20 }} disabled={busy}>
        {busy ? "جارٍ الإعداد…" : "إرسال التذكير"}
      </button>
      {message && (
        <p role="status" style={{ marginTop: 15 }}>
          {message}
        </p>
      )}
    </form>
  );
}
