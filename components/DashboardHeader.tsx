"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName } from "@/lib/utils";
import ThemeToggle from "./ThemeToggle";
import { Icon } from "./Icon";
import { PortfolioSummary } from "@/lib/dashboard/types";
import { ROUTES } from "@/lib/routes";

interface DashboardHeaderProps {
  userName?: string;
  summary?: Partial<PortfolioSummary>;
}

export default function DashboardHeader({ 
  userName,
  summary,
}: DashboardHeaderProps) {
  const { user } = useAuth();

  const resolvedSummary: PortfolioSummary = {
    userName: summary?.userName ?? userName ?? getUserDisplayName(user),
    portfolioValue: summary?.portfolioValue ?? 0,
    portfolioChangePct: summary?.portfolioChangePct ?? 0,
    availableBalance: summary?.availableBalance ?? 0,
    availableBalanceChangePct: summary?.availableBalanceChangePct ?? 0,
    notificationCount: summary?.notificationCount ?? 0,
  };

  const displayName = resolvedSummary.userName;
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
          {displayName} · Wert
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
          <Icon action="notification" size="lg" />
          {notificationCount > 0 && (
            <span className="notification-badge">{notificationCount}</span>
          )}
        </Link>
        <ThemeToggle />
      </div>
    </header>
  );
}
