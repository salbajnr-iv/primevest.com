import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ error: "Transactions are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ error: "Missing authorization token" }, { status: 401 });
    }

    const url = new URL(req.url);
    const page = Math.max(Number(url.searchParams.get("page") || DEFAULT_PAGE), 1);
    const requestedPageSize = Math.max(Number(url.searchParams.get("pageSize") || DEFAULT_PAGE_SIZE), 1);
    const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: userData, error: userErr } = await supabase.auth.getUser(token);
    if (userErr || !userData?.user) {
      return NextResponse.json({ error: "Invalid auth token" }, { status: 401 });
    }

    const { data, count, error } = await supabase
      .from("transactions")
      .select("id,type,status,asset,amount,fee_amount,total_amount,external_reference,created_at,updated_at,metadata", { count: "exact" })
      .eq("user_id", userData.user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json({ error: "Failed to fetch transactions", details: error.message }, { status: 500 });
    }

    return NextResponse.json({
      ok: true,
      page,
      pageSize,
      total: count || 0,
      totalPages: count ? Math.ceil(count / pageSize) : 0,
      transactions: data || [],
    });
  } catch (error) {
    return NextResponse.json({ error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
