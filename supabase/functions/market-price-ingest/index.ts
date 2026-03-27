import { supabaseAdmin } from "../_shared/supabase.ts";
import { badRequest, errorResponse, json } from "../_shared/http.ts";
import { logError, logInfo } from "../_shared/log.ts";

function getMarketFreshnessState(ageSeconds: number): "live" | "delayed" | "stale" {
  if (ageSeconds <= 90) return "live";
  if (ageSeconds <= 300) return "delayed";
  return "stale";
}

function getAgeSeconds(timestamp: string): number {
  const ts = new Date(timestamp).getTime();
  if (!Number.isFinite(ts)) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.floor((Date.now() - ts) / 1000));
}

type AssetRow = {
  id: string;
  symbol: string;
  name: string;
};

type IngestTier = "core" | "tail" | "all";

type SourceHealth = {
  source: string;
  status: "healthy" | "degraded" | "down";
  checked_at: string;
  latency_ms: number;
  failure_count: number;
  details: string | null;
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
  // 50+ total - synced from lib/market/service.ts
};

const CORE_SYMBOLS = new Set(["BTC", "ETH", "SOL", "BNB", "XRP"]);

const MAX_RETRIES = 3;
const BASE_BACKOFF_MS = 350;

const sleep = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));

async function updateSourceHealth(payload: SourceHealth) {
  await supabaseAdmin.from("market_data_source_health").upsert(payload, { onConflict: "source" });
}

async function logIngestionFailure(payload: {
  source: string;
  tier: IngestTier;
  reason: string;
  status_code?: number;
  attempt_count: number;
  details?: string;
}) {
  await supabaseAdmin.from("market_data_ingest_failures").insert({
    source: payload.source,
    tier: payload.tier,
    reason: payload.reason,
    status_code: payload.status_code ?? null,
    attempt_count: payload.attempt_count,
    details: payload.details ?? null,
  });
}

