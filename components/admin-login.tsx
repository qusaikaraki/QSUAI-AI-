"use client";
import { useActionState } from "react";
import { login } from "@/app/admin/actions";
export function AdminLogin({ enabled }: { enabled: boolean }) {
  const [state, action, pending] = useActionState(login, { error: "" });
  return (
    <form action={action} className="form-panel login-box">
      <span className="eyebrow">مساحة الإدارة</span>
      <h1 style={{ fontSize: 26 }}>مرحبًا بك.</h1>
      <p>سجّل الدخول لإدارة الطلبات وتفاصيل الدفعة.</p>
      <div className="field">
        <label htmlFor="admin-email">البريد الإلكتروني</label>
        <input
          type="email"
          name="email"
          id="admin-email"
          dir="ltr"
          autoComplete="username"
          required
        />
      </div>
      <div className="field" style={{ marginTop: 18 }}>
        <label htmlFor="password">كلمة المرور</label>
        <input
          type="password"
          name="password"
          id="password"
          dir="ltr"
          autoComplete="current-password"
          required
          maxLength={200}
        />
      </div>
      <button
        disabled={!enabled || pending}
        className="button"
        style={{ width: "100%", marginTop: 25 }}
      >
        {pending ? "جارٍ التحقق…" : "دخول الإدارة"}
      </button>
      {state.error && (
        <p role="alert" className="error-message">
          {state.error}
        </p>
      )}
      {!enabled && (
        <p className="notice" style={{ marginTop: 20 }}>
          دخول الإدارة متاح بعد ربط خدمة المصادقة وإنشاء حساب المسؤول.
        </p>
      )}
    </form>
  );
}
