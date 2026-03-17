import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import {
  MARKET_IMPACT_THRESHOLDS,
  calculateMarketImpactPercent,
  getImpactSeverity,
  isImpactBlocked,
  requiresImpactConfirmation,
} from "@/lib/swap/market-impact";

type RpcMarketImpactResult = {
  impact_pct: number | null;
  severity: "normal" | "warn" | "high" | null;
  classification: "normal" | "warn" | "confirm_required" | "blocked" | null;
  warn_threshold: number | null;
  confirmation_threshold: number | null;
  block_threshold: number | null;
};

const DEFAULT_LIQUIDITY_EUR = 1_000_000;

export async function POST(req: Request) {
  try {
    const body = await req.json();

    if (!body || typeof body !== "object") {
      return NextResponse.json({ ok: false, error: "Request payload must be a JSON object." }, { status: 400 });
    }

    const amountEur = Number((body as Record<string, unknown>).amountEur);
    const liquidityEur = Number((body as Record<string, unknown>).liquidityEur ?? DEFAULT_LIQUIDITY_EUR);
    const symbol = String((body as Record<string, unknown>).symbol ?? "").toUpperCase();

    const safeAmountEur = Number.isFinite(amountEur) && amountEur > 0 ? amountEur : 0;
    const safeLiquidityEur = Number.isFinite(liquidityEur) && liquidityEur > 0 ? liquidityEur : DEFAULT_LIQUIDITY_EUR;

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

    let rpcResult: RpcMarketImpactResult | null = null;

    if (supabaseUrl && serviceRole) {
      const supabase = createClient(supabaseUrl, serviceRole);
      const { data, error } = await supabase.rpc("estimate_buy_market_impact", {
        p_amount_eur: safeAmountEur,
        p_liquidity_eur: safeLiquidityEur,
        p_symbol: symbol || null,
      });

      if (!error) {
        rpcResult = (Array.isArray(data) ? data[0] : data) as RpcMarketImpactResult | null;
      }
    }

    const impactPct = Number(rpcResult?.impact_pct ?? calculateMarketImpactPercent({ amountEur: safeAmountEur, liquidityEur: safeLiquidityEur }));
    const severity = rpcResult?.severity ?? getImpactSeverity(impactPct);
    const requiresConfirmation = requiresImpactConfirmation(impactPct);
    const blocked = isImpactBlocked(impactPct);

    const classification = rpcResult?.classification ?? (blocked ? "blocked" : requiresConfirmation ? "confirm_required" : impactPct >= MARKET_IMPACT_THRESHOLDS.warnPct ? "warn" : "normal");

    return NextResponse.json({
      ok: true,
      data: {
        symbol,
        amountEur: safeAmountEur,
        liquidityEur: safeLiquidityEur,
        impactPct: Number.isFinite(impactPct) ? Number(impactPct.toFixed(2)) : 0,
        severity,
        classification,
        threshold: {
          warnPct: Number(rpcResult?.warn_threshold ?? MARKET_IMPACT_THRESHOLDS.warnPct),
          confirmationRequiredPct: Number(rpcResult?.confirmation_threshold ?? MARKET_IMPACT_THRESHOLDS.confirmationRequiredPct),
          blockPct: Number(rpcResult?.block_threshold ?? MARKET_IMPACT_THRESHOLDS.blockPct),
        },
        requiresConfirmation,
        blocked,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Failed to estimate market impact.", details: String(error) }, { status: 500 });
  }
}