async function fetchWithRetry(url: string) {
  for (let attempt = 0; attempt <= MAX_RETRIES; attempt += 1) {
    const response = await fetch(url, { headers: { accept: "application/json" } });

    if (response.ok) {
      return { response, attemptCount: attempt + 1 };
    }

    if (attempt < MAX_RETRIES && (response.status === 429 || response.status >= 500)) {
      const retryAfter = Number(response.headers.get("retry-after") || "0");
      const backoff = (retryAfter > 0 ? retryAfter * 1000 : BASE_BACKOFF_MS * 2 ** attempt) + Math.floor(Math.random() * 120);
      await sleep(backoff);
      continue;
    }

    return { response, attemptCount: attempt + 1 };
  }

  throw new Error("Unreachable retry state");
}

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return badRequest("Unsupported HTTP method");
  }

  const start = Date.now();
  const url = new URL(req.url);
  const rawTier = (url.searchParams.get("tier") || "").toLowerCase();
  const bodyTier = req.method === "POST" ? await req.clone().json().catch(() => ({})) as { tier?: string } : {};
  const tier = (bodyTier.tier || rawTier || "all") as IngestTier;

  if (!["core", "tail", "all"].includes(tier)) {
    return badRequest("Invalid tier. Expected one of: core, tail, all.");
  }

  try {
    const { data: assets, error: assetError } = await supabaseAdmin
      .from("assets")
      .select("id, symbol, name")
      .eq("status", "active");

    if (assetError) {
      throw assetError;
    }

    const trackedAssets = ((assets ?? []) as AssetRow[])
      .map((asset) => ({ ...asset, symbol: asset.symbol.toUpperCase() }))
      .filter((asset) => {
        if (tier === "all") return true;
        if (tier === "core") return CORE_SYMBOLS.has(asset.symbol);
        return !CORE_SYMBOLS.has(asset.symbol);
      })
      .filter((asset) => Boolean(COINGECKO_MAP[asset.symbol]));

    if (!trackedAssets.length) {
      await updateSourceHealth({
        source: "coingecko",
        status: "degraded",
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - start,
        failure_count: 1,
        details: "No active mapped assets",
      });
      return json({ ok: true, ingested: 0, snapshotsRefreshed: 0, tier, message: "No tracked assets configured." });
    }

    const ids = trackedAssets.map((asset) => COINGECKO_MAP[asset.symbol]).join(",");
    const { response: feedResponse, attemptCount } = await fetchWithRetry(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_last_updated_at=true`,
    );

    if (!feedResponse.ok) {
      const body = await feedResponse.text();
      await updateSourceHealth({
        source: "coingecko",
        status: feedResponse.status === 429 ? "degraded" : "down",
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - start,
        failure_count: 1,
        details: `CoinGecko error (${feedResponse.status}): ${body}`,
      });
      await logIngestionFailure({
        source: "coingecko",
        tier,
        reason: feedResponse.status === 429 ? "rate_limited" : "provider_http_error",
        status_code: feedResponse.status,
        attempt_count: attemptCount,
        details: body.slice(0, 500),
      });
      return errorResponse(`CoinGecko error (${feedResponse.status}): ${body}`, 502);
    }

    const payload = (await feedResponse.json()) as Record<string, { eur?: number; last_updated_at?: number }>;

    const rows = trackedAssets
      .map((asset) => {
        const coinId = COINGECKO_MAP[asset.symbol];
        const quote = payload[coinId];
        if (!quote || !Number.isFinite(quote.eur)) return null;

        const sourceCapturedAt = quote.last_updated_at
          ? new Date(quote.last_updated_at * 1000).toISOString()
          : new Date().toISOString();
        const ingestedAt = new Date().toISOString();
        const ageSeconds = getAgeSeconds(sourceCapturedAt);

        return {
          asset_id: asset.id,
          asset: asset.symbol,
          last_price: quote.eur,
          price: quote.eur,
          source: "coingecko",
          status: getMarketFreshnessState(ageSeconds),
          captured_at: sourceCapturedAt,
          priced_at: ingestedAt,
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      await updateSourceHealth({
        source: "coingecko",
        status: "degraded",
        checked_at: new Date().toISOString(),
        latency_ms: Date.now() - start,
        failure_count: 1,
        details: "No prices returned by provider",
      });
      return json({ ok: true, ingested: 0, snapshotsRefreshed: 0, message: "No prices returned by provider." });
    }

    const { error: insertError } = await supabaseAdmin
      .from("market_prices")
      .upsert(rows, { onConflict: "asset_id,source,captured_at", ignoreDuplicates: true });
    if (insertError) {
      throw insertError;
    }

    const { data: snapshotRefreshCount, error: snapshotError } = await supabaseAdmin.rpc("refresh_asset_snapshots", {
      p_source: "coingecko",
    });

    if (snapshotError) {
      throw snapshotError;
    }

    await updateSourceHealth({
      source: "coingecko",
      status: "healthy",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - start,
      failure_count: 0,
      details: null,
    });

    logInfo("market_price_ingest", {
      ingested: rows.length,
      snapshotsRefreshed: snapshotRefreshCount ?? 0,
      tier,
    });

    return json({
      ok: true,
      source: "coingecko",
      ingested: rows.length,
      snapshotsRefreshed: snapshotRefreshCount ?? 0,
      tier,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    await logIngestionFailure({
      source: "coingecko",
      tier,
      reason: "runtime_error",
      attempt_count: MAX_RETRIES + 1,
      details: String(error).slice(0, 500),
    });
    await updateSourceHealth({
      source: "coingecko",
      status: "down",
      checked_at: new Date().toISOString(),
      latency_ms: Date.now() - start,
      failure_count: 1,
      details: String(error),
    });

    logError("market_price_ingest_error", error);
    return errorResponse("Market price ingestion failed", 500, {
      details: String(error),
    });
  }
});
