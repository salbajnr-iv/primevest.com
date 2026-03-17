import { NextResponse } from "next/server";
import { buildQuote, deriveCrossRate, humanizeQuoteError, validateSwapInput } from "@/lib/swap/quote-engine";
import { getAssetSnapshots } from "@/lib/market/snapshots";

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

    const snapshots = await getAssetSnapshots([input.from, input.to]);
    const fromSnapshot = snapshots.find((snapshot) => snapshot.asset === input.from);
    const toSnapshot = snapshots.find((snapshot) => snapshot.asset === input.to);

    const derivedRate = fromSnapshot && toSnapshot
      ? deriveCrossRate(fromSnapshot.priceEur, toSnapshot.priceEur)
      : null;

    const quote = buildQuote(input, Date.now(), derivedRate ?? undefined);

    return NextResponse.json({
      ok: true,
      quote,
      freshness: {
        source: fromSnapshot?.source ?? toSnapshot?.source ?? "static-fallback",
        fromAsset: fromSnapshot
          ? { asset: fromSnapshot.asset, pricedAt: fromSnapshot.pricedAt, ageSeconds: fromSnapshot.freshnessAgeSeconds, status: fromSnapshot.freshnessStatus }
          : null,
        toAsset: toSnapshot
          ? { asset: toSnapshot.asset, pricedAt: toSnapshot.pricedAt, ageSeconds: toSnapshot.freshnessAgeSeconds, status: toSnapshot.freshnessStatus }
          : null,
        fallbackUsed: !derivedRate,
      },
    });
  } catch (err) {
    return NextResponse.json({ ok: false, code: "invalid_quote", error: String(err) }, { status: 500 });
  }
}
