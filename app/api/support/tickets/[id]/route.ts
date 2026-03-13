import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { getBearerToken, SUPPORT_TICKET_STATES } from "@/lib/support/tickets";

function getSupabaseAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!supabaseUrl || !serviceRoleKey) {
    return null;
  }

  return createClient(supabaseUrl, serviceRoleKey);
}

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const token = getBearerToken(request);
  if (!token) {
    return NextResponse.json({ error: "Missing auth token." }, { status: 401 });
  }

  const supabase = getSupabaseAdminClient();
  if (!supabase) {
    return NextResponse.json({ error: "Support service unavailable." }, { status: 503 });
  }

  const { data: userData, error: userErr } = await supabase.auth.getUser(token);
  if (userErr || !userData?.user) {
    return NextResponse.json({ error: "Invalid auth token." }, { status: 401 });
  }

  const { id } = await params;

  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .select("id, reference_id, category, subject, message, status, created_at, updated_at, open_at, pending_at, resolved_at, closed_at")
    .eq("id", id)
    .eq("user_id", userData.user.id)
    .single();

  if (ticketErr || !ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  const { data: replies, error: repliesErr } = await supabase
    .from("support_ticket_replies")
    .select("id, ticket_id, user_id, message, is_staff, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  if (repliesErr) {
    return NextResponse.json({ error: "Unable to load replies." }, { status: 500 });
  }

  return NextResponse.json({ ok: true, states: SUPPORT_TICKET_STATES, ticket, replies: replies ?? [] });
}
