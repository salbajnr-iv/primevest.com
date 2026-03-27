import { NextResponse } from "next/server";

import { verifyAdminBearerToken } from "@/lib/admin/server";
import { createAdminClient } from "@/lib/supabase/admin";

export async function GET(req: Request) {
  try {
    const url = new URL(req.url)
    const id = url.searchParams.get('id')
    const page = parseInt(url.searchParams.get('page') || '1')
    const limit = parseInt(url.searchParams.get('limit') || '20')
    const status = url.searchParams.get('status') || 'all'

    const authHeader = req.headers.get("authorization") || "";
    const token = authHeader.replace("Bearer ", "");
    if (!token) {
      return NextResponse.json(
        { error: "Missing authorization token" },
        { status: 401 },
      );
    }

    const verification = await verifyAdminBearerToken(token);
    if (verification.error) {
      return NextResponse.json(
        { error: verification.error },
        { status: verification.status || 401 },
      );
    }

    const supabase = createAdminClient();

    if (id) {
      const { data, error } = await supabase
        .from('kyc_requests')
        .select('*, kyc_documents(*), profiles:user_id (email, full_name)')
        .eq('id', Number(id))
        .maybeSingle()
      if (error) return NextResponse.json({ error: 'Could not fetch request' }, { status: 500 })
      return NextResponse.json({ ok: true, request: data })
    }

    const from = (page - 1) * limit;
    const to = from + limit - 1;

    let query = supabase
      .from('kyc_requests')
      .select('*, kyc_documents(*), profiles:user_id (email, full_name)', { count: 'exact' })
      .range(from, to)
      .order('submitted_at', { ascending: false })

    if (status !== 'all') {
      query = query.eq('status', status)
    }

    const { data, error, count } = await query

    if (error)
      return NextResponse.json(
        { error: "Could not fetch requests" },
        { status: 500 },
      );

    return NextResponse.json({ ok: true, requests: data, total: count });
  } catch (err) {
    return NextResponse.json(
      { error: "Unexpected error", details: String(err) },
      { status: 500 },
    );
  }
}
