import "server-only";
import { createAdminClient } from "@/lib/supabase/admin";
import { getAgeSeconds, getMarketFreshnessState, type MarketFreshnessState } from "@/lib/market/freshness";
import { getLatestPrices } from "@/lib/market/service";
import type { AssetSnapshotRow } from "@/lib/market/types";

export type AssetSnapshot = {
  asset: string;
  priceEur: number;
  source: string;
  pricedAt: string;
  freshnessStatus: MarketFreshnessState;
  freshnessAgeSeconds: number;
};

function createServiceSupabase() {
  const adminClient = createAdminClient();
  return adminClient;
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

  return data.map((row: AssetSnapshotRow) => {
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

  const snapshotData = data as unknown as AssetSnapshotRow | null;
  const updatedAt = snapshotData?.priced_at ?? snapshotData?.updated_at ?? new Date(0).toISOString();
  const ageSeconds = getAgeSeconds(updatedAt);

  return {
    source: String(snapshotData?.source ?? "unavailable"),
    updatedAt,
    ageSeconds,
    status: getMarketFreshnessState(ageSeconds),
  };
}
