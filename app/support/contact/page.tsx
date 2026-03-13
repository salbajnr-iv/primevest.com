"use client";

import * as React from "react";
import { track } from "@vercel/analytics";
import BottomNav from "@/components/BottomNav";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";
import SupportLayout from "@/app/support/SupportLayout";

const channels = [
  { title: "Email", detail: "support@primevest.com", href: "mailto:support@primevest.com" },
  { title: "Phone", detail: "+43 123 456 789", href: "tel:+43123456789" },
  { title: "Escalation", detail: "compliance@primevest.com", href: "mailto:compliance@primevest.com" },
];

export default function SupportContactPage() {
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");
  const [message, setMessage] = React.useState("");
  const [submitted, setSubmitted] = React.useState(false);

  React.useEffect(() => {
    track("support_funnel_opened", { step: "contact", path: "/support/contact" });
  }, []);

  const loadChannels = React.useCallback(() => {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 500);
  }, []);

  React.useEffect(() => {
    loadChannels();
  }, [loadChannels]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!message.trim()) {
      setStatus("error");
      return;
    }
    track("support_funnel_submitted", { step: "contact", path: "/support/contact" });
    setSubmitted(true);
    setMessage("");
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <SupportLayout title="Create ticket" description="Submit a new request and we will route it to the right team.">

        <section className="section">
          <h3 className="section-title">Support channels</h3>
          <div className="card">
            {status === "loading" && <LoadingSpinner text="Loading contact options..." />}
            {status === "error" && <ErrorState title="Contact channels unavailable" message="We could not load contact options right now." onRetry={loadChannels} />}
            {status === "ready" && channels.length === 0 && <EmptyState title="No channels available" message="Please create a ticket and our team will follow up by email." />}
            {status === "ready" && channels.length > 0 && (
              <div className="quick-actions-grid">
                {channels.map((item) => (
                  <a key={item.title} href={item.href} className="quick-action-card"><div className="quick-action-content"><span>{item.title}</span><small>{item.detail}</small></div></a>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Ticket message</h3>
          <div className="card">
            {submitted ? (
              <EmptyState title="Ticket submitted" message="Thanks. Our support team will respond in your inbox within 24 hours." action={{ label: "Create another ticket", onClick: () => setSubmitted(false) }} />
            ) : (
              <form onSubmit={handleSubmit} className="space-y-3">
                <textarea className="search-input" rows={4} placeholder="Describe your issue..." value={message} onChange={(e) => setMessage(e.target.value)} />
                <div className="flex gap-3">
                  <button className="btn btn-primary" type="submit">Submit ticket</button>
                </div>
              </form>
            )}
          </div>
        </section>
        </SupportLayout>
      </div>
      <BottomNav />
    </div>
  );
}
