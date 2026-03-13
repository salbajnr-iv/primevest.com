import { NextResponse } from "next/server";

const curatedCommunityData = {
  generatedAt: new Date().toISOString(),
  announcements: [
    {
      id: "platform-update",
      title: "Platform update: faster ticket triage and SLA labels",
      summary: "Support tickets now show estimated first-response windows by category.",
      href: "/support/tickets",
      source: "PrimeVest Support",
    },
    {
      id: "security-reminder",
      title: "Security reminder: never share OTP or recovery phrases",
      summary: "Community moderators will remove requests asking for credentials.",
      href: "/support",
      source: "Trust & Safety",
    },
  ],
  guides: [
    {
      id: "deposit-guide",
      title: "Deposits and transfer timelines",
      summary: "Expected processing windows and common verification blockers.",
      href: "/support",
      source: "Help Center",
    },
    {
      id: "ticket-guide",
      title: "How to write an effective support ticket",
      summary: "Use category, screenshots, and transaction IDs for faster resolution.",
      href: "/support/tickets",
      source: "Help Center",
    },
  ],
  forums: [
    {
      id: "troubleshooting-forum",
      title: "Troubleshooting discussions",
      summary: "Ask peers about app behavior, settings, and workflow tips.",
      href: "/support/status",
      source: "Community",
    },
    {
      id: "best-practices-forum",
      title: "Best practices and workflows",
      summary: "See how experienced users manage watchlists and alerts.",
      href: "/support",
      source: "Community",
    },
  ],
};

export async function GET() {
  return NextResponse.json(curatedCommunityData);
}
