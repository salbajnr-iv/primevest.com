import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

import { verifyAdminBearerToken } from '@/lib/admin/server'

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 })

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

    const { data: doc, error: docErr } = await supabase.from('kyc_documents').select('*').eq('id', id).maybeSingle()
    if (docErr || !doc) return NextResponse.json({ error: 'Document not found' }, { status: 404 })

    // Create signed URL
    const { data: urlData, error: urlErr } = await supabase.storage
      .from('kyc-documents')
      .createSignedUrl(doc.storage_path, 60) // short TTL

    if (urlErr || !urlData) return NextResponse.json({ error: 'Could not create signed url' }, { status: 500 })

    return NextResponse.json({ ok: true, url: urlData.signedUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
