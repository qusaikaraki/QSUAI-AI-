import { PageTop } from "@/components/page-top";
import { ContactForm } from "@/components/forms";
import { configured } from "@/lib/db";
export const metadata = {
  title: "تواصل معنا",
  alternates: { canonical: "/contact" },
};
export const dynamic = "force-dynamic";
export default function Page() {
  const ready = configured();
  return (
    <>
      <PageTop
        title="لنتحدث عن خطوتك القادمة."
        description="سؤال عن المحتوى، أو المشاركة، أو بيانات تسجيلك؟ أرسل لنا رسالة واضحة وسنساعدك."
        label="تواصل معنا"
      />
      <section className="section container">
        {!ready && (
          <div className="notice">
            نموذج التواصل قيد التجهيز. ستظهر قنوات التواصل المعتمدة هنا عند
            تفعيلها.
          </div>
        )}
        <div className="form-layout">
          <ContactForm enabled={ready} />
          <aside className="form-aside">
            <h3>تواصل مع قصي</h3>
            <p>
              للاستفسار عن طلب سابق، اذكر رقم التسجيل. لا تشارك معلومات شخصية
              حساسة.
            </p>
            <div className="contact-links">
              {process.env.CONTACT_EMAIL && (
                <a href={"mailto:" + process.env.CONTACT_EMAIL}>
                  البريد الإلكتروني ↗
                </a>
              )}
              {process.env.CONTACT_WHATSAPP && (
                <a
                  href={
                    "https://wa.me/" +
                    process.env.CONTACT_WHATSAPP.replace(/\D/g, "")
                  }
                >
                  WhatsApp ↗
                </a>
              )}
              {process.env.CONTACT_LINKEDIN && (
                <a href={process.env.CONTACT_LINKEDIN}>LinkedIn ↗</a>
              )}
            </div>
          </aside>
        </div>
      </section>
    </>
  );
}
