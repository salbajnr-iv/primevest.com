"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import { getUserDisplayName, formatCompact } from "@/lib/utils";
import { TrendingUp, Users } from "@/lib/lucide-react";
import ThemeToggle from "./ThemeToggle";
import { Icon } from "./Icon";
import { PortfolioSummary } from "@/lib/dashboard/types";
/* eslint-disable @typescript-eslint/no-unused-vars */
import { ROUTES } from "@/lib/routes";
import { usePortfolioSummary } from "@/lib/dashboard/hooks";

interface DashboardHeaderProps {
  userName?: string;
  summary?: PortfolioSummary;
}

export default function DashboardHeader({ 
  userName,
}: DashboardHeaderProps) {
  const { summary, loading, error } = usePortfolioSummary();
  const { user } = useAuth();

  if (loading) {
    return (
      <div className="dashboard-panel p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="animate-pulse">
            <div className="h-5 bg-slate-200 rounded w-32 mb-2" />
            <div className="h-8 bg-slate-200 rounded w-48" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-panel p-4 md:p-5 bg-rose-50 border border-rose-200">
        <div className="text-rose-800 text-sm">
          Error loading portfolio summary
        </div>
      </div>
    );
  }

  const resolvedSummary = {
    ...summary,
    userName: summary?.userName || userName || getUserDisplayName(user),
  } as PortfolioSummary;

  const displayName = resolvedSummary.userName;
  const portfolioValue = new Intl.NumberFormat('de-DE', { 
    style: 'currency', 
    currency: 'EUR' 
  }).format(resolvedSummary.portfolioValue);
  const portfolioChange = resolvedSummary.portfolioChangePct.toFixed(2);
  const notificationCount = Number(resolvedSummary.notificationCount) || 0;
  const isPositive = resolvedSummary.portfolioChangePct >= 0;

  return (
    <div className="dashboard-panel p-4 md:p-5">
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl md:text-3xl font-black text-slate-900 leading-tight">
            Portfolio Overview
          </h1>
          <p className="text-xl font-bold text-slate-900 mt-2 leading-tight">
            Welcome back, <span className="text-emerald-600 block">{displayName}</span>
          </p>
          <div className="flex items-center gap-6 mt-4 p-4 bg-gradient-to-r from-slate-50 to-slate-100 rounded-2xl">
            <div className="text-right">
              <p className="text-sm font-semibold text-slate-600 uppercase tracking-wide">
                Portfolio Value
              </p>
              <p className="text-3xl md:text-4xl font-black text-slate-900 mt-1">
                {portfolioValue}
              </p>
            </div>
            <div className="flex flex-col items-center p-4 bg-white/60 backdrop-blur-sm rounded-xl border border-slate-200 shadow-sm min-w-[100px]">
              <span className="text-xs font-semibold text-slate-500 uppercase tracking-wide">
                24h Change
              </span>
              <span className={`text-lg font-black px-3 py-1 rounded-full ${
                isPositive 
                  ? 'bg-emerald-100 text-emerald-800 shadow-emerald-200/50 shadow-lg' 
                  : 'bg-rose-100 text-rose-800 shadow-rose-200/50 shadow-lg'
              }`}>
                {isPositive ? '+' : ''}{portfolioChange}%
              </span>
              <div className={`w-3 h-3 mt-1 rounded-full animate-ping ${
                isPositive ? 'bg-emerald-500' : 'bg-rose-500'
              }`} />
            </div>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Link 
            href="/watchlists" 
            className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-5 py-2.5 text-sm font-semibold text-slate-700 shadow-sm hover:bg-slate-50 hover:border-slate-300 transition-all flex-shrink-0"
          >
            <Users size={16} />
            Watchlist
          </Link>
          <Link 
            href="/dashboard/trade" 
            className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white shadow-lg hover:bg-emerald-700 hover:shadow-xl hover:-translate-y-0.5 transition-all flex-shrink-0"
          >
            <TrendingUp size={16} />
            Trade Now
          </Link>
          <div className="flex items-center gap-2">
            <Link href="/settings/notifications" className="relative p-2 rounded-xl bg-slate-100 hover:bg-slate-200 transition-all">
              <Icon action="notification" size="lg" />
              {notificationCount > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-emerald-600 text-white text-xs rounded-full flex items-center justify-center font-bold shadow-lg border-2 border-white animate-pulse">
                  {notificationCount}
                </span>
              )}
            </Link>
            <ThemeToggle />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-end mt-3 -mb-4">
        <div className="flex items-center gap-2 text-sm text-emerald-700 font-semibold bg-emerald-50 px-4 py-2 rounded-xl border border-emerald-200 shadow-sm">
          <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
          Live Data • Updated {formatCompact(resolvedSummary.availableBalance || 0)} available
        </div>
      </div>
    </div>
  );
}
