import { NextResponse } from "next/server";
import { portfolioSummary } from "@/lib/dashboard/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, summary: portfolioSummary });
}
