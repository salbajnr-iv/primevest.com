import { NextResponse } from "next/server";
import { buildQuote, humanizeQuoteError, validateSwapInput } from "@/lib/swap/quote-engine";

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

    const executionId = `SWP-${Date.now()}`;

    return NextResponse.json({
      ok: true,
      executionId,
      settledAmount: expectedQuote.expectedReceive,
      quote: expectedQuote,
    });
  } catch (err) {
    return NextResponse.json({ ok: false, code: "invalid_quote", error: String(err) }, { status: 500 });
  }
}
