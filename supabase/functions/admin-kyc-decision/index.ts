import { requireAdmin } from "../_shared/admin-auth.ts";
import { jsonResponse, requestIdFromHeaders } from "../_shared/http.ts";
import { logEvent } from "../_shared/log.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

type KycDecisionPayload = {
  requestId: string;
  decision: "verified" | "rejected";
  reason?: string | null;
  idempotencyKey?: string;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminId } = await requireAdmin(request);
    const payload = (await request.json()) as KycDecisionPayload;
    const idempotencyKey = payload.idempotencyKey ?? requestIdFromHeaders(request);

    if (!payload.requestId || !payload.decision || !idempotencyKey) {
      return jsonResponse({ error: "requestId, decision, and idempotency key are required" }, 400);
    }

    const { data: existingAction } = await supabaseAdmin
      .from("admin_actions")
      .select("id")
      .eq("admin_id", adminId)
      .eq("action_type", "kyc_decision")
      .contains("new_value", { idempotency_key: idempotencyKey })
      .maybeSingle();

    if (existingAction) {
      logEvent({ level: "info", fn: "admin-kyc-decision", msg: "idempotent_replay", admin_id: adminId, request_id: payload.requestId, idempotency_key: idempotencyKey });
      return jsonResponse({ ok: true, deduped: true }, 200);
    }

    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from("kyc_requests")
      .select("id, user_id, status")
      .eq("id", payload.requestId)
      .single();

    if (requestError || !requestRow) {
      return jsonResponse({ error: "KYC request not found" }, 404);
    }

    if (["verified", "rejected"].includes(requestRow.status)) {
      logEvent({ level: "info", fn: "admin-kyc-decision", msg: "already_final_state", admin_id: adminId, request_id: payload.requestId, current_status: requestRow.status });
      return jsonResponse({ ok: true, deduped: true, status: requestRow.status }, 200);
    }

    const now = new Date().toISOString();
    const reviewedAt = payload.decision === "verified" ? now : now;

    const { error: updateRequestError } = await supabaseAdmin
      .from("kyc_requests")
      .update({
        status: payload.decision,
        reviewed_at: reviewedAt,
        reviewed_by: adminId,
        review_reason: payload.reason ?? null,
        updated_at: now,
      })
      .eq("id", payload.requestId)
      .neq("status", "verified")
      .neq("status", "rejected");

    if (updateRequestError) {
      throw updateRequestError;
    }

    const { error: updateProfileError } = await supabaseAdmin
      .from("profiles")
      .update({
        kyc_status: payload.decision,
        kyc_reviewed_at: reviewedAt,
        kyc_rejection_reason: payload.decision === "rejected" ? (payload.reason ?? null) : null,
        updated_at: now,
      })
      .eq("id", requestRow.user_id);

    if (updateProfileError) {
      throw updateProfileError;
    }

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: adminId,
      action_type: "kyc_decision",
      target_user_id: requestRow.user_id,
      target_table: "kyc_requests",
      new_value: {
        request_id: payload.requestId,
        status: payload.decision,
        reason: payload.reason ?? null,
        idempotency_key: idempotencyKey,
      },
    });

    logEvent({ level: "info", fn: "admin-kyc-decision", msg: "decision_applied", admin_id: adminId, request_id: payload.requestId, user_id: requestRow.user_id, decision: payload.decision, idempotency_key: idempotencyKey });

    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    logEvent({
      level: "error",
      fn: "admin-kyc-decision",
      msg: "handler_failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse({ error: "Unauthorized or invalid request" }, 401);
  }
});
