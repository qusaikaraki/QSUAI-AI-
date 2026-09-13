import Link from "next/link";
import { ArrowUpLeft, BookOpen, ArrowLeft } from "lucide-react";
import { MobileNav } from "./mobile-nav";
import { brand } from "@/lib/config";
const navigation = [
  ["/courses", "البرنامج التدريبي"],
  ["/method", "كيف نتعلم"],
  ["/about", "عن قصي"],
  ["/faq", "الأسئلة الشائعة"],
];
export function Logo() {
  return (
    <Link className="logo" href="/" aria-label={brand.name}>
      <span className="brand-mark" aria-hidden="true">
        <BookOpen size={25} />
        <i />
      </span>
      <span>
        {brand.logoArabic} <b>{brand.logoEnglish}</b>
        <small>{brand.logoTagline}</small>
      </span>
    </Link>
  );
}
export function Navbar() {
  return (
    <header className="header">
      <div className="container nav">
        <Logo />
        <nav aria-label="التنقل الرئيسي" className="desktop-nav">
          {navigation.map(([href, title]) => (
            <Link key={href} href={href}>
              {title}
            </Link>
          ))}
        </nav>
        <Link href="/register" className="button small nav-cta">
          انضم إلى الدفعة القادمة <ArrowUpLeft size={17} />
        </Link>
        <MobileNav links={navigation} />
      </div>
    </header>
  );
}
export function Footer() {
  return (
    <footer>
      <div className="container footer-grid">
        <div>
          <Logo />
          <p>
            معرفة واضحة. تطبيق حقيقي.
            <br />
            وتقنية نستخدمها بوعي.
          </p>
        </div>
        <div>
          <strong>تعلّم معنا</strong>
          <Link href="/courses">الدورات</Link>
          <Link href="/method">منهجية التعلم</Link>
          <Link href="/about">عن قصي كركي</Link>
        </div>
        <div>
          <strong>نحن هنا لمساعدتك</strong>
          <Link href="/faq">الأسئلة الشائعة</Link>
          <Link href="/contact">تواصل معنا</Link>
          {process.env.CONTACT_LINKEDIN && (
            <a href={process.env.CONTACT_LINKEDIN} rel="noopener noreferrer">
              LinkedIn ↗
            </a>
          )}
        </div>
        <div>
          <strong>الخصوصية والشفافية</strong>
          <Link href="/privacy">سياسة الخصوصية</Link>
          <Link href="/terms">شروط الاستخدام</Link>
          <Link href="/admin">دخول الإدارة</Link>
        </div>
      </div>
      <div className="container footer-bottom">
        <span>
          © {new Date().getFullYear()} {brand.name}
        </span>
        <span>تعليم عربي · آفاق مفتوحة</span>
      </div>
    </footer>
  );
}
export function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
}) {
  return (
    <div className="section-heading">
      {eyebrow && <span className="eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {description && <p>{description}</p>}
    </div>
  );
}
export function CTASection() {
  return (
    <section className="container">
      <div className="cta-section">
        <div>
          <span className="eyebrow">خطوتك الأولى تبدأ بالفهم</span>
          <h2>مهارة ترافقك في الجامعة، وما بعدها.</h2>
          <p>
            ابدأ من حيث أنت. لا تحتاج إلى خبرة في البرمجة أو الذكاء الاصطناعي.
          </p>
        </div>
        <Link href="/register" className="button light">
          انضم إلى الدفعة القادمة <ArrowLeft size={19} />
        </Link>
      </div>
    </section>
  );
}
