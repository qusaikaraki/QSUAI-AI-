import Link from "next/link";
import Image from "next/image";
import {
  ArrowLeft,
  Check,
  Globe,
  Video,
  GraduationCap,
  Code2,
  FlaskConical,
  ChartNoAxesCombined,
  ShieldCheck,
  CalendarDays,
  Clock3,
} from "lucide-react";
import { modules, faqs, outcomes } from "@/lib/content";
import { instructor, stateLabels, type Cohort } from "@/lib/config";
import { SectionHeading } from "./layout";
export function CurriculumModule({
  index,
  module,
}: {
  index: number;
  module: (typeof modules)[number];
}) {
  return (
    <details className="curriculum-module">
      <summary>
        <span className="module-number">
          {String(index + 1).padStart(2, "0")}
        </span>
        <span>
          <b>{module.title}</b>
          <small dir="ltr">{module.en}</small>
        </span>
        <span className="plus" aria-hidden="true">
          +
        </span>
      </summary>
      <div className="module-body">
        <p>{module.desc}</p>
        <ul>
          {module.topics.map((t) => (
            <li key={t}>{t}</li>
          ))}
        </ul>
      </div>
    </details>
  );
}
export function Curriculum() {
  return (
    <section id="curriculum" className="section container">
      <div className="split-heading">
        <SectionHeading
          eyebrow="المنهج التدريبي"
          title="رحلة واضحة. خطوة بخطوة."
          description="ثمانية محاور مترابطة، من أول سؤال عن الذكاء الاصطناعي إلى مشروع يحمل فكرتك."
        />
        <span className="chapter-label">
          08 محاور <span>من الفهم إلى البناء</span>
        </span>
      </div>
      <div className="curriculum-grid">
        {modules.map((m, i) => (
          <CurriculumModule key={m.en} module={m} index={i} />
        ))}
      </div>
      <p className="section-note">
        نراجع الأدوات والأمثلة مع تطورها، ونحافظ على الأساس: الفهم والتطبيق
        والتحقق.
      </p>
    </section>
  );
}
export function Outcomes() {
  return (
    <section className="section container">
      <SectionHeading
        eyebrow="ما الذي ستخرج به؟"
        title="معرفة تستطيع استخدامها."
        description="مهارات عملية تتجاوز أداة واحدة، وتبقى معك عندما تتغير الأدوات."
      />
      <div className="outcomes">
        {outcomes.map((t) => (
          <div key={t}>
            <Check size={19} />
            <span>{t}</span>
          </div>
        ))}
      </div>
    </section>
  );
}
export function Method() {
  return (
    <section className="method-section section">
      <div className="container">
        <SectionHeading
          eyebrow="طريقتنا في التعلم"
          title="لا نعلّمك الضغط على الأزرار. نعلّمك كيف تفكر باستخدام الأدوات."
          description="كل مهارة تمر بخمس خطوات. نفهم أولًا، ثم نختبر المعرفة في موقف حقيقي."
        />
        <div className="method-steps">
          {[
            ["افهم", "المفهوم قبل الأداة"],
            ["جرّب", "تطبيق موجّه وواضح"],
            ["تحقّق", "راجع الدقة والمصادر"],
            ["طبّق", "اربطه بتخصصك"],
            ["ابنِ", "أنجز مشروعك"],
          ].map(([a, b], i) => (
            <div key={a}>
              <span>0{i + 1}</span>
              <h3>{a}</h3>
              <p>{b}</p>
              {i < 4 && <ArrowLeft aria-hidden="true" />}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
export function Audience() {
  return (
    <section className="section container">
      <SectionHeading
        eyebrow="لمن صُمم البرنامج؟"
        title="تخصصك مختلف. نقطة البداية مشتركة."
        description="للطلاب العرب، بدءًا من مجتمعنا الجامعي في فلسطين، وباب مفتوح للتعلم من أي مكان."
      />
      <div className="audience-grid">
        {[
          "طالب جديد في الجامعة",
          "طالب يريد تطوير طريقة دراسته",
          "طالب هندسة أو برمجة",
          "طالب في التخصصات الصحية",
          "طالب يبني مهاراته المهنية",
          "مبتدئ يبدأ من الصفر",
        ].map((t) => (
          <div key={t}>
            <GraduationCap size={24} />
            <h3>{t}</h3>
          </div>
        ))}
      </div>
      <p className="section-note">
        لا تحتاج إلى خبرة سابقة، ومعرفة البرمجة ليست شرطًا.
      </p>
    </section>
  );
}
export function Projects() {
  const items = [
    {
      icon: Code2,
      title: "الهندسة والحاسوب",
      name: "مساعد دراسة متخصص",
      text: "نظّم مفاهيم مادة صعبة، وجرّب أسئلة تساعدك على فهمها واختبار نفسك.",
      tag: "فهم · برمجة · اختبار",
    },
    {
      icon: FlaskConical,
      title: "التخصصات الصحية",
      name: "قراءة ورقة علمية بوعي",
      text: "حلّل بنية ورقة بحثية، واستخرج أسئلتها وحدودها، ثم راجع كل استنتاج في المصدر.",
      tag: "بحث · تحقق · تلخيص",
    },
    {
      icon: ChartNoAxesCombined,
      title: "الأعمال والبيانات",
      name: "من بيانات إلى فكرة",
      text: "حلّل ملفًا صغيرًا، وابنِ رسمًا واضحًا، واكتب ما تدعمه البيانات فعلًا.",
      tag: "تحليل · عرض · قرار",
    },
  ];
  return (
    <section className="section projects-section">
      <div className="container">
        <SectionHeading
          eyebrow="تعلّم له أثر"
          title="من تخصصك تبدأ الفكرة."
          description="أمثلة لمشاريع يمكنك تطويرها. اختر مشكلة صغيرة، وابنِ حلًا تفهمه وتستطيع تقييمه."
        />
        <div className="project-grid">
          {items.map((p, i) => (
            <article className="project-card" key={p.title}>
              <div className={"project-art art-" + i} aria-hidden="true">
                <p.icon size={42} />
                <div className="diagram-lines">
                  <i />
                  <i />
                  <i />
                </div>
                <span>0{i + 1}</span>
              </div>
              <div className="project-copy">
                <small>{p.title}</small>
                <h3>{p.name}</h3>
                <p>{p.text}</p>
                <span className="project-tag">{p.tag}</span>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
export function ResponsibleAI() {
  return (
    <section className="container section">
      <div className="responsible">
        <div className="shield">
          <ShieldCheck size={45} />
        </div>
        <div>
          <span className="eyebrow">الوعي جزء من المهارة</span>
          <h2>طوّر تفكيرك، لا تستبدله.</h2>
          <p>
            قد يخطئ الذكاء الاصطناعي بثقة. نتعلم كيف نراجع المعلومات والمراجع،
            ونحمي البيانات الشخصية، ونحترم النزاهة الأكاديمية. أنت مسؤول عن
            عملك، والأداة تساعدك على تحسينه.
          </p>
          <div className="ethics-tags">
            <span>تحقّق من المصادر</span>
            <span>احمِ خصوصيتك</span>
            <span>احترم جهدك الأكاديمي</span>
          </div>
        </div>
      </div>
    </section>
  );
}
export function InstructorProfile({ full = false }: { full?: boolean }) {
  return (
    <section className="section container instructor-section">
      <div
        className="portrait-placeholder"
        aria-label="مساحة مخصصة للصورة الشخصية لقصي كركي"
      >
        {instructor.photo ? (
          <Image
            src={instructor.photo}
            alt={instructor.name}
            fill
            sizes="(max-width:600px) 290px,330px"
            style={{ objectFit: "cover" }}
          />
        ) : (
          <span className="portrait-monogram" aria-hidden="true">
            ق ك
          </span>
        )}
        <div>
          <span>{instructor.englishName.toUpperCase()}</span>
          <small>الهندسة · التقنية · التعليم</small>
        </div>
      </div>
      <div>
        <span className="eyebrow">تعرّف إلى مدرّبك</span>
        <h2>{instructor.name}</h2>
        <p className="instructor-title">{instructor.headline}</p>
        <p>{instructor.bio}</p>
        {full && <p>{instructor.mission}</p>}
        <blockquote>
          «الفجوة ليست في توفر الأدوات، بل في معرفة كيف نستخدمها بشكل صحيح.»
        </blockquote>
        {!full && (
          <Link href="/about" className="text-link">
            تعرّف إلى قصي ومنهجية البرنامج <ArrowLeft size={18} />
          </Link>
        )}
      </div>
    </section>
  );
}
export function FAQAccordion({ limit }: { limit?: number }) {
  return (
    <div className="faq-list">
      {faqs.slice(0, limit).map(([q, a]) => (
        <details key={q}>
          <summary>
            {q}
            <span aria-hidden="true">+</span>
          </summary>
          <p>{a}</p>
        </details>
      ))}
    </div>
  );
}
export function CourseCard({
  cohort,
  name,
  description,
}: {
  cohort: Cohort;
  name: string;
  description: string;
}) {
  const canJoin =
    (cohort.registration_enabled &&
      ["open", "limited"].includes(cohort.state)) ||
    (cohort.waitlist_enabled && cohort.state === "waitlist");
  return (
    <article className="cohort-card">
      <div>
        <span className="status-chip">{stateLabels[cohort.state]}</span>
        <h2>{name}</h2>
        <p>{description}</p>
        <div className="course-facts">
          <span>
            <Video size={18} />
            جلسات مباشرة أونلاين
          </span>
          <span>
            <Globe size={18} />
            باللغة العربية
          </span>
          <span>
            <CalendarDays size={18} />
            {cohort.start_date
              ? new Intl.DateTimeFormat("ar", {
                  dateStyle: "long",
                  timeZone: "UTC",
                }).format(new Date(cohort.start_date))
              : "موعد البداية يُعلن لاحقًا"}
          </span>
          <span>
            <Clock3 size={18} />
            {cohort.sessions
              ? `${cohort.sessions} جلسة`
              : "تفاصيل الجلسات تُعلن لاحقًا"}
          </span>
        </div>
        {cohort.days && (
          <p>
            {cohort.days} · <bdi>{cohort.time}</bdi> ·{" "}
            <bdi>{cohort.timezone}</bdi>
          </p>
        )}
        {cohort.session_minutes && (
          <p>مدة الجلسة: {cohort.session_minutes} دقيقة</p>
        )}
      </div>
      <div className="cohort-action">
        <span>رسوم البرنامج</span>
        <strong>
          {cohort.price === null
            ? "تُعلن لاحقًا"
            : new Intl.NumberFormat("ar", {
                style: "currency",
                currency: cohort.currency,
              }).format(cohort.price)}
        </strong>
        <p>تُوضح التفاصيل قبل تأكيد انضمامك.</p>
        <Link href={canJoin ? "/register" : "/contact"} className="button">
          {canJoin
            ? cohort.state === "waitlist"
              ? "انضم إلى قائمة الانتظار"
              : "سجّل الآن"
            : "استفسر عن الدفعة القادمة"}
          <ArrowLeft size={18} />
        </Link>
        <small>التسجيل الأولي لا يتطلب دفعًا إلكترونيًا.</small>
      </div>
    </article>
  );
}
