import { NextResponse, after } from "next/server";
import { z } from "zod";
import { admin, db } from "@/lib/db";
import { guard } from "@/lib/security";
import { drainOutbox } from "@/lib/email";
export async function POST(request: Request) {
  if (!(await admin())) return new NextResponse(null, { status: 401 });
  try {
    await guard("admin-email", 30);
    const parsed = z
      .object({
        registration_id: z.uuid(),
        template: z.enum(["reminder", "starting"]),
        instructions: z.string().trim().min(10).max(3000),
      })
      .safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json(
        { error: "راجع رقم التسجيل والتعليمات." },
        { status: 400 },
      );
    const { data: r } = await db()
      .from("registrations")
      .select("id,email,full_name,course_id")
      .eq("id", parsed.data.registration_id)
      .eq("registration_status", "approved")
      .single();
    if (!r)
      return NextResponse.json(
        { error: "لا يوجد طالب مقبول بهذا الرقم." },
        { status: 404 },
      );
    const { data: c } = await db()
      .from("courses")
      .select("name")
      .eq("id", r.course_id)
      .single();
    const { error } = await db()
      .from("email_outbox")
      .insert({
        recipient: r.email,
        template: parsed.data.template,
        payload: {
          name: r.full_name,
          course_name: c?.name,
          registration_id: r.id,
          instructions: parsed.data.instructions,
        },
      });
    if (error) throw error;
    after(async () => {
      try {
        await drainOutbox();
      } catch {}
    });
    return NextResponse.json({ message: "أُضيف التذكير إلى صندوق الإرسال." });
  } catch {
    return NextResponse.json(
      { error: "تعذّر تجهيز الرسالة." },
      { status: 503 },
    );
  }
}
