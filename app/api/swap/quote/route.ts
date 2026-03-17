import { NextResponse } from "next/server";
import { buildQuote, deriveCrossRate, humanizeQuoteError, validateSwapInput } from "@/lib/swap/quote-engine";
import { getAssetSnapshots } from "@/lib/market/snapshots";

type SwapQuoteErrorCode =
  | "SWAP_QUOTE_INVALID_PAYLOAD"
  | "SWAP_QUOTE_VALIDATION_FAILED"
  | "SWAP_QUOTE_DEPENDENCY_UNAVAILABLE"
  | "SWAP_QUOTE_FAILED";

const errorResponse = (status: number, code: SwapQuoteErrorCode, message: string, details?: string) =>
  NextResponse.json({ ok: false, code, message, details }, { status });

export async function POST(req: Request) {
  try {
    const body = await req.json();
    if (!body || typeof body !== "object") {
      return errorResponse(400, "SWAP_QUOTE_INVALID_PAYLOAD", "Request payload must be a JSON object.");
    }

    const input = {
      from: String((body as Record<string, unknown>).from || "").toUpperCase(),
      to: String((body as Record<string, unknown>).to || "").toUpperCase(),
      amount: Number((body as Record<string, unknown>).amount),
      slippageTolerance: Number((body as Record<string, unknown>).slippageTolerance),
    };

    const validationError = validateSwapInput(input);
    if (validationError) {
      return errorResponse(400, "SWAP_QUOTE_VALIDATION_FAILED", humanizeQuoteError(validationError), validationError);
    }

    const snapshots = await getAssetSnapshots([input.from, input.to]);
    const fromSnapshot = snapshots.find((snapshot) => snapshot.asset === input.from);
    const toSnapshot = snapshots.find((snapshot) => snapshot.asset === input.to);

    if (!fromSnapshot || !toSnapshot) {
      return errorResponse(
        503,
        "SWAP_QUOTE_DEPENDENCY_UNAVAILABLE",
        "Live market snapshots are unavailable for one or more assets.",
      );
    }

    const derivedRate = deriveCrossRate(fromSnapshot.priceEur, toSnapshot.priceEur);
    if (!derivedRate) {
      return errorResponse(
        503,
        "SWAP_QUOTE_DEPENDENCY_UNAVAILABLE",
        "Unable to derive quote rate from live market snapshots.",
      );
    }

    const quote = buildQuote(input, Date.now(), derivedRate);

    return NextResponse.json({
      ok: true,
      data: {
        quote,
        freshness: {
          source: fromSnapshot.source,
          fromAsset: {
            asset: fromSnapshot.asset,
            pricedAt: fromSnapshot.pricedAt,
            ageSeconds: fromSnapshot.freshnessAgeSeconds,
            status: fromSnapshot.freshnessStatus,
          },
          toAsset: {
            asset: toSnapshot.asset,
            pricedAt: toSnapshot.pricedAt,
            ageSeconds: toSnapshot.freshnessAgeSeconds,
            status: toSnapshot.freshnessStatus,
          },
        },
      },
    });
  } catch (err) {
    return errorResponse(500, "SWAP_QUOTE_FAILED", "Failed to build swap quote.", String(err));
  }
}
