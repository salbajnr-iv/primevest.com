import { NextResponse } from "next/server";
import { getLatestPrices } from "@/lib/market/service";

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const assets = (searchParams.get("assets") || "")
    .split(",")
    .map((v) => v.trim().toUpperCase())
    .filter(Boolean);

  const prices = await getLatestPrices(assets.length ? assets : undefined);
  return NextResponse.json({ ok: true, prices });
}
