import { NextResponse } from "next/server";
import { getPerformanceSeries } from "@/lib/dashboard/mock-data";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const period = searchParams.get("period") ?? "1D";

  return NextResponse.json({ ok: true, performance: getPerformanceSeries(period) });
}
