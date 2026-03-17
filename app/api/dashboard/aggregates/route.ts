import { NextResponse } from "next/server";
import { getDashboardData } from "@/lib/dashboard/queries";
import type { DashboardDateRange } from "@/lib/dashboard/types";
import { createClient } from "@/lib/supabase/server";
import { getLatestMarketFreshness } from "@/lib/market/snapshots";

const ALLOWED_RANGES: DashboardDateRange[] = ["Today", "Last 7 days", "Last 30 days", "Last quarter"];

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requestedRange = searchParams.get("range") as DashboardDateRange | null;
  const range = requestedRange && ALLOWED_RANGES.includes(requestedRange) ? requestedRange : "Last 30 days";

  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ ok: false, error: "Unauthorized" }, { status: 401 });
  }

  const [data, marketFreshness] = await Promise.all([
    getDashboardData(supabase, user.id, range),
    getLatestMarketFreshness(),
  ]);

  return NextResponse.json({ ok: true, data, range, marketFreshness });
}
