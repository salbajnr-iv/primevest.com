"use client";

import * as React from "react";
import type { MarketListing } from "@/lib/market/listings";
import { getAgeSeconds, getMarketFreshnessState, type MarketFreshnessState } from "@/lib/market/freshness";

const DEFAULT_POLL_INTERVAL_MS = 15_000;

export type LiveMarketAsset = {
  id: string;
  symbol: string;
  name: string;
  iconSrc: string;
  price: number | null;
  change24h: number | null;
  marketCap: number | null;
  volume24h: number | null;
  source: string;
  pricedAt: string | null;
  freshnessStatus: MarketFreshnessState | "unavailable";
  freshnessAgeSeconds: number;
};

type MarketListApiResponse = {
  ok: boolean;
  listings: MarketListing[];
  freshness?: {
    latestPricedAt: string | null;
    oldestAgeSeconds: number;
    status: string;
  };
};

type MarketLatestApiResponse = {
  ok: boolean;
  prices: Array<{
    asset: string;
    priceEur: number;
    source: string;
    pricedAt: string;
    status?: MarketFreshnessState;
  }>;
  freshness?: {
    status: string;
    latestPricedAt: string;
    oldestAgeSeconds: number;
    isStale?: boolean;
  };
};

function normalizeAsset(listing: MarketListing, latestBySymbol: Map<string, MarketLatestApiResponse["prices"][number]>): LiveMarketAsset {
  const symbol = listing.symbol.toUpperCase();
  const latest = latestBySymbol.get(symbol);
  const latestPrice = Number(latest?.priceEur);
  const listPrice = Number(listing.price);
  const hasLatestPrice = Number.isFinite(latestPrice) && latestPrice > 0;
  const hasListPrice = Number.isFinite(listPrice) && listPrice > 0;
  const price = hasLatestPrice ? latestPrice : hasListPrice ? listPrice : null;

  const pricedAt = latest?.pricedAt ?? listing.pricedAt ?? null;
  const freshnessAgeSeconds = pricedAt ? getAgeSeconds(pricedAt) : Number.MAX_SAFE_INTEGER;
  const freshnessStatus = price
    ? getMarketFreshnessState(freshnessAgeSeconds)
    : "unavailable";

  return {
    id: listing.id,
    symbol,
    name: listing.name,
    iconSrc: listing.iconSrc,
    price,
    change24h: Number.isFinite(listing.change24h) ? listing.change24h : null,
    marketCap: Number.isFinite(listing.marketCap) && listing.marketCap > 0 ? listing.marketCap : null,
    volume24h: Number.isFinite(listing.volume24h) && listing.volume24h > 0 ? listing.volume24h : null,
    source: latest?.source ?? listing.source ?? "unavailable",
    pricedAt,
    freshnessStatus,
    freshnessAgeSeconds,
  };
}

export function useLiveMarket(pollIntervalMs = DEFAULT_POLL_INTERVAL_MS) {
  const [assets, setAssets] = React.useState<LiveMarketAsset[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = React.useState<string | null>(null);

  const refresh = React.useCallback(async () => {
    try {
      setError(null);
      const listRes = await fetch("/api/market/list?category=all", { cache: "no-store" });
      if (!listRes.ok) {
        throw new Error(`Market list unavailable (${listRes.status})`);
      }

      const listData = (await listRes.json()) as MarketListApiResponse;
      if (!listData.ok) {
        throw new Error("Market list response was not ok");
      }

      const symbols = listData.listings.map((asset) => asset.symbol.toUpperCase()).join(",");
      const latestRes = await fetch(`/api/market/latest?assets=${encodeURIComponent(symbols)}`, { cache: "no-store" });
      if (!latestRes.ok) {
        throw new Error(`Latest prices unavailable (${latestRes.status})`);
      }

      const latestData = (await latestRes.json()) as MarketLatestApiResponse;
      if (!latestData.ok) {
        throw new Error("Latest prices response was not ok");
      }

      const latestBySymbol = new Map(
        (latestData.prices ?? []).map((row) => [row.asset.toUpperCase(), row]),
      );

      setAssets(listData.listings.map((listing) => normalizeAsset(listing, latestBySymbol)));
      setLastSyncedAt(new Date().toISOString());
    } catch (refreshError) {
      setError(refreshError instanceof Error ? refreshError.message : "Unable to load live market data");
      setAssets([]);
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void refresh();
    const timer = setInterval(() => {
      void refresh();
    }, pollIntervalMs);

    return () => clearInterval(timer);
  }, [pollIntervalMs, refresh]);

  const staleCount = assets.filter((asset) => asset.freshnessStatus === "stale").length;
  const unavailableCount = assets.filter((asset) => asset.freshnessStatus === "unavailable").length;

  return {
    assets,
    loading,
    error,
    refresh,
    lastSyncedAt,
    hasData: assets.length > 0,
    hasStaleData: staleCount > 0,
    hasUnavailableData: unavailableCount > 0,
  };
}
