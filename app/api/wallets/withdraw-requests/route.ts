import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Withdrawals are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const body = await req.json();
    const currency = String(body.currency || "").toUpperCase();
    const destination = String(body.destination || "").trim();
    const amount = Number(body.amount);
    const fee = Number(body.fee || 0);
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey).trim() : null;

    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc("request_withdrawal_review", {
      p_currency: currency,
      p_destination: destination,
      p_amount: amount,
      p_fee: fee,
      p_idempotency_key: idempotencyKey,
    });

    if (rpcErr) {
      return NextResponse.json({ error: "Failed to create withdrawal request", details: rpcErr.message }, { status: 500 });
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const code = String(result?.code || "UNKNOWN");
      const status = code === "KYC_REQUIRED" ? 403 : code === "INSUFFICIENT_FUNDS" ? 400 : code === "IDEMPOTENCY_CONFLICT" ? 409 : 422;
      return NextResponse.json({ error: result?.message || "Unable to submit withdrawal request", code }, { status });
    }

    return NextResponse.json({
      ok: true,
      transaction: {
        id: result.transaction_id,
        type: "withdrawal",
        status: "withdraw_requested",
        currency,
        amount,
        fee,
        payout: result.payout,
      },
      balance: {
        before: result.balance_before,
        after: result.balance_after,
      },
      idempotentReplay: result.code === "IDEMPOTENT_REPLAY",
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
