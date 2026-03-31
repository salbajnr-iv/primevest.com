"use client";

import * as React from "react";
import BottomNav from "@/components/BottomNav";
import { track } from "@vercel/analytics";
import SupportLayout from "@/app/support/SupportLayout";
import { createClient } from "@/lib/supabase/client";
import { useSupportTicketStatusRealtime, useTicketRealtime, type RealtimeReply } from "@/lib/supabase/realtime";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";
import { MessageList, ChatInput } from "@/components/ui";
import type { SupportTicketState } from "@/lib/support/tickets";

interface SupportTicket {
  id: number;
  reference_id: string;
  category: string;
  subject: string;
  message: string;
  status: SupportTicketState;
  created_at: string;
  updated_at: string;
  open_at: string | null;
  pending_at: string | null;
  resolved_at: string | null;
  closed_at: string | null;
}

const STATUS_OPTIONS: Array<"all" | SupportTicketState> = ["all", "open", "pending", "resolved", "closed"];
const PAGE_SIZE = 8;

function formatDate(iso: string | null) {
  if (!iso) return "-";
  return new Intl.DateTimeFormat("en-GB", { dateStyle: "medium", timeStyle: "short" }).format(new Date(iso));
}

export default function SupportTicketsPage() {
  const [authToken, setAuthToken] = React.useState<string>("");
  const [tickets, setTickets] = React.useState<SupportTicket[]>([]);
  const [selectedTicket, setSelectedTicket] = React.useState<SupportTicket | null>(null);

  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [detailStatus, setDetailStatus] = React.useState<"idle" | "loading" | "error">("idle");
  const [activeFilter, setActiveFilter] = React.useState<(typeof STATUS_OPTIONS)[number]>("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [page, setPage] = React.useState(1);
  const [total, setTotal] = React.useState(0);
  const [currentUserId, setCurrentUserId] = React.useState<string>("");
  const [realtimeMessages, setRealtimeMessages] = React.useState<RealtimeReply[]>([]);

  const [mutating, setMutating] = React.useState(false);
  const [newTicketSubject, setNewTicketSubject] = React.useState("");
  const [newTicketCategory, setNewTicketCategory] = React.useState("general");
  const [newTicketMessage, setNewTicketMessage] = React.useState(""); 

  const loadTickets = React.useCallback(async () => {
    if (!authToken) return;

    setStatus("loading");
    const params = new URLSearchParams({
      page: String(page),
      pageSize: String(PAGE_SIZE),
      status: activeFilter,
      search: searchQuery,
    });

    try {
      const response = await fetch(`/api/support/tickets?${params.toString()}`, {
        headers: { Authorization: `Bearer ${authToken}` },
      });

      if (!response.ok) {
        throw new Error("Unable to load tickets");
      }

      const data = await response.json();
      setTickets(data.tickets ?? []);
      setTotal(data.total ?? 0);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, [activeFilter, authToken, page, searchQuery]);

  const loadTicketDetail = React.useCallback(
    async (ticketId: number) => {
      if (!authToken) return;
      setDetailStatus("loading");

      try {
        const response = await fetch(`/api/support/tickets/${ticketId}`, {
          headers: { Authorization: `Bearer ${authToken}` },
        });

        if (!response.ok) {
          throw new Error("Unable to load ticket detail");
        }

        const data = await response.json();
        track("support_funnel_viewed_ticket", { step: "ticket_detail", ticketId });
        setSelectedTicket(data.ticket);
        const rtReplies: RealtimeReply[] = (data.replies ?? []).map((r: RealtimeReply) => ({
          ...r,
          seen_at: null,
        }));
        setRealtimeMessages(rtReplies);
        setDetailStatus("idle");
      } catch {
        setDetailStatus("error");
      }
    },
    [authToken]
  );

  React.useEffect(() => {
    track("support_funnel_opened", { step: "tickets", path: "/support/tickets" });
  }, []);
  React.useEffect(() => {
    const initializeAuth = async () => {
      const supabase = createClient();

      const { data: { user }, error: authError } = await supabase.auth.getUser();
      if (authError) {
        console.error('Auth validation failed:', authError);
        return;
      }
      
      setCurrentUserId(user?.id || '');
      
      const { data: sessionData } = await supabase.auth.getSession();
      const token = sessionData?.session?.access_token ?? "";
      setAuthToken(token);
    };

    initializeAuth();
  }, []);

  React.useEffect(() => {
    if (authToken) {
      loadTickets();
    }
  }, [authToken, loadTickets]);

  useSupportTicketStatusRealtime((ticketUpdate) => {
    setTickets((current) =>
      current.map((ticket) =>
        ticket.id === ticketUpdate.id
          ? { ...ticket, status: ticketUpdate.status as SupportTicketState, updated_at: ticketUpdate.updated_at }
          : ticket
      )
    );

    setSelectedTicket((current) =>
      current && current.id === ticketUpdate.id
        ? { ...current, status: ticketUpdate.status as SupportTicketState, updated_at: ticketUpdate.updated_at }
        : current
    );
  });

  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const { messages: rtMessages, sendMessage } = useTicketRealtime(selectedTicket?.id || null, realtimeMessages);

  React.useEffect(() => {
    setRealtimeMessages(rtMessages);
  }, [rtMessages]);

  const createTicket = async () => {
    if (!authToken || !newTicketMessage.trim()) return;

    setMutating(true);
    try {
      const response = await fetch("/api/support/tickets", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify({
          category: newTicketCategory,
          subject: newTicketSubject,
          message: newTicketMessage,
        }),
      });

      if (!response.ok) {
        throw new Error("Unable to create ticket");
      }

      track("support_funnel_submitted", { step: "ticket_created", path: "/support/tickets" });
      setNewTicketSubject("");
      setNewTicketMessage("");
      setPage(1);
      await loadTickets();
    } finally {
      setMutating(false);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <SupportLayout title="Track tickets" description="Monitor support progress, review replies, and update open requests.">

        <section className="section">
          <h3 className="section-title">New ticket</h3>
          <div className="card space-y-2">
            <input className="search-input" placeholder="Subject" value={newTicketSubject} onChange={(event) => setNewTicketSubject(event.target.value)} />
            <select className="search-input" value={newTicketCategory} onChange={(event) => setNewTicketCategory(event.target.value)}>
              <option value="general">General</option>
              <option value="account">Account</option>
              <option value="kyc">KYC</option>
              <option value="withdrawal">Withdrawal</option>
              <option value="trading">Trading</option>
            </select>
            <textarea className="search-input" rows={4} placeholder="How can we help you?" value={newTicketMessage} onChange={(event) => setNewTicketMessage(event.target.value)} />
            <button className="menu-btn" disabled={mutating || !newTicketMessage.trim()} onClick={createTicket}>{mutating ? "Submitting..." : "New ticket"}</button>
          </div>
        </section>

        <section className="section">
          <div className="card space-y-3">
            <input
              value={searchQuery}
              onChange={(event) => {
                setPage(1);
                setSearchQuery(event.target.value);
              }}
              placeholder="Search by ticket number, subject, or message"
              className="search-input"
            />
            <div className="flex flex-wrap gap-2">
              {STATUS_OPTIONS.map((option) => (
                <button
                  key={option}
                  onClick={() => {
                    setPage(1);
                    setActiveFilter(option);
                  }}
                  className="menu-btn"
                  style={{ opacity: option === activeFilter ? 1 : 0.6 }}
                >
                  {option}
                </button>
              ))}
            </div>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Ticket history</h3>
          <div className="card">
            {status === "loading" && <LoadingSpinner text="Loading your tickets..." />}
            {status === "error" && <ErrorState title="Unable to load tickets" message="Please retry and we will fetch your latest support updates." onRetry={loadTickets} />}
            {status === "ready" && tickets.length === 0 && <EmptyState title="No tickets found" message="Try adjusting search filters or create a new support request." />}
            {status === "ready" && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <button key={ticket.id} className="quick-action-card w-full text-left" onClick={() => loadTicketDetail(ticket.id)}>
                    <div className="quick-action-content">
                      <span>{ticket.reference_id} • {ticket.subject}</span>
                      <small>{ticket.status.toUpperCase()} · Updated {formatDate(ticket.updated_at)}</small>
                    </div>
                  </button>
                ))}
              </div>
            )}
            <div className="mt-4 flex items-center justify-between">
              <button className="menu-btn" onClick={() => setPage((current) => Math.max(1, current - 1))} disabled={page === 1}>Previous</button>
              <small>Page {page} of {pageCount}</small>
              <button className="menu-btn" onClick={() => setPage((current) => Math.min(pageCount, current + 1))} disabled={page === pageCount}>Next</button>
            </div>
          </div>
        </section>

        {selectedTicket && (
          <section className="section">
            <h3 className="section-title">Ticket updates</h3>
            <div className="card space-y-3">
              {detailStatus === "loading" && <LoadingSpinner text="Loading details..." />}
              {detailStatus === "error" && <ErrorState title="Unable to load ticket detail" message="Please retry to view ticket updates." onRetry={() => loadTicketDetail(selectedTicket.id)} />}
              {detailStatus === "idle" && (
                <>
                  <div className="quick-action-content">
                    <span>{selectedTicket.reference_id} • {selectedTicket.subject}</span>
                    <small>{selectedTicket.category} · {selectedTicket.status.toUpperCase()}</small>
                  </div>
                  <p>{selectedTicket.message}</p>
                  <small>Opened: {formatDate(selectedTicket.open_at || selectedTicket.created_at)} · Pending: {formatDate(selectedTicket.pending_at)} · Resolved: {formatDate(selectedTicket.resolved_at)} · Closed: {formatDate(selectedTicket.closed_at)}</small>

                  <div className="h-96 border rounded-lg flex flex-col overflow-hidden">
                    <MessageList messages={realtimeMessages} currentUserId={currentUserId} />
                    <ChatInput onSend={sendMessage} />
                  </div>
                </>
              )}
            </div>
          </section>
        )}
        </SupportLayout>
      </div>
      <BottomNav />
    </div>
  );
}
