import { NextResponse } from "next/server";
import "server-only";

import { createAdminClient } from "@/lib/supabase/admin";
import { verifyAdminBearerToken } from "@/lib/admin/server";

export async function POST(req: Request) {
  try {
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

    const verification = await verifyAdminBearerToken(token);
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status || 401 });
    }

    const supabase = createAdminClient();

    const { data: rpcData, error: rpcErr } = await supabase.rpc("review_withdrawal_request", {
      p_transaction_id: transactionId,
      p_decision: decision,
      p_reason: reason,
      p_admin_action_idempotency_key: idempotencyKey,
    } as never);

    if (rpcErr) {
      return NextResponse.json({ error: "Failed to review withdrawal", details: rpcErr.message }, { status: 500 });
    }

    const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
    const typedResult = result as unknown as { success?: boolean; message?: string; code?: string; transaction_id?: string; status?: string } | null;
    
    if (!typedResult?.success) {
      const status = typedResult?.code === "FORBIDDEN" ? 403 : typedResult?.code === "NOT_FOUND" ? 404 : 422;
      return NextResponse.json({ error: typedResult?.message || "Unable to review withdrawal", code: typedResult?.code }, { status });
    }

    return NextResponse.json({
      ok: true,
      transactionId: typedResult.transaction_id,
      status: typedResult.status,
      decision,
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
