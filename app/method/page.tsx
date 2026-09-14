import { PageTop } from "@/components/page-top";
import { Method, Projects, ResponsibleAI } from "@/components/program";
export const metadata = {
  title: "منهجية التعلم",
  alternates: { canonical: "/method" },
};
export default function Page() {
  return (
    <>
      <PageTop
        title="الفهم أولًا. ثم التطبيق."
        description="جلسات مباشرة، أمثلة واضحة، وتجارب تجعلك تسأل وتختبر وتبني. لا نكتفي بمشاهدة الأداة وهي تعمل."
        label="كيف نتعلم"
      />
      <Method />
      <Projects />
      <ResponsibleAI />
    </>
  );
}
