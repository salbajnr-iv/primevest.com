import test from "node:test";
import assert from "node:assert/strict";

import { validateExecutionPreflight } from "./execution";

const baseInput = {
  from: "BTC",
  to: "ETH",
  amount: 1,
  expectedRate: 15,
  slippageTolerance: 0.5,
  minReceived: 14,
};

test("rejects stale quote", () => {
  const now = 200_000;
  const result = validateExecutionPreflight(
    { ...baseInput, quoteTimestamp: now - 50_000 },
    now,
    80_000,
    5_000,
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "quote_stale");
});

test("rejects excessive slippage", () => {
  const result = validateExecutionPreflight(
    { ...baseInput, quoteTimestamp: 100_000, slippageTolerance: 7 },
    120_000,
    80_000,
    5_000,
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "invalid_slippage_tolerance");
});

test("rejects when expected output is below min received", () => {
  const result = validateExecutionPreflight(
    { ...baseInput, quoteTimestamp: 100_000, minReceived: 20 },
    120_000,
    80_000,
    5_000,
  );

  assert.equal(result.ok, false);
  if (result.ok) return;
  assert.equal(result.code, "min_received_violation");
});

test("accepts happy path", () => {
  const result = validateExecutionPreflight(
    { ...baseInput, quoteTimestamp: 100_000, minReceived: 10 },
    120_000,
    80_000,
    5_000,
  );

  assert.equal(result.ok, true);
  if (!result.ok) return;
  assert.equal(result.marketRate, 16);
  assert.ok(result.expectedReceive >= 10);
});
