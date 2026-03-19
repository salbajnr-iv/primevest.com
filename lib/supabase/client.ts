import { createBrowserClient } from '@supabase/ssr'
import type { AuthChangeEvent, Session } from '@supabase/supabase-js'

let browserClient: ReturnType<typeof createBrowserClient> | null = null
let hasInitializedRealtimeSync = false

function initializeRealtimeAuthSync(client: ReturnType<typeof createBrowserClient>) {
  if (hasInitializedRealtimeSync) {
    return
  }

  hasInitializedRealtimeSync = true

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
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

  if (!supabaseUrl || !supabaseAnonKey) {
    if (typeof window !== 'undefined') {
      console.warn('Supabase is not configured: missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
    }

    return null
  }

  if (!browserClient) {
    browserClient = createBrowserClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })
    initializeRealtimeAuthSync(browserClient)
  }

  return browserClient
}
