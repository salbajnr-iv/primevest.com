import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { orderHistory } from "@/lib/dashboard/mock-data";

interface DbOrder {
  id: string | number;
  side: string | null;
  asset: string | null;
  amount: number | null;
  total: number | null;
  status: string | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);

export async function GET(req: Request) {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRole = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRole) {
    return NextResponse.json({ ok: true, orders: orderHistory });
  }

  try {
    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ ok: true, orders: orderHistory });
    }

    const supabase = createClient(supabaseUrl, serviceRole);
    const { data: userData, error: userErr } = await supabase.auth.getUser(token);

    if (userErr || !userData?.user) {
      return NextResponse.json({ ok: true, orders: orderHistory });
    }

    const { data: rows, error } = await supabase
      .from("orders")
      .select("id,side,asset,amount,total,status")
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .limit(100);

    if (error) {
      return NextResponse.json({ ok: true, orders: orderHistory });
    }

    const mapped = ((rows || []) as DbOrder[]).map((row) => ({
      id: `ORD-${row.id}`,
      side: (row.side || "-").replace(/^\w/, (c) => c.toUpperCase()),
      symbol: row.asset || "-",
      amount: String(row.amount ?? 0),
      total: formatCurrency(Number(row.total ?? 0)),
      status: (row.status || "pending").replace(/^\w/, (c) => c.toUpperCase()),
    }));

    return NextResponse.json({ ok: true, orders: mapped });
  } catch {
    return NextResponse.json({ ok: true, orders: orderHistory });
  }
}
