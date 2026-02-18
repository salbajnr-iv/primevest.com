import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { documents = [], metadata = {} } = body || {}

    const authHeader = req.headers.get('authorization') || ''
    const token = authHeader.replace('Bearer ', '')
    if (!token) {
      return NextResponse.json({ error: 'Missing authorization token' }, { status: 401 })
    }

    const supabase = createClient(process.env.NEXT_PUBLIC_SUPABASE_URL!, process.env.SUPABASE_SERVICE_ROLE_KEY!)

    // Verify user from token
    const { data: userData, error: userErr } = await supabase.auth.getUser(token)
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: 'Invalid auth token' }, { status: 401 })
    }

    const userId = userData.user.id

    // Basic validation
    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 })
    }

    // Create KYC request
    const { data: requestData, error: requestErr } = await supabase
      .from('kyc_requests')
      .insert([{ user_id: userId, status: 'submitted', metadata }])
      .select('*')
      .single()

    if (requestErr || !requestData) {
      return NextResponse.json({ error: 'Failed to create KYC request' }, { status: 500 })
    }

    const requestId = requestData.id

    // Insert documents metadata
    const docsToInsert = documents.map((d: any) => ({
      request_id: requestId,
      user_id: userId,
      doc_type: d.doc_type || 'unknown',
      storage_path: d.storage_path,
      file_name: d.file_name || '',
      mime_type: d.mime_type || null,
      size: d.size || null,
      meta: d.meta || {}
    }))

    const { error: docsErr } = await supabase.from('kyc_documents').insert(docsToInsert)

    if (docsErr) {
      // Attempt to clean up by deleting the created request
      await supabase.from('kyc_requests').delete().eq('id', requestId)
      return NextResponse.json({ error: 'Failed to attach documents' }, { status: 500 })
    }

    // Update profile KYC status
    await supabase.from('profiles').update({ kyc_status: 'submitted', kyc_requested_at: new Date().toISOString() }).eq('id', userId)

    return NextResponse.json({ ok: true, request: requestData })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
