export type MarketImpactSeverity = "normal" | "warn" | "high";

export const MARKET_IMPACT_THRESHOLDS = {
  warnPct: 1,
  highPct: 3,
  confirmationRequiredPct: 3,
  blockPct: 8,
} as const;

const DEFAULT_LIQUIDITY_EUR = 1_000_000;

function round(value: number, precision = 2) {
  const factor = 10 ** precision;
  return Math.round(value * factor) / factor;
}

export function calculateMarketImpactPercent({
  amountEur,
  liquidityEur = DEFAULT_LIQUIDITY_EUR,
}: {
  amountEur: number;
  liquidityEur?: number;
}): number {
  if (!Number.isFinite(amountEur) || !Number.isFinite(liquidityEur) || amountEur <= 0 || liquidityEur <= 0) {
    return 0;
  }

  const ratio = amountEur / liquidityEur;
  const impact = Math.sqrt(ratio) * 100;

  return round(Math.max(0, Math.min(99, impact)));
}

export function formatImpactPercent(impactPct: number, locale = "de-DE"): string {
  const safeImpact = Number.isFinite(impactPct) ? impactPct : 0;
  return `${safeImpact.toLocaleString(locale, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}%`;
}

export function getImpactSeverity(impactPct: number): MarketImpactSeverity {
  if (impactPct >= MARKET_IMPACT_THRESHOLDS.highPct) {
    return "high";
  }

  if (impactPct >= MARKET_IMPACT_THRESHOLDS.warnPct) {
    return "warn";
  }

  return "normal";
}

export function requiresImpactConfirmation(impactPct: number): boolean {
  return impactPct >= MARKET_IMPACT_THRESHOLDS.confirmationRequiredPct;
}

export function isImpactBlocked(impactPct: number): boolean {
  return impactPct >= MARKET_IMPACT_THRESHOLDS.blockPct;
}
