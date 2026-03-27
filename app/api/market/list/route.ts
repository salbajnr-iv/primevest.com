import { NextResponse } from "next/server";

import { createAdminClient } from "@/lib/supabase/admin";
import { getAgeSeconds, getMarketFreshnessState } from "@/lib/market/freshness";
import type { AssetCategory, MarketListing } from "@/lib/market/listings";

const ALLOWED_CATEGORIES = new Set<AssetCategory>([
  "crypto",
  "stocks",
  "etfs",
  "metals",
  "commodities",
  "forex",
  "indices",
]);

type AssetMetadata = {
  iconSrc?: string;
  marketCap?: number;
  volume24h?: number;
  baselinePrice?: number;
};

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const rawCategory = (searchParams.get("category") ?? "all").toLowerCase();
  const category = rawCategory === "all" || ALLOWED_CATEGORIES.has(rawCategory as AssetCategory)
    ? rawCategory
    : "all";

  try {
    const supabase = createAdminClient();

    let assetQuery = supabase
      .from("assets")
      .select("id, symbol, name, status, category, type, metadata")
      .eq("status", "active")
      .order("symbol", { ascending: true });

    if (category !== "all") {
      assetQuery = assetQuery.eq("category", category);
    }

    const { data: assets, error: assetsError } = await assetQuery;
    if (assetsError) {
      return NextResponse.json({ ok: false, error: assetsError.message }, { status: 500 });
    }

    if (!assets?.length) {
      return NextResponse.json({
        ok: true,
        category,
        listings: [],
        freshness: { latestPricedAt: null, oldestAgeSeconds: Number.MAX_SAFE_INTEGER, status: "stale" },
      });
    }

    const symbols = assets.map((row) => row.symbol.toUpperCase());
    const { data: snapshots, error: snapshotError } = await supabase
      .from("asset_snapshots")
      .select("asset, price_eur, source, source_status, priced_at")
      .in("asset", symbols);

    if (snapshotError) {
      return NextResponse.json({ ok: false, error: snapshotError.message }, { status: 500 });
    }

    const snapshotMap = new Map(
      (snapshots ?? []).map((row) => [
        String(row.asset ?? "").toUpperCase(),
        {
          price: Number(row.price_eur ?? 0),
          source: String(row.source ?? "unavailable"),
          pricedAt: row.priced_at,
        },
      ]),
    );

    const listings: MarketListing[] = assets.map((asset) => {
      const symbol = String(asset.symbol ?? "").toUpperCase();
      const snapshot = snapshotMap.get(symbol);
      const metadata = (asset.metadata as AssetMetadata | null) ?? {};
      const baselinePrice = Number(metadata.baselinePrice ?? snapshot?.price ?? 0);
      const livePrice = Number(snapshot?.price ?? baselinePrice ?? 0);
      const change24h = baselinePrice > 0 ? ((livePrice - baselinePrice) / baselinePrice) * 100 : 0;

      return {
        id: asset.id,
        symbol,
        name: asset.name,
        category: (asset.category as AssetCategory) ?? "crypto",
        type: asset.type ?? "spot",
        status: asset.status,
        iconSrc: metadata.iconSrc ?? "",
        price: Number(livePrice.toFixed(6)),
        change24h: Number(change24h.toFixed(2)),
        marketCap: Number(metadata.marketCap ?? 0),
        volume24h: Number(metadata.volume24h ?? 0),
        source: snapshot?.source ?? "unavailable",
        pricedAt: snapshot?.pricedAt ?? null,
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
