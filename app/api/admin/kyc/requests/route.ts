import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

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

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    const adminId = userData.user.id
    const { data: profileData, error: profileErr } = await supabase.from('profiles').select('is_admin').eq('id', adminId).maybeSingle()

    if (profileErr || !profileData || profileData.is_admin !== true) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }

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
