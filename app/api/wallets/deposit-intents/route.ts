import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Deposits are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const body = await req.json();
    const currency = String(body.currency || "").toUpperCase();
    const provider = String(body.provider || "").trim();
    const amount = Number(body.amount);
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey).trim() : null;
    const externalReference = body.externalReference ? String(body.externalReference).trim() : null;

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

    const { data: rpcData, error: rpcErr } = await supabase.rpc("create_deposit_intent", {
      p_currency: currency,
      p_amount: amount,
      p_provider: provider,
      p_idempotency_key: idempotencyKey,
      p_external_reference: externalReference,
    });

    if (rpcErr) {
      return NextResponse.json({ error: "Failed to create deposit intent", details: rpcErr.message }, { status: 500 });
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const status = result?.code === "IDEMPOTENCY_CONFLICT" ? 409 : 422;
      return NextResponse.json({ error: result?.message || "Unable to create deposit intent", code: result?.code }, { status });
    }

    return NextResponse.json({
      ok: true,
      transaction: {
        id: result.transaction_id,
        type: "deposit",
        status: result.status,
        currency,
        amount,
        provider,
      },
      idempotentReplay: result.code === "IDEMPOTENT_REPLAY",
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
