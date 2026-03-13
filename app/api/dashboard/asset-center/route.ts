import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { tradingPlatforms } from "@/lib/config/trading-platforms";

interface DbOrder {
  side: string | null;
  total: number | null;
  status: string | null;
}

export async function GET(req: Request) {
  const fallbackAccounts = [
    { id: "live-main", name: "Live Account", type: "live", balance: 0, currency: "USD" },
  ];

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;
  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ ok: true, accounts: fallbackAccounts, platforms: tradingPlatforms });
  }

  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ ok: true, accounts: fallbackAccounts, platforms: tradingPlatforms });
    }

    const supabase = createClient(supabaseUrl, serviceRole);

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: true, accounts: fallbackAccounts, platforms: tradingPlatforms });
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
      { ok: false, error: "Failed to load asset center data", details: String(error) },
      { status: 500 },
    );
  }
}
