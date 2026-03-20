import { requireAdmin } from "../_shared/admin-auth.ts";
import {
  jsonResponse,
  requestIdFromHeaders,
  requestIpFromHeaders,
} from "../_shared/http.ts";
import { logEvent } from "../_shared/log.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

type KycDecisionPayload = {
  requestId: string;
  decision: "verified" | "rejected";
  reason?: string | null;
  idempotencyKey?: string;
  reviewContext?: Record<string, unknown>;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminId } = await requireAdmin(request);
    const payload = (await request.json()) as KycDecisionPayload;
    const idempotencyKey =
      payload.idempotencyKey ?? requestIdFromHeaders(request);

    if (!payload.requestId || !payload.decision || !idempotencyKey) {
      return jsonResponse(
        { error: "requestId, decision, and idempotency key are required" },
        400,
      );
    }

    const { data: existingAction } = await supabaseAdmin
      .from("admin_actions")
      .select("id")
      .eq("admin_id", adminId)
      .eq("action_type", "kyc_decision")
      .contains("new_value", { context: { idempotency_key: idempotencyKey } })
      .maybeSingle();

    if (existingAction) {
      logEvent({
        level: "info",
        fn: "admin-kyc-decision",
        msg: "idempotent_replay",
        admin_id: adminId,
        request_id: payload.requestId,
        idempotency_key: idempotencyKey,
      });
      return jsonResponse({ ok: true, deduped: true }, 200);
    }

    const reviewContext = {
      source: "admin_dashboard",
      reason: payload.reason ?? null,
      idempotency_key: idempotencyKey,
      ...(payload.reviewContext ?? {}),
    };

    const { data: result, error } = await supabaseAdmin.rpc(
      "apply_kyc_review_decision",
      {
        p_request_id: payload.requestId,
        p_decision: payload.decision,
        p_admin_id: adminId,
        p_reason: payload.reason ?? null,
        p_action_type: "kyc_decision",
        p_context: reviewContext,
        p_ip_address: requestIpFromHeaders(request),
      },
    );

    if (error) {
      if (error.message.includes("not found")) {
        return jsonResponse({ error: error.message }, 404);
      }
      throw error;
    }

    const applied = Array.isArray(result) ? result[0] : result;
    if (!applied) {
      throw new Error("Empty KYC decision result");
    }

    logEvent({
      level: "info",
      fn: "admin-kyc-decision",
      msg: "decision_applied",
      admin_id: adminId,
      request_id: payload.requestId,
      user_id: applied.user_id,
      decision: applied.request_status,
      idempotency_key: idempotencyKey,
    });

    return jsonResponse({ ok: true, decision: applied.request_status }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    logEvent({
      level: "error",
      fn: "admin-kyc-decision",
      msg: "handler_failed",
      error: message,
    });

    const unauthorized =
      message === "Missing bearer token" ||
      message === "Invalid auth token" ||
      message === "Admin access required";
    return jsonResponse(
      { error: unauthorized ? "Unauthorized or invalid request" : message },
      unauthorized ? 401 : 400,
    );
  }
});
