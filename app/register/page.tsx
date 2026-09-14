import { PageTop } from "@/components/page-top";
import { RegistrationForm } from "@/components/forms";
import { getProgram } from "@/lib/db";
import { stateLabels } from "@/lib/config";
export const metadata = {
  title: "التسجيل في البرنامج",
  alternates: { canonical: "/register" },
  robots: { index: false, follow: true },
};
export const dynamic = "force-dynamic";
export default async function Page() {
  const { course, cohort, connected } = await getProgram();
  const enabled =
    connected &&
    (!cohort.deadline || Date.parse(cohort.deadline) > Date.now()) &&
    ((["open", "limited"].includes(cohort.state) &&
      cohort.registration_enabled) ||
      (cohort.state === "waitlist" && cohort.waitlist_enabled));
  return (
    <>
      <PageTop
        title="خطوتك الأولى نحو فهم أعمق."
        description="طلب واحد بسيط. نراجع معلوماتك ونتواصل معك بشأن تفاصيل الدفعة والخطوات التالية."
        label="التسجيل"
      />
      <section className="section container">
        {!enabled && (
          <div className="notice" role="status">
            {connected
              ? `${stateLabels[cohort.state]}. لا نستقبل طلبات جديدة حاليًا. تابع تفاصيل الدفعة أو تواصل معنا.`
              : "التسجيل الإلكتروني قيد التجهيز. سنفتح استقبال الطلبات بعد إعلان تفاصيل الدفعة."}
          </div>
        )}
        <div className="form-layout">
          <RegistrationForm
            cohortId={cohort.id}
            supportEnabled={cohort.support_enabled}
            enabled={enabled}
          />
          <aside className="form-aside">
            <span className="eyebrow">البرنامج التدريبي</span>
            <h3>{course.name}</h3>
            <p>من الأساسيات إلى التطبيق</p>
            <p>أونلاين · بالعربية · للمبتدئين</p>
            <h3 style={{ marginTop: 25, fontSize: 18 }}>
              ماذا يحدث بعد الإرسال؟
            </h3>
            <ol>
              <li>تحصل على رقم مرجعي لطلبك.</li>
              <li>نراجع بياناتك وتوفر المقاعد.</li>
              <li>نتواصل بشأن الخطوات التالية.</li>
            </ol>
            <p>إرسال الطلب لا يؤكد المقعد ولا يتطلب دفعًا فوريًا.</p>
          </aside>
        </div>
      </section>
    </>
  );
}
