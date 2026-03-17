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

const COINGECKO_MAP: Record<string, string> = {
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
};

Deno.serve(async (req) => {
  if (req.method !== "POST" && req.method !== "GET") {
    return badRequest("Unsupported HTTP method");
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
      .filter((asset) => Boolean(COINGECKO_MAP[asset.symbol]));

    if (!trackedAssets.length) {
      return json({ ok: true, ingested: 0, snapshotsRefreshed: 0, message: "No tracked assets configured." });
    }

    const ids = trackedAssets.map((asset) => COINGECKO_MAP[asset.symbol]).join(",");
    const feedResponse = await fetch(
      `https://api.coingecko.com/api/v3/simple/price?ids=${ids}&vs_currencies=eur&include_last_updated_at=true`,
      { headers: { accept: "application/json" } },
    );

    if (!feedResponse.ok) {
      const body = await feedResponse.text();
      return errorResponse(`CoinGecko error (${feedResponse.status}): ${body}`, 502);
    }

    const payload = (await feedResponse.json()) as Record<string, { eur?: number; last_updated_at?: number }>;

    const rows = trackedAssets
      .map((asset) => {
        const coinId = COINGECKO_MAP[asset.symbol];
        const quote = payload[coinId];
        if (!quote || !Number.isFinite(quote.eur)) return null;

        const pricedAt = quote.last_updated_at ? new Date(quote.last_updated_at * 1000).toISOString() : new Date().toISOString();
        const ageSeconds = getAgeSeconds(pricedAt);

        return {
          asset_id: asset.id,
          asset: asset.symbol,
          last_price: quote.eur,
          source: "coingecko",
          status: getMarketFreshnessState(ageSeconds),
          priced_at: pricedAt,
        };
      })
      .filter(Boolean);

    if (!rows.length) {
      return json({ ok: true, ingested: 0, snapshotsRefreshed: 0, message: "No prices returned by provider." });
    }

    const { error: insertError } = await supabaseAdmin.from("market_prices").insert(rows);
    if (insertError) {
      throw insertError;
    }

    const { data: snapshotRefreshCount, error: snapshotError } = await supabaseAdmin.rpc("refresh_asset_snapshots", {
      p_source: "coingecko",
    });

    if (snapshotError) {
      throw snapshotError;
    }

    logInfo("market_price_ingest", {
      ingested: rows.length,
      snapshotsRefreshed: snapshotRefreshCount ?? 0,
    });

    return json({
      ok: true,
      source: "coingecko",
      ingested: rows.length,
      snapshotsRefreshed: snapshotRefreshCount ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    logError("market_price_ingest_error", error);
    return errorResponse("Market price ingestion failed", 500, {
      details: String(error),
    });
  }
});
