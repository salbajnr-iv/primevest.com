import { jsonResponse, requestIpFromHeaders } from "../_shared/http.ts";
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

const signPayload = async (
  secret: string,
  payload: string,
): Promise<string> => {
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"],
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(payload),
  );
  return Array.from(new Uint8Array(signature))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
};

const toDecision = (
  status: ProviderStatus,
): "verified" | "rejected" | "under_review" => {
  if (status === "approved") return "verified";
  if (status === "rejected") return "rejected";
  return "under_review";
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST")
    return jsonResponse({ error: "Method not allowed" }, 405);

  const secret = Deno.env.get("KYC_WEBHOOK_SECRET");
  const webhookActorUserId = Deno.env.get("WEBHOOK_ACTOR_USER_ID");

  if (!secret || !webhookActorUserId) {
    return jsonResponse({ error: "Missing required env" }, 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-kyc-signature");
  const expectedSignature = await signPayload(secret, rawBody);

  if (!signature || signature !== expectedSignature) {
    logEvent({
      level: "warn",
      fn: "kyc-provider-callback",
      msg: "signature_verification_failed",
    });
    return jsonResponse({ error: "Invalid signature" }, 401);
  }

  const payload = JSON.parse(rawBody) as CallbackPayload;
  if (!payload.event_id || !payload.request_id || !payload.status) {
    return jsonResponse({ error: "Invalid payload" }, 400);
  }

  const replay = await claimReplay("kyc_provider_callback", payload.event_id);
  if (!replay.claimed) {
    if (replay.existing?.status === "completed")
      return jsonResponse({ ok: true, deduped: true }, 200);
    return jsonResponse({ ok: false, in_progress: true }, 202);
  }

  try {
    const decision = toDecision(payload.status);
    const { data: result, error } = await supabaseAdmin.rpc(
      "apply_kyc_review_decision",
      {
        p_request_id: payload.request_id,
        p_decision: decision,
        p_admin_id: webhookActorUserId,
        p_reason: payload.reason ?? null,
        p_action_type: "kyc_provider_callback",
        p_context: {
          event_id: payload.event_id,
          provider: payload.provider ?? "unknown",
          provider_status: payload.status,
          reason: payload.reason ?? null,
          metadata: payload.metadata ?? {},
        },
        p_ip_address: requestIpFromHeaders(request),
      },
    );

    if (error) {
      if (error.message.includes("not found")) {
        await failReplay("kyc_provider_callback", payload.event_id, {
          ok: false,
          error: error.message,
        });
        return jsonResponse({ error: error.message }, 404);
      }
      throw error;
    }

    const applied = Array.isArray(result) ? result[0] : result;

    await completeReplay("kyc_provider_callback", payload.event_id, {
      ok: true,
      decision: applied?.request_status ?? decision,
    });
    return jsonResponse(
      { ok: true, decision: applied?.request_status ?? decision },
      200,
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    await failReplay("kyc_provider_callback", payload.event_id, {
      ok: false,
      error: message,
    });
    logEvent({
      level: "error",
      fn: "kyc-provider-callback",
      msg: "handler_failed",
      error: message,
    });
    return jsonResponse({ error: "Failed to process callback" }, 500);
  }
});
