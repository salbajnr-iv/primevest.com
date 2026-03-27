import { type MarketFreshnessState } from "@/lib/market/freshness";

export type MarketPriceRow = {
  asset: string;
  price_eur: number;
  source: string;
  source_status?: string | null;
  priced_at?: string | null;
  updated_at?: string | null;
};

export type AssetSnapshotRow = {
  asset: string;
  price_eur: number;
  source: string;
  source_status?: string | null;
  priced_at: string | null;
  updated_at: string | null;
};

export type MarketPriceSnapshot = {
  asset: string;
  priceEur: number;
  source: string;
  status: MarketFreshnessState;
  pricedAt: string;
};

export type AssetSnapshot = {
  asset: string;
  priceEur: number;
  source: string;
  pricedAt: string;
  freshnessStatus: MarketFreshnessState;
  freshnessAgeSeconds: number;
};
