import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tradingPlatforms } from "@/lib/config/trading-platforms";

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

const errorResponse = (status: number, code: AssetCenterErrorCode, message: string, details?: string) =>
  NextResponse.json({ ok: false, code, message, details }, { status });

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return errorResponse(
      503,
      "ASSET_CENTER_CONFIG_UNAVAILABLE",
      "Asset Center is temporarily unavailable because required backend configuration is missing. Please contact support.",
    );
  }

  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return errorResponse(401, "ASSET_CENTER_AUTH_REQUIRED", "Please sign in again to view your asset center accounts.");
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return errorResponse(401, "ASSET_CENTER_AUTH_INVALID", "Your session has expired. Please sign in again to continue.");
    }

    const userId = userData.user.id;

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
      { id: "live-main", name: "Live Account", type: "live", balance: liveBalance, currency: "USD" },
      { id: "tradew", name: "Trade W Account", type: "tradew", balance: pendingOrderTotal, currency: "USD" },
      { id: "investment", name: "Investment Account", type: "investment", balance: completedBuyTotal, currency: "USD" },
    ];

    return NextResponse.json({ ok: true, data: { accounts, platforms: tradingPlatforms } });
  } catch (error) {
    return errorResponse(500, "ASSET_CENTER_LOAD_FAILED", "Unable to load asset center data right now. Please try again.", String(error));
  }
}
