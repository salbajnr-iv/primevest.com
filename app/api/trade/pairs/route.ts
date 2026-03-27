import { NextResponse } from "next/server";

import { getLatestPrices } from "@/lib/market/service";
import { TRADE_INSTRUMENTS } from "@/lib/trade/instruments";

export async function GET() {
  const latestPrices = await getLatestPrices(TRADE_INSTRUMENTS.map((instrument) => instrument.base));

  const priceByAsset = new Map(latestPrices.map((row) => [row.asset, row.priceEur]));

  return NextResponse.json({
    ok: true,
    data: TRADE_INSTRUMENTS.map((instrument) => ({
      ...instrument,
      price: priceByAsset.get(instrument.base) ?? null,
    })),
  });
}
