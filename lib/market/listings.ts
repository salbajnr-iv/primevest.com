export type AssetCategory = "crypto" | "stocks" | "etfs" | "metals" | "commodities" | "forex" | "indices";

export type MarketListing = {
  id: string;
  symbol: string;
  name: string;
  category: AssetCategory;
  type: string;
  status: string;
  iconSrc: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  source: string;
  pricedAt: string | null;
};

export type MarketListResponse = {
  ok: boolean;
  category: AssetCategory | "all";
  listings: MarketListing[];
  freshness: {
    latestPricedAt: string | null;
    oldestAgeSeconds: number;
    status: "fresh" | "delayed" | "stale";
  };
};

export const DEFAULT_CATEGORY: AssetCategory = "crypto";

export function formatPrice(price: number, symbol?: string): string {
  void symbol;
  if (price >= 1000) {
    return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 1) {
    return price.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  }
  if (price >= 0.01) {
    return price.toLocaleString("de-DE", { minimumFractionDigits: 4, maximumFractionDigits: 4 });
  }

  return price.toLocaleString("de-DE", { minimumFractionDigits: 6, maximumFractionDigits: 8 });
}

export function formatCompact(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}T`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

export function getAssetColor(symbol: string): string {
  const colors: Record<string, string> = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    BNB: "#F3BA2F",
    SOL: "#9945FF",
    XRP: "#23292F",
    ADA: "#0033AD",
    DOGE: "#C2A633",
    DOT: "#E6007A",
    XAU: "#b8860b",
    XAG: "#95a5a6",
  };

  return colors[symbol.toUpperCase()] ?? "#0f9d58";
}
