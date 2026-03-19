import { createClient } from '@supabase/supabase-js'

export interface AdminRequestVerificationResult {
  error?: string
  status?: number
  adminId?: string
}

export async function verifyAdminBearerToken(token: string): Promise<AdminRequestVerificationResult> {
  if (!token) {
    return { error: 'Missing authorization token', status: 401 }
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!supabaseUrl || !serviceRoleKey) {
    return { error: 'Missing Supabase environment configuration', status: 500 }
  }

  const supabase = createClient(supabaseUrl, serviceRoleKey)
  const { data: userData, error: userErr } = await supabase.auth.getUser(token)

  if (userErr || !userData?.user) {
    return { error: 'Invalid auth token', status: 401 }
  }

  const adminId = userData.user.id
  const { data: adminProfile, error: adminErr } = await supabase
    .from('profiles')
    .select('is_admin')
    .eq('id', adminId)
    .maybeSingle()

  if (adminErr || !adminProfile || adminProfile.is_admin !== true) {
    return { error: 'Forbidden', status: 403 }
  }

  return { adminId }
}
