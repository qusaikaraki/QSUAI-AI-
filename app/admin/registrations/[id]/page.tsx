import { redirect, notFound } from "next/navigation";
import { admin, db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { RegistrationReview } from "@/components/admin-forms";
export default async function Page({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await admin())) redirect("/admin/login");
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/i.test(id)) notFound();
  const { data: r } = await db()
    .from("registrations")
    .select("*")
    .eq("id", id)
    .single();
  if (!r) notFound();
  const { data: notes } = await db()
    .from("admin_notes")
    .select("id,body,created_at")
    .eq("registration_id", id)
    .order("created_at", { ascending: false });
  return (
    <AdminShell>
      <div className="admin-title">
        <h1>{r.full_name}</h1>
        <a href="/admin" className="text-link">
          العودة إلى الطلبات ←
        </a>
      </div>
      <div className="form-panel">
        <dl className="detail-grid">
          {[
            ["رقم الطلب", r.id],
            ["البريد", r.email],
            ["الهاتف", r.phone],
            ["الجامعة", r.university],
            ["التخصص", r.major],
            ["السنة", r.year],
            ["مستوى AI", r.ai_level],
            ["المدينة", r.city || "لم يحدد"],
            ["العمر", r.age || "لم يحدد"],
            ["الاهتمامات", r.interests.join("، ") || "لم يحدد"],
            ["طلب معلومات الدعم", r.support_requested ? "نعم" : "لا"],
            ["الموافقة", new Date(r.consent_at).toISOString()],
            ["دافع الانضمام", r.motivation || "لم يضف إجابة"],
          ].map(([k, v]) => (
            <div key={k}>
              <dt>{k}</dt>
              <dd>{v}</dd>
            </div>
          ))}
        </dl>
      </div>
      <RegistrationReview
        id={id}
        status={r.registration_status}
        payment={r.payment_status}
      />
      <h2 style={{ fontSize: 23, marginTop: 30 }}>الملاحظات الداخلية</h2>
      {notes?.length ? (
        notes.map((n) => (
          <div className="note" key={n.id}>
            <small>
              {new Date(n.created_at).toLocaleString("ar", { timeZone: "UTC" })}{" "}
              UTC
            </small>
            <p>{n.body}</p>
          </div>
        ))
      ) : (
        <p>لا توجد ملاحظات بعد.</p>
      )}
    </AdminShell>
  );
}
