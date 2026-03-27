import { NextResponse } from "next/server";
import {
  isSupportTicketState,
  SUPPORT_TICKET_STATES,
} from "@/lib/support/tickets";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

const DEFAULT_PAGE_SIZE = 10;
const MAX_PAGE_SIZE = 50;

async function getCurrentUser() {
  const supabase = await createServerClient();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (error || !user) {
    return {
      error: NextResponse.json(
        { error: "Authentication required." },
        { status: 401 },
      ),
    };
  }

  return { user };
}

export async function GET(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const supabase = createAdminClient();
    const { searchParams } = new URL(request.url);
    const statusFilter = searchParams.get("status")?.toLowerCase() || "all";
    const search = searchParams.get("search")?.trim() || "";
    const page = Math.max(1, Number(searchParams.get("page") || "1"));
    const pageSize = Math.min(
      MAX_PAGE_SIZE,
      Math.max(1, Number(searchParams.get("pageSize") || DEFAULT_PAGE_SIZE)),
    );

    let query = supabase
      .from("support_tickets")
      .select(
        "id, reference_id, category, subject, message, status, created_at, updated_at, open_at, pending_at, resolved_at, closed_at",
        { count: "exact" },
      )
      .eq("user_id", user.id)
      .order("updated_at", { ascending: false })
      .range((page - 1) * pageSize, page * pageSize - 1);

    if (statusFilter !== "all" && isSupportTicketState(statusFilter)) {
      query = query.eq("status", statusFilter);
    }

    if (search) {
      query = query.or(
        `reference_id.ilike.%${search}%,subject.ilike.%${search}%,message.ilike.%${search}%,category.ilike.%${search}%`,
      );
    }

    const { data, error, count } = await query;

    if (error) {
      return NextResponse.json(
        { error: "Unable to load support tickets." },
        { status: 500 },
      );
    }

    return NextResponse.json({
      ok: true,
      states: SUPPORT_TICKET_STATES,
      page,
      pageSize,
      total: count ?? 0,
      tickets: data ?? [],
    });
  } catch {
    return NextResponse.json(
      { error: "Unexpected support ticket error." },
      { status: 500 },
    );
  }
}

export async function POST(request: Request) {
  try {
    const authResult = await getCurrentUser();
    if ("error" in authResult) {
      return authResult.error;
    }

    const { user } = authResult;
    const supabase = createAdminClient();

    let payload: unknown;
    try {
      payload = await request.json();
    } catch {
      return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
    }

    const body = (payload || {}) as {
      category?: string;
      subject?: string;
      message?: string;
    };

    const category = body.category?.trim() || "general";
    const subject = body.subject?.trim() || "Support request";
    const message = body.message?.trim();

    if (!message) {
      return NextResponse.json(
        { error: "Message is required." },
        { status: 400 },
      );
    }

    const referenceId = `TKT-${Date.now().toString().slice(-8)}${Math.floor(Math.random() * 10)}`;
    const now = new Date().toISOString();

    const { data, error } = await supabase
      .from("support_tickets")
      .insert({
        user_id: user.id,
        email: user.email ?? "unknown@example.com",
        name: user.user_metadata?.full_name ?? user.email ?? "User",
        category,
        subject,
        message,
        reference_id: referenceId,
        status: "open",
        open_at: now,
        updated_at: now,
      })
      .select(
        "id, reference_id, category, subject, message, status, created_at, updated_at, open_at, pending_at, resolved_at, closed_at",
      )
      .single();

    if (error || !data) {
      return NextResponse.json(
        { error: "Unable to create support ticket." },
        { status: 500 },
      );
    }

    return NextResponse.json({ ok: true, ticket: data }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "Unexpected support ticket error." },
      { status: 500 },
    );
  }
}
