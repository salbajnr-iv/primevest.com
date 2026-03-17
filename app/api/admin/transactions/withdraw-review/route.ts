import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

export async function POST(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Admin tools are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const body = await req.json();
    const transactionId = String(body.transactionId || "").trim();
    const decision = String(body.decision || "").trim().toLowerCase();
    const reason = body.reason ? String(body.reason).trim() : null;
    const idempotencyKey = body.idempotencyKey ? String(body.idempotencyKey).trim() : null;

    if (!/^[0-9a-fA-F-]{36}$/.test(transactionId)) {
      return NextResponse.json({ error: "Invalid transaction id" }, { status: 400 });
    }

    if (!["approve", "reject"].includes(decision)) {
      return NextResponse.json({ error: "decision must be approve or reject" }, { status: 400 });
    }

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

    const { data: profile, error: profileErr } = await supabase
      .from("profiles")
      .select("is_admin")
      .eq("id", userData.user.id)
      .single();

    if (profileErr || !profile?.is_admin) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    const { data: rpcData, error: rpcErr } = await supabase.rpc("review_withdrawal_request", {
      p_transaction_id: transactionId,
      p_decision: decision,
      p_reason: reason,
      p_admin_action_idempotency_key: idempotencyKey,
    });

    if (rpcErr) {
      return NextResponse.json({ error: "Failed to review withdrawal", details: rpcErr.message }, { status: 500 });
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    if (!result?.success) {
      const status = result?.code === "FORBIDDEN" ? 403 : result?.code === "NOT_FOUND" ? 404 : 422;
      return NextResponse.json({ error: result?.message || "Unable to review withdrawal", code: result?.code }, { status });
    }

    return NextResponse.json({
      ok: true,
      transactionId: result.transaction_id,
      status: result.status,
      decision,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
