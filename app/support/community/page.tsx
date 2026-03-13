"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";

const discussions = [
  { title: "Best way to track recurring deposits", replies: 18, href: "/support/faqs" },
  { title: "How long does Level 2 verification take?", replies: 42, href: "/support/tickets" },
  { title: "Mobile app push notifications not arriving", replies: 7, href: "/support/status" },
];

export default function SupportCommunityPage() {
  const router = useRouter();
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  const loadDiscussions = React.useCallback(() => {
    setStatus("loading");
    window.setTimeout(() => setStatus("ready"), 400);
  }, []);

  React.useEffect(() => {
    loadDiscussions();
  }, [loadDiscussions]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/support" className="header-back" aria-label="Back to support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">SUPPORT</span>
            <div className="header-title">Community</div>
          </div>
        </header>

        <section className="section">
          <h3 className="section-title">Popular discussions</h3>
          <div className="card">
            {status === "loading" && <LoadingSpinner text="Loading discussions..." />}
            {status === "error" && <ErrorState title="Community feed unavailable" message="We could not fetch the latest discussions." onRetry={loadDiscussions} />}
            {status === "ready" && discussions.length === 0 && <EmptyState title="No discussions yet" message="Be the first to ask a question in community support." action={{ label: "Contact support", onClick: () => router.push("/support/contact") }} />}
            {status === "ready" && discussions.length > 0 && (
              <div className="space-y-3">
                {discussions.map((discussion) => (
                  <Link key={discussion.title} href={discussion.href} className="quick-action-card"><div className="quick-action-content"><span>{discussion.title}</span><small>{discussion.replies} replies</small></div></Link>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <div className="card">
            <div className="quick-actions-grid">
              <Link href="/support/faqs" className="quick-action-card"><div className="quick-action-content"><span>Browse FAQ</span><small>Find verified answers</small></div></Link>
              <Link href="/support/contact" className="quick-action-card"><div className="quick-action-content"><span>Need official help?</span><small>Open a direct support request</small></div></Link>
            </div>
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
