import { NextResponse } from "next/server";

import { getAssetSnapshots } from "@/lib/market/snapshots";
import type { QuoteResult } from "@/lib/market/get-quote";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const symbol = searchParams.get("symbol");
  
  if (!symbol) {
    return NextResponse.json({ error: "Symbol required" }, { status: 400 });
  }

  try {
    const snapshots = await getAssetSnapshots([symbol.toUpperCase()]);
    if (!snapshots.length) {
      return NextResponse.json({ quote: null });
    }
    
    const snapshot = snapshots[0];
    const quote: QuoteResult = {
      priceEur: snapshot.priceEur,
      timestamp: snapshot.pricedAt,
      freshness: snapshot.freshnessStatus,
      ageSeconds: snapshot.freshnessAgeSeconds,
      source: snapshot.source,
    };

    return NextResponse.json({ quote });
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch quote" }, { status: 500 });
  }
}

