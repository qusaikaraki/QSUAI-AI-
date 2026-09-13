import Link from "next/link";
export default function Page() {
  return (
    <section className="section container">
      <div className="success-box">
        <span className="eyebrow">404</span>
        <h1>هذه الصفحة غير موجودة.</h1>
        <p>
          قد يكون الرابط قد تغير. يمكنك العودة إلى البرنامج أو الصفحة الرئيسية.
        </p>
        <Link className="button" href="/">
          العودة إلى الرئيسية
        </Link>
      </div>
    </section>
  );
}
