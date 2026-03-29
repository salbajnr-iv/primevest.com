import { NextResponse } from "next/server";

import { getAgeSeconds, getMarketFreshnessState } from "@/lib/market/freshness";
import type { AssetCategory, MarketListing } from "@/lib/market/listings";
import { createAdminClient } from "@/lib/supabase/admin";

const ALLOWED_CATEGORIES = new Set<AssetCategory>([
  "crypto",
  "stocks",
  "etfs",
  "metals",
  "commodities",
  "forex",
  "indices",
]);

type AssetRow = {
  id: string;
  symbol: string;
  name: string;
  status: string;
  metadata?: Record<string, any>;
};


type SnapshotRow = {
  asset: string | null;
  price_eur: number | string | null;
  source: string | null;
  source_status: string | null;
  priced_at: string | null;
  updated_at: string | null;
};

function toCategory(asset: AssetRow): AssetCategory {
  const rawCategory = String(asset.metadata?.category ?? "").toLowerCase();
  if (ALLOWED_CATEGORIES.has(rawCategory as AssetCategory)) {
    return rawCategory as AssetCategory;
  }

  const rawClassType = String(asset.metadata?.class_type ?? "").toLowerCase();
  if (ALLOWED_CATEGORIES.has(rawClassType as AssetCategory)) {
    return rawClassType as AssetCategory;
  }

  const rawAssetType = String(asset.metadata?.asset_type ?? "").toLowerCase();
  if (rawAssetType === "stock") return "stocks";
  if (rawAssetType === "etf") return "etfs";
  if (rawAssetType === "index") return "indices";
  if (rawAssetType === "fiat") return "forex";
  if (rawAssetType === "commodity") {
    return rawClassType === "metals" ? "metals" : "commodities";
  }

  return "crypto";
}


function toListingType(asset: AssetRow): string {
  const directType = String(asset.metadata?.listing_type ?? "").trim().toLowerCase();
  if (directType) return directType;

  const classType = String(asset.metadata?.class_type ?? "").trim().toLowerCase();
  if (classType) return classType;

  const assetType = String(asset.metadata?.asset_type ?? "").trim().toLowerCase();
  if (assetType === "fiat") return "pair";
  if (assetType === "stock" || assetType === "etf" || assetType === "index") return "cfd";

  return "spot";
}



function toNumber(value: number | string | null | undefined): number {
  const parsed = Number(value ?? 0);
  return Number.isFinite(parsed) ? parsed : 0;
}

function toSource(snapshot?: SnapshotRow): string {
  const source = String(snapshot?.source ?? "unavailable").trim() || "unavailable";
  const sourceStatus = String(snapshot?.source_status ?? "").trim().toLowerCase();

  if (!sourceStatus || sourceStatus === "live") {
    return source;
  }

  return `${source}:${sourceStatus}`;
}

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = (searchParams.get("category") ?? "all").toLowerCase();
  const category = rawCategory === "all" || ALLOWED_CATEGORIES.has(rawCategory as AssetCategory)
    ? rawCategory
    : "all";

  try {
    const supabase = createAdminClient();

    const { data: assets, error: assetsError } = await supabase
      .from("assets")
      .select("id, symbol, name, status, metadata")
      .eq("status", "active")
      .order("symbol", { ascending: true });


    if (assetsError) {
      return NextResponse.json({ ok: false, error: assetsError.message }, { status: 500 });
    }

    // Filter out Supabase error objects and invalid rows
    const validAssets = (assets ?? [])
      .filter((row): row is AssetRow => {
        return row && 
               typeof row === 'object' && 
               'id' in row && 
               typeof row.id === 'string' &&
               'symbol' in row &&
               typeof row.symbol === 'string' &&
               row.status === 'active';
      });

    const normalizedAssets = validAssets
      .map((row) => ({
        ...row,
        symbol: row.symbol.toUpperCase(),
      }))
      .filter((row) => {
        if (category === "all") return true;
        return toCategory(row) === category;
      });


    if (!normalizedAssets.length) {
      return NextResponse.json({
        ok: true,
        category,
        listings: [],
        freshness: { latestPricedAt: null, oldestAgeSeconds: Number.MAX_SAFE_INTEGER, status: "stale" },
      });
    }

    const symbols = normalizedAssets.map((row) => row.symbol);
    const { data: snapshots, error: snapshotError } = await supabase
      .from("asset_snapshots")
      .select("asset, price_eur, source, source_status, priced_at, updated_at")
      .in("asset", symbols);

    if (snapshotError) {
      return NextResponse.json({ ok: false, error: snapshotError.message }, { status: 500 });
    }

    const snapshotMap = new Map(
      ((snapshots ?? []) as SnapshotRow[]).map((row) => [
        String(row.asset ?? "").toUpperCase(),
        {
          price: toNumber(row.price_eur),
          source: String(row.source ?? "unavailable"),
          sourceStatus: row.source_status ?? "stale",
          pricedAt: row.priced_at,
        },
      ]),
    );

    const listings: MarketListing[] = normalizedAssets.map((asset) => {
      const symbol = asset.symbol;
      const snapshot = snapshotMap.get(symbol);
      const metadata = (asset.metadata ?? {}) as Record<string, any>;
      const baselinePrice = toNumber(metadata.baseline_price_eur ?? metadata.baselinePrice ?? 0);
      const livePrice = toNumber(snapshot?.price ?? 0);
      const change24h = baselinePrice > 0 ? ((livePrice - baselinePrice) / baselinePrice) * 100 : 0;



      const pricedAt = snapshot?.pricedAt ?? null;
      const freshnessAgeSeconds = pricedAt ? getAgeSeconds(pricedAt) : Number.MAX_SAFE_INTEGER;
      const freshnessStatus = getMarketFreshnessState(freshnessAgeSeconds);

      return {
        id: asset.id,
        symbol: asset.symbol,
        name: asset.name,
        category: toCategory(asset),
        type: toListingType(asset),
        status: asset.status,
        iconSrc: metadata.icon_src ?? metadata.iconSrc ?? "",
        price: Number(livePrice.toFixed(6)),
        change24h: Number(change24h.toFixed(2)),
        marketCap: toNumber(metadata.market_cap ?? metadata.marketCap ?? 0),
        volume24h: toNumber(metadata.volume_24h ?? metadata.volume24h ?? 0),
        source: snapshot?.source ?? "unavailable",
        pricedAt,
        sourceStatus: snapshot?.sourceStatus ?? "stale",
        freshness: {
          ageSeconds: freshnessAgeSeconds,
          status: freshnessStatus,
          isStale: freshnessStatus === "stale",
        },
      };
    });


    const timestamps = listings
      .map((row) => row.pricedAt)
      .filter((value): value is string => Boolean(value));
    const latestPricedAt = timestamps.length
      ? new Date(Math.max(...timestamps.map((value) => new Date(value).getTime()))).toISOString()
      : null;
    const oldestAgeSeconds = timestamps.length
      ? Math.max(...timestamps.map((value) => getAgeSeconds(value)))
      : Number.MAX_SAFE_INTEGER;

    return NextResponse.json({
      ok: true,
      category,
      listings,
      freshness: {
        latestPricedAt,
        oldestAgeSeconds,
        status: getMarketFreshnessState(oldestAgeSeconds),
      },
    });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        error: error instanceof Error ? error.message : "Unknown market list error",
      },
      { status: 500 },
    );
  }
}
