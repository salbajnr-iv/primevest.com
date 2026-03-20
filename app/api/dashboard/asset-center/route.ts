import { NextResponse } from "next/server";
import { tradingPlatforms } from "@/lib/config/trading-platforms";
import { createClient as createServerClient } from "@/lib/supabase/server";

interface DbOrder {
  side: string | null;
  total: number | null;
  status: string | null;
}

type AssetCenterErrorCode =
  | "ASSET_CENTER_CONFIG_UNAVAILABLE"
  | "ASSET_CENTER_AUTH_REQUIRED"
  | "ASSET_CENTER_AUTH_INVALID"
  | "ASSET_CENTER_DEPENDENCY_UNAVAILABLE"
  | "ASSET_CENTER_LOAD_FAILED";

const errorResponse = (
  status: number,
  code: AssetCenterErrorCode,
  message: string,
  details?: string,
) => NextResponse.json({ ok: false, code, message, details }, { status });

export async function GET() {
  try {
    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return errorResponse(
        401,
        "ASSET_CENTER_AUTH_REQUIRED",
        "Please sign in again to view your asset center accounts.",
      );
    }

    const userId = user.id;

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("account_balance")
      .eq("id", userId)
      .maybeSingle();

    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("side,total,status")
      .eq("user_id", userId)
      .limit(250);

    const dependencyError = profileErr || ordersErr;
    if (dependencyError) {
      return errorResponse(
        503,
        "ASSET_CENTER_DEPENDENCY_UNAVAILABLE",
        "Asset Center data provider is temporarily unavailable. Please try again shortly.",
      );
    }

    const orderRows = (orders || []) as DbOrder[];
    const completedBuyTotal = orderRows
      .filter((order) => order.status === "completed" && order.side === "buy")
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    const pendingOrderTotal = orderRows
      .filter((order) => order.status === "pending")
      .reduce((sum, order) => sum + Number(order.total ?? 0), 0);

    const liveBalance = Number(profile?.account_balance ?? 0);

    const accounts = [
      {
        id: "live-main",
        name: "Live Account",
        type: "live",
        balance: liveBalance,
        currency: "EUR",
        balanceSource: "profiles.account_balance",
      },
      {
        id: "tradew",
        name: "Trade W Account",
        type: "tradew",
        balance: pendingOrderTotal,
        currency: "EUR",
        balanceSource: "pending orders total",
      },
      {
        id: "investment",
        name: "Investment Account",
        type: "investment",
        balance: completedBuyTotal,
        currency: "EUR",
        balanceSource: "completed buy orders total",
      },
    ];

    return NextResponse.json({
      ok: true,
      data: { accounts, platforms: tradingPlatforms },
    });
  } catch (error) {
    return errorResponse(
      500,
      "ASSET_CENTER_LOAD_FAILED",
      "Unable to load asset center data right now. Please try again.",
      String(error),
    );
  }
}
