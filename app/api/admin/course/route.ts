import { NextResponse } from "next/server";
import { admin, db } from "@/lib/db";
import { guard } from "@/lib/security";
import { courseSchema } from "@/lib/validation";
import { cohortDefault } from "@/lib/config";
export async function POST(request: Request) {
  const user = await admin();
  if (!user) return new NextResponse(null, { status: 401 });
  try {
    await guard("admin-course", 60);
    const parsed = courseSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        {
          error:
            "راجع التواريخ والأرقام والمنطقة الزمنية والروابط. يجب أن يكون رابط اللقاء HTTPS.",
        },
        { status: 400 },
      );
    const { error } = await db().rpc("save_program", {
      p_cohort: cohortDefault.id,
      p_data: parsed.data,
      p_admin: user.id,
    });
    if (error)
      return NextResponse.json(
        {
          error: error.message.includes("CAPACITY")
            ? "لا يمكن خفض السعة عن عدد الطلبات المحجوزة."
            : "تعذّر حفظ معلومات البرنامج.",
        },
        { status: 409 },
      );
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json({ error: "تعذّر الحفظ حاليًا." }, { status: 503 });
  }
}
