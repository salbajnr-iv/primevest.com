import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { PortfolioSummary } from "@/lib/dashboard/types";
import { getLatestMarketFreshness } from "@/lib/market/snapshots";


type RouteErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "QUERY_FAILED";

const EMPTY_SUMMARY: PortfolioSummary = {
  userName: "User",
  portfolioValue: 0,
  portfolioChangePct: 0,
  availableBalance: 0,
  availableBalanceChangePct: 0,
  notificationCount: 0,
};

const errorResponse = (status: number, code: RouteErrorCode, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

export async function GET() {
  const supabase = await createServerClient();

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required");
  }

  const [{ data: profile, error: profileError }, { count: notificationCount, error: notificationError }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, account_balance").eq("id", user.id).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", user.id),
  ]);

  if (profileError || notificationError) {
    const code = profileError?.code || notificationError?.code;
    if (code === "42501") {
      return errorResponse(403, "FORBIDDEN", "Forbidden");
    }
    return errorResponse(500, "QUERY_FAILED", "Failed to load summary data");
  }

  if (profile && profile.id !== user.id) {
    return errorResponse(403, "FORBIDDEN", "Forbidden");
  }

  const marketFreshness = await getLatestMarketFreshness();

  if (!profile) {
    return NextResponse.json({ ok: true, summary: EMPTY_SUMMARY, marketFreshness });
  }

  // Use full name if available, fallback to email prefix, then fallback to "User"
  const userName = profile.full_name?.trim() 
    ? profile.full_name.trim()
    : profile?.email ? profile.email.split("@")[0] : "User";
  const balance = Number(profile.account_balance ?? 0);

  return NextResponse.json({
    ok: true,
    marketFreshness,
    summary: {
      userName,
      portfolioValue: balance,
      portfolioChangePct: 0,
      availableBalance: balance,
      availableBalanceChangePct: 0,
      notificationCount: notificationCount ?? 0,
    } satisfies PortfolioSummary,
  });
}
