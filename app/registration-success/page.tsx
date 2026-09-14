import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { Check } from "lucide-react";
export const metadata = {
  title: "تم استلام تسجيلك",
  robots: { index: false, follow: false },
};
export default async function Page() {
  const reference = (await cookies()).get("registration_reference")?.value;
  if (!reference || !/^[0-9a-f-]{36}$/i.test(reference)) redirect("/register");
  return (
    <section className="section container">
      <div className="success-box">
        <div className="success-icon">
          <Check size={34} />
        </div>
        <h1>تم استلام تسجيلك بنجاح</h1>
        <p>
          شكرًا لك. تم استلام طلب التسجيل وسنتواصل معك عبر البريد الإلكتروني أو
          WhatsApp بخصوص الخطوات التالية.
        </p>
        <span>رقم التسجيل المرجعي</span>
        <code className="reference" dir="ltr">
          {reference}
        </code>
        <p>
          احتفظ بهذا الرقم للاستفسار عن طلبك. جرى إدراج رسالة التأكيد للإرسال؛
          قد يستغرق وصولها بعض الوقت. القبول النهائي يُؤكد بعد مراجعة الطلب.
        </p>
        <Link href="/courses/ai-for-university" className="button">
          عد إلى تفاصيل البرنامج
        </Link>
      </div>
    </section>
  );
}
