import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    const verification = await verifyAdminBearerToken(token)
    if (verification.error) {
      return NextResponse.json({ error: verification.error }, { status: verification.status || 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    if (id) {
      const { data, error } = await supabase.from('kyc_requests').select('*, kyc_documents(*)').eq('id', id).maybeSingle()
      if (error) return NextResponse.json({ error: 'Could not fetch request' }, { status: 500 })
      return NextResponse.json({ ok: true, request: data })
    }

    const from = (page - 1) * limit
    const to = from + limit - 1

    const { data, error, count } = await supabase.from('kyc_requests').select('*, kyc_documents(*), profiles:user_id (email, full_name)', { count: 'exact' }).range(from, to).order('submitted_at', { ascending: false })

    if (error) return NextResponse.json({ error: 'Could not fetch requests' }, { status: 500 })

    return NextResponse.json({ ok: true, requests: data, total: count })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
