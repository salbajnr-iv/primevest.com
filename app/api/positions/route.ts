import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

type PositionsSortKey = "allocation" | "value" | "pnl";
type SortDirection = "asc" | "desc";

type DbPositionRow = {
  id: string;
  asset: string | null;
  quantity: number | null;
  market_value: number | null;
  unrealized_pnl: number | null;
  avg_cost: number | null;
  updated_at: string | null;
  assets?: {
    symbol: string | null;
    name: string | null;
  } | null;
};

const DEFAULT_PAGE = 1;
const DEFAULT_PAGE_SIZE = 25;
const MAX_PAGE_SIZE = 100;
const DEFAULT_SORT: PositionsSortKey = "allocation";
const DEFAULT_DIRECTION: SortDirection = "desc";
const SUPPORTED_SORTS = new Set<PositionsSortKey>(["allocation", "value", "pnl"]);
const SUPPORTED_DIRECTIONS = new Set<SortDirection>(["asc", "desc"]);

const safeNumber = (value: unknown) => {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
};

const clampPositiveInt = (value: string | null, fallback: number, max = Number.POSITIVE_INFINITY) => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed < 1) {
    return fallback;
  }

  return Math.min(Math.floor(parsed), max);
};

const normalizeSort = (rawSort: string | null): PositionsSortKey => {
  const normalized = (rawSort || "").trim().toLowerCase() as PositionsSortKey;
  return SUPPORTED_SORTS.has(normalized) ? normalized : DEFAULT_SORT;
};

const normalizeDirection = (rawDirection: string | null): SortDirection => {
  const normalized = (rawDirection || "").trim().toLowerCase() as SortDirection;
  return SUPPORTED_DIRECTIONS.has(normalized) ? normalized : DEFAULT_DIRECTION;
};

export async function GET(req: Request) {
  try {
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

    if (!supabaseUrl || !anonKey) {
      return NextResponse.json({ ok: false, error: "Positions are unavailable right now." }, { status: 503 });
    }

    const token = (req.headers.get("authorization") || "").replace("Bearer ", "");
    if (!token) {
      return NextResponse.json({ ok: false, error: "Missing authorization token." }, { status: 401 });
    }

    const url = new URL(req.url);
    const query = (url.searchParams.get("q") || "").trim();
    const page = clampPositiveInt(url.searchParams.get("page"), DEFAULT_PAGE);
    const pageSize = clampPositiveInt(url.searchParams.get("pageSize"), DEFAULT_PAGE_SIZE, MAX_PAGE_SIZE);
    const sort = normalizeSort(url.searchParams.get("sort"));
    const direction = normalizeDirection(url.searchParams.get("direction"));

    const from = (page - 1) * pageSize;
    const to = from + pageSize - 1;

    const supabase = createClient(supabaseUrl, anonKey, {
      global: {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      },
    });

    const { data: userData, error: userError } = await supabase.auth.getUser(token);
    if (userError || !userData?.user) {
      return NextResponse.json({ ok: false, error: "Invalid auth token." }, { status: 401 });
    }

    let dbQuery = supabase
      .from("positions")
      .select("id,asset,quantity,market_value,unrealized_pnl,avg_cost,updated_at,assets:asset_id(symbol,name)", { count: "exact" })
      .eq("user_id", userData.user.id);

    if (query) {
      const escaped = query.replace(/,/g, "\\,");
      dbQuery = dbQuery.or(`asset.ilike.%${escaped}%,assets.symbol.ilike.%${escaped}%,assets.name.ilike.%${escaped}%`);
    }

    if (sort === "pnl") {
      dbQuery = dbQuery.order("unrealized_pnl", { ascending: direction === "asc", nullsFirst: false });
    } else {
      dbQuery = dbQuery.order("market_value", { ascending: direction === "asc", nullsFirst: false });
    }

    const { data, count, error } = await dbQuery.range(from, to);

    if (error) {
      return NextResponse.json({ ok: false, error: "Failed to load positions.", details: error.message }, { status: 500 });
    }

    const rows = ((data || []) as DbPositionRow[]).map((row) => {
      const symbol = (row.assets?.symbol || row.asset || "").toUpperCase();
      return {
        id: row.id,
        symbol,
        name: row.assets?.name || symbol,
        quantity: safeNumber(row.quantity),
        value: safeNumber(row.market_value),
        pnl: safeNumber(row.unrealized_pnl),
        avgCost: safeNumber(row.avg_cost),
        updatedAt: row.updated_at,
      };
    });

    const totalValue = rows.reduce((sum, row) => sum + row.value, 0);
    const positions = rows.map((row) => ({
      ...row,
      allocationPct: totalValue > 0 ? Number(((row.value / totalValue) * 100).toFixed(4)) : 0,
    }));

    return NextResponse.json({
      ok: true,
      data: {
        positions,
      },
      pagination: {
        page,
        pageSize,
        total: count || 0,
        totalPages: count ? Math.ceil(count / pageSize) : 0,
      },
      query: {
        q: query,
        sort,
        direction,
      },
    });
  } catch (error) {
    return NextResponse.json({ ok: false, error: "Unexpected error", details: String(error) }, { status: 500 });
  }
}
