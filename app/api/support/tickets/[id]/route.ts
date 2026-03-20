import { NextResponse } from "next/server";
import { SUPPORT_TICKET_STATES } from "@/lib/support/tickets";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const sessionClient = await createServerClient();
  const {
    data: { user },
    error: userErr,
  } = await sessionClient.auth.getUser();

  if (userErr || !user) {
    return NextResponse.json(
      { error: "Authentication required." },
      { status: 401 },
    );
  }

  const supabase = createAdminClient();
  const { id } = await params;

  const { data: ticket, error: ticketErr } = await supabase
    .from("support_tickets")
    .select(
      "id, reference_id, category, subject, message, status, created_at, updated_at, open_at, pending_at, resolved_at, closed_at",
    )
    .eq("id", id)
    .eq("user_id", user.id)
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
    return NextResponse.json(
      { error: "Unable to load replies." },
      { status: 500 },
    );
  }

  return NextResponse.json({
    ok: true,
    states: SUPPORT_TICKET_STATES,
    ticket,
    replies: replies ?? [],
  });
}
