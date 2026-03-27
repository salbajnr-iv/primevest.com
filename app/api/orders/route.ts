import { NextResponse } from "next/server";

import { getLatestPrices } from "@/lib/market/service";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

type ApiErrorCode =
  | "ORDERS_CONFIG_UNAVAILABLE"
  | "ORDERS_AUTH_REQUIRED"
  | "ORDERS_AUTH_INVALID"
  | "ORDERS_INVALID_PAYLOAD"
  | "ORDERS_DEPENDENCY_UNAVAILABLE"
  | "ORDERS_CREATE_FAILED"
  | "ORDERS_FETCH_FAILED";

const SUPPORTED_SIDES = new Set(["buy", "sell"]);
const SUPPORTED_ORDER_TYPES = new Set(["market", "limit"]);

function errorResponse(
  status: number,
  code: ApiErrorCode,
  message: string,
  details?: string,
) {
  return NextResponse.json({ ok: false, code, message, details }, { status });
}

type CreateOrderPayload = {
  side: string;
  asset: string;
  amount: number;
  total: number;
  orderType: string;
  price: number | null;
};

function parseCreateOrderPayload(
  body: unknown,
): { payload: CreateOrderPayload } | { error: string } {
  const source =
    body && typeof body === "object" ? (body as Record<string, unknown>) : null;
  if (!source) {
    return { error: "Request payload must be a JSON object." };
  }

  const side = String(source.side ?? "").toLowerCase();
  const asset = String(source.asset ?? "").toUpperCase();
  const amount = Number(source.amount);
  const total = Number(source.total);
  const orderType = String(source.orderType ?? "market").toLowerCase();
  const price = source.price == null ? null : Number(source.price);

  if (!SUPPORTED_SIDES.has(side)) {
    return { error: 'Invalid side. Must be "buy" or "sell".' };
  }

  if (!asset || !/^[A-Z0-9]{2,10}$/.test(asset)) {
    return { error: "Invalid asset symbol format." };
  }

  if (!Number.isFinite(amount) || amount <= 0) {
    return { error: "Amount must be a positive number." };
  }

  if (!Number.isFinite(total) || total <= 0) {
    return { error: "Total must be a positive number." };
  }

  if (!SUPPORTED_ORDER_TYPES.has(orderType)) {
    return { error: 'Invalid orderType. Must be "market" or "limit".' };
  }

  if (
    orderType === "limit" &&
    (!Number.isFinite(price) || (price as number) <= 0)
  ) {
    return { error: "Price must be a positive number for limit orders." };
  }

  if (price != null && (!Number.isFinite(price) || price <= 0)) {
    return { error: "Price must be a positive number when provided." };
  }

  return {
    payload: {
      side,
      asset,
      amount,
      total,
      orderType,
      price,
    },
  };
}

async function getAuthenticatedClient() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: errorResponse(
        401,
        "ORDERS_AUTH_REQUIRED",
        "Authentication required.",
      ),
    };
  }

  return { supabase, user };
}

export async function POST(req: Request) {
  try {
    const parsed = parseCreateOrderPayload(await req.json());
    if ("error" in parsed) {
      return errorResponse(400, "ORDERS_INVALID_PAYLOAD", parsed.error);
    }

    const authResult = await getAuthenticatedClient();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { side, asset, amount, price, total, orderType } = parsed.payload;
    const { supabase, user } = authResult;

    const latestPrice =
      price == null
        ? (await getLatestPrices([asset])).find((row) => row.asset === asset)
        : null;

    if (orderType === "market" && price == null && !latestPrice) {
      return errorResponse(
        503,
        "ORDERS_DEPENDENCY_UNAVAILABLE",
        "Market price dependency unavailable; unable to price market order.",
      );
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "create_order_atomic",
      {
        p_side: side,
        p_asset: asset,
        p_amount: amount,
        p_price: price ?? latestPrice?.priceEur ?? null,
        p_total: total,
        p_order_type: orderType,
      },
    );

    if (rpcErr) {
      return errorResponse(
        503,
        "ORDERS_DEPENDENCY_UNAVAILABLE",
        "Order dependency is temporarily unavailable.",
        rpcErr.message,
      );
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const status = result?.code === "INSUFFICIENT_FUNDS" ? 400 : 422;
      return errorResponse(
        status,
        "ORDERS_CREATE_FAILED",
        result?.message || "Failed to create order.",
        result?.code,
      );
    }

    await createAdminClient()
      .from("admin_actions")
      .insert([{
        admin_id: user.id,
        action_type: "order_created",
        target_user_id: user.id,
        target_table: "orders",
        new_value: JSON.stringify({
          order_id: result.order_id,
          side,
          asset,
          amount,
          total,
        }),
      }] as { admin_id: string; action_type: string; target_user_id: string; target_table: string; new_value: string }[]);

    return NextResponse.json({
      ok: true,
      data: {
        order: {
          id: result.order_id,
          side,
          asset,
          amount,
          price: price ?? latestPrice?.priceEur ?? null,
          total,
          status: "pending",
        },
        transaction_id: result.transaction_id,
        balance: {
          before: result.balance_before,
          after: result.balance_after,
        },
      },
    });
  } catch (err) {
    return errorResponse(
      500,
      "ORDERS_CREATE_FAILED",
      "Unexpected error creating order.",
      String(err),
    );
  }
}

export async function GET() {
  try {
    const authResult = await getAuthenticatedClient();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { supabase, user } = authResult;
    const { data: orders, error: ordersErr } = await supabase
      .from("orders")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .limit(50);

    if (ordersErr) {
      return errorResponse(
        503,
        "ORDERS_DEPENDENCY_UNAVAILABLE",
        "Order storage dependency is temporarily unavailable.",
        ordersErr.message,
      );
    }

    return NextResponse.json({ ok: true, data: { orders: orders || [] } });
  } catch (err) {
    return errorResponse(
      500,
      "ORDERS_FETCH_FAILED",
      "Unexpected error fetching orders.",
      String(err),
    );
  }
}
