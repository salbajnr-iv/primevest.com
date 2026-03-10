import { NextResponse } from "next/server";
import { recentActivity } from "@/lib/dashboard/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, activity: recentActivity });
}
