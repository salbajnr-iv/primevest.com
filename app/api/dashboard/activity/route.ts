import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";
import type { ActivityItem, OrderStatus } from "@/lib/dashboard/types";

type RouteErrorCode = "UNAUTHENTICATED" | "FORBIDDEN" | "QUERY_FAILED";

type OrderRow = {
  id: string | number;
  order_type: string | null;
  side: string | null;
  total_amount: number | null;
  total: number | null;
  status: string | null;
  created_at: string;
};

type TransactionRow = {
  id: string | number;
  type: string | null;
  amount: number | null;
  status: string | null;
  created_at: string;
};

const errorResponse = (status: number, code: RouteErrorCode, error: string) =>
  NextResponse.json({ ok: false, code, error }, { status });

const toStatus = (value: string | null): OrderStatus => {
  if (value === "completed" || value === "pending" || value === "cancelled") return value;
  return "pending";
};

const toCurrencyLabel = (value: number) => `${value >= 0 ? "+" : ""}${value.toFixed(2)} €`;

export async function GET() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser();

  if (authError || !user) {
    return errorResponse(401, "UNAUTHENTICATED", "Authentication required");
  }

  const [ordersRes, txRes] = await Promise.all([
    supabase
      .from("orders")
      .select("id, order_type, side, total_amount, total, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("transactions")
      .select("id, type, amount, status, created_at")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(10),
  ]);

  if (ordersRes.error || txRes.error) {
    const code = ordersRes.error?.code || txRes.error?.code;
    if (code === "42501") {
      return errorResponse(403, "FORBIDDEN", "Forbidden");
    }
    return errorResponse(500, "QUERY_FAILED", "Failed to load activity");
  }

  const orderRows = (ordersRes.data ?? []) as OrderRow[];
  const transactionRows = (txRes.data ?? []) as TransactionRow[];

  const orderItems: ActivityItem[] = orderRows.map((row) => {
    const type = row.order_type || row.side || "Order";
    const total = Number(row.total_amount ?? row.total ?? 0);
    return {
      id: `ORD-${row.id}`,
      type: type.charAt(0).toUpperCase() + type.slice(1).toLowerCase(),
      amountLabel: toCurrencyLabel(-Math.abs(total)),
      status: toStatus(row.status),
      href: "/dashboard/orders",
      createdAt: row.created_at,
    };
  });

  const txItems: ActivityItem[] = transactionRows.map((row) => {
    const txType = row.type || "Transaction";
    const amount = Number(row.amount ?? 0);
    const isCredit = ["deposit", "credit"].includes(txType.toLowerCase());
    return {
      id: `TX-${row.id}`,
      type: txType.charAt(0).toUpperCase() + txType.slice(1).toLowerCase(),
      amountLabel: toCurrencyLabel(isCredit ? Math.abs(amount) : -Math.abs(amount)),
      status: toStatus(row.status),
      href: "/dashboard/wallets",
      createdAt: row.created_at,
    };
  });

  const activity = [...orderItems, ...txItems]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 20);

  return NextResponse.json({ ok: true, activity });
}
