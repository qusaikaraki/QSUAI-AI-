import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  Check,
  Video,
  Globe,
  MousePointer2,
  Sparkles,
  BookOpen,
  Terminal,
  Layers3,
} from "lucide-react";
export function Hero() {
  return (
    <section className="hero">
      <div className="container hero-grid">
        <div className="hero-copy">
          <span className="hero-eyebrow">
            <span />
            لطلاب الجامعة · من الصفر إلى التطبيق
          </span>
          <h1>
            افهم الذكاء الاصطناعي.
            <br />
            استخدمه <em>بذكاء.</em>
            <br />
            وابنِ به مستقبلك.
          </h1>
          <p>
            رحلتك الجامعية تستحق أدوات أفضل.
            <br />
            تعلّم مع قصي كركي كيف تستخدم الذكاء الاصطناعي في الدراسة والبحث
            وبناء المشاريع، دون أن تتوقف عن التفكير بنفسك.
          </p>
          <div className="hero-buttons">
            <Link href="/register" className="button">
              انضم إلى الدفعة القادمة <ArrowUpLeft size={20} />
            </Link>
            <Link href="/#curriculum" className="button secondary">
              استكشف المنهج <ArrowLeft size={18} />
            </Link>
          </div>
          <div className="hero-assurance">
            <Check size={16} />
            <span>لا خبرة سابقة مطلوبة</span>
            <span className="dot-divider">·</span>
            <span>لا يشترط معرفة البرمجة</span>
          </div>
        </div>
        <div
          className="knowledge-map"
          role="img"
          aria-label="رحلة التعلم: من السؤال والفهم إلى التجربة والتحقق وبناء مشروعك"
        >
          <div className="map-header">
            <span>مسار المعرفة</span>
            <span dir="ltr">LEARN → BUILD</span>
          </div>
          <div className="orbit orbit-one" />
          <div className="orbit orbit-two" />
          <div className="map-axis axis-one" />
          <div className="map-axis axis-two" />
          <div className="map-center">
            <span className="core-symbol">
              <Layers3 size={46} />
            </span>
            <strong>
              فهم أعمق.
              <br />
              إمكانيات أوسع.
            </strong>
            <small>ذكاء اصطناعي · تفكير إنساني</small>
          </div>
          <div className="map-node node-1">
            <BookOpen />
            <span>افهم الفكرة</span>
            <small>01 / UNDERSTAND</small>
          </div>
          <div className="map-node node-2">
            <Terminal />
            <span>جرّب بنفسك</span>
            <small>02 / PRACTICE</small>
          </div>
          <div className="map-node node-3">
            <Check />
            <span>تحقّق وابنِ</span>
            <small>03 / CREATE</small>
          </div>
          <span className="map-spark spark-1" />
          <span className="map-spark spark-2" />
          <div className="map-caption">
            <span>سؤال جيد</span>
            <ArrowLeft size={14} />
            <span>معرفة</span>
            <ArrowLeft size={14} />
            <span>مشروعك الأول</span>
          </div>
          <div className="floating-label">
            <MousePointer2 size={14} /> مستقبلك يبدأ بفهمك
          </div>
        </div>
      </div>
      <div className="container program-strip">
        <div>
          <Video />
          <span>
            تعلم مباشر<strong>جلسات أونلاين</strong>
          </span>
        </div>
        <div>
          <Globe />
          <span>
            بلغتك، بوضوح<strong>شرح باللغة العربية</strong>
          </span>
        </div>
        <div>
          <BookOpen />
          <span>
            خطوة بخطوة<strong>مناسب للمبتدئين</strong>
          </span>
        </div>
        <div>
          <Sparkles />
          <span>
            أكثر من معرفة<strong>تطبيق ومشروع عملي</strong>
          </span>
        </div>
      </div>
    </section>
  );
}
