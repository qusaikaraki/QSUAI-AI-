import type { Metadata } from "next";
import "@fontsource/ibm-plex-sans-arabic/400.css";
import "@fontsource/ibm-plex-sans-arabic/500.css";
import "@fontsource/ibm-plex-sans-arabic/600.css";
import "@fontsource/ibm-plex-sans-arabic/700.css";
import "./globals.css";
import { Navbar, Footer } from "@/components/layout";
import { brand, siteUrl } from "@/lib/config";
import { Analytics } from "@/components/analytics";
export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: brand.name + " | من الفهم إلى التطبيق",
    template: "%s | " + brand.name,
  },
  description:
    "تعلم الذكاء الاصطناعي بالعربية مع قصي كركي. برنامج عملي لطلاب الجامعة في الدراسة والبحث وهندسة الأوامر والبرمجة والاستخدام المسؤول.",
  alternates: { canonical: "/" },
  openGraph: {
    type: "website",
    locale: "ar_PS",
    siteName: brand.name,
    title: brand.name,
    description: brand.tagline,
    images: ["/opengraph-image.png"],
  },
  twitter: { card: "summary_large_image" },
  icons: { icon: "/icon.svg" },
};
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ar" dir="rtl" data-scroll-behavior="smooth">
      <body>
        <a className="skip-link" href="#main">
          انتقل إلى المحتوى
        </a>
        <Navbar />
        {process.env.ACADEMY_TEST_FIXTURE === "1" && (
          <div className="notice" style={{ margin: 0, textAlign: "center" }}>
            بيئة اختبار محلية — جميع الطلبات تجريبية، ولا تُرسل رسائل حقيقية.
          </div>
        )}
        <main id="main">{children}</main>
        <Footer />
        <Analytics />
      </body>
    </html>
  );
}
