import { NextResponse } from "next/server";
import { orderHistory } from "@/lib/dashboard/mock-data";

export async function GET() {
  return NextResponse.json({ ok: true, orders: orderHistory });
}
