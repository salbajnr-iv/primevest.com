export type MarketFreshnessState = "live" | "delayed" | "stale";

const LIVE_THRESHOLD_SECONDS = 90;
const DELAYED_THRESHOLD_SECONDS = 5 * 60;

export function getMarketFreshnessState(ageSeconds: number): MarketFreshnessState {
  if (ageSeconds <= LIVE_THRESHOLD_SECONDS) return "live";
  if (ageSeconds <= DELAYED_THRESHOLD_SECONDS) return "delayed";
  return "stale";
}

export function getAgeSeconds(timestamp: string | Date, now = Date.now()): number {
  const ts = new Date(timestamp).getTime();
  if (!Number.isFinite(ts)) return Number.MAX_SAFE_INTEGER;
  return Math.max(0, Math.floor((now - ts) / 1000));
}
