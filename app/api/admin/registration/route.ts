import { NextResponse, after } from "next/server";
import { admin, db } from "@/lib/db";
import { guard } from "@/lib/security";
import { updateSchema } from "@/lib/validation";
import { drainOutbox } from "@/lib/email";
export async function POST(request: Request) {
  const user = await admin();
  if (!user) return new NextResponse(null, { status: 401 });
  try {
    await guard("admin-update", 120);
    const parsed = updateSchema.safeParse(await request.json());
    if (!parsed.success)
      return NextResponse.json({ error: "راجع الحقول." }, { status: 400 });
    const p = parsed.data;
    const { error } = await db().rpc("update_registration", {
      p_id: p.id,
      p_status: p.status,
      p_payment: p.payment,
      p_admin: user.id,
      p_note: p.note,
    });
    if (error)
      return NextResponse.json(
        {
          error: error.message.includes("FULL")
            ? "سعة الدفعة مكتملة. عدّل السعة أو أفرغ مقعدًا قبل القبول."
            : "تعذّر حفظ التعديل.",
        },
        { status: 409 },
      );
    after(async () => {
      try {
        await drainOutbox();
      } catch {}
    });
    return NextResponse.json({ success: true });
  } catch {
    return NextResponse.json(
      { error: "تعذّر الحفظ. أعد المحاولة." },
      { status: 503 },
    );
  }
}
