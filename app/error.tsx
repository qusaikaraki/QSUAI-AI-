"use client";
export default function ErrorPage({ reset }: { reset: () => void }) {
  return (
    <section className="section container">
      <div className="success-box">
        <h1>تعذّر تحميل الصفحة الآن.</h1>
        <p>حدث خلل مؤقت. حاول مجددًا، أو عد إلى الصفحة الرئيسية.</p>
        <button className="button" onClick={reset}>
          إعادة المحاولة
        </button>
      </div>
    </section>
  );
}
