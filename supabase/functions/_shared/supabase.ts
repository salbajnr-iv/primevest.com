// Supabase Edge Function (Deno runtime) - VSCode TS support
// deno-lint-ignore-file
/* @ts-expect-error Deno ESM import for Supabase Edge Functions */
import { createClient } from "https://esm.sh/@supabase/supabase-js@2?target=deno";

declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

const supabaseUrl = Deno.env.get("SUPABASE_URL");
const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!supabaseUrl) {
  throw new Error("Missing required env var SUPABASE_URL");
}

if (!serviceRoleKey) {
  throw new Error("Missing required env var SUPABASE_SERVICE_ROLE_KEY");
}

export const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  },
});
