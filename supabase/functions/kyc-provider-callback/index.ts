import { jsonResponse } from "../_shared/http.ts";
import { logEvent } from "../_shared/log.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { claimReplay, completeReplay, failReplay } from "../_shared/replay.ts";

type ProviderStatus = "approved" | "rejected" | "review_required";
type CallbackPayload = {
  event_id: string;
  request_id: string;
  status: ProviderStatus;
  reason?: string | null;
  provider?: string;
  metadata?: Record<string, unknown>;
};

const encoder = new TextEncoder();

const signPayload = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const toDecision = (status: ProviderStatus): "verified" | "rejected" | "under_review" => {
  if (status === "approved") return "verified";
  if (status === "rejected") return "rejected";
  return "under_review";
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("KYC_WEBHOOK_SECRET");
  const webhookActorUserId = Deno.env.get("WEBHOOK_ACTOR_USER_ID");

  if (!secret || !webhookActorUserId) {
    return jsonResponse({ error: "Missing required env" }, 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-kyc-signature");
  const expectedSignature = await signPayload(secret, rawBody);

  if (!signature || signature !== expectedSignature) {
    logEvent({ level: "warn", fn: "kyc-provider-callback", msg: "signature_verification_failed" });
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const payload = JSON.parse(rawBody) as CallbackPayload;
  if (!payload.event_id || !payload.request_id || !payload.status) {
    return jsonResponse({ error: "Invalid payload" }, 400);
  }

  const replay = await claimReplay("kyc_provider_callback", payload.event_id);
  if (!replay.claimed) {
    if (replay.existing?.status === "completed") return jsonResponse({ ok: true, deduped: true }, 200);
    return jsonResponse({ ok: false, in_progress: true }, 202);
  }

  try {
    const { data: requestRow, error: requestError } = await supabaseAdmin
      .from("kyc_requests")
      .select("id, user_id, status")
      .eq("id", payload.request_id)
      .single();

    if (requestError || !requestRow) return jsonResponse({ error: "Request not found" }, 404);

    const decision = toDecision(payload.status);
    const now = new Date().toISOString();

    await supabaseAdmin.from("kyc_requests").update({
      status: decision,
      reviewed_at: now,
      reviewed_by: webhookActorUserId,
      review_reason: payload.reason ?? null,
      updated_at: now,
    }).eq("id", payload.request_id);

    await supabaseAdmin.from("profiles").update({
      kyc_status: decision,
      kyc_reviewed_at: now,
      kyc_rejection_reason: decision === "rejected" ? (payload.reason ?? null) : null,
      updated_at: now,
    }).eq("id", requestRow.user_id);

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: webhookActorUserId,
      action_type: "kyc_provider_callback",
      target_user_id: requestRow.user_id,
      target_table: "kyc_requests",
      new_value: {
        event_id: payload.event_id,
        request_id: payload.request_id,
        previous_status: requestRow.status,
        next_status: decision,
        provider: payload.provider ?? "unknown",
        reason: payload.reason ?? null,
        metadata: payload.metadata ?? {},
      },
    });

    await completeReplay("kyc_provider_callback", payload.event_id, { ok: true });
    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await failReplay("kyc_provider_callback", payload.event_id, { ok: false, error: message });
    logEvent({ level: "error", fn: "kyc-provider-callback", msg: "handler_failed", error: message });
    return jsonResponse({ error: "Failed to process callback" }, 500);
  }
});
