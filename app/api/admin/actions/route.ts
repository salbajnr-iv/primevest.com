import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '50')
    const type = url.searchParams.get('type') || 'all'

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    const verification = await verifyAdminBearerToken(token)
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

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
      console.error('Audit fetch error:', error)
      return NextResponse.json({ error: 'Could not fetch audit logs' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, actions: data, total: count })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
