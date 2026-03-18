import { PostgrestError } from "https://esm.sh/@supabase/supabase-js@2.56.1";

import { supabaseAdmin } from "./supabase.ts";

type ReplayRow = {
  status: "processing" | "completed" | "failed";
  response: unknown;
};

export const claimReplay = async (taskType: string, replayKey: string): Promise<{ claimed: boolean; existing?: ReplayRow }> => {
  const { error } = await supabaseAdmin
    .from("async_task_replays")
    .insert({ task_type: taskType, replay_key: replayKey, status: "processing" });

  if (!error) {
    return { claimed: true };
  }

  const pgError = error as PostgrestError;
  if (pgError.code !== "23505") {
    throw error;
  }

  const { data: existing, error: existingError } = await supabaseAdmin
    .from("async_task_replays")
    .select("status, response")
    .eq("task_type", taskType)
    .eq("replay_key", replayKey)
    .single();

  if (existingError || !existing) {
    throw existingError ?? new Error("Replay row exists but could not be loaded");
  }

  return { claimed: false, existing: existing as ReplayRow };
};

export const completeReplay = async (
  taskType: string,
  replayKey: string,
  response: Record<string, unknown>,
): Promise<void> => {
  const { error } = await supabaseAdmin
    .from("async_task_replays")
    .update({ status: "completed", response, completed_at: new Date().toISOString() })
    .eq("task_type", taskType)
    .eq("replay_key", replayKey);

  if (error) throw error;
};

export const failReplay = async (taskType: string, replayKey: string, response: Record<string, unknown>): Promise<void> => {
  const { error } = await supabaseAdmin
    .from("async_task_replays")
    .update({ status: "failed", response })
    .eq("task_type", taskType)
    .eq("replay_key", replayKey);

  if (error) throw error;
};
