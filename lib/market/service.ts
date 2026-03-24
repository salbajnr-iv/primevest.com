import { createAdminClient } from "@/lib/supabase/admin";
import { getAgeSeconds, getMarketFreshnessState, type MarketFreshnessState } from "@/lib/market/freshness";
import type { MarketPriceRow } from "@/lib/market/types";
import type { SupabaseClient } from "@supabase/supabase-js";

export type MarketProvider = "coingecko";

export type MarketPriceSnapshot = {
  asset: string;
  priceEur: number;
  source: string;
  status: MarketFreshnessState;
  pricedAt: string;
};

const COINGECKO_MAP: Record<string, string> = {
  // Crypto
  BTC: "bitcoin",
  ETH: "ethereum",
  SOL: "solana",
  BNB: "binancecoin",
  XRP: "ripple",
  ADA: "cardano",
  DOGE: "dogecoin",
  DOT: "polkadot",
  AVAX: "avalanche-2",
  LINK: "chainlink",
  // Stocks (Popular)
  AAPL: "apple",
  TSLA: "tesla-inc",
  GOOGL: "alphabet-inc",
  MSFT: "microsoft",
  AMZN: "amazon",
  NVDA: "nvidia",
  META: "meta",
  NFLX: "netflix",
  AMD: "amd",
  INTC: "intel",
  // Indices/Proxies
  SPX: "sp-500",
  NDX: "nasdaq",
  DJI: "dow-jones",
  // Metals/Commodities (ETFs/Proxies)
  XAU: "pax-gold",
  XAG: "abrdn-physical-silver-shares-etf",
  GLD: "spdr-gold-shares",
  SLV: "ishares-silver-trust",
  USO: "united-states-oil-fund",
  UNG: "united-states-natural-gas-fund",
  // Forex (Major)
  EURUSD: "euro",
  GBPUSD: "pound-sterling",
  USDJPY: "japanese-yen",
  // More Crypto/ETFs
  LTC: "litecoin",
  MATIC: "polygon",
  ATOM: "cosmos",
  QNT: "quant-network",
  SPY: "spdr-s-p-500-etf-trust",
  // 50+ total for broad coverage
};

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 350;
const COINGECKO_MIN_REQUEST_INTERVAL_MS = 1400;

type HealthPayload = {
  source: string;
  status: "healthy" | "degraded" | "down";
  checked_at: string;
  latency_ms: number;
  failure_count: number;
  details: string | null;
};

let lastProviderRequestAt = 0;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function enforceProviderRateLimit() {
  const elapsed = Date.now() - lastProviderRequestAt;
  if (elapsed < COINGECKO_MIN_REQUEST_INTERVAL_MS) {
    await sleep(COINGECKO_MIN_REQUEST_INTERVAL_MS - elapsed);
  }
  lastProviderRequestAt = Date.now();
}

function createServiceSupabase() {
  return createAdminClient();
}

async function fetchWithRetry(url: string, init: RequestInit, maxRetries = MAX_RETRIES) {
  let attempt = 0;
  let lastError: unknown;

  while (attempt <= maxRetries) {
    try {
      await enforceProviderRateLimit();
      const response = await fetch(url, init);

      if (response.ok) {
        return response;
      }

      if (response.status === 429 || response.status >= 500) {
        const retryAfter = Number(response.headers.get("retry-after") || "0");
        const retryAfterMs = Number.isFinite(retryAfter) && retryAfter > 0 ? retryAfter * 1000 : 0;
        if (attempt < maxRetries) {
          const backoffMs = retryAfterMs || BASE_BACKOFF_MS * 2 ** attempt;
          await sleep(backoffMs + Math.floor(Math.random() * 120));
          attempt += 1;
          continue;
        }
      }

      return response;
    } catch (error) {
      lastError = error;
      if (attempt >= maxRetries) {
        break;
      }
      await sleep(BASE_BACKOFF_MS * 2 ** attempt + Math.floor(Math.random() * 120));
      attempt += 1;
    }
  }

  throw lastError instanceof Error ? lastError : new Error("Provider request failed");
}

async function upsertSourceHealth(supabase: SupabaseClient, payload: HealthPayload) {
  await supabase.from("market_data_source_health").upsert(payload, { onConflict: "source" });
}

