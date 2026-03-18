import { requireAdmin } from "../_shared/admin-auth.ts";
import { jsonResponse, requestIdFromHeaders } from "../_shared/http.ts";
import { supabaseAdmin } from "../_shared/supabase.ts";
import { claimReplay, completeReplay } from "../_shared/replay.ts";

type BatchOperation =
  | { type: "deposit"; amount: number; reason?: string }
  | { type: "withdraw"; amount: number; reason?: string }
  | { type: "transaction"; amount: number; txType?: string; currency?: string; description?: string; reference_id?: string; metadata?: Record<string, unknown> }
  | { type: "notify"; title?: string; body?: string };

type Payload = {
  targetUserId: string;
  operations: BatchOperation[];
  idempotencyKey?: string;
};

Deno.serve(async (request: Request) => {
  if (request.method !== "POST") return jsonResponse({ error: "Method not allowed" }, 405);

  try {
    const { adminId } = await requireAdmin(request);
    const payload = await request.json() as Payload;
    const idempotencyKey = payload.idempotencyKey ?? requestIdFromHeaders(request);

    if (!payload.targetUserId || !Array.isArray(payload.operations) || payload.operations.length === 0 || !idempotencyKey) {
      return jsonResponse({ error: "targetUserId, operations and idempotency key are required" }, 400);
    }

    const replayKey = `${adminId}:${idempotencyKey}`;
    const replay = await claimReplay("admin_maintenance_batch", replayKey);
    if (!replay.claimed) {
      if (replay.existing?.status === "completed") return jsonResponse({ ok: true, deduped: true, results: replay.existing.response }, 200);
      return jsonResponse({ ok: false, in_progress: true }, 202);
    }

    const results: Array<{ success: boolean; operation: BatchOperation; error?: string }> = [];

    for (const op of payload.operations) {
      try {
        if (op.type === "deposit" || op.type === "withdraw") {
          const { error } = await supabaseAdmin.rpc("adjust_balance", {
            p_user_id: payload.targetUserId,
            p_action_type: op.type === "deposit" ? "add" : "subtract",
            p_amount: Number(op.amount) || 0,
            p_reason: op.reason ?? `Maintenance ${op.type}`,
          });

          if (error) throw error;

          await supabaseAdmin.from("admin_actions").insert({
            admin_id: adminId,
            action_type: `maintenance_${op.type}`,
            target_user_id: payload.targetUserId,
            target_table: "profiles",
            new_value: op,
          });

          results.push({ success: true, operation: op });
          continue;
        }

        if (op.type === "transaction") {
          const record = {
            user_id: payload.targetUserId,
            type: op.txType ?? "trade",
            amount: Number(op.amount) || 0,
            currency: op.currency ?? "EUR",
            status: "completed",
            description: op.description ?? "Maintenance inserted transaction",
            reference_id: op.reference_id ?? `MAINT-${Date.now()}`,
            metadata: op.metadata ?? {},
          };

          const { error } = await supabaseAdmin.from("transactions").insert(record);
          if (error) throw error;

          await supabaseAdmin.from("admin_actions").insert({
            admin_id: adminId,
            action_type: "maintenance_transaction",
            target_user_id: payload.targetUserId,
            target_table: "transactions",
            new_value: record,
          });

          results.push({ success: true, operation: op });
          continue;
        }

        if (op.type === "notify") {
          const payloadRow = {
            user_id: payload.targetUserId,
            title: op.title ?? "Maintenance notification",
            body: op.body ?? "This notification was sent by admin maintenance.",
            read: false,
          };

          const { error } = await supabaseAdmin.from("notifications").insert(payloadRow);
          if (error) throw error;

          await supabaseAdmin.from("admin_actions").insert({
            admin_id: adminId,
            action_type: "maintenance_notify",
            target_user_id: payload.targetUserId,
            target_table: "notifications",
            new_value: payloadRow,
          });

          results.push({ success: true, operation: op });
          continue;
        }

        results.push({ success: false, operation: op, error: "Unknown operation" });
      } catch (innerError) {
        results.push({
          success: false,
          operation: op,
          error: innerError instanceof Error ? innerError.message : String(innerError),
        });
      }
    }

    await completeReplay("admin_maintenance_batch", replayKey, { results });
    return jsonResponse({ ok: true, results }, 200);
  } catch {
    return jsonResponse({ error: "Unauthorized or invalid request" }, 401);
  }
});
