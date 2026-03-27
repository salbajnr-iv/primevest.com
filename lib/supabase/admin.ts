import "server-only";

import { createClient, type SupabaseClient } from "@supabase/supabase-js";

import type { Database } from "@/types/supabase";

let adminClient: SupabaseClient<Database> | null = null;

function getSupabaseAdminConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Missing Supabase admin configuration.");
  }

  return { supabaseUrl, serviceRoleKey };
}

export function createAdminClient(): SupabaseClient<Database> {
  if (adminClient) {
    return adminClient;
  }

  const { supabaseUrl, serviceRoleKey } = getSupabaseAdminConfig();
  adminClient = createClient<Database>(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });

  return adminClient;
}
