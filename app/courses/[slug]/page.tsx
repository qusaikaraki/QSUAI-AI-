import { notFound } from "next/navigation";
import { PageTop } from "@/components/page-top";
import {
  Curriculum,
  Outcomes,
  Method,
  ResponsibleAI,
  CourseCard,
  FAQAccordion,
} from "@/components/program";
import { getProgram } from "@/lib/db";
import { siteUrl } from "@/lib/config";
export const dynamic = "force-dynamic";
export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { course } = await getProgram();
  if (slug !== course.slug) return {};
  return {
    title: course.name,
    description: course.description,
    alternates: { canonical: "/courses/" + slug },
    openGraph: {
      title: course.name,
      description: course.description,
      url: "/courses/" + slug,
      images: ["/opengraph-image.png"],
    },
  };
}
export default async function Page({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const { course, cohort } = await getProgram();
  if (slug !== course.slug) notFound();
  const structured = {
    "@context": "https://schema.org",
    "@type": "Course",
    name: course.name,
    description: course.description,
    inLanguage: "ar",
    educationalLevel: "Beginner",
    provider: { "@type": "Person", name: "قصي كركي", url: siteUrl + "/about" },
    url: siteUrl + "/courses/" + slug,
  };
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(structured).replaceAll("<", "\\u003c"),
        }}
      />
      <PageTop title={course.name} description={course.description} />
      <section className="section container">
        <CourseCard
          cohort={cohort}
          name={course.name}
          description="من الأساسيات إلى التطبيق · مبتدئ إلى متوسط · جلسات مباشرة أونلاين"
        />
      </section>
      <Outcomes />
      <Curriculum />
      <Method />
      <ResponsibleAI />
      <section className="section container content-narrow">
        <h2>قبل الانضمام</h2>
        <FAQAccordion />
      </section>
    </>
  );
}
