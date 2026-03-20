import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

type Currency = "EUR" | "BTC" | "ETH" | "USDT";

const networkFee: Record<Currency, number> = {
  EUR: 1,
  BTC: 0.0002,
  ETH: 0.003,
  USDT: 2,
};

const amountPrecision: Record<Currency, number> = {
  EUR: 2,
  USDT: 2,
  BTC: 6,
  ETH: 6,
};

const destinationValidators: Record<Currency, RegExp> = {
  EUR: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  USDT: /^(T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})$/,
};

function hasValidPrecision(value: number, currency: Currency) {
  const precision = amountPrecision[currency];
  return Number(value.toFixed(precision)) === value;
}

async function getAuthenticatedClient() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      ),
    };
  }

  return { supabase, user };
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currency = String(body.currency || "") as Currency;
    const destination = String(body.destination || "").trim();
    const amount = Number(body.amount);
    const fee = Number(body.fee);

    if (!Object.keys(networkFee).includes(currency)) {
      return NextResponse.json(
        { error: "Unsupported currency" },
        { status: 400 },
      );
    }

    if (!Number.isFinite(amount) || amount <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than zero" },
        { status: 400 },
      );
    }

    if (!hasValidPrecision(amount, currency)) {
      return NextResponse.json(
        { error: `Amount exceeds ${amountPrecision[currency]} decimal places` },
        { status: 400 },
      );
    }

    const expectedFee = networkFee[currency];
    if (!Number.isFinite(fee) || Math.abs(fee - expectedFee) > 1e-9) {
      return NextResponse.json(
        { error: "Invalid fee for selected currency" },
        { status: 400 },
      );
    }

    if (!destinationValidators[currency].test(destination)) {
      return NextResponse.json(
        { error: "Invalid destination format" },
        { status: 400 },
      );
    }

    const authResult = await getAuthenticatedClient();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { supabase } = authResult;
    const payout = Number((amount - fee).toFixed(amountPrecision[currency]));
    if (payout <= 0) {
      return NextResponse.json(
        { error: "Amount must be greater than fee" },
        { status: 400 },
      );
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "request_withdrawal_review",
      {
        p_currency: currency,
        p_destination: destination,
        p_amount: amount,
        p_fee: fee,
      },
    );

    if (rpcErr) {
      return NextResponse.json(
        {
          error: "Failed to create withdrawal request",
          details: rpcErr.message,
        },
        { status: 500 },
      );
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const status = result?.code === "INSUFFICIENT_FUNDS" ? 400 : 422;
      return NextResponse.json(
        {
          error: result?.message || "Failed to create withdrawal request",
          code: result?.code,
        },
        { status },
      );
    }

    return NextResponse.json({
      ok: true,
      reference: `WDR-${result.transaction_id}`,
      withdrawal: {
        id: result.transaction_id,
        status: "pending",
        createdAt: new Date().toISOString(),
        currency,
        payout: result.payout,
      },
      balance: {
        before: result.balance_before,
        after: result.balance_after,
      },
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}

export async function GET(req: Request) {
  try {
    const reference = new URL(req.url).searchParams.get("reference") || "";
    const txId = reference.replace("WDR-", "").trim();
    if (!/^[0-9a-fA-F-]{36}$/.test(txId)) {
      return NextResponse.json(
        { error: "Invalid withdrawal reference" },
        { status: 400 },
      );
    }

    const authResult = await getAuthenticatedClient();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { supabase, user } = authResult;
    const { data: tx, error } = await supabase
      .from("transactions")
      .select("id,status,created_at")
      .eq("id", txId)
      .eq("user_id", user.id)
      .eq("type", "withdrawal")
      .maybeSingle();

    if (error || !tx) {
      return NextResponse.json(
        { error: "Withdrawal request not found" },
        { status: 404 },
      );
    }

    return NextResponse.json({
      ok: true,
      reference: `WDR-${tx.id}`,
      status: tx.status,
      createdAt: tx.created_at,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}
