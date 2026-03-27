import { NextResponse } from "next/server";
import { createClient as createServerClient } from "@/lib/supabase/server";

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const page = Math.max(
      Number(url.searchParams.get("page") || DEFAULT_PAGE),
      1,
    );
    const requestedPageSize = Math.max(
      Number(url.searchParams.get("pageSize") || DEFAULT_PAGE_SIZE),
      1,
    );
    const pageSize = Math.min(requestedPageSize, MAX_PAGE_SIZE);
    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = await createServerClient();
    const {
      data: { user },
      error: userErr,
    } = await supabase.auth.getUser();

    if (userErr || !user) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 },
      );
    }

    const { data, count, error } = await supabase
      .from("transactions")
      .select(
        "id,type,status,asset,amount,fee_amount,total_amount,external_reference,created_at,updated_at,metadata",
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("created_at", { ascending: false })
      .range(from, to);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch transactions", details: error.message },
        { status: 500 },
      );
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
    return NextResponse.json(
      { error: "Unexpected error", details: String(error) },
      { status: 500 },
    );
  }
}
