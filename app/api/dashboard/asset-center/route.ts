import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tradingPlatforms } from "@/lib/config/trading-platforms";

interface DbOrder {
  side: string | null;
  total: number | null;
  status: string | null;
}

export async function GET(req: Request) {
  const demoModeEnabled = process.env.ASSET_CENTER_DEMO_MODE === "true";
  const fallbackAccounts = [
    { id: "live-main", name: "Live Account", type: "live", balance: 0, currency: "USD" },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    if (demoModeEnabled) {
      return NextResponse.json({
        ok: true,
        accounts: fallbackAccounts,
        platforms: tradingPlatforms,
        meta: { demoMode: true },
      });
    }

    return NextResponse.json(
      {
        ok: false,
        code: "ASSET_CENTER_CONFIG_UNAVAILABLE",
        message:
          "Asset Center is temporarily unavailable because required backend configuration is missing. Please contact support.",
      },
      { status: 503 },
    );
  }

  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        {
          ok: false,
          code: "ASSET_CENTER_AUTH_REQUIRED",
          message: "Please sign in again to view your asset center accounts.",
        },
        { status: 401 },
      );
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json(
        {
          ok: false,
          code: "ASSET_CENTER_AUTH_INVALID",
          message: "Your session has expired. Please sign in again to continue.",
        },
        { status: 401 },
      );
    }

    const userId = userData.user.id;

    const { data: profile } = await supabase
      .from("profiles")
      .select("account_balance")
      .eq("id", userId)
      .maybeSingle();

    const { data: orders } = await supabase
      .from("orders")
      .select("side,total,status")
      .eq("user_id", userId)
      .limit(250);

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

    return NextResponse.json({ ok: true, accounts, platforms: tradingPlatforms });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        code: "ASSET_CENTER_LOAD_FAILED",
        message: "Unable to load asset center data right now. Please try again.",
        details: String(error),
      },
      { status: 500 },
    );
  }
}
