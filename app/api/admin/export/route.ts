import { NextResponse } from "next/server";
import { admin } from "@/lib/db";
import { registrationQuery } from "@/lib/admin-data";
import { csvCell } from "@/lib/security";
export async function GET(request: Request) {
  if (!(await admin())) return new NextResponse(null, { status: 401 });
  const filters = Object.fromEntries(new URL(request.url).searchParams);
  const columns = [
    "id",
    "created_at",
    "full_name",
    "email",
    "phone",
    "university",
    "major",
    "year",
    "ai_level",
    "registration_status",
    "payment_status",
  ];
  let csv = "\uFEFF" + columns.map(csvCell).join(",") + "\r\n";
  let start = 0;
  while (true) {
    const { data, error } = await registrationQuery(filters).range(
      start,
      start + 499,
    );
    if (error)
      return NextResponse.json({ error: "تعذّر التصدير" }, { status: 500 });
    for (const r of data || [])
      csv += columns.map((c) => csvCell(r[c])).join(",") + "\r\n";
    if (!data || data.length < 500) break;
    start += 500;
    if (start >= 50000)
      return NextResponse.json(
        { error: "ضيّق نطاق التاريخ لتصدير أقل من 50000 طلب." },
        { status: 413 },
      );
  }
  return new NextResponse(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": 'attachment; filename="registrations.csv"',
      "Cache-Control": "no-store",
    },
  });
}
