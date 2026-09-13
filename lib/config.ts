export const brand = {
  logoArabic: "قصي",
  logoEnglish: "AI",
  logoTagline: "من الفهم إلى التطبيق",
  name: "أكاديمية قصي للذكاء الاصطناعي",
  shortName: "قصي · AI",
  englishName: "Qusai AI Academy",
  tagline: "الذكاء الاصطناعي من الفهم إلى التطبيق",
  locales: ["ar", "en", "tr"] as const,
  activeLocale: "ar",
};
export const instructor = {
  name: "قصي كركي",
  englishName: "Qusai Karki",
  headline:
    "مهندس وباحث مهتم بتطبيقات الذكاء الاصطناعي والتقنيات الطبية والهندسية",
  photo: null as string | null,
  bio: "أنا قصي كركي، مهندس في مجال الهندسة الطبية الحيوية، أعمل وأهتم بتطوير حلول تجمع بين الهندسة، البرمجيات، تحليل الصور والذكاء الاصطناعي. أواصل دراستي المتقدمة في الهندسة الطبية الحيوية، وأؤمن بأهمية أن تصل المعرفة التقنية إلى الطلاب بلغة واضحة.",
  mission:
    "خلال عملي ودراستي وجدت أن الفجوة الحقيقية ليست في توفر أدوات الذكاء الاصطناعي، بل في معرفة كيفية استخدامها بشكل صحيح. ومن هنا جاءت فكرة هذا البرنامج: تقديم الذكاء الاصطناعي للطلاب العرب بطريقة واضحة، عملية ومسؤولة منذ بداية رحلتهم الجامعية.",
};
export const courseDefault = {
  id: "11111111-1111-4111-8111-111111111111",
  slug: "ai-for-university",
  name: "الذكاء الاصطناعي لطلاب الجامعة",
  description:
    "برنامج عربي يبدأ من الأساسيات، ويصل بك إلى استخدام الذكاء الاصطناعي بوعي في الدراسة والبحث والبرمجة وبناء المشاريع.",
  subtitle: "من الأساسيات إلى التطبيق",
};
export type Cohort = {
  id: string;
  course_id: string;
  start_date: string | null;
  end_date: string | null;
  days: string;
  time: string;
  timezone: string;
  sessions: number | null;
  session_minutes: number | null;
  capacity: number | null;
  deadline: string | null;
  price: number | null;
  currency: string;
  state: "open" | "limited" | "closed" | "waitlist" | "upcoming";
  registration_enabled: boolean;
  waitlist_enabled: boolean;
  support_enabled: boolean;
  meeting_url?: string;
  payment_instructions?: string;
};
export const cohortDefault: Cohort = {
  id: "22222222-2222-4222-8222-222222222222",
  course_id: courseDefault.id,
  start_date: null,
  end_date: null,
  days: "",
  time: "",
  timezone: "Asia/Hebron",
  sessions: null,
  session_minutes: null,
  capacity: null,
  deadline: null,
  price: null,
  currency: "ILS",
  state: "upcoming",
  registration_enabled: false,
  waitlist_enabled: false,
  support_enabled: false,
};
export const stateLabels = {
  open: "التسجيل مفتوح",
  limited: "المقاعد محدودة",
  closed: "التسجيل مغلق",
  waitlist: "قائمة الانتظار",
  upcoming: "الدفعة القادمة قريبًا",
};
export const statusLabels: Record<string, string> = {
  pending: "قيد المراجعة",
  approved: "مقبول",
  waitlisted: "قائمة الانتظار",
  rejected: "غير مقبول",
  cancelled: "ملغى",
};
export const paymentLabels: Record<string, string> = {
  pending: "بانتظار الدفع",
  received: "تم الدفع",
  scholarship: "مقعد مدعوم",
  free: "تسجيل مجاني",
};
export const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
