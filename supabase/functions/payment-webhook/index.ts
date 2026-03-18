import { logEvent } from "../_shared/log.ts";
import { jsonResponse } from "../_shared/http.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { claimReplay, completeReplay, failReplay } from "../_shared/replay.ts";

type PaymentWebhookPayload = {
  event_id: string;
  provider?: "stripe" | "onramp" | string;
  user_id?: string;
  type:
    | "deposit_pending"
    | "deposit_succeeded"
    | "deposit_failed"
    | "deposit_reversed"
    | "withdraw_pending"
    | "withdraw_approved"
    | "withdraw_succeeded"
    | "withdraw_failed"
    | "withdraw_reversed";
  amount?: number;
  currency?: string;
  external_reference?: string;
  metadata?: Record<string, unknown>;
};

class HttpError extends Error {
  status: number;

  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

const encoder = new TextEncoder();

const secureCompare = (left: string, right: string): boolean => {
  if (left.length !== right.length) return false;

  let mismatch = 0;
  for (let i = 0; i < left.length; i += 1) {
    mismatch |= left.charCodeAt(i) ^ right.charCodeAt(i);
  }

  return mismatch === 0;
};

const signPayload = async (secret: string, payload: string): Promise<string> => {
  const key = await crypto.subtle.importKey("raw", encoder.encode(secret), { name: "HMAC", hash: "SHA-256" }, false, ["sign"]);
  const signature = await crypto.subtle.sign("HMAC", key, encoder.encode(payload));
  return Array.from(new Uint8Array(signature)).map((byte) => byte.toString(16).padStart(2, "0")).join("");
};

const selectTransaction = async (payload: PaymentWebhookPayload) => {
  const transactionId = typeof payload.metadata?.transaction_id === "string" ? payload.metadata.transaction_id : null;

  if (transactionId) {
    const { data } = await supabaseAdmin
      .from("transactions")
      .select("id,user_id,status,type")
      .eq("id", transactionId)
      .maybeSingle();

    if (data) return data;
  }

  if (payload.external_reference) {
    const { data } = await supabaseAdmin
      .from("transactions")
      .select("id,user_id,status,type")
      .eq("external_reference", payload.external_reference)
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }

  if (payload.user_id && payload.type.startsWith("deposit")) {
    const { data } = await supabaseAdmin
      .from("transactions")
      .select("id,user_id,status,type")
      .eq("user_id", payload.user_id)
      .eq("type", "deposit")
      .eq("status", "deposit_initiated")
      .order("created_at", { ascending: false })
      .limit(1)
      .maybeSingle();

    if (data) return data;
  }

  return null;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  const webhookSecret = Deno.env.get("STRIPE_WEBHOOK_SECRET") ?? Deno.env.get("PAYMENT_WEBHOOK_SECRET");
  const webhookActorUserId = Deno.env.get("WEBHOOK_ACTOR_USER_ID");

  if (!webhookSecret || !webhookActorUserId) {
    logEvent({ level: "error", fn: "payment-webhook", msg: "missing_env", required: ["STRIPE_WEBHOOK_SECRET|PAYMENT_WEBHOOK_SECRET", "WEBHOOK_ACTOR_USER_ID"] });
    return jsonResponse({ error: "Missing required webhook environment variables" }, 500);
  }

  const rawBody = await request.text();
  const signature = request.headers.get("x-provider-signature") ?? request.headers.get("stripe-signature");
  const expectedSignature = await signPayload(webhookSecret, rawBody);

  if (!signature || !secureCompare(signature, expectedSignature)) {
    logEvent({ level: "warn", fn: "payment-webhook", msg: "signature_verification_failed" });
    return jsonResponse({ error: "Invalid webhook signature" }, 401);
  }

  const payload = JSON.parse(rawBody) as PaymentWebhookPayload;
  const { event_id: eventId, amount, type, currency = "USD", metadata = {}, provider = "stripe", external_reference: externalReference } = payload;

  if (!eventId || !type) {
    return jsonResponse({ error: "Invalid payload" }, 400);
  }

  const replay = await claimReplay("payment_webhook", eventId);
  if (!replay.claimed) {
    if (replay.existing?.status === "completed") {
      return jsonResponse({ ok: true, deduped: true, replay: replay.existing.response ?? null }, 200);
    }

    return jsonResponse({ ok: false, in_progress: true }, 202);
  }

  try {
    const tx = await selectTransaction(payload);

    if (!tx && !(payload.user_id && type.startsWith("deposit") && Number.isFinite(amount) && (amount ?? 0) > 0)) {
      throw new HttpError("No matching transaction found for webhook event", 404);
    }

    let transactionId = tx?.id as string | null;

    if (!transactionId) {
      const { data: depositIntent, error: intentError } = await supabaseAdmin.rpc("create_deposit_intent", {
        p_currency: currency,
        p_amount: amount,
        p_provider: provider,
        p_idempotency_key: `${provider}:${eventId}:intent`,
        p_external_reference: externalReference ?? eventId,
      });
      if (intentError) throw intentError;
      const intentResult = Array.isArray(depositIntent) ? depositIntent[0] : depositIntent;
      if (!intentResult?.success || !intentResult.transaction_id) {
        throw new HttpError(intentResult?.message ?? "Unable to create mapped deposit intent", 422);
      }
      transactionId = intentResult.transaction_id;
    }

    let rpcName = "";
    let rpcPayload: Record<string, unknown> = {};

    if (["deposit_succeeded"].includes(type)) {
      rpcName = "confirm_deposit_callback";
      rpcPayload = {
        p_transaction_id: transactionId,
        p_callback_idempotency_key: `${provider}:${eventId}`,
        p_external_reference: externalReference,
        p_settled_amount: amount,
        p_payload: { type, metadata, provider, event_id: eventId },
      };
    } else if (["withdraw_succeeded", "withdraw_failed", "withdraw_reversed"].includes(type)) {
      rpcName = "settle_withdrawal_callback";
      const providerStatus = type === "withdraw_succeeded" ? "succeeded" : type === "withdraw_reversed" ? "reversed" : "failed";
      rpcPayload = {
        p_transaction_id: transactionId,
        p_callback_idempotency_key: `${provider}:${eventId}`,
        p_provider_status: providerStatus,
        p_external_reference: externalReference,
        p_payload: { type, metadata, provider, event_id: eventId },
      };
    } else if (["withdraw_approved"].includes(type)) {
      rpcName = "review_withdrawal_request";
      rpcPayload = {
        p_transaction_id: transactionId,
        p_decision: "approve",
        p_reason: `Provider ${provider} approved withdrawal`,
        p_admin_action_idempotency_key: `${provider}:${eventId}`,
      };
    } else if (["deposit_failed", "deposit_reversed", "withdraw_pending", "deposit_pending"].includes(type)) {
      const { error: updateError } = await supabaseAdmin
        .from("transactions")
        .update({
          status: type === "deposit_failed" ? "deposit_failed" : type === "deposit_reversed" ? "cancelled" : type === "withdraw_pending" ? "withdraw_in_review" : "deposit_initiated",
          callback_idempotency_key: `${provider}:${eventId}`,
          metadata: { ...metadata, provider, event_id: eventId, external_reference: externalReference },
          updated_at: new Date().toISOString(),
        })
        .eq("id", transactionId);
      if (updateError) throw updateError;
    }

    if (rpcName) {
      const { data: rpcData, error: rpcError } = await supabaseAdmin.rpc(rpcName, rpcPayload);
      if (rpcError) throw rpcError;
      const result = Array.isArray(rpcData) ? rpcData[0] : rpcData;
      if (!result?.success) {
        throw new HttpError(result?.message ?? `${rpcName} failed`, 422);
      }
    }

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: webhookActorUserId,
      action_type: "payment_webhook_processed",
      target_user_id: tx?.user_id ?? payload.user_id ?? null,
      target_table: "transactions",
      new_value: { provider_event_id: eventId, type, amount, currency, metadata, externalReference, transactionId, provider },
    });

    await completeReplay("payment_webhook", eventId, { ok: true, event_id: eventId, transaction_id: transactionId });
    return jsonResponse({ ok: true, transaction_id: transactionId }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = error instanceof HttpError ? error.status : 500;
    await failReplay("payment_webhook", eventId, { ok: false, error: message, status });
    logEvent({ level: status >= 500 ? "error" : "warn", fn: "payment-webhook", msg: "handler_failed", event_id: eventId, error: message, status });
    return jsonResponse({ error: message }, status);
  }
});
