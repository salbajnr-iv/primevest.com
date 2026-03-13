"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";

const services = [
  { name: "Trading Engine", status: "Operational", detail: "All markets are running normally." },
  { name: "Deposits & Withdrawals", status: "Degraded", detail: "Some EUR withdrawals may be delayed up to 30 minutes." },
  { name: "Authentication", status: "Operational", detail: "Logins and 2FA verification are stable." },
];

export default function SupportStatusPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  const loadStatus = React.useCallback(() => {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 450);
  }, []);

  React.useEffect(() => {
    loadStatus();
  }, [loadStatus]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/support" className="header-back" aria-label="Back to support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">SUPPORT</span>
            <div className="header-title">System Status</div>
          </div>
        </header>

        <section className="section">
          <h3 className="section-title">Current platform health</h3>
          <div className="card">
            {status === "loading" && <LoadingSpinner text="Loading system status..." />}
            {status === "error" && <ErrorState onRetry={loadStatus} />}
            {status === "ready" && services.length === 0 && <EmptyState title="No status data" message="Status data is temporarily unavailable." action={{ label: "Back to support", onClick: () => router.push("/support") }} />}
            {status === "ready" && services.length > 0 && (
              <div className="space-y-3">
                {services.map((service) => (
                  <div key={service.name} className="quick-action-card"><div className="quick-action-content"><span>{service.name} — {service.status}</span><small>{service.detail}</small></div></div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="card">
            <div className="quick-actions-grid">
              <Link href="/support/tickets" className="quick-action-card"><div className="quick-action-content"><span>Report an issue</span><small>Create a support ticket</small></div></Link>
              <Link href="/support/community" className="quick-action-card"><div className="quick-action-content"><span>See community updates</span><small>Review user reports and workarounds</small></div></Link>
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
