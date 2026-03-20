import { createBrowserClient } from '@supabase/ssr'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null
let hasInitializedRealtimeSync = false

function getSupabaseConfig() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    throw new Error(
      'Supabase browser client is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY'
    )
  }

  return { supabaseUrl, supabaseAnonKey }
}

async function syncRealtimeAuthFromSession(client: ReturnType<typeof createBrowserClient>) {
  const {
    data: { session },
  } = await client.auth.getSession()

  await setRealtimeAuth(session?.access_token, client)
}

function initializeRealtimeAuthSync(client: ReturnType<typeof createBrowserClient>) {
  if (hasInitializedRealtimeSync) {
    return
  }

  hasInitializedRealtimeSync = true

  void syncRealtimeAuthFromSession(client)

  client.auth.onAuthStateChange(async (_event: AuthChangeEvent, session: Session | null) => {
    await setRealtimeAuth(session?.access_token, client)
  })
}

export async function setRealtimeAuth(accessToken?: string, client = browserClient) {
  if (!client) return

  try {
    await client.realtime.setAuth(accessToken ?? '')
  } catch (error) {
    console.warn('Failed to sync realtime auth token', error)
  }
}

export function createClient() {
  if (!browserClient) {
    const { supabaseUrl, supabaseAnonKey } = getSupabaseConfig()

    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    initializeRealtimeAuthSync(browserClient)
  }

  return browserClient
}
