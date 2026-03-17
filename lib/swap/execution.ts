import {
  deriveCrossRate,
  MAX_SLIPPAGE_TOLERANCE,
  MIN_SLIPPAGE_TOLERANCE,
  SWAP_QUOTE_STALE_THRESHOLD_MS,
  type QuoteInput,
} from "./quote-engine";

export type SwapExecutionValidationCode =
  | "missing_quote_timestamp"
  | "missing_expected_rate"
  | "missing_slippage_tolerance"
  | "missing_min_received"
  | "invalid_slippage_tolerance"
  | "quote_stale"
  | "invalid_market_rate"
  | "min_received_violation";

export type SwapExecutionValidationResult =
  | {
      ok: true;
      marketRate: number;
      expectedReceive: number;
      maxQuoteAgeMs: number;
    }
  | {
      ok: false;
      code: SwapExecutionValidationCode;
      message: string;
      details?: Record<string, number>;
    };

function round(n: number, precision = 8) {
  const factor = 10 ** precision;
  return Math.round(n * factor) / factor;
}

function executionError(
  code: SwapExecutionValidationCode,
  message: string,
  details?: Record<string, number>,
): SwapExecutionValidationResult {
  return { ok: false, code, message, details };
}

export type SwapExecutionPreflightInput = QuoteInput & {
  quoteTimestamp: number;
  expectedRate: number;
  minReceived: number;
};

export function validateExecutionPreflight(
  input: SwapExecutionPreflightInput,
  now: number,
  fromPriceEur: number,
  toPriceEur: number,
): SwapExecutionValidationResult {
  if (!Number.isFinite(input.quoteTimestamp) || input.quoteTimestamp <= 0) {
    return executionError("missing_quote_timestamp", "Missing or invalid quote timestamp.");
  }

  if (!Number.isFinite(input.expectedRate) || input.expectedRate <= 0) {
    return executionError("missing_expected_rate", "Missing or invalid expected rate.");
  }

  if (!Number.isFinite(input.slippageTolerance)) {
    return executionError("missing_slippage_tolerance", "Missing or invalid slippage tolerance.");
  }

  if (!Number.isFinite(input.minReceived) || input.minReceived <= 0) {
    return executionError("missing_min_received", "Missing or invalid minimum received amount.");
  }

  if (
    input.slippageTolerance < MIN_SLIPPAGE_TOLERANCE ||
    input.slippageTolerance > MAX_SLIPPAGE_TOLERANCE
  ) {
    return executionError(
      "invalid_slippage_tolerance",
      `Slippage tolerance must be between ${MIN_SLIPPAGE_TOLERANCE.toFixed(2)}% and ${MAX_SLIPPAGE_TOLERANCE.toFixed(2)}%.`,
      { min: MIN_SLIPPAGE_TOLERANCE, max: MAX_SLIPPAGE_TOLERANCE, provided: input.slippageTolerance },
    );
  }

  const quoteAgeMs = Math.max(0, now - input.quoteTimestamp);
  if (quoteAgeMs > SWAP_QUOTE_STALE_THRESHOLD_MS) {
    return executionError("quote_stale", "Quote is too old. Please request a fresh quote.", {
      quoteAgeMs,
      staleThresholdMs: SWAP_QUOTE_STALE_THRESHOLD_MS,
    });
  }

  const marketRate = deriveCrossRate(fromPriceEur, toPriceEur);
  if (!marketRate) {
    return executionError("invalid_market_rate", "Unable to derive market rate for swap execution.");
  }

  const fee = input.amount * marketRate * 0.0015;
  const expectedReceive = round(input.amount * marketRate - fee);
  if (expectedReceive < input.minReceived) {
    return executionError(
      "min_received_violation",
      "Current market output is below your minimum received amount. Please refresh quote or raise slippage.",
      {
        expectedReceive,
        minReceived: input.minReceived,
      },
    );
  }

  return {
    ok: true,
    marketRate: round(marketRate),
    expectedReceive,
    maxQuoteAgeMs: SWAP_QUOTE_STALE_THRESHOLD_MS,
  };
}
