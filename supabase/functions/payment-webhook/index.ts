import { logEvent } from "../_shared/log.ts";
import { jsonResponse } from "../_shared/http.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { claimReplay, completeReplay, failReplay } from "../_shared/replay.ts";

type PaymentWebhookPayload = {
  event_id: string;
  user_id: string;
  type: "deposit_succeeded" | "deposit_reversed";
  amount: number;
  currency?: string;
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
  const { event_id: eventId, user_id: userId, amount, type, currency = "USD", metadata = {} } = payload;

  if (!eventId || !userId || !Number.isFinite(amount) || amount <= 0) {
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
    const { data: profile, error: profileError } = await supabaseAdmin.from("profiles").select("account_balance").eq("id", userId).single();
    if (profileError || !profile) throw new HttpError("Profile not found", 404);

    const previousBalance = Number(profile.account_balance ?? 0);
    const signedAmount = type === "deposit_reversed" ? -amount : amount;
    const nextBalance = previousBalance + signedAmount;

    if (nextBalance < 0) throw new HttpError("Balance cannot go below zero", 409);

    const { error: updateError } = await supabaseAdmin.from("profiles").update({ account_balance: nextBalance, updated_at: new Date().toISOString() }).eq("id", userId);
    if (updateError) throw updateError;

    await supabaseAdmin.from("balance_history").insert({
      user_id: userId,
      admin_id: webhookActorUserId,
      action_type: signedAmount >= 0 ? "add" : "subtract",
      amount: Math.abs(signedAmount),
      currency,
      previous_balance: previousBalance,
      new_balance: nextBalance,
      reason: `webhook:${type}:${eventId}`,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: webhookActorUserId,
      action_type: "payment_webhook_processed",
      target_user_id: userId,
      target_table: "profiles",
      new_value: { provider_event_id: eventId, type, amount, currency, metadata },
    });

    await completeReplay("payment_webhook", eventId, { ok: true, event_id: eventId });
    return jsonResponse({ ok: true }, 200);
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    const status = error instanceof HttpError ? error.status : 500;
    await failReplay("payment_webhook", eventId, { ok: false, error: message, status });
    logEvent({ level: status >= 500 ? "error" : "warn", fn: "payment-webhook", msg: "handler_failed", event_id: eventId, error: message, status });
    return jsonResponse({ error: message }, status);
  }
});
