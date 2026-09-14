import { redirect } from "next/navigation";
import { admin, db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<{ page?: string }>;
}) {
  if (!(await admin())) redirect("/admin/login");
  const page = Math.max(1, Number((await searchParams).page) || 1);
  const { data, count, error } = await db()
    .from("contact_messages")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * 30, page * 30 - 1);
  return (
    <AdminShell>
      <div className="admin-title">
        <h1>رسائل التواصل</h1>
        <span>{count || 0} رسالة</span>
      </div>
      {error ? (
        <p className="notice">تعذّر تحميل الرسائل.</p>
      ) : data?.length ? (
        data.map((m) => (
          <article
            className="form-panel"
            style={{ marginBottom: 15 }}
            key={m.id}
          >
            <h2>{m.subject}</h2>
            <p>
              {m.name} · <bdi>{m.email}</bdi> ·{" "}
              {new Date(m.created_at).toLocaleDateString("ar", {
                timeZone: "UTC",
              })}
            </p>
            <p style={{ whiteSpace: "pre-wrap" }}>{m.message}</p>
            <a
              className="text-link"
              href={"mailto:" + encodeURIComponent(m.email)}
            >
              الرد عبر البريد ↗
            </a>
          </article>
        ))
      ) : (
        <div className="empty-state">لا توجد رسائل بعد.</div>
      )}
      <div className="pagination">
        {page > 1 && <a href={"?page=" + (page - 1)}>السابق</a>}
        {page * 30 < (count || 0) && <a href={"?page=" + (page + 1)}>التالي</a>}
      </div>
    </AdminShell>
  );
}
