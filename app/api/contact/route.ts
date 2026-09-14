import { NextResponse } from "next/server";
import { contactSchema } from "@/lib/validation";
import { db } from "@/lib/db";
import { guard } from "@/lib/security";
export async function POST(request: Request) {
  try {
    await guard("contact");
    const raw = await request.text();
    if (raw.length > 12000)
      return NextResponse.json(
        { error: "الرسالة أطول من المسموح" },
        { status: 413 },
      );
    const parsed = contactSchema.safeParse(JSON.parse(raw));
    if (!parsed.success)
      return NextResponse.json(
        { error: "يرجى مراجعة الاسم والبريد والرسالة." },
        { status: 400 },
      );
    const { website, ...message } = parsed.data;
    void website;
    const { error } = await db().from("contact_messages").insert(message);
    if (error) throw error;
    return NextResponse.json({ success: true }, { status: 201 });
  } catch (e) {
    return NextResponse.json(
      {
        error:
          e instanceof Error && e.message === "RATE_LIMIT"
            ? "حاول مجددًا بعد 15 دقيقة."
            : "تعذّر إرسال الرسالة. يرجى المحاولة لاحقًا.",
      },
      { status: e instanceof Error && e.message === "RATE_LIMIT" ? 429 : 503 },
    );
  }
}
