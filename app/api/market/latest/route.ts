import { NextResponse } from "next/server";
import { getLatestPrices } from "@/lib/market/service";
import { getAgeSeconds, getMarketFreshnessState } from "@/lib/market/freshness";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assets = (searchParams.get("assets") || "")
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);

  const prices = await getLatestPrices(assets.length ? assets : undefined);
  const freshest = prices.reduce((latest, row) => {
    if (!latest) return row;
    return new Date(row.pricedAt).getTime() > new Date(latest.pricedAt).getTime() ? row : latest;
  }, prices[0]);

  const oldestAgeSeconds = prices.length
    ? Math.max(...prices.map((row) => getAgeSeconds(row.pricedAt)))
    : Number.MAX_SAFE_INTEGER;

  const freshness = {
    source: freshest?.source ?? "unavailable",
    latestPricedAt: freshest?.pricedAt ?? new Date(0).toISOString(),
    oldestAgeSeconds,
    status: getMarketFreshnessState(oldestAgeSeconds),
    isStale: prices.length > 0 && getMarketFreshnessState(oldestAgeSeconds) === "stale",
  };

  return NextResponse.json({ ok: true, prices, freshness });
}
