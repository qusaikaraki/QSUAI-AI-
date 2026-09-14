import { timingSafeEqual } from "node:crypto";
import { NextResponse } from "next/server";
import { drainOutbox } from "@/lib/email";
export async function GET(request: Request) {
  const expected = process.env.CRON_SECRET
    ? `Bearer ${process.env.CRON_SECRET}`
    : "";
  const actual = request.headers.get("authorization") || "";
  if (
    !expected ||
    expected.length !== actual.length ||
    !timingSafeEqual(Buffer.from(expected), Buffer.from(actual))
  )
    return new NextResponse(null, { status: 401 });
  return NextResponse.json(await drainOutbox());
}
