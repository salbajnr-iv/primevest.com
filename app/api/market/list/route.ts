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
  category: string | null;
  type: string | null;
  icon_src: string | null;
  market_cap: number | string | null;
  volume_24h: number | string | null;
  baseline_price: number | string | null;
  metadata: {
    iconSrc?: string;
    marketCap?: number;
    volume24h?: number;
    baselinePrice?: number;
  } | null;
};

type SnapshotRow = {
  asset: string;
  price_eur: number | string;
  source: string | null;
  source_status: string | null;
  priced_at: string | null;
};

function toNumber(value: number | string | null | undefined, fallback = 0): number {
  if (typeof value === "number") {
    return Number.isFinite(value) ? value : fallback;
  }
  if (typeof value === "string") {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
  }
  return fallback;
}

function normalizeCategory(asset: AssetRow): AssetCategory {
  const direct = (asset.category ?? "").toLowerCase();
  if (ALLOWED_CATEGORIES.has(direct as AssetCategory)) {
    return direct as AssetCategory;
  }

  const type = (asset.type ?? "").toLowerCase();
  if (type === "stock" || type === "stocks") return "stocks";
  if (type === "etf" || type === "etfs") return "etfs";
  if (type === "metal" || type === "metals") return "metals";
  if (type === "commodity" || type === "commodities") return "commodities";
  if (type === "fiat" || type === "forex") return "forex";
  if (type === "index" || type === "indices") return "indices";

  return "crypto";
}

function emptyPayload(category: AssetCategory | "all") {
  return {
    ok: true,
    category,
    listings: [],
    freshness: {
      latestPricedAt: null,
      oldestAgeSeconds: Number.MAX_SAFE_INTEGER,
      status: "stale" as const,
    },
  };
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
      .select("id, symbol, name, status, category, type, icon_src, market_cap, volume_24h, baseline_price, metadata")
      .eq("status", "active")
      .order("symbol", { ascending: true });

    if (assetsError) {
      return NextResponse.json({ ok: false, error: assetsError.message }, { status: 500 });
    }

    if (!assets?.length) {
      return NextResponse.json(emptyPayload(category));
    }

    const normalizedAssets = (assets as AssetRow[]).map((asset) => ({
      ...asset,
      category: normalizeCategory(asset),
    }));

    const filteredAssets = category === "all"
      ? normalizedAssets
      : normalizedAssets.filter((asset) => asset.category === category);

    if (!filteredAssets.length) {
      return NextResponse.json(emptyPayload(category));
    }

    const symbols = filteredAssets.map((row) => String(row.symbol ?? "").toUpperCase());
    const { data: snapshots, error: snapshotError } = await supabase
      .from("asset_snapshots")
      .select("asset, price_eur, source, source_status, priced_at")
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

    const listings: MarketListing[] = filteredAssets.map((asset) => {
      const symbol = String(asset.symbol ?? "").toUpperCase();
      const snapshot = snapshotMap.get(symbol);
      const metadata = asset.metadata ?? {};
      const baselinePrice = toNumber(asset.baseline_price ?? metadata.baselinePrice, snapshot?.price ?? 0);
      const livePrice = toNumber(snapshot?.price, baselinePrice);
      const change24h = baselinePrice > 0 ? ((livePrice - baselinePrice) / baselinePrice) * 100 : 0;

      const pricedAt = snapshot?.pricedAt ?? null;
      const freshnessAgeSeconds = pricedAt ? getAgeSeconds(pricedAt) : Number.MAX_SAFE_INTEGER;
      const freshnessStatus = getMarketFreshnessState(freshnessAgeSeconds);

      return {
        id: asset.id,
        symbol,
        name: asset.name,
        category: asset.category as AssetCategory,
        type: asset.type ?? "spot",
        status: asset.status,
        iconSrc: asset.icon_src ?? metadata.iconSrc ?? "",
        price: Number(livePrice.toFixed(6)),
        change24h: Number(change24h.toFixed(2)),
        marketCap: toNumber(asset.market_cap ?? metadata.marketCap),
        volume24h: toNumber(asset.volume_24h ?? metadata.volume24h),
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
