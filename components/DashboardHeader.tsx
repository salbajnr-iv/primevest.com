"use client";

import * as React from "react";
import Link from "next/link";
import ThemeToggle from "./ThemeToggle";
import NotificationBadge from "./NotificationBadge";

interface DashboardHeaderProps {
  userName?: string;
  portfolioValue?: string;
  portfolioChange?: string;
  notificationCount?: number;
}

export default function DashboardHeader({ 
  userName = "User", 
  portfolioValue = "0,00 €",
  portfolioChange = "0%",
  notificationCount = 0
}: DashboardHeaderProps) {
  const isPositive = !portfolioChange.startsWith('-');

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
        <Link href="/notifications" className="notification-bell">
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

