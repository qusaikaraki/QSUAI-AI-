"use server";
import { redirect } from "next/navigation";
import { auth, admin, configured } from "@/lib/db";
import { guard } from "@/lib/security";
export async function login(_previous: { error: string }, form: FormData) {
  try {
    await guard("admin-login", 8);
    if (!configured()) return { error: "يجب إعداد خدمة المصادقة قبل الدخول." };
    const email = String(form.get("email") || "").trim();
    const password = String(form.get("password") || "");
    if (email.length > 254 || password.length > 200)
      return { error: "بيانات الدخول غير صحيحة." };
    const client = await auth();
    const { error } = await client.auth.signInWithPassword({ email, password });
    if (error || !(await admin())) {
      await client.auth.signOut();
      return { error: "تعذّر الدخول. تحقق من بياناتك وصلاحية الإدارة." };
    }
  } catch {
    return {
      error: "تعذّر تسجيل الدخول حاليًا. تحقق من الإعدادات أو حاول لاحقًا.",
    };
  }
  redirect("/admin");
}
export async function logout() {
  if (configured()) {
    const client = await auth();
    await client.auth.signOut();
  }
  redirect("/admin/login");
}
