import { PageTop } from "@/components/page-top";
import { FAQAccordion } from "@/components/program";
import { CTASection } from "@/components/layout";
export const metadata = {
  title: "الأسئلة الشائعة",
  alternates: { canonical: "/faq" },
};
export default function Page() {
  return (
    <>
      <PageTop
        title="كل بداية معها أسئلة."
        description="هنا تجد إجابات واضحة حول المستوى والأدوات والتسجيل وطريقة التعلم."
        label="الأسئلة الشائعة"
      />
      <section className="section container content-narrow">
        <FAQAccordion />
      </section>
      <CTASection />
    </>
  );
}
