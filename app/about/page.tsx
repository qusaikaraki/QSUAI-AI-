import { PageTop } from "@/components/page-top";
import { InstructorProfile, ResponsibleAI } from "@/components/program";
import { CTASection } from "@/components/layout";
export const metadata = {
  title: "عن قصي كركي",
  alternates: { canonical: "/about" },
};
export default function Page() {
  return (
    <>
      <PageTop
        title="التقنية أقرب حين نفهمها."
        description="قصي كركي · هندسة، بحث، وتعليم يربط المعرفة بالتطبيق."
        label="عن المدرب"
      />
      <InstructorProfile full />
      <ResponsibleAI />
      <CTASection />
    </>
  );
}
