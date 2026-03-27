import { NextResponse } from 'next/server'
import { createClient } from '@/lib/supabase/server'
import { createClient as createServiceClient } from '@supabase/supabase-js'

export async function GET() {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data: requests, error } = await supabase
      .from('kyc_requests')
      .select('*, kyc_documents(*)')
      .eq('user_id', user.id)
      .order('submitted_at', { ascending: false })

    if (error) {
      console.error('KYC requests fetch error:', error)
      return NextResponse.json({ error: 'Failed to fetch KYC requests' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, requests })
  } catch (err) {
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const supabase = await createClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const body = await req.json()
    const { documents = [], metadata = {} } = body

    if (!Array.isArray(documents) || documents.length === 0) {
      return NextResponse.json({ error: 'No documents provided' }, { status: 400 })
    }

    // Use service role for consistent creation across tables
    const serviceClient = createServiceClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!
    )

    // 1. Create KYC Request
    const { data: requestData, error: requestErr } = await serviceClient
      .from('kyc_requests')
      .insert([{ 
        user_id: user.id, 
        status: 'submitted', 
        metadata,
        submitted_at: new Date().toISOString()
      }])
      .select()
      .single()

    if (requestErr) throw requestErr

    // 2. Attach Documents
    const docsToInsert = documents.map((d: any) => ({
      request_id: requestData.id,
      user_id: user.id,
      doc_type: d.doc_type || 'unknown',
      storage_path: d.path || d.storage_path,
      file_name: d.file_name || 'document',
      mime_type: d.mime_type,
      size: d.size,
      uploaded_at: new Date().toISOString()
    }))

    const { error: docsErr } = await serviceClient
      .from('kyc_documents')
      .insert(docsToInsert)

    if (docsErr) {
      // Cleanup request if docs fail
      await serviceClient.from('kyc_requests').delete().eq('id', requestData.id)
      throw docsErr
    }

    // 3. Update Profile status
    await serviceClient
      .from('profiles')
      .update({ 
        kyc_status: 'submitted',
        kyc_requested_at: new Date().toISOString()
      })
      .eq('id', user.id)

    return NextResponse.json({ ok: true, request: requestData })
  } catch (err) {
    console.error('KYC submission error:', err)
    return NextResponse.json({ error: 'Internal server error', details: String(err) }, { status: 500 })
  }
}
