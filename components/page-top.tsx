import Link from "next/link";
export function PageTop({
  title,
  description,
  label,
}: {
  title: string;
  description?: string;
  label?: string;
}) {
  return (
    <section className="page-top">
      <div className="container">
        <div className="breadcrumb">
          <Link href="/">الرئيسية</Link>
          <span>/</span>
          <span>{label || title}</span>
        </div>
        <h1>{title}</h1>
        {description && <p>{description}</p>}
      </div>
    </section>
  );
}
