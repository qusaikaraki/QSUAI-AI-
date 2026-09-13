import Link from "next/link";
import { logout } from "@/app/admin/actions";
export function AdminSidebar() {
  return (
    <aside className="admin-sidebar">
      <h2>إدارة الأكاديمية</h2>
      <Link href="/admin">نظرة عامة والطلبات</Link>
      <Link href="/admin/course">إدارة البرنامج والدفعة</Link>
      <Link href="/admin/messages">رسائل التواصل</Link>
      <Link href="/admin/emails">البريد والإشعارات</Link>
      <form action={logout}>
        <button className="button secondary small">تسجيل الخروج</button>
      </form>
    </aside>
  );
}
export function AdminShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="admin-shell">
      <AdminSidebar />
      <div className="admin-main">{children}</div>
    </div>
  );
}
