import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { getLatestPrices } from "@/lib/market/service";
import type { PortfolioAsset } from "@/types/trade";

type BalanceRow = {
  asset: string;
  available: string | number;
};

type AssetMetaRow = {
  symbol: string;
  name: string;
};

type HistoricalPriceRow = {
  asset: string;
  price?: string | number | null;
  last_price?: string | number | null;
  captured_at?: string | null;
  priced_at?: string | null;
  created_at?: string | null;
  source?: string | null;
};

type PortfolioAssetWithTrace = PortfolioAsset & {
  priceEur: number;
  priceSource: string;
  pricedAt: string;
  priceAsOf24h: number;
  changeSource: string;
  changeComputedFrom: {
    latestPricedAt: string;
    previousPricedAt: string;
  };
};

function toNumber(value: string | number | null | undefined): number {
  const num = Number(value ?? 0);
  return Number.isFinite(num) ? num : 0;
}

export async function GET() {
  const supabase = await createClient();

  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { data: balances, error: balanceError } = await supabase
    .from("balances")
    .select("asset, available")
    .eq("user_id", user.id)
    .gt("available", 0);

  if (balanceError) {
    console.error("Portfolio balances fetch error:", balanceError);
    return NextResponse.json({ error: "Failed to fetch portfolio" }, { status: 500 });
  }

  const normalizedBalances = (balances ?? []) as BalanceRow[];
  if (!normalizedBalances.length) {
    return NextResponse.json([]);
  }

  const symbols = [...new Set(normalizedBalances.map((row) => String(row.asset).toUpperCase()))];

  const [{ data: assetsMeta, error: assetsError }, latestPrices] = await Promise.all([
    supabase.from("assets").select("symbol, name").in("symbol", symbols),
    getLatestPrices(symbols),
  ]);

  if (assetsError) {
    console.error("Portfolio assets metadata fetch error:", assetsError);
    return NextResponse.json({ error: "Failed to fetch portfolio metadata" }, { status: 500 });
  }

  const metadataBySymbol = new Map(
    ((assetsMeta ?? []) as AssetMetaRow[]).map((row) => [String(row.symbol).toUpperCase(), row]),
  );

  const latestPriceBySymbol = new Map(latestPrices.map((row) => [row.asset.toUpperCase(), row]));

  const cutoff24h = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();

  const { data: historicalPrices, error: historicalError } = await supabase
    .from("market_prices")
    .select("asset, price, last_price, captured_at, priced_at, created_at, source")
    .in("asset", symbols)
    .lte("captured_at", cutoff24h)
    .order("captured_at", { ascending: false })
    .limit(Math.max(symbols.length * 8, 50));

  if (historicalError) {
    console.error("Portfolio historical prices fetch error:", historicalError);
    return NextResponse.json({ error: "Failed to fetch historical pricing" }, { status: 500 });
  }

  const historyBySymbol = new Map<string, HistoricalPriceRow[]>();
  for (const row of (historicalPrices ?? []) as HistoricalPriceRow[]) {
    const symbol = String(row.asset).toUpperCase();
    if (!historyBySymbol.has(symbol)) {
      historyBySymbol.set(symbol, []);
    }
    historyBySymbol.get(symbol)?.push(row);
  }

  const portfolio: PortfolioAssetWithTrace[] = normalizedBalances
    .map((balance) => {
      const symbol = String(balance.asset).toUpperCase();
      const meta = metadataBySymbol.get(symbol);
      const latest = latestPriceBySymbol.get(symbol);
      const holdings = toNumber(balance.available);

      const latestPrice = toNumber(latest?.priceEur);
      const value = holdings * latestPrice;

      const candidates = historyBySymbol.get(symbol) ?? [];
      const sameSourceCandidate = candidates.find(
        (entry) => String(entry.source ?? "").toLowerCase() === String(latest?.source ?? "").toLowerCase(),
      );
      const baseline = sameSourceCandidate ?? candidates[0];
      const baselinePrice = toNumber(baseline?.price ?? baseline?.last_price ?? 0);

      const change = baselinePrice > 0 ? ((latestPrice - baselinePrice) / baselinePrice) * 100 : 0;

      const latestPricedAt = latest?.pricedAt ?? new Date(0).toISOString();
      const previousPricedAt =
        baseline?.captured_at ?? baseline?.priced_at ?? baseline?.created_at ?? new Date(0).toISOString();

      return {
        symbol,
        name: meta?.name ?? symbol,
        holdings,
        value,
        change,
        priceEur: latestPrice,
        priceSource: latest?.source ?? "unavailable",
        pricedAt: latestPricedAt,
        priceAsOf24h: baselinePrice,
        changeSource: baseline?.source ?? latest?.source ?? "unavailable",
        changeComputedFrom: {
          latestPricedAt,
          previousPricedAt,
        },
      };
    })
    .sort((a, b) => {
      if (b.value !== a.value) return b.value - a.value;
      return a.symbol.localeCompare(b.symbol);
    });

  return NextResponse.json(portfolio);
}
