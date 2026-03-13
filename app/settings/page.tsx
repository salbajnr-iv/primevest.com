"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageLoading } from "@/components/ui/LoadingStates";

interface SettingsAction {
  label: string;
  description: string;
  href: string;
  cta: string;
}

interface SettingsGroup {
  title: string;
  description: string;
  actions: SettingsAction[];
}

const QUICK_FIX_GROUPS: SettingsGroup[] = [
  {
    title: "Account",
    description: "Manage your identity, account access, and recovery options.",
    actions: [
      {
        label: "Profile",
        description: "Update your personal information and account identity details.",
        href: "/profile",
        cta: "Open profile",
      },
      {
        label: "Security verification",
        description: "Review KYC and account verification status.",
        href: "/profile/kyc",
        cta: "Review verification",
      },
      {
        label: "Password reset",
        description: "Start a secure password reset flow if you need to recover access.",
        href: "/auth/reset-password",
        cta: "Reset password",
      },
    ],
  },
  {
    title: "Preferences",
    description: "Choose how PrimeVest looks and behaves for your day-to-day usage.",
    actions: [
      {
        label: "Theme",
        description: "Set display and visual preference controls in phase 2.",
        href: "/settings/language",
        cta: "Open preferences",
      },
      {
        label: "Language",
        description: "Pick your preferred application language.",
        href: "/settings/language",
        cta: "Choose language",
      },
    ],
  },
  {
    title: "Notifications",
    description: "Review account alerts, activity updates, and promotional messages.",
    actions: [
      {
        label: "Notification center",
        description: "See all updates and mark items as read from the notifications page.",
        href: "/notifications",
        cta: "Open notifications",
      },
    ],
  },
  {
    title: "Privacy & data controls",
    description: "Control consent, data visibility, and account privacy details.",
    actions: [
      {
        label: "Privacy policy",
        description: "Review how account data is collected, used, and protected.",
        href: "/privacy",
        cta: "View privacy policy",
      },
      {
        label: "Terms and controls",
        description: "Read account usage controls and legal preferences.",
        href: "/terms",
        cta: "Review terms",
      },
    ],
  },
];

function SettingsCard({ group }: { group: SettingsGroup }) {
  return (
    <article className="page-card space-y-4">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold text-gray-900">{group.title}</h2>
        <p className="text-sm text-gray-600">{group.description}</p>
      </div>

      <div className="space-y-3">
        {group.actions.map((action) => (
          <div
            key={action.label}
            className="rounded-xl border border-gray-200 bg-white/80 p-4 shadow-sm"
          >
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h3 className="font-medium text-gray-900">{action.label}</h3>
                <p className="text-sm text-gray-600">{action.description}</p>
              </div>
              <Button asChild size="sm">
                <Link href={action.href}>{action.cta}</Link>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </article>
  );
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasPhaseTwoError, setHasPhaseTwoError] = React.useState(false);

  React.useEffect(() => {
    const timer = window.setTimeout(() => {
      setIsLoading(false);
      setHasPhaseTwoError(true);
    }, 550);

    return () => window.clearTimeout(timer);
  }, []);

  if (isLoading) {
    return <PageLoading />;
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <main className="space-y-6 px-4 py-6 sm:px-6">
          <section className="page-card space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Release scope</p>
            <h1 className="text-2xl font-bold text-gray-900">Settings dashboard</h1>
            <p className="text-sm text-gray-600">
              Phase 1 quick fix is live with grouped settings cards and working navigation. Phase 2 will add
              inline forms and saved preference controls.
            </p>
          </section>

          <section className="grid gap-4 lg:grid-cols-2">
            {QUICK_FIX_GROUPS.map((group) => (
              <SettingsCard key={group.title} group={group} />
            ))}
          </section>

          {hasPhaseTwoError && (
            <section className="page-card">
              <ErrorState
                title="Phase 2 forms are not connected yet"
                message="Advanced settings editors are temporarily unavailable in this release. Use the links above to manage your settings from existing pages."
                onRetry={() => setHasPhaseTwoError(false)}
                retryText="Dismiss"
              />
            </section>
          )}

          <section className="page-card">
            <EmptyState
              title="No pending data requests"
              message="When exports, deletion requests, or consent updates are submitted, they will appear here for tracking."
              action={{
                label: "Review privacy details",
                onClick: () => window.location.assign("/privacy"),
              }}
            />
          </section>
        </main>
      </div>
      <BottomNav />
    </div>
  );
}
