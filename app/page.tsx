import Link from "next/link";
import { ArrowLeft, Compass, MessagesSquare, ScanLine } from "lucide-react";
import { Hero } from "@/components/hero";
import {
  Curriculum,
  Outcomes,
  Method,
  Audience,
  Projects,
  ResponsibleAI,
  InstructorProfile,
  CourseCard,
  FAQAccordion,
} from "@/components/program";
import { SectionHeading, CTASection } from "@/components/layout";
import { getProgram } from "@/lib/db";
export const dynamic = "force-dynamic";
export default async function Home() {
  const { course, cohort } = await getProgram();
  return (
    <>
      <Hero />
      <section className="section container why-section">
        <SectionHeading
          eyebrow="لماذا نتعلم الذكاء الاصطناعي؟"
          title="الجامعة تتغير. وطريقة تعلمك أيضًا."
          description="أدوات الذكاء الاصطناعي أصبحت جزءًا من البحث والبرمجة وكتابة التقارير. لكن الوصول إلى إجابة لا يعني الوصول إلى معرفة. هنا نتعلم الفرق."
        />
        <div className="why-grid">
          {[
            {
              icon: Compass,
              t: "افهم قبل أن تستخدم",
              p: "اعرف ما تستطيع الأداة فعله، وأين تنتهي حدودها. اختر الأداة لأنك تفهم حاجتك.",
            },
            {
              icon: MessagesSquare,
              t: "اسأل بطريقة أفضل",
              p: "حوّل فكرتك إلى تعليمات واضحة. أعطِ السياق، وحدد المطلوب، وحسّن النتيجة خطوة بخطوة.",
            },
            {
              icon: ScanLine,
              t: "راجع، ثم اعتمد",
              p: "لا تأخذ الإجابة كما هي. تحقّق من المعلومات والمراجع، واجعل حكمك جزءًا من كل خطوة.",
            },
          ].map((x) => (
            <article key={x.t}>
              <x.icon />
              <h3>{x.t}</h3>
              <p>{x.p}</p>
            </article>
          ))}
        </div>
      </section>
      <Outcomes />
      <Curriculum />
      <Method />
      <Audience />
      <Projects />
      <ResponsibleAI />
      <InstructorProfile />
      <section className="section container">
        <SectionHeading
          eyebrow="البرنامج الأول"
          title="خطوة عملية لرحلتك الجامعية."
        />
        <CourseCard
          cohort={cohort}
          name={course.name}
          description={course.description}
        />
      </section>
      <CTASection />
      <section className="section container faq-section">
        <SectionHeading
          eyebrow="قبل أن تبدأ"
          title="أسئلتك في مكانها."
          description="تفاصيل واضحة لتختار وأنت مطمئن."
        />
        <div>
          <FAQAccordion limit={5} />
          <Link href="/faq" className="text-link">
            جميع الأسئلة الشائعة <ArrowLeft size={18} />
          </Link>
        </div>
      </section>
      <section className="contact-strip container">
        <div>
          <h3>لديك سؤال عن البرنامج؟</h3>
          <p>أخبرنا بما تحتاج معرفته قبل أن تبدأ.</p>
        </div>
        <Link className="button secondary" href="/contact">
          تواصل معنا <ArrowUpLeftIcon />
        </Link>
      </section>
    </>
  );
}
function ArrowUpLeftIcon() {
  return <ArrowLeft size={18} />;
}
