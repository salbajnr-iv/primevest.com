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

    const quote = buildQuote(input);
    return NextResponse.json({ ok: true, quote });
  } catch (err) {
    return NextResponse.json({ ok: false, code: "invalid_quote", error: String(err) }, { status: 500 });
  }
}
