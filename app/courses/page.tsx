import Link from "next/link";
import { PageTop } from "@/components/page-top";
import { CourseCard } from "@/components/program";
import { getProgram } from "@/lib/db";
export const metadata = {
  title: "الدورات",
  alternates: { canonical: "/courses" },
};
export const dynamic = "force-dynamic";
export default async function Page() {
  const { course, cohort } = await getProgram();
  return (
    <>
      <PageTop
        title="معرفة تبدأ معك، وتنمو بك."
        description="برامج عربية عملية تساعدك على فهم التقنية واستخدامها في رحلتك الجامعية."
        label="الدورات"
      />
      <section className="section container">
        <CourseCard
          cohort={cohort}
          name={course.name}
          description={course.description}
        />
        <Link href={"/courses/" + course.slug} className="text-link">
          تعرّف إلى البرنامج والمنهج كاملًا ←
        </Link>
      </section>
    </>
  );
}
