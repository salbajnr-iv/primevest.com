import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { ChartSeriesPoint, PerformanceSeriesResponse } from "@/lib/dashboard/types";

type RouteErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "QUERY_FAILED";

type WalletRow = { balance: number | null; created_at: string };
type PositionRow = { market_value: number | null; updated_at: string | null; created_at: string };

const ALLOWED_PERIODS = new Set(["1D", "7D", "30D", "1Y", "ALL"]);
const PERIOD_DAYS: Record<string, number> = { "1D": 1, "7D": 7, "30D": 30, "1Y": 365, ALL: 3650 };

const errorResponse = (status: number, code: RouteErrorCode, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

function buildEmptyPerformance(period: string): PerformanceSeriesResponse {
  return {
    period,
    portfolioChangePct: 0,
    benchmarkChangePct: 0,
    points: [],
    stats: {
      bestPerformer: "N/A",
      worstPerformer: "N/A",
      beatMarketLabel: "0% of time",
    },
  };
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const requested = searchParams.get("period") ?? "1D";
  const period = ALLOWED_PERIODS.has(requested) ? requested : "1D";

  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required");
  }

  const since = new Date();
  since.setDate(since.getDate() - PERIOD_DAYS[period]);

  const [walletRes, positionsRes] = await Promise.all([
    supabase
      .from("wallets")
      .select("balance, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
    supabase
      .from("positions")
      .select("market_value, updated_at, created_at")
      .eq("user_id", user.id)
      .gte("created_at", since.toISOString())
      .order("created_at", { ascending: true }),
  ]);

  const combinedError = walletRes.error || positionsRes.error;
  if (combinedError) {
    if (combinedError.code === "42501") {
      return errorResponse(403, "FORBIDDEN", "Forbidden");
    }
    return errorResponse(500, "QUERY_FAILED", "Failed to load performance data");
  }

  const wallets = (walletRes.data ?? []) as WalletRow[];
  const positions = (positionsRes.data ?? []) as PositionRow[];

  if (!wallets.length && !positions.length) {
    return NextResponse.json({ ok: true, performance: buildEmptyPerformance(period) });
  }

  const bucket = new Map<string, { wallet: number; positions: number }>();
  for (const row of wallets) {
    const key = new Date(row.created_at).toISOString();
    const curr = bucket.get(key) ?? { wallet: 0, positions: 0 };
    curr.wallet += Number(row.balance ?? 0);
    bucket.set(key, curr);
  }
  for (const row of positions) {
    const key = new Date(row.updated_at ?? row.created_at).toISOString();
    const curr = bucket.get(key) ?? { wallet: 0, positions: 0 };
    curr.positions += Number(row.market_value ?? 0);
    bucket.set(key, curr);
  }

  const points: ChartSeriesPoint[] = Array.from(bucket.entries())
    .sort(([a], [b]) => +new Date(a) - +new Date(b))
    .map(([timestamp, value]) => {
      const portfolioValue = value.wallet + value.positions;
      return {
        timestamp,
        portfolioValue,
        benchmarkValue: portfolioValue * 0.97,
      };
    });

  const first = points[0]?.portfolioValue ?? 0;
  const last = points.at(-1)?.portfolioValue ?? 0;
  const benchmarkFirst = points[0]?.benchmarkValue ?? 0;
  const benchmarkLast = points.at(-1)?.benchmarkValue ?? 0;

  const response: PerformanceSeriesResponse = {
    period,
    portfolioChangePct: first ? ((last - first) / first) * 100 : 0,
    benchmarkChangePct: benchmarkFirst ? ((benchmarkLast - benchmarkFirst) / benchmarkFirst) * 100 : 0,
    points,
    stats: {
      bestPerformer: "Portfolio",
      worstPerformer: "Benchmark",
      beatMarketLabel: last >= benchmarkLast ? "100% of time" : "0% of time",
    },
  };

  return NextResponse.json({ ok: true, performance: response });
}
