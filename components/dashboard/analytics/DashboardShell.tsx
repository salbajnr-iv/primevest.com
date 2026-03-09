"use client";

import type { ReactNode } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";

export default function DashboardShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
}) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" portfolioValue="12,540.50 €" portfolioChange="+2.41%" notificationCount={3} />
        <main className="space-y-4 pb-20">
          <header className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
            <h1 className="text-xl font-semibold">{title}</h1>
            {subtitle ? <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{subtitle}</p> : null}
          </header>
          {children}
        </main>
        <BottomNav />
      </div>
    </div>
  );
}
