import { redirect } from "next/navigation";
import { admin, db } from "@/lib/db";
import { cohortDefault, courseDefault } from "@/lib/config";
import { AdminShell } from "@/components/admin-shell";
import { CourseManagement } from "@/components/admin-forms";
export default async function Page() {
  if (!(await admin())) redirect("/admin/login");
  const [{ data: course }, { data: cohort }] = await Promise.all([
    db().from("courses").select("*").eq("id", courseDefault.id).single(),
    db().from("cohorts").select("*").eq("id", cohortDefault.id).single(),
  ]);
  return (
    <AdminShell>
      <div className="admin-title">
        <h1>إدارة البرنامج والدفعة</h1>
      </div>
      {course && cohort ? (
        <CourseManagement course={course} cohort={cohort} />
      ) : (
        <div className="notice">
          لم تُعثر على بيانات البرنامج. راجع تهيئة قاعدة البيانات.
        </div>
      )}
    </AdminShell>
  );
}
