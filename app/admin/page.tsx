import Link from "next/link";
import { redirect } from "next/navigation";
import { admin, db } from "@/lib/db";
import { cohortDefault, statusLabels } from "@/lib/config";
import { levels, years } from "@/lib/content";
import { registrationQuery, type Filters } from "@/lib/admin-data";
import { AdminShell } from "@/components/admin-shell";
export default async function Page({
  searchParams,
}: {
  searchParams: Promise<Filters>;
}) {
  if (!(await admin())) redirect("/admin/login");
  const filters = await searchParams;
  const page = Math.max(1, Math.min(100000, Number(filters.page) || 1));
  const client = db();
  const {
    data: rows,
    count,
    error,
  } = await registrationQuery(filters).range((page - 1) * 25, page * 25 - 1);
  const counts = await Promise.all(
    ["pending", "approved", "waitlisted", "rejected", "cancelled"].map(
      async (status) => {
        const { count, error } = await client
          .from("registrations")
          .select("id", { count: "exact", head: true })
          .eq("registration_status", status);
        if (error) throw error;
        return count || 0;
      },
    ),
  );
  const today = new Date().toISOString().slice(0, 10);
  const { count: todayCount } = await client
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .gte("created_at", today + "T00:00:00Z");
  const { data: cohort } = await client
    .from("cohorts")
    .select("capacity")
    .eq("id", cohortDefault.id)
    .single();
  const { count: occupied } = await client
    .from("registrations")
    .select("id", { count: "exact", head: true })
    .eq("cohort_id", cohortDefault.id)
    .in("registration_status", ["pending", "approved"]);
  const stats = [
    ["إجمالي الطلبات", counts.reduce((a, b) => a + b, 0)],
    ["اليوم (UTC)", todayCount || 0],
    ["قيد المراجعة", counts[0]],
    ["المقبولون", counts[1]],
    ["قائمة الانتظار", counts[2]],
    ["الطلبات الملغاة", counts[4]],
    ["غير المقبولين", counts[3]],
    [
      "المقاعد المتاحة",
      cohort?.capacity == null
        ? "غير محددة"
        : Math.max(0, cohort.capacity - (occupied || 0)),
    ],
  ];
  const params = new URLSearchParams(
    Object.entries(filters).filter((e): e is [string, string] => !!e[1]),
  );
  const pageHref = (p: number) => {
    const next = new URLSearchParams(params);
    next.set("page", String(p));
    return "/admin?" + next;
  };
  return (
    <AdminShell>
      <div className="admin-title">
        <div>
          <span className="eyebrow">طلاب اليوم، مشاريع الغد</span>
          <h1>نظرة عامة على التسجيل</h1>
        </div>
        <a
          className="button secondary small"
          href={"/api/admin/export?" + params}
        >
          تصدير النتائج CSV ↓
        </a>
      </div>
      <div className="stat-grid">
        {stats.map(([label, value]) => (
          <div className="stat" key={label}>
            <span>{label}</span>
            <strong>{value}</strong>
          </div>
        ))}
      </div>
      <h2 style={{ fontSize: 24 }}>طلبات التسجيل</h2>
      <form className="filters" method="get">
        <label>
          ابحث بالاسم أو البريد
          <input className="filter-input" name="q" defaultValue={filters.q} />
        </label>
        {[
          ["university", "الجامعة"],
          ["major", "التخصص"],
        ].map(([key, label]) => (
          <label key={key}>
            {label} (مطابقة تامة)
            <input
              className="filter-input"
              name={key}
              defaultValue={filters[key]}
            />
          </label>
        ))}
        {[
          ["year", "السنة الجامعية", years],
          ["ai_level", "مستوى AI", levels],
          ["registration_status", "حالة الطلب", Object.keys(statusLabels)],
        ].map(([key, label, options]) => (
          <label key={key as string}>
            {label}
            <select
              className="filter-input"
              name={key as string}
              defaultValue={filters[key as string] || ""}
            >
              <option value="">الكل</option>
              {(options as string[]).map((v) => (
                <option key={v} value={v}>
                  {statusLabels[v] || v}
                </option>
              ))}
            </select>
          </label>
        ))}
        <label>
          من تاريخ (UTC)
          <input
            className="filter-input"
            type="date"
            name="from"
            defaultValue={filters.from}
          />
        </label>
        <label>
          إلى تاريخ (UTC)
          <input
            className="filter-input"
            type="date"
            name="to"
            defaultValue={filters.to}
          />
        </label>
        <div style={{ display: "flex", alignItems: "end", gap: 10 }}>
          <button className="button small">تطبيق الفلاتر</button>
          <Link href="/admin" className="text-link">
            مسح
          </Link>
        </div>
      </form>
      {error ? (
        <p role="alert" className="notice">
          تعذّر تحميل الطلبات. أعد المحاولة.
        </p>
      ) : (
        <div className="table-wrap">
          <table>
            <caption className="sr-only">
              طلبات التسجيل المطابقة للفلاتر
            </caption>
            <thead>
              <tr>
                {[
                  "الاسم",
                  "البريد",
                  "الهاتف",
                  "الجامعة",
                  "التخصص",
                  "السنة",
                  "مستوى AI",
                  "التاريخ",
                  "الحالة",
                  "الإجراء",
                ].map((t) => (
                  <th scope="col" key={t}>
                    {t}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows?.map((r) => (
                <tr key={r.id}>
                  <td>{r.full_name}</td>
                  <td dir="ltr">{r.email}</td>
                  <td dir="ltr">{r.phone}</td>
                  <td>{r.university}</td>
                  <td>{r.major}</td>
                  <td>{r.year}</td>
                  <td>{r.ai_level}</td>
                  <td>
                    {new Date(r.created_at).toLocaleDateString("ar", {
                      timeZone: "UTC",
                    })}
                  </td>
                  <td>
                    <span className={"badge " + r.registration_status}>
                      {statusLabels[r.registration_status]}
                    </span>
                  </td>
                  <td>
                    <Link
                      className="text-link"
                      style={{ margin: 0 }}
                      href={"/admin/registrations/" + r.id}
                    >
                      عرض ومراجعة
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {!rows?.length && (
            <div className="empty-state">
              لا توجد طلبات مطابقة. ستظهر التسجيلات الحقيقية هنا عند وصولها.
            </div>
          )}
        </div>
      )}
      <div className="pagination">
        <span>
          {count || 0} طلب · الصفحة {page}
        </span>
        <div style={{ display: "flex", gap: 20 }}>
          {page > 1 && <Link href={pageHref(page - 1)}>السابق</Link>}
          {page * 25 < (count || 0) && (
            <Link href={pageHref(page + 1)}>التالي</Link>
          )}
        </div>
      </div>
    </AdminShell>
  );
}
