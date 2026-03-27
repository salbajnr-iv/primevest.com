import { createClient as createServerClient } from '@/lib/supabase/server'
import { createClient } from '@supabase/supabase-js'
import { authErrorResponse, authSuccessResponse } from '../_shared'

export async function POST(request: Request) {
  const payload = (await request.json().catch(() => null)) as {
    email?: string
    password?: string
    metadata?: Record<string, unknown>
  } | null

  const email = payload?.email?.trim().toLowerCase()
  const password = payload?.password

  if (!email || !password) {
    return authErrorResponse(400, 'Email and password are required.', 'InvalidCredentials')
  }

  const supabase = await createServerClient()
  const { data, error } = await supabase.auth.signUp({
    email,
    password,
    options: {
      data: payload?.metadata,
      emailRedirectTo: `${process.env.NEXT_PUBLIC_SITE_URL}/auth/callback`,
    },
  })

  if (error) {
    return authErrorResponse(error.status ?? 400, error.message, error.name)
  }

  // Explicitly create profile if user was created
  if (data.user) {
    const serviceRoleClient = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )
    
    // Check if profile exists already (just in case trigger works too)
    const { data: profile } = await serviceRoleClient
      .from('profiles')
      .select('id')
      .eq('id', data.user.id)
      .maybeSingle()

    if (!profile) {
      const { error: profileError } = await serviceRoleClient
        .from('profiles')
        .insert([{
          id: data.user.id,
          email: email,
          full_name: payload?.metadata?.full_name || `${payload?.metadata?.firstName || ''} ${payload?.metadata?.lastName || ''}`.trim() || null,
          kyc_status: 'none',
          is_active: true,
          created_at: new Date().toISOString()
        }])
      
      if (profileError) {
        console.error('Explicit profile creation error:', profileError)
      }
    }
  }

  return authSuccessResponse(data.session, data.user, {
    identities: data.user?.identities ?? [],
  })
}
