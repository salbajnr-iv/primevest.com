import { createClient } from "@supabase/supabase-js";
import { getAgeSeconds, getMarketFreshnessState, type MarketFreshnessState } from "@/lib/market/freshness";
import { getLatestPrices } from "@/lib/market/service";

export type AssetSnapshot = {
  asset: string;
  priceEur: number;
  source: string;
  pricedAt: string;
  freshnessStatus: MarketFreshnessState;
  freshnessAgeSeconds: number;
};

function createServiceSupabase() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return null;
  }

  return createClient(supabaseUrl, serviceRole, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}

export async function getAssetSnapshots(assets: string[]): Promise<AssetSnapshot[]> {
  const latest = await getLatestPrices(assets);
  if (latest.length) {
    return latest.map((row) => {
      const freshnessAgeSeconds = getAgeSeconds(row.pricedAt);
      return {
        asset: row.asset,
        priceEur: row.priceEur,
        source: row.source,
        pricedAt: row.pricedAt,
        freshnessAgeSeconds,
        freshnessStatus: getMarketFreshnessState(freshnessAgeSeconds),
      };
    });
  }

  const supabase = createServiceSupabase();
  if (!supabase || !assets.length) return [];

  const normalized = assets.map((asset) => asset.toUpperCase());

  const { data, error } = await supabase
    .from("asset_snapshots")
    .select("asset, price_eur, source, priced_at, updated_at")
    .in("asset", normalized);

  if (error || !data) return [];

  return data.map((row) => {
    const pricedAt = row.priced_at ?? row.updated_at ?? new Date(0).toISOString();
    const freshnessAgeSeconds = getAgeSeconds(pricedAt);
    return {
      asset: String(row.asset).toUpperCase(),
      priceEur: Number(row.price_eur),
      source: String(row.source ?? "unknown"),
      pricedAt,
      freshnessAgeSeconds,
      freshnessStatus: getMarketFreshnessState(freshnessAgeSeconds),
    };
  });
}

export async function getLatestMarketFreshness() {
  const supabase = createServiceSupabase();
  if (!supabase) {
    return {
      source: "unavailable",
      updatedAt: new Date(0).toISOString(),
      ageSeconds: Number.MAX_SAFE_INTEGER,
      status: "stale" as MarketFreshnessState,
    };
  }

  const { data } = await supabase
    .from("asset_snapshots")
    .select("source, priced_at, updated_at")
    .order("priced_at", { ascending: false })
    .limit(1)
    .maybeSingle();

  const updatedAt = data?.priced_at ?? data?.updated_at ?? new Date(0).toISOString();
  const ageSeconds = getAgeSeconds(updatedAt);

  return {
    source: String(data?.source ?? "unavailable"),
    updatedAt,
    ageSeconds,
    status: getMarketFreshnessState(ageSeconds),
  };
}
