"use client";

import * as React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import { PortfolioSummary } from "@/lib/dashboard/types";
import { ROUTES } from "@/lib/routes";

interface DashboardHeaderProps {
  summary?: Partial<PortfolioSummary>;
  userName?: string;
}

export default function DashboardHeader({ 
  summary,
  userName: legacyUserName,
}: DashboardHeaderProps) {
  const resolvedSummary: PortfolioSummary = {
    userName: summary?.userName ?? legacyUserName ?? "User",
    portfolioValue: summary?.portfolioValue ?? 0,
    portfolioChangePct: summary?.portfolioChangePct ?? 0,
    availableBalance: summary?.availableBalance ?? 0,
    availableBalanceChangePct: summary?.availableBalanceChangePct ?? 0,
    notificationCount: summary?.notificationCount ?? 0,
  };

  const userName = resolvedSummary.userName;
  const portfolioValue = new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(resolvedSummary.portfolioValue);
  const portfolioChange = `${resolvedSummary.portfolioChangePct >= 0 ? '+' : ''}${resolvedSummary.portfolioChangePct.toFixed(2)}%`;
  const notificationCount = resolvedSummary.notificationCount;
  const isPositive = resolvedSummary.portfolioChangePct >= 0;

  return (
    <header className="header">
      <div className="header-left">
        <span className="header-eyebrow">PORTFOLIO</span>
        <div className="header-title">
          {userName} · Wert
          <span className="status-dot"></span>
        </div>
        <div className="header-summary">
          <div className="portfolio-value">
            <span className="value">{portfolioValue}</span>
          </div>
          <div className={`portfolio-change ${isPositive ? 'positive' : 'negative'}`}>
            {isPositive ? '△' : '▼'} {portfolioChange}
          </div>
        </div>
      </div>
      
      <div className="header-right">
        <Link href={ROUTES.settings.notifications} className="notification-bell">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
            <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
          </svg>
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
