"use client";

import * as React from "react";
import Link from "next/link";
import { track } from "@vercel/analytics";
import BottomNav from "@/components/BottomNav";
import SupportLayout from "@/app/support/SupportLayout";

interface FAQItem {
  question: string;
  answer: string;
}

const FAQs: FAQItem[] = [
  {
    question: "How do I deposit funds?",
    answer: "Open Wallets → Deposit, choose your asset, and complete the payment flow.",
  },
  {
    question: "How can I withdraw funds?",
    answer: "Open Wallets → Withdraw, enter amount and destination, then confirm your request.",
  },
  {
    question: "How long does KYC review take?",
    answer: "KYC review typically completes within 2–5 business days after submission.",
  },
  {
    question: "Where can I check outages?",
    answer: "Use Support → Platform status for live incidents and maintenance windows.",
  },
];

export default function SupportPage() {
  const [query, setQuery] = React.useState("");

  React.useEffect(() => {
    track("support_funnel_opened", { step: "hub", path: "/support" });
  }, []);

  const filtered = React.useMemo(() => {
    const value = query.trim().toLowerCase();
    if (!value) return FAQs;
    return FAQs.filter((item) => item.question.toLowerCase().includes(value) || item.answer.toLowerCase().includes(value));
  }, [query]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <SupportLayout title="Support hub" description="Search common answers or continue with a support path.">
          <section className="section">
            <h3 className="section-title">FAQ & search triage</h3>
            <div className="card space-y-3">
              <input
                type="text"
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search FAQs"
                className="search-input"
              />
              <div className="space-y-2">
                {filtered.map((item) => (
                  <div key={item.question} className="quick-action-card">
                    <div className="quick-action-content">
                      <span>{item.question}</span>
                      <small>{item.answer}</small>
                    </div>
                  </div>
                ))}
                {filtered.length === 0 && (
                  <div className="quick-action-content">
                    <span>No results found</span>
                    <small>Try another keyword or continue with Create ticket below.</small>
                  </div>
                )}
              </div>
            </div>
          </section>

          <section className="section">
            <h3 className="section-title">Continue in support</h3>
            <div className="card space-y-3">
              <Link href="/support/contact" className="quick-action-card">
                <div className="quick-action-content">
                  <span>Create ticket</span>
                  <small>Submit a new support request for account or trading issues.</small>
                </div>
              </Link>
              <Link href="/support/tickets" className="quick-action-card">
                <div className="quick-action-content">
                  <span>Track tickets</span>
                  <small>View updates, reply to agents, and monitor resolution status.</small>
                </div>
              </Link>
              <Link href="/support/status" className="quick-action-card">
                <div className="quick-action-content">
                  <span>View platform status</span>
                  <small>Check incidents and planned maintenance.</small>
                </div>
              </Link>
              <Link href="/support/community" className="quick-action-card">
                <div className="quick-action-content">
                  <span>Open community help</span>
                  <small>Browse peer tips and curated guides.</small>
                </div>
              </Link>
            </div>
          </section>
        </SupportLayout>
      </div>
      <BottomNav />
    </div>
  );
}
