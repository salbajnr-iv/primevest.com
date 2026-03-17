import { NextResponse } from "next/server";
import { buildQuote, humanizeQuoteError, validateSwapInput } from "@/lib/swap/quote-engine";
import { createClient as createServerClient } from "@/lib/supabase/server";

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
    const clientExpiresAt = Number(body?.expiresAt);
    const now = Date.now();

    if (!clientQuoteId || !Number.isFinite(clientExpiresAt)) {
      return NextResponse.json(
        { ok: false, code: "invalid_quote", error: humanizeQuoteError("invalid_quote") },
        { status: 400 },
      );
    }

    if (clientExpiresAt <= now) {
      return NextResponse.json(
        { ok: false, code: "quote_expired", error: humanizeQuoteError("quote_expired") },
        { status: 409 },
      );
    }

    const expectedQuote = buildQuote(input, now);

    if (expectedQuote.quoteId !== clientQuoteId) {
      return NextResponse.json(
        { ok: false, code: "invalid_quote", error: humanizeQuoteError("invalid_quote") },
        { status: 409 },
      );
    }

    const clientMinReceived = Number(body?.minReceived);
    if (!Number.isFinite(clientMinReceived) || clientMinReceived <= 0 || clientMinReceived > expectedQuote.expectedReceive) {
      return NextResponse.json(
        { ok: false, code: "invalid_quote", error: humanizeQuoteError("invalid_quote") },
        { status: 400 },
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
      p_destination_amount: expectedQuote.expectedReceive,
      p_quote_id: expectedQuote.quoteId,
      p_metadata: {
        min_received: clientMinReceived,
        slippage_tolerance: input.slippageTolerance,
        quote_expires_at: new Date(clientExpiresAt).toISOString(),
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
      settledAmount: expectedQuote.expectedReceive,
      quote: expectedQuote,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, code: "invalid_quote", error: String(err) }, { status: 500 });
  }
}