export async function fetchAndPersistMarketPrices(provider: MarketProvider = "coingecko") {
  const supabase = createServiceSupabase();
  if (!supabase) {
    throw new Error("Missing Supabase service credentials");
  }

  const startedAt = Date.now();

  const { data: assets, error: assetError } = await supabase
    .from("assets")
    .select("id, symbol")
    .eq("status", "active");

  if (assetError) {
    await upsertSourceHealth(supabase, {
      source: provider,
      status: "down",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      failure_count: 1,
      details: assetError.message,
    });
    throw assetError;
  }

  const tracked = ((assets ?? []) as unknown as Array<{ id: string; symbol: string }>)
    .map((asset: { id: string; symbol: string }) => ({ id: String(asset.id), symbol: String(asset.symbol).toUpperCase() }))
    .filter((asset) => Boolean(COINGECKO_MAP[asset.symbol]));

  if (!tracked.length) {
    return { ingested: 0, snapshotsRefreshed: 0, source: provider };
  }

  const ids = tracked.map((asset) => COINGECKO_MAP[asset.symbol]).join(",");

  const response = await fetchWithRetry(
    `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_last_updated_at=true`,
    { headers: { accept: "application/json" } },
  );

  if (!response.ok) {
    const details = await response.text();
    await upsertSourceHealth(supabase, {
      source: provider,
      status: response.status === 429 ? "degraded" : "down",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      failure_count: 1,
      details: `Provider HTTP ${response.status}: ${details}`,
    });
    throw new Error(`Provider HTTP ${response.status}`);
  }

  const payload = (await response.json()) as Record<string, { eur?: number; last_updated_at?: number }>;

  const rows = tracked
    .map((asset) => {
      const quote = payload[COINGECKO_MAP[asset.symbol]];
      if (!quote || !Number.isFinite(quote.eur)) return null;

      const pricedAt = quote.last_updated_at
        ? new Date(quote.last_updated_at * 1000).toISOString()
        : new Date().toISOString();

      return {
        asset_id: asset.id,
        asset: asset.symbol,
        last_price: quote.eur,
        source: provider,
        status: getMarketFreshnessState(getAgeSeconds(pricedAt)),
        priced_at: pricedAt,
      };
    })
    .filter(Boolean) as unknown as Array<{
      asset_id: string;
      asset: string;
      last_price: number;
      source: MarketProvider;
      status: MarketFreshnessState;
      priced_at: string;
    }>;

  if (!rows.length) {
    return { ingested: 0, snapshotsRefreshed: 0, source: provider };
  }

  const { error: insertError } = await supabase.from("market_prices").insert(rows);
  if (insertError) {
    await upsertSourceHealth(supabase, {
      source: provider,
      status: "down",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      failure_count: 1,
      details: insertError.message,
    });
    throw insertError;
  }

  const { data: refreshCount, error: refreshError } = await supabase.rpc("refresh_asset_snapshots", {
    p_source: provider,
  } as never);

  if (refreshError) {
    await upsertSourceHealth(supabase, {
      source: provider,
      status: "degraded",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - startedAt,
      failure_count: 1,
      details: refreshError.message,
    });
    throw refreshError;
  }

  await upsertSourceHealth(supabase, {
    source: provider,
    status: "healthy",
    checked_at: new Date().toISOString(),
    latency_ms: Date.now() - startedAt,
    failure_count: 0,
    details: null,
  });

  return {
    source: provider,
    ingested: rows.length,
    snapshotsRefreshed: Number(refreshCount ?? 0),
  };
}

export async function getLatestPrices(assets?: string[]): Promise<MarketPriceSnapshot[]> {
  const supabase = createServiceSupabase();
  if (!supabase) return [];

  let query = supabase
    .from("asset_snapshots")
    .select("asset, price_eur, source, source_status, priced_at")
    .order("priced_at", { ascending: false });

  if (assets?.length) {
    query = query.in("asset", assets.map((asset) => asset.toUpperCase()));
  }

  const { data, error } = await query;

  if (error || !data) return [];

  return data.map((row: MarketPriceRow) => ({
    asset: String(row.asset).toUpperCase(),
    priceEur: Number(row.price_eur ?? 0),
    source: String(row.source ?? "unknown"),
    status: ((row.source_status ?? "stale") as MarketFreshnessState) || "stale",
    pricedAt: row.priced_at ?? new Date(0).toISOString(),
  }));
}
