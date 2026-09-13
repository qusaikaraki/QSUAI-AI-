"use client";
import Link from "next/link";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { registrationSchema, type RegistrationInput } from "@/lib/validation";
import { interests, levels, years } from "@/lib/content";
import { ArrowLeft, ShieldCheck, Check } from "lucide-react";
export function RegistrationForm({
  cohortId,
  supportEnabled,
  enabled,
}: {
  cohortId: string;
  supportEnabled: boolean;
  enabled: boolean;
}) {
  const [failure, setFailure] = useState("");
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<
    RegistrationInput,
    unknown,
    ReturnType<typeof registrationSchema.parse>
  >({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      cohort_id: cohortId,
      interests: [],
      website: "",
      support_requested: false,
    },
  });
  const submit = handleSubmit(async (values) => {
    setFailure("");
    try {
      const response = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(values),
      });
      const result = await response.json();
      if (!response.ok) {
        setFailure(result.error);
        return;
      }
      window.dispatchEvent(
        new CustomEvent("academy:analytics", {
          detail: { event: "registration_completed" },
        }),
      );
      window.location.assign("/registration-success");
    } catch {
      setFailure("تعذّر الاتصال. يرجى التحقق من الإنترنت والمحاولة مجددًا.");
    }
  });
  const field = (
    key:
      "full_name" | "email" | "phone" | "university" | "major" | "city" | "age",
    label: string,
    type = "text",
    required = true,
  ) => (
    <div className="field" key={key}>
      <label htmlFor={key}>
        {label} {required && <span aria-hidden="true">*</span>}
      </label>
      <input
        id={key}
        type={type}
        {...register(key)}
        autoComplete={
          key === "full_name"
            ? "name"
            : key === "email"
              ? "email"
              : key === "phone"
                ? "tel"
                : key === "city"
                  ? "address-level2"
                  : "off"
        }
        dir={["email", "phone", "age"].includes(key) ? "ltr" : undefined}
        aria-required={required}
        aria-invalid={!!errors[key]}
        aria-describedby={errors[key] ? key + "-error" : undefined}
      />
      {errors[key] && <small id={key + "-error"}>{errors[key]?.message}</small>}
    </div>
  );
  return (
    <form
      className="form-panel"
      onSubmit={submit}
      noValidate
      onFocus={() =>
        window.dispatchEvent(
          new CustomEvent("academy:analytics", {
            detail: { event: "registration_started" },
          }),
        )
      }
    >
      <h2>تعرّفنا إليك، لنبدأ معًا.</h2>
      <p>
        الحقول المميزة بـ * مطلوبة. معلوماتك مخصصة لتنظيم البرنامج والتواصل بشأن
        طلبك.
      </p>
      <fieldset
        disabled={!enabled || isSubmitting}
        style={{ border: 0, padding: 0, margin: 0 }}
      >
        <legend className="sr-only">بيانات التسجيل</legend>
        <div className="form-grid">
          {field("full_name", "الاسم الكامل")}
          {field("email", "البريد الإلكتروني", "email")}
          {field("phone", "رقم الهاتف / WhatsApp", "tel")}
          {field("university", "الجامعة")}
          {field("major", "التخصص")}
          <div className="field">
            <label htmlFor="year">السنة الجامعية *</label>
            <select
              id="year"
              {...register("year")}
              aria-required="true"
              aria-invalid={!!errors.year}
              aria-describedby={errors.year ? "year-error" : undefined}
            >
              <option value="">اختر السنة الجامعية</option>
              {years.map((v) => (
                <option key={v}>{v}</option>
              ))}
            </select>
            {errors.year && <small id="year-error">اختر السنة الجامعية</small>}
          </div>
          {field("city", "المدينة (اختياري)", "text", false)}
          {field("age", "العمر (اختياري)", "number", false)}
        </div>
        <h3 className="form-section-title">مسارك واهتماماتك</h3>
        <div className="field">
          <label htmlFor="ai_level">
            ما مستواك الحالي في الذكاء الاصطناعي؟ *
          </label>
          <select
            id="ai_level"
            {...register("ai_level")}
            aria-required="true"
            aria-invalid={!!errors.ai_level}
          >
            <option value="">اختر مستواك</option>
            {levels.map((v) => (
              <option key={v}>{v}</option>
            ))}
          </select>
          {errors.ai_level && <small>اختر المستوى الأقرب إلى خبرتك</small>}
        </div>
        <fieldset style={{ border: 0, padding: 0, margin: "22px 0 0" }}>
          <legend style={{ fontSize: 14 }}>
            ما الذي تريد أن تتعلمه أكثر؟ (يمكنك اختيار أكثر من مجال)
          </legend>
          <div className="check-grid">
            {interests.map((v) => (
              <label className="check-option" key={v}>
                <input type="checkbox" value={v} {...register("interests")} />
                {v}
              </label>
            ))}
          </div>
        </fieldset>
        <div className="field">
          <label htmlFor="motivation">
            لماذا تريد الانضمام إلى البرنامج؟ (اختياري)
          </label>
          <textarea
            id="motivation"
            maxLength={2000}
            {...register("motivation")}
            placeholder="أخبرنا بهدف تريد تحقيقه أو مهارة ترغب في تعلمها."
          />
          {errors.motivation && <small>{errors.motivation.message}</small>}
        </div>
        {supportEnabled && (
          <label className="consent">
            <input type="checkbox" {...register("support_requested")} />
            <span>
              أرغب في معرفة خيارات الدعم أو المقاعد المدعومة إن توفرت. هذا الطلب
              لا يضمن الحصول على دعم.
            </span>
          </label>
        )}
        <label className="consent">
          <input
            type="checkbox"
            {...register("consent")}
            aria-required="true"
            aria-invalid={!!errors.consent}
          />
          <span>
            أوافق على{" "}
            <Link href="/privacy" target="_blank">
              سياسة الخصوصية
            </Link>{" "}
            و
            <Link href="/terms" target="_blank">
              شروط التسجيل
            </Link>
            . *
          </span>
        </label>
        {errors.consent && (
          <p className="error-message">{errors.consent.message}</p>
        )}
        <div className="hidden-trap" aria-hidden="true">
          <label htmlFor="website">اترك هذا الحقل فارغًا</label>
          <input
            id="website"
            tabIndex={-1}
            autoComplete="off"
            {...register("website")}
          />
        </div>
        <div className="form-submit">
          <button className="button" type="submit">
            {isSubmitting ? "جارٍ إرسال طلبك…" : "إرسال طلب التسجيل"}
            <ArrowLeft size={18} />
          </button>
          <small>
            <ShieldCheck
              size={14}
              style={{ display: "inline", marginInlineEnd: 4 }}
            />
            بياناتك محفوظة لغرض التسجيل فقط
          </small>
        </div>
      </fieldset>
      {failure && (
        <p className="error-message" role="alert">
          {failure}
        </p>
      )}
    </form>
  );
}
export function ContactForm({ enabled }: { enabled: boolean }) {
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);
  return done ? (
    <div className="success-box" role="status">
      <div className="success-icon">
        <Check />
      </div>
      <h2>وصلت رسالتك، شكرًا لك.</h2>
      <p>سنراجع رسالتك ونرد عبر البريد الإلكتروني الذي أدخلته.</p>
    </div>
  ) : (
    <form
      className="form-panel"
      onSubmit={async (e) => {
        e.preventDefault();
        setBusy(true);
        setMessage("");
        const form = e.currentTarget;
        try {
          const result = await fetch("/api/contact", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(Object.fromEntries(new FormData(form))),
          });
          const data = await result.json();
          if (result.ok) {
            setDone(true);
            window.dispatchEvent(
              new CustomEvent("academy:analytics", {
                detail: { event: "contact_submitted" },
              }),
            );
          } else setMessage(data.error);
        } catch {
          setMessage("تعذّر الاتصال. حاول مجددًا.");
        } finally {
          setBusy(false);
        }
      }}
    >
      <h2>كيف يمكننا مساعدتك؟</h2>
      <p>لا تضع بيانات حساسة في رسالتك.</p>
      <div className="form-grid">
        {[
          ["name", "الاسم", "text"],
          ["email", "البريد الإلكتروني", "email"],
          ["subject", "الموضوع", "text"],
        ].map(([key, label, type]) => (
          <div
            className={"field " + (key === "subject" ? "full-width" : "")}
            key={key}
          >
            <label htmlFor={key}>{label} *</label>
            <input
              id={key}
              name={key}
              type={type}
              required
              minLength={key === "subject" ? 3 : 2}
              maxLength={key === "email" ? 254 : 160}
            />
          </div>
        ))}
        <div className="field full-width">
          <label htmlFor="message">رسالتك *</label>
          <textarea
            id="message"
            name="message"
            minLength={10}
            maxLength={3000}
            required
          />
        </div>
      </div>
      <div className="hidden-trap" aria-hidden="true">
        <input
          name="website"
          tabIndex={-1}
          autoComplete="off"
          aria-label="اتركه فارغًا"
        />
      </div>
      <p style={{ fontSize: 13, marginTop: 18 }}>
        نستخدم معلوماتك للرد على رسالتك وفق{" "}
        <Link className="text-link" href="/privacy">
          سياسة الخصوصية
        </Link>
        .
      </p>
      <button
        className="button"
        style={{ marginTop: 20 }}
        disabled={busy || !enabled}
      >
        {busy ? "جارٍ الإرسال…" : "أرسل رسالتك"}
        <ArrowLeft size={18} />
      </button>
      {message && (
        <p role="alert" className="error-message">
          {message}
        </p>
      )}
    </form>
  );
}
