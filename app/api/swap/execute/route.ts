import { NextResponse } from "next/server";
import { deriveCrossRate, humanizeQuoteError, validateSwapInput } from "@/lib/swap/quote-engine";
import { createClient as createServerClient } from "@/lib/supabase/server";
import { getAssetSnapshots } from "@/lib/market/snapshots";
import { validateExecutionPreflight } from "@/lib/swap/execution";

type RpcSwapResult = {
  success: boolean;
  code: string;
  message: string;
  swap_id: string | null;
  transaction_id: string | null;
};

export async function POST(req: Request) {
  try {
    const body = await req.json();

    const input = {
      from: String(body?.from || "").toUpperCase(),
      to: String(body?.to || "").toUpperCase(),
      amount: Number(body?.amount),
      slippageTolerance: Number(body?.slippageTolerance),
    };

    const validationError = validateSwapInput(input);
    if (validationError) {
      return NextResponse.json(
        { ok: false, code: validationError, error: humanizeQuoteError(validationError) },
        { status: 400 },
      );
    }

    const clientQuoteId = String(body?.quoteId || "");
    const quoteTimestamp = Number(body?.quoteTimestamp);
    const expectedRate = Number(body?.expectedRate);
    const clientMinReceived = Number(body?.minReceived);

    if (!clientQuoteId) {
      return NextResponse.json(
        { ok: false, code: "invalid_quote", error: humanizeQuoteError("invalid_quote") },
        { status: 400 },
      );
    }

    const snapshots = await getAssetSnapshots([input.from, input.to]);
    const fromSnapshot = snapshots.find((snapshot) => snapshot.asset === input.from);
    const toSnapshot = snapshots.find((snapshot) => snapshot.asset === input.to);

    if (!fromSnapshot || !toSnapshot) {
      return NextResponse.json(
        {
          ok: false,
          code: "invalid_market_rate",
          error: "Live market snapshots are unavailable for one or more assets.",
        },
        { status: 503 },
      );
    }

    const preflight = validateExecutionPreflight(
      {
        ...input,
        quoteTimestamp,
        expectedRate,
        minReceived: clientMinReceived,
      },
      Date.now(),
      fromSnapshot.priceEur,
      toSnapshot.priceEur,
    );

    if (!preflight.ok) {
      const status =
        preflight.code === "quote_stale"
          ? 409
          : preflight.code === "min_received_violation"
            ? 409
            : preflight.code === "invalid_market_rate"
              ? 503
              : 400;

      return NextResponse.json(
        {
          ok: false,
          code: preflight.code,
          error: preflight.message,
          details: preflight.details,
        },
        { status },
      );
    }

    const currentRate = deriveCrossRate(fromSnapshot.priceEur, toSnapshot.priceEur);
    const expectedQuoteId = `Q-${input.from}-${input.to}-${Math.round(input.amount * 1e6)}-${Math.round((currentRate || 0) * 1e6)}`;

    if (expectedQuoteId !== clientQuoteId) {
      return NextResponse.json(
        { ok: false, code: "invalid_quote", error: humanizeQuoteError("invalid_quote") },
        { status: 409 },
      );
    }

    const supabase = await createServerClient();
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json({ ok: false, code: "AUTH_REQUIRED", error: "Authentication required." }, { status: 401 });
    }

    const { data: rpcData, error: rpcError } = await supabase.rpc("execute_swap_atomic", {
      p_source_asset: input.from,
      p_destination_asset: input.to,
      p_source_amount: input.amount,
      p_destination_amount: preflight.expectedReceive,
      p_quote_id: clientQuoteId,
      p_metadata: {
        min_received: clientMinReceived,
        slippage_tolerance: input.slippageTolerance,
        quote_timestamp: new Date(quoteTimestamp).toISOString(),
        expected_rate: expectedRate,
        market_rate: preflight.marketRate,
      },
    });

    if (rpcError) {
      return NextResponse.json({ ok: false, code: "SWAP_RPC_FAILED", error: rpcError.message }, { status: 500 });
    }

    const result: RpcSwapResult | undefined = Array.isArray(rpcData) ? rpcData[0] : rpcData;

    if (!result?.success || !result.swap_id || !result.transaction_id) {
      const code = result?.code || "SWAP_FAILED";
      const status = code === "KYC_REQUIRED" ? 403 : code === "INSUFFICIENT_FUNDS" ? 400 : 422;
      return NextResponse.json(
        {
          ok: false,
          code,
          error: result?.message || "Swap execution failed.",
        },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      executionId: result.swap_id,
      swap_id: result.swap_id,
      transaction_id: result.transaction_id,
      settledAmount: preflight.expectedReceive,
      quote: {
        quoteId: clientQuoteId,
        quoteTimestamp,
        expectedRate,
        minReceived: clientMinReceived,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, code: "invalid_quote", error: String(err) }, { status: 500 });
  }
}
