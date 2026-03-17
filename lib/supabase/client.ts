import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

let browserClient: SupabaseClient | null = null
let realtimeAuthSyncInitialized = false

export async function setRealtimeAuth(accessToken?: string, client = browserClient) {
  if (!client) return

  try {
    await client.realtime.setAuth(accessToken ?? '')
  } catch (error) {
    console.warn('Failed to sync realtime auth token', error)
  }
}

function initializeRealtimeAuthSync(client: SupabaseClient) {
  if (realtimeAuthSyncInitialized || typeof window === 'undefined') return

  realtimeAuthSyncInitialized = true

  void client.auth.getSession().then(async ({ data: { session } }) => {
    await setRealtimeAuth(session?.access_token, client)
  })

  client.auth.onAuthStateChange(async (_event, session) => {
    await setRealtimeAuth(session?.access_token, client)
  })
}

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return null
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey)
    initializeRealtimeAuthSync(browserClient)
  }

  return browserClient
}
