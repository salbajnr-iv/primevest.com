import { createBrowserClient } from '@supabase/ssr'
<<<<<<< HEAD
import { getSupabaseStatus } from './health-check'

export function createClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  
  // Check if Supabase configuration is valid
  if (getSupabaseStatus() === 'unhealthy') {
    console.warn('Supabase configuration is invalid, client may not work properly')
  }
  
  return createBrowserClient(supabaseUrl, supabaseAnonKey, {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    },
    global: {
      fetch: (url, options = {}) => {
        return fetch(url, {
          ...options,
          signal: AbortSignal.timeout(10000) // 10 second timeout
        }).catch(error => {
          console.warn('Supabase fetch failed, using fallback:', error.message)
          throw error
        })
      }
    }
  })
=======

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
>>>>>>> 02bdcb7 (Initial commit)
}

