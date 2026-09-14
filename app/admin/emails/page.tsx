import { redirect } from "next/navigation";
import { admin, db } from "@/lib/db";
import { AdminShell } from "@/components/admin-shell";
import { EmailActions } from "@/components/email-admin";
export default async function Page() {
  if (!(await admin())) redirect("/admin/login");
  const { data } = await db()
    .from("email_outbox")
    .select("id,recipient,template,status,attempts,created_at")
    .order("created_at", { ascending: false })
    .limit(50);
  return (
    <AdminShell>
      <div className="admin-title">
        <h1>البريد والإشعارات</h1>
      </div>
      {!process.env.RESEND_API_KEY && (
        <div className="notice">
          مزود البريد غير متصل. الرسائل محفوظة في صندوق الإرسال حتى استكمال
          الإعداد.
        </div>
      )}
      <EmailActions />
      <h2 style={{ fontSize: 23, marginBlock: 25 }}>آخر 50 رسالة</h2>
      <div className="table-wrap">
        <table>
          <thead>
            <tr>
              {["المستلم", "نوع الرسالة", "الحالة", "المحاولات"].map((t) => (
                <th key={t}>{t}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {data?.map((e) => (
              <tr key={e.id}>
                <td dir="ltr">{e.recipient}</td>
                <td>
                  {{
                    received: "استلام التسجيل",
                    approved: "قبول",
                    waitlisted: "قائمة الانتظار",
                    reminder: "تذكير",
                    starting: "بدء قريب",
                    admin: "إشعار الإدارة",
                  }[e.template as string] || e.template}
                </td>
                <td>
                  {{
                    pending: "بانتظار الإرسال",
                    processing: "جارٍ الإرسال",
                    sent: "أُرسلت",
                    failed: "فشل الإرسال",
                  }[e.status as string] || e.status}
                </td>
                <td>{e.attempts}</td>
              </tr>
            ))}
          </tbody>
        </table>
        {!data?.length && <div className="empty-state">لا توجد رسائل بعد.</div>}
      </div>
    </AdminShell>
  );
}
