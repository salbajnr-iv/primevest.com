"use client";

import type { ReactNode } from "react";
import { useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

export default function DashboardShell({
  title,
  subtitle,
  children,
  header = { userName: "User", portfolioValue: "12,540.50 €", portfolioChange: "+2.41%", notificationCount: 3 },
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  header?: { userName?: string; portfolioValue?: string; portfolioChange?: string; notificationCount?: number };
}) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <div className="flex items-start gap-4 lg:gap-6">
          <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

          <div className="min-w-0 flex-1">
            <DashboardHeader {...header} />
            <main className="space-y-4 pb-20">
              <header className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
                <h1 className="text-xl font-semibold">{title}</h1>
                {subtitle ? <p className="mt-1 text-sm" style={{ color: "var(--muted)" }}>{subtitle}</p> : null}
              </header>
              {children}
            </main>
          </div>
        </div>

        <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
      </div>
    </div>
  );
}
