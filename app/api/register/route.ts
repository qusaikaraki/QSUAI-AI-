import { NextResponse, after } from "next/server";
import { cookies } from "next/headers";
import { registrationSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { guard } from "@/lib/security";
import { drainOutbox } from "@/lib/email";
export async function POST(request: Request) {
  try {
    await guard("registration");
    if (Number(request.headers.get("content-length") || 0) > 16000)
      return NextResponse.json(
        { error: "الطلب أكبر من المسموح" },
        { status: 413 },
      );
    const raw = await request.text();
    if (raw.length > 16000)
      return NextResponse.json(
        { error: "الطلب أكبر من المسموح" },
        { status: 413 },
      );
    const parsed = registrationSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return NextResponse.json(
        { error: "يرجى مراجعة الحقول المطلوبة وصيغة البيانات." },
        { status: 400 },
      );
    const { data, error } = await db().rpc("submit_registration", {
      p_data: parsed.data,
      p_admin_email: process.env.ADMIN_NOTIFICATION_EMAIL || null,
    });
    if (error) {
      if (error.code === "23505")
        return NextResponse.json(
          {
            error:
              "يوجد طلب مسجل بهذا البريد لهذه الدفعة. تواصل معنا للاستفسار عنه.",
          },
          { status: 409 },
        );
      if (error.message.includes("CLOSED"))
        return NextResponse.json(
          { error: "التسجيل لهذه الدفعة غير متاح الآن." },
          { status: 409 },
        );
      if (error.message.includes("FULL"))
        return NextResponse.json(
          { error: "اكتملت سعة الدفعة. تابع الإعلان عن الدفعة القادمة." },
          { status: 409 },
        );
      throw error;
    }
    const jar = await cookies();
    jar.set("registration_reference", data, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      path: "/registration-success",
      maxAge: 3600,
    });
    after(async () => {
      try {
        await drainOutbox();
      } catch {
        /* Durable outbox will retry. */
      }
    });
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    const message = e instanceof Error ? e.message : "";
    return NextResponse.json(
      {
        error:
          message === "RATE_LIMIT"
            ? "طلبات كثيرة خلال وقت قصير. حاول بعد 15 دقيقة."
            : "تعذّر إرسال الطلب الآن. لم يتم تأكيد تسجيلك؛ حاول لاحقًا أو تواصل معنا.",
      },
      {
        status:
          message === "RATE_LIMIT" ? 429 : message === "ORIGIN" ? 403 : 503,
      },
    );
  }
}
