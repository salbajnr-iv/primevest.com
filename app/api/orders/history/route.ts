import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

type RouteErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "QUERY_FAILED";

interface DbOrder {
  id: string | number;
  side: string | null;
  order_type: string | null;
  asset: string | null;
  symbol: string | null;
  amount: number | null;
  total: number | null;
  total_amount: number | null;
  status: string | null;
}

const formatCurrency = (value: number) =>
  new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 }).format(value);

const errorResponse = (status: number, code: RouteErrorCode, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required");
  }

  const { data: rows, error } = await supabase
    .from("orders")
    .select("id, side, order_type, asset, symbol, amount, total, total_amount, status")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(100);

  if (error) {
    if (error.code === "42501") {
      return errorResponse(403, "FORBIDDEN", "Forbidden");
    }
    return errorResponse(500, "QUERY_FAILED", "Failed to load order history");
  }

  if (!rows?.length) {
    return NextResponse.json({ ok: true, orders: [] });
  }

  const mapped = (rows as DbOrder[]).map((row) => ({
    id: `ORD-${row.id}`,
    side: (row.side || row.order_type || "-").replace(/^\w/, (c) => c.toUpperCase()),
    symbol: row.symbol || row.asset || "-",
    amount: String(row.amount ?? 0),
    total: formatCurrency(Number(row.total ?? row.total_amount ?? 0)),
    status: (row.status || "pending").replace(/^\w/, (c) => c.toUpperCase()),
  }));

  return NextResponse.json({ ok: true, orders: mapped });
}
