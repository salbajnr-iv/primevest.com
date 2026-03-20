import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const currency = String(body.currency || "").toUpperCase();
    const provider = String(body.provider || "").trim();
    const amount = Number(body.amount);
    const idempotencyKey = body.idempotencyKey
      ? String(body.idempotencyKey).trim()
      : null;
    const externalReference = body.externalReference
      ? String(body.externalReference).trim()
      : null;

    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc(
      "create_deposit_intent",
      {
        p_currency: currency,
        p_amount: amount,
        p_provider: provider,
        p_idempotency_key: idempotencyKey,
        p_external_reference: externalReference,
      },
    );

    if (rpcErr) {
      return NextResponse.json(
        { error: "Failed to create deposit intent", details: rpcErr.message },
        { status: 500 },
      );
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const status = result?.code === "IDEMPOTENCY_CONFLICT" ? 409 : 422;
      return NextResponse.json(
        {
          error: result?.message || "Unable to create deposit intent",
          code: result?.code,
        },
        { status },
      );
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
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}
