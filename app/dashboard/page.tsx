"use client";

import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";
import PerformanceChart from "@/components/PerformanceChart";
import { ActivityItem, ChartSeriesPoint, PerformanceStats, PortfolioSummary } from "@/lib/dashboard/types";

export const dynamic = "force-dynamic";

const quickActions = [
  { label: "Buy", href: "/dashboard/buy", color: "buy", icon: "+" },
  { label: "Sell", href: "/dashboard/sell", color: "sell", icon: "−" },
  { label: "Swap", href: "/dashboard/swap", color: "swap", icon: "⇄" },
  { label: "Deposit", href: "/dashboard/deposit", color: "deposit", icon: "↓" },
];

const periods = ["1D", "7D", "30D", "1Y", "ALL"];

export default function DashboardPage() {
  const [summary, setSummary] = useState<PortfolioSummary | null>(null);
  const [activity, setActivity] = useState<ActivityItem[]>([]);
  const [seriesByPeriod, setSeriesByPeriod] = useState<Record<string, ChartSeriesPoint[]>>({});
  const [changeByPeriod, setChangeByPeriod] = useState<Record<string, { portfolio: number; benchmark: number }>>({});
  const [statsByPeriod, setStatsByPeriod] = useState<Record<string, PerformanceStats>>({});

  const loadDashboard = useCallback(async () => {
    const [summaryRes, activityRes, ...performanceResponses] = await Promise.all([
      fetch("/api/dashboard/summary", { cache: "no-store" }),
      fetch("/api/dashboard/activity", { cache: "no-store" }),
      ...periods.map((period) => fetch(`/api/dashboard/performance?period=${period}`, { cache: "no-store" })),
    ]);

    const summaryJson = await summaryRes.json();
    const activityJson = await activityRes.json();
    const perfJson = await Promise.all(performanceResponses.map((response) => response.json()));

    setSummary(summaryJson.summary);
    setActivity(activityJson.activity ?? []);

    const nextSeries: Record<string, ChartSeriesPoint[]> = {};
    const nextChanges: Record<string, { portfolio: number; benchmark: number }> = {};
    const nextStats: Record<string, PerformanceStats> = {};

    perfJson.forEach(({ performance }) => {
      nextSeries[performance.period] = performance.points;
      nextChanges[performance.period] = {
        portfolio: performance.portfolioChangePct,
        benchmark: performance.benchmarkChangePct,
      };
      nextStats[performance.period] = performance.stats;
    });

    setSeriesByPeriod(nextSeries);
    setChangeByPeriod(nextChanges);
    setStatsByPeriod(nextStats);
  }, []);

  useEffect(() => {
    const timeout = setTimeout(() => {
      void loadDashboard();
    }, 0);

    const interval = setInterval(() => {
      void loadDashboard();
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, [loadDashboard]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader
          userName={summary?.userName ?? "User"}
          portfolioValue={`${(summary?.portfolioValue ?? 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} €`}
          portfolioChange={`${(summary?.portfolioChangePct ?? 0).toFixed(2)}%`}
          notificationCount={summary?.notificationCount ?? 0}
        />

        <main>
          <section className="portfolio">
            <div className="portfolio-inner">
              <small>Available Balance</small>
              <div className="value-row">
                <div className="value">{(summary?.availableBalance ?? 0).toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}<span className="value-currency">€</span></div>
                <div className="value-detail">
                  <div className="value-label">24h</div>
                  <div className="change">{(summary?.availableBalanceChangePct ?? 0) >= 0 ? "+" : ""}{(summary?.availableBalanceChangePct ?? 0).toFixed(1)}%</div>
                </div>
              </div>
            </div>
          </section>

          <PerformanceChart
            seriesByPeriod={seriesByPeriod}
            changeByPeriod={changeByPeriod}
            statsByPeriod={statsByPeriod}
          />

          <section style={{ marginTop: 16 }}>
            <div className="page-header">
              <h3 className="section-title" style={{ margin: 0 }}>Quick Actions</h3>
              <Link href="/wallets" className="text-green-700 underline" style={{ fontSize: 13 }}>Open Wallets</Link>
            </div>
            <div className="portfolio-actions" style={{ marginTop: 12 }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="action-btn">
                  <div className={`action-icon ${action.color}`}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{action.icon}</span>
                  </div>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <div className="page-header">
              <h3 className="section-title" style={{ margin: 0 }}>Recent Activity</h3>
              <Link href="/transactions" className="text-green-700 underline" style={{ fontSize: 13 }}>View all</Link>
            </div>

            <div className="list-card" style={{ marginTop: 12 }}>
              {activity.map((item, index) => (
                <Link
                  href={item.href}
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index === activity.length - 1 ? "none" : "1px solid var(--border)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.type}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.amountLabel}</div>
                    <div style={{ fontSize: 12, color: item.status === "completed" ? "var(--success)" : "#f59e0b" }}>
                      {item.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
