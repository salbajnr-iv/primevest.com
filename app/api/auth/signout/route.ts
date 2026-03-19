import { createClient as createServerClient } from '@/lib/supabase/server'
import { authErrorResponse } from '../_shared'

export async function POST() {
  const supabase = await createServerClient()
  const { error } = await supabase.auth.signOut()

  if (error) {
    return authErrorResponse(error.status ?? 400, error.message, error.name)
  }

  return new Response(null, { status: 204 })
}
