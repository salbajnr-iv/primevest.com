import { NextResponse } from 'next/server'

import { AdminRouteError, getAdminClient, handleAdminRouteError, requireAdminRequest } from '@/lib/admin/api'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const type = url.searchParams.get('type') || 'all'

    const auth = await requireAdminRequest(req)
    if (auth.response) {
      return auth.response
    }

    const supabase = getAdminClient()
    const from = (page - 1) * limit
    const to = from + limit - 1

    let query = supabase
      .from('admin_actions')
      .select(`
        *,
        admin:admin_id (email, full_name),
        target:target_user_id (email, full_name)
      `, { count: 'exact' })
      .range(from, to)
      .order('created_at', { ascending: false })

    if (type !== 'all') {
      query = query.eq('action_type', type)
    }

    const { data, error, count } = await query

    if (error) {
      throw new AdminRouteError('Could not fetch audit logs', 500, error.message)
    }

    return NextResponse.json({ ok: true, actions: data, total: count })
  } catch (err) {
    return handleAdminRouteError(err, 'Could not fetch audit logs')
  }
}
