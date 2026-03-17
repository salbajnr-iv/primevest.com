import { requireAdmin } from "../_shared/admin-auth.ts";
import { jsonResponse, requestIdFromHeaders } from "../_shared/http.ts";
import { logEvent } from "../_shared/log.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";

type BalanceAdjustmentPayload = {
  userId: string;
  operation: "add" | "subtract" | "set";
  amount: number;
  reason: string;
  idempotencyKey?: string;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") {
    return jsonResponse({ error: "Method not allowed" }, 405);
  }

  try {
    const { adminId } = await requireAdmin(request);
    const payload = (await request.json()) as BalanceAdjustmentPayload;
    const idempotencyKey = payload.idempotencyKey ?? requestIdFromHeaders(request);

    if (!payload.userId || !payload.reason || !idempotencyKey || !Number.isFinite(payload.amount) || payload.amount < 0) {
      return jsonResponse({ error: "Invalid payload" }, 400);
    }

    const { data: existingAction } = await supabaseAdmin
      .from("admin_actions")
      .select("id")
      .eq("admin_id", adminId)
      .eq("action_type", "balance_adjustment")
      .contains("new_value", { idempotency_key: idempotencyKey })
      .maybeSingle();

    if (existingAction) {
      logEvent({ level: "info", fn: "admin-balance-adjustment", msg: "idempotent_replay", admin_id: adminId, user_id: payload.userId, idempotency_key: idempotencyKey });
      return jsonResponse({ ok: true, deduped: true }, 200);
    }

    const { data: profile, error: profileError } = await supabaseAdmin
      .from("profiles")
      .select("account_balance")
      .eq("id", payload.userId)
      .single();

    if (profileError || !profile) {
      return jsonResponse({ error: "User profile not found" }, 404);
    }

    const previousBalance = Number(profile.account_balance ?? 0);
    let newBalance = previousBalance;

    if (payload.operation === "add") {
      newBalance = previousBalance + payload.amount;
    } else if (payload.operation === "subtract") {
      newBalance = previousBalance - payload.amount;
    } else if (payload.operation === "set") {
      newBalance = payload.amount;
    }

    if (newBalance < 0) {
      return jsonResponse({ error: "Balance cannot go below zero" }, 409);
    }

    const now = new Date().toISOString();

    const { error: updateError } = await supabaseAdmin
      .from("profiles")
      .update({ account_balance: newBalance, updated_at: now })
      .eq("id", payload.userId);

    if (updateError) {
      throw updateError;
    }

    await supabaseAdmin.from("balance_history").insert({
      user_id: payload.userId,
      admin_id: adminId,
      action_type: payload.operation,
      amount: payload.amount,
      previous_balance: previousBalance,
      new_balance: newBalance,
      reason: payload.reason,
    });

    await supabaseAdmin.from("admin_actions").insert({
      admin_id: adminId,
      action_type: "balance_adjustment",
      target_user_id: payload.userId,
      target_table: "profiles",
      new_value: {
        idempotency_key: idempotencyKey,
        operation: payload.operation,
        amount: payload.amount,
        reason: payload.reason,
        previous_balance: previousBalance,
        new_balance: newBalance,
      },
    });

    logEvent({ level: "info", fn: "admin-balance-adjustment", msg: "balance_adjusted", admin_id: adminId, user_id: payload.userId, operation: payload.operation, amount: payload.amount, previous_balance: previousBalance, new_balance: newBalance, idempotency_key: idempotencyKey });

    return jsonResponse({ ok: true, newBalance }, 200);
  } catch (error) {
    logEvent({
      level: "error",
      fn: "admin-balance-adjustment",
      msg: "handler_failed",
      error: error instanceof Error ? error.message : String(error),
    });

    return jsonResponse({ error: "Unauthorized or invalid request" }, 401);
  }
});
