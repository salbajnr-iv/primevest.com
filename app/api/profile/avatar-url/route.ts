import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

export async function GET(req: Request) {
  try {
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

    const userId = userData.user.id
    const { data: profile, error: profileErr } = await supabase
      .from('profiles')
      .select('avatar_storage_path')
      .eq('id', userId)
      .maybeSingle()

    if (profileErr) {
      return NextResponse.json({ error: 'Could not load profile' }, { status: 500 })
    }

    if (!profile?.avatar_storage_path) {
      return NextResponse.json({ ok: true, url: null })
    }

    const { data: urlData, error: urlErr } = await supabase.storage
      .from('avatars')
      .createSignedUrl(profile.avatar_storage_path, 120)

    if (urlErr || !urlData) {
      return NextResponse.json({ error: 'Could not create signed url' }, { status: 500 })
    }

    return NextResponse.json({ ok: true, url: urlData.signedUrl })
  } catch (err) {
    return NextResponse.json({ error: 'Unexpected error', details: String(err) }, { status: 500 })
  }
}
