"use client";

import * as React from "react";
import Link from "next/link";
import { CircleHelp, ClipboardList, Headphones, MessageCircle, Search, Users } from "lucide-react";
import { track } from "@vercel/analytics";
import BottomNav from "@/components/BottomNav";
import SupportLayout from "@/app/support/SupportLayout";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { Button } from "@/components/ui/button";

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

const CONTINUE_LINKS = [
  {
    href: "/support/contact",
    title: "Create ticket",
    description: "Submit a new support request for account or trading issues.",
    icon: <ClipboardList className="h-5 w-5 text-blue-600" />,
  },
  {
    href: "/support/tickets",
    title: "Track tickets",
    description: "View updates, reply to agents, and monitor resolution status.",
    icon: <MessageCircle className="h-5 w-5 text-violet-600" />,
  },
  {
    href: "/support/status",
    title: "View platform status",
    description: "Check incidents and planned maintenance.",
    icon: <Headphones className="h-5 w-5 text-emerald-600" />,
  },
  {
    href: "/support/community",
    title: "Open community help",
    description: "Browse peer tips and curated guides.",
    icon: <Users className="h-5 w-5 text-amber-600" />,
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
          <section className="section space-y-4">
            <FeatureCard
              title="FAQ & search triage"
              description="Search common questions before opening a ticket."
              icon={<IconBadge icon={<CircleHelp className="h-5 w-5 text-gray-700" />} className="bg-gray-100" />}
            >
              <div className="space-y-3">
                <div className="relative">
                  <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-500" />
                  <input
                    type="text"
                    value={query}
                    onChange={(event) => setQuery(event.target.value)}
                    placeholder="Search FAQs"
                    className="w-full rounded-md border border-gray-200 py-2 pl-9 pr-3 text-sm"
                  />
                </div>
                <div className="space-y-3">
                  {filtered.map((item) => (
                    <FeatureCard
                      key={item.question}
                      title={item.question}
                      description={item.answer}
                      className="p-4"
                    />
                  ))}
                  {filtered.length === 0 && (
                    <FeatureCard
                      title="No results found"
                      description="Try another keyword or continue with Create ticket below."
                      className="p-4"
                    />
                  )}
                </div>
              </div>
            </FeatureCard>
          </section>

          <section className="section space-y-4">
            <FeatureCard
              title="Continue in support"
              description="Pick the fastest path based on your issue type."
              icon={<IconBadge icon={<MessageCircle className="h-5 w-5 text-gray-700" />} className="bg-gray-100" />}
            >
              <div className="grid gap-3 md:grid-cols-2">
                {CONTINUE_LINKS.map((item) => (
                  <FeatureCard
                    key={item.href}
                    title={item.title}
                    description={item.description}
                    icon={<IconBadge icon={item.icon} className="bg-gray-100" />}
                    className="p-4"
                    secondaryAction={<Button asChild variant="outline" size="sm"><Link href={item.href}>Details</Link></Button>}
                    primaryAction={<Button asChild size="sm"><Link href={item.href}>Open</Link></Button>}
                  />
                ))}
              </div>
            </FeatureCard>
          </section>
        </SupportLayout>
      </div>
      <BottomNav />
    </div>
  );
}
