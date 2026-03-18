export const SUPPORTED_ASSETS = ["BTC", "ETH", "SOL", "BNB"] as const;

const BASE_RATES: Record<string, Record<string, number>> = {
  BTC: { ETH: 15.8, SOL: 620, BNB: 128 },
  ETH: { BTC: 0.0632, SOL: 39.4, BNB: 8.1 },
  SOL: { BTC: 0.00161, ETH: 0.0254, BNB: 0.206 },
  BNB: { BTC: 0.0078, ETH: 0.123, SOL: 4.84 },
};

const MIN_AMOUNT: Record<string, number> = { BTC: 0.001, ETH: 0.01, SOL: 1, BNB: 0.1 };
const MAX_AMOUNT: Record<string, number> = { BTC: 8, ETH: 120, SOL: 25000, BNB: 1800 };
const LIQUIDITY_CAP: Record<string, number> = { BTC: 6, ETH: 95, SOL: 18000, BNB: 1300 };

export const MIN_SLIPPAGE_TOLERANCE = 0.1;
export const MAX_SLIPPAGE_TOLERANCE = 5;

function readPositiveEnvMs(name: string, fallback: number) {
  const value = Number(process.env[name]);
  return Number.isFinite(value) && value > 0 ? value : fallback;
}

export const SWAP_QUOTE_TTL_MS = readPositiveEnvMs("SWAP_QUOTE_TTL_MS", 30_000);
export const SWAP_QUOTE_STALE_THRESHOLD_MS = readPositiveEnvMs("SWAP_QUOTE_STALE_THRESHOLD_MS", 45_000);

export type QuoteErrorCode =
  | "invalid_pair"
  | "amount_bounds"
  | "insufficient_liquidity"
  | "quote_expired"
  | "invalid_quote"
  | "slippage_out_of_range";

export type SwapQuote = {
  quoteId: string;
  quoteTimestamp: number;
  from: string;
  to: string;
  amount: number;
  rate: number;
  expectedRate: number;
  fee: number;
  slippageEstimate: number;
  minReceived: number;
  expectedReceive: number;
  expiresAt: number;
  minAmount: number;
  maxAmount: number;
};

export type QuoteInput = {
  from: string;
  to: string;
  amount: number;
  slippageTolerance: number;
};

function round(n: number, precision = 8) {
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

function isSupported(asset: string) {
  return (SUPPORTED_ASSETS as readonly string[]).includes(asset);
}

function resolveBaseRate(input: QuoteInput, directRate?: number): number {
  if (Number.isFinite(directRate) && (directRate as number) > 0) {
    return directRate as number;
  }
  return BASE_RATES[input.from][input.to];
}

export function deriveCrossRate(fromAssetPriceEur: number, toAssetPriceEur: number): number | null {
  if (!Number.isFinite(fromAssetPriceEur) || !Number.isFinite(toAssetPriceEur) || fromAssetPriceEur <= 0 || toAssetPriceEur <= 0) {
    return null;
  }

  return fromAssetPriceEur / toAssetPriceEur;
}

export function validateSwapInput(input: QuoteInput): QuoteErrorCode | null {
  if (!isSupported(input.from) || !isSupported(input.to) || input.from === input.to) {
    return "invalid_pair";
  }

  if (!Number.isFinite(input.amount) || input.amount <= 0) {
    return "amount_bounds";
  }

  const min = MIN_AMOUNT[input.from];
  const max = MAX_AMOUNT[input.from];
  if (input.amount < min || input.amount > max) {
    return "amount_bounds";
  }

  if (input.amount > LIQUIDITY_CAP[input.from]) {
    return "insufficient_liquidity";
  }

  if (
    !Number.isFinite(input.slippageTolerance) ||
    input.slippageTolerance < MIN_SLIPPAGE_TOLERANCE ||
    input.slippageTolerance > MAX_SLIPPAGE_TOLERANCE
  ) {
    return "slippage_out_of_range";
  }

  return null;
}

export function buildQuote(input: QuoteInput, now = Date.now(), directRate?: number): SwapQuote {
  const baseRate = resolveBaseRate(input, directRate);
  const notional = input.amount * baseRate;

  const feeRate = 0.0015;
  const fee = round(notional * feeRate);

  const impact = Math.min(0.9, input.amount / LIQUIDITY_CAP[input.from]);
  const slippageEstimate = round(Math.max(0.05, 0.15 + impact * 0.35), 4);

  const expectedReceive = round(notional - fee);
  const toleranceFactor = Math.max(input.slippageTolerance, slippageEstimate) / 100;
  const minReceived = round(expectedReceive * (1 - toleranceFactor));

  const expiresAt = now + SWAP_QUOTE_TTL_MS;
  const quoteId = `Q-${input.from}-${input.to}-${Math.round(input.amount * 1e6)}-${Math.round(baseRate * 1e6)}`;

  return {
    quoteId,
    quoteTimestamp: now,
    from: input.from,
    to: input.to,
    amount: round(input.amount),
    rate: round(baseRate),
    expectedRate: round(baseRate),
    fee,
    slippageEstimate,
    minReceived,
    expectedReceive,
    expiresAt,
    minAmount: MIN_AMOUNT[input.from],
    maxAmount: MAX_AMOUNT[input.from],
  };
}

export function humanizeQuoteError(code: QuoteErrorCode): string {
  switch (code) {
    case "insufficient_liquidity":
      return "Not enough liquidity is available for this amount.";
    case "amount_bounds":
      return "Amount is outside the allowed bounds for the selected asset.";
    case "quote_expired":
      return "This quote has expired. Please request a fresh quote.";
    case "invalid_quote":
      return "The quote is invalid or has been tampered with.";
    case "slippage_out_of_range":
      return `Slippage tolerance must be between ${MIN_SLIPPAGE_TOLERANCE.toFixed(2)}% and ${MAX_SLIPPAGE_TOLERANCE.toFixed(2)}%.`;
    case "invalid_pair":
    default:
      return "Invalid asset pair selected.";
  }
}
