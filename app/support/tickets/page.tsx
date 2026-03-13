"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";

const tickets = [
  { id: "PV-1042", subject: "Withdrawal pending", status: "In progress", updated: "2h ago" },
  { id: "PV-1016", subject: "KYC verification", status: "Resolved", updated: "1d ago" },
];

export default function SupportTicketsPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  const loadTickets = React.useCallback(() => {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 550);
  }, []);

  React.useEffect(() => {
    loadTickets();
  }, [loadTickets]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/support" className="header-back" aria-label="Back to support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">SUPPORT</span>
            <div className="header-title">Tickets</div>
          </div>
        </header>

        <section className="section">
          <h3 className="section-title">Your support tickets</h3>
          <div className="card">
            {status === "loading" && <LoadingSpinner text="Loading your tickets..." />}
            {status === "error" && <ErrorState title="Unable to load tickets" message="Please retry and we will fetch your latest support updates." onRetry={loadTickets} />}
            {status === "ready" && tickets.length === 0 && <EmptyState title="No open tickets" message="Create a new support request if you need help." action={{ label: "Contact support", onClick: () => router.push("/support/contact") }} />}
            {status === "ready" && tickets.length > 0 && (
              <div className="space-y-3">
                {tickets.map((ticket) => (
                  <div key={ticket.id} className="quick-action-card"><div className="quick-action-content"><span>{ticket.id} • {ticket.subject}</span><small>{ticket.status} · Updated {ticket.updated}</small></div></div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="card">
            <div className="quick-actions-grid">
              <Link href="/support/contact" className="quick-action-card"><div className="quick-action-content"><span>Open New Ticket</span><small>Submit details to our support team</small></div></Link>
              <Link href="/support/status" className="quick-action-card"><div className="quick-action-content"><span>Check Platform Status</span><small>See current incidents and maintenance</small></div></Link>
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
