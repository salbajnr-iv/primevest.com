"use client";

import * as React from "react";
import Link from "next/link";
import { Bell, Contact, Lock, Settings, ShieldCheck } from "lucide-react";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { EmptyState, ErrorState, PageLoading } from "@/components/ui/LoadingStates";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { PageSectionHeader } from "@/components/ui/PageSectionHeader";
import { PageMain, PageShell, StickyPageHeader, SurfaceCard } from "@/components/ui/page-layout";

interface SettingsAction {
  label: string;
  description: string;
  href: string;
  cta: string;
}

interface SettingsGroup {
  title: string;
  description: string;
  category: "account" | "preferences" | "notifications" | "privacy";
  icon: React.ReactNode;
  actions: SettingsAction[];
}

const QUICK_FIX_GROUPS: SettingsGroup[] = [
  {
    title: "Account",
    description: "Manage your identity, account access, and recovery options.",
    category: "account",
    icon: <Contact className="h-5 w-5 text-blue-600" />,
    actions: [
      { label: "Profile", description: "Update your personal information and account identity details.", href: "/profile", cta: "Open profile" },
      { label: "Security verification", description: "Review KYC and account verification status.", href: "/profile/kyc", cta: "Review verification" },
      { label: "Password reset", description: "Start a secure password reset flow if you need to recover access.", href: "/auth/reset-password", cta: "Reset password" },
    ],
  },
  {
    title: "Preferences",
    description: "Choose how PrimeVest looks and behaves for your day-to-day usage.",
    category: "preferences",
    icon: <Settings className="h-5 w-5 text-violet-600" />,
    actions: [
      { label: "Theme", description: "Set display and visual preference controls in phase 2.", href: "/settings/language", cta: "Open preferences" },
      { label: "Language", description: "Pick your preferred application language.", href: "/settings/language", cta: "Choose language" },
    ],
  },
  {
    title: "Notifications",
    description: "Review account alerts, activity updates, and promotional messages.",
    category: "notifications",
    icon: <Bell className="h-5 w-5 text-emerald-600" />,
    actions: [
      { label: "Notification center", description: "See all updates and mark items as read from the notifications page.", href: "/notifications", cta: "Open notifications" },
    ],
  },
  {
    title: "Privacy & data controls",
    description: "Control consent, data visibility, and account privacy details.",
    category: "privacy",
    icon: <ShieldCheck className="h-5 w-5 text-amber-600" />,
    actions: [
      { label: "Privacy policy", description: "Review how account data is collected, used, and protected.", href: "/privacy", cta: "View privacy policy" },
      { label: "Terms and controls", description: "Read account usage controls and legal preferences.", href: "/terms", cta: "Review terms" },
    ],
  },
];

type CategoryFilter = "all" | "account" | "preferences" | "notifications" | "privacy";

function SettingsCard({ group }: { group: SettingsGroup }) {
  return (
    <FeatureCard
      title={group.title}
      description={group.description}
      icon={<IconBadge icon={group.icon} className="bg-gray-100" />}
    >
      <div className="space-y-3">
        {group.actions.map((action) => (
          <FeatureCard
            key={action.label}
            title={action.label}
            description={action.description}
            className="p-4"
            secondaryAction={<Button asChild variant="outline" size="sm"><Link href={action.href}>Details</Link></Button>}
            primaryAction={<Button asChild size="sm"><Link href={action.href}>{action.cta}</Link></Button>}
          />
        ))}
      </div>
    </FeatureCard>
  );
}

export default function SettingsPage() {
  const [isLoading, setIsLoading] = React.useState(true);
  const [hasPhaseTwoError, setHasPhaseTwoError] = React.useState(false);
  const [filter, setFilter] = React.useState<CategoryFilter>("all");

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

  const visibleGroups = QUICK_FIX_GROUPS.filter((group) => (filter === "all" ? true : group.category === filter));

  return (
    <PageShell>
      <StickyPageHeader
        eyebrow="Account"
        title="Settings"
        badge={<Badge variant="secondary">Phase 1</Badge>}
        action={
          <Button asChild variant="outline" size="sm">
            <Link href="/profile">Open profile</Link>
          </Button>
        }
      />

      <PageMain>
        <FeatureCard
          title="Settings categories"
          description="Use filters to focus on specific account controls."
          icon={<IconBadge icon={<Lock className="h-5 w-5 text-gray-700" />} className="bg-gray-100" />}
        >
          <div className="flex flex-wrap gap-2">
            {(["all", "account", "preferences", "notifications", "privacy"] as CategoryFilter[]).map((tab) => (
              <Button key={tab} size="sm" variant={filter === tab ? "default" : "outline"} onClick={() => setFilter(tab)} className="capitalize">
                {tab}
              </Button>
            ))}
          </div>
        </FeatureCard>

        <PageSectionHeader
          eyebrow="Controls"
          title="Manage your account"
          description="Primary actions are right-aligned with secondary details links on the left."
        />

        <section className="grid gap-4 lg:grid-cols-2">
          {visibleGroups.map((group) => (
            <SettingsCard key={group.title} group={group} />
          ))}
        </section>

        {hasPhaseTwoError && (
          <SurfaceCard className="p-4">
            <ErrorState
              title="Phase 2 forms are not connected yet"
              message="Advanced settings editors are temporarily unavailable in this release. Use the links above to manage your settings from existing pages."
              onRetry={() => setHasPhaseTwoError(false)}
              retryText="Dismiss"
            />
          </SurfaceCard>
        )}

        <SurfaceCard className="p-4">
          <EmptyState
            title="No pending data requests"
            message="When exports, deletion requests, or consent updates are submitted, they will appear here for tracking."
            action={{ label: "Review privacy details", onClick: () => window.location.assign("/privacy") }}
          />
        </SurfaceCard>
      </PageMain>
      <BottomNav />
    </PageShell>
  );
}
