import { NextResponse } from "next/server";
import {
  isSupportTicketState,
  SUPPORT_TICKET_STATES,
} from "@/lib/support/tickets";
import { createAdminClient } from "@/lib/supabase/admin";
import { createClient as createServerClient } from "@/lib/supabase/server";

export async function POST(
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
    .select("id, user_id, status")
    .eq("id", id)
    .eq("user_id", user.id)
    .single();

  if (ticketErr || !ticket) {
    return NextResponse.json({ error: "Ticket not found." }, { status: 404 });
  }

  let payload: unknown;
  try {
    payload = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid payload." }, { status: 400 });
  }

  const body = (payload || {}) as { message?: string; status?: string };
  const message = body.message?.trim() || "";
  const nextStatus = body.status?.trim().toLowerCase();

  if (!message && !nextStatus) {
    return NextResponse.json(
      { error: "Reply message or status change required." },
      { status: 400 },
    );
  }

  if (nextStatus && !isSupportTicketState(nextStatus)) {
    return NextResponse.json(
      { error: "Invalid ticket status.", states: SUPPORT_TICKET_STATES },
      { status: 400 },
    );
  }

  const now = new Date().toISOString();

  if (message) {
    const { error: replyError } = await supabase
      .from("support_ticket_replies")
      .insert({
        ticket_id: id,
        user_id: user.id,
        message,
        is_staff: false,
        created_at: now,
      });

    if (replyError) {
      return NextResponse.json(
        { error: "Unable to post reply." },
        { status: 500 },
      );
    }
  }

  if (nextStatus && nextStatus !== ticket.status) {
    const statusTimestamps: Record<string, string> = {
      updated_at: now,
      ...(nextStatus === "open" ? { open_at: now } : {}),
      ...(nextStatus === "pending" ? { pending_at: now } : {}),
      ...(nextStatus === "resolved" ? { resolved_at: now } : {}),
      ...(nextStatus === "closed" ? { closed_at: now } : {}),
    };

    const { error: updateError } = await supabase
      .from("support_tickets")
      .update({ status: nextStatus, ...statusTimestamps })
      .eq("id", id)
      .eq("user_id", user.id);

    if (updateError) {
      return NextResponse.json(
        { error: "Unable to update ticket status." },
        { status: 500 },
      );
    }
  } else {
    await supabase
      .from("support_tickets")
      .update({ updated_at: now })
      .eq("id", id)
      .eq("user_id", user.id);
  }

  const { data: updatedTicket } = await supabase
    .from("support_tickets")
    .select(
      "id, reference_id, category, subject, message, status, created_at, updated_at, open_at, pending_at, resolved_at, closed_at",
    )
    .eq("id", id)
    .single();

  const { data: replies } = await supabase
    .from("support_ticket_replies")
    .select("id, ticket_id, user_id, message, is_staff, created_at")
    .eq("ticket_id", id)
    .order("created_at", { ascending: true });

  return NextResponse.json({
    ok: true,
    ticket: updatedTicket,
    replies: replies ?? [],
  });
}
