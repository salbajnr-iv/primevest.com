"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, formatCompact } from "@/lib/utils";
import { TrendingUp, Users } from "@/lib/lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Icon } from "./Icon";
import { PortfolioSummary } from "@/lib/dashboard/types";
import { usePortfolioSummary } from "@/lib/dashboard/hooks";

interface DashboardHeaderProps {
  userName?: string;
  summary?: PortfolioSummary;
}

export default function DashboardHeader({ userName }: DashboardHeaderProps) {
  const { summary, loading, error } = usePortfolioSummary();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-panel p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="animate-pulse">
            <div className="mb-2 h-5 w-32 rounded bg-[var(--bg-soft)]" />
            <div className="h-8 w-48 rounded bg-[var(--bg-soft)]" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel border border-rose-200 bg-rose-50 p-4 md:p-5 dark:border-rose-900/60 dark:bg-rose-950/30">
        <div className="text-sm text-rose-800 dark:text-rose-300">Error loading portfolio summary</div>
      </div>
    );
  }

  const resolvedSummary = {
    ...summary,
    userName: summary?.userName || userName || getUserDisplayName(user),
  } as PortfolioSummary;

  const displayName = resolvedSummary.userName;
  const portfolioValue = new Intl.NumberFormat("de-DE", {
    style: "currency",
    currency: "EUR",
  }).format(resolvedSummary.portfolioValue);
  const portfolioChange = resolvedSummary.portfolioChangePct.toFixed(2);
  const notificationCount = Number(resolvedSummary.notificationCount) || 0;
  const isPositive = resolvedSummary.portfolioChangePct >= 0;

  return (
    <div className="dashboard-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-black leading-tight text-[var(--text)] md:text-3xl">Portfolio Overview</h1>
          <p className="mt-2 text-xl font-bold leading-tight text-[var(--text)]">
            Welcome back, <span className="block text-[var(--green)]">{displayName}</span>
          </p>
          <div className="mt-4 flex items-center gap-6 rounded-2xl border border-[var(--border)] bg-[var(--bg-soft)] p-4">
            <div className="text-right">
              <p className="text-sm font-semibold uppercase tracking-wide text-[var(--muted)]">Portfolio Value</p>
              <p className="mt-1 text-3xl font-black text-[var(--text)] md:text-4xl">{portfolioValue}</p>
            </div>
            <div className="flex min-w-[100px] flex-col items-center rounded-xl border border-[var(--border)] bg-[var(--card)] p-4 shadow-sm">
              <span className="text-xs font-semibold uppercase tracking-wide text-[var(--muted)]">24h Change</span>
              <span
                className={`mt-1 rounded-full px-3 py-1 text-lg font-black ${
                  isPositive ? "bg-emerald-100 text-emerald-800 dark:bg-emerald-900/50 dark:text-emerald-300" : "bg-rose-100 text-rose-800 dark:bg-rose-900/50 dark:text-rose-300"
                }`}
              >
                {isPositive ? "+" : ""}
                {portfolioChange}%
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/watchlists"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl border border-[var(--border)] px-5 py-2.5 text-sm font-semibold text-[var(--text)] shadow-sm transition-all hover:bg-[var(--bg-soft)]"
          >
            <Users size={16} />
            Watchlist
          </Link>
          <Link
            href="/dashboard/trade"
            className="inline-flex flex-shrink-0 items-center gap-2 rounded-xl bg-[var(--green)] px-5 py-2.5 text-sm font-semibold text-white shadow-lg transition-all hover:brightness-95"
          >
            <TrendingUp size={16} />
            Trade Now
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/settings/notifications" className="relative rounded-xl border border-[var(--border)] bg-[var(--bg-soft)] p-2 transition-all hover:brightness-95">
              <Icon action="notification" size="lg" />
              {notificationCount > 0 && (
                <span className="absolute -right-1 -top-1 flex h-5 w-5 items-center justify-center rounded-full border-2 border-[var(--card)] bg-[var(--green)] text-xs font-bold text-white shadow-lg">
                  {notificationCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="-mb-4 mt-3 flex items-center justify-end">
        <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--green-soft)] px-4 py-2 text-sm font-semibold text-[var(--green)]">
          <div className="h-2 w-2 rounded-full bg-[var(--green)]" />
          Live Data • Updated {formatCompact(resolvedSummary.availableBalance || 0)} available
        </div>
      </div>
    </div>
  );
}
