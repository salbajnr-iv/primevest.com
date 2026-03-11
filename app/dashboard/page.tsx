"use client";

import * as React from "react";
import {
  Bell,
  CalendarRange,
  ChevronRight,
  CircleAlert,
  Newspaper,
  TrendingUp,
  Users,
} from "lucide-react";
import KpiGauge from "@/components/dashboard/analytics/KpiGauge";
import MetricsBarChart from "@/components/dashboard/analytics/MetricsBarChart";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";
import DataTable from "@/components/dashboard/analytics/DataTable";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";

const kpis = [
  { label: "Portfolio Health", value: 86, valueLabel: "86/100", deltaLabel: "+3.5% vs last week" },
  { label: "Order Fill Rate", value: 92, valueLabel: "92%", deltaLabel: "+1.2% this month" },
  { label: "Risk Coverage", value: 74, valueLabel: "74%", deltaLabel: "Needs rebalance" },
];

const volumeData = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 21 },
  { label: "Fri", value: 25 },
];

const performanceSeries: Record<string, { label: string; value: number }[]> = {
  "7D": [
    { label: "D1", value: 108 },
    { label: "D2", value: 112 },
    { label: "D3", value: 111 },
    { label: "D4", value: 115 },
    { label: "D5", value: 117 },
  ],
  "1M": [
    { label: "W1", value: 100 },
    { label: "W2", value: 105 },
    { label: "W3", value: 103 },
    { label: "W4", value: 111 },
    { label: "W5", value: 116 },
  ],
  "3M": [
    { label: "M1", value: 95 },
    { label: "M2", value: 101 },
    { label: "M3", value: 116 },
    { label: "M4", value: 123 },
    { label: "M5", value: 130 },
  ],
};

const topPairs = [
  { pair: "BTC/EUR", volume: "€1.2M", spread: "0.09%", pnl: "+€8,210" },
  { pair: "ETH/EUR", volume: "€860K", spread: "0.12%", pnl: "+€4,144" },
  { pair: "SOL/EUR", volume: "€510K", spread: "0.22%", pnl: "+€1,982" },
];

const activityFeed = [
  { action: "Limit order executed", detail: "Bought 0.12 BTC at €58,240", time: "2 min ago" },
  { action: "Risk alert resolved", detail: "Hedging ratio back above 70%", time: "18 min ago" },
  { action: "Portfolio rebalance", detail: "Moved 8% from BTC to ETH", time: "1 hr ago" },
];

const marketNews = [
  "ECB signals slower pace of rate cuts, risk assets steady.",
  "Bitcoin ETF inflows rise for the fourth consecutive day.",
  "Gold and crypto correlation drops to monthly lows.",
];

export default function DashboardPage() {
  const [range, setRange] = React.useState("Last 30 days");
  const [activePerfRange, setActivePerfRange] = React.useState<keyof typeof performanceSeries>("1M");

  return (
    <DashboardShell
      title="Analytics Overview"
      subtitle="Unified KPI, live market pulse, and portfolio intelligence"
      header={{ userName: "Alex", portfolioValue: "68,415.92 €", portfolioChange: "+4.27%", notificationCount: 5 }}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Analytics Overview</h2>
            <p className="text-sm text-slate-600 mt-1">Welcome back, Alex! Here&apos;s your real-time investment snapshot.</p>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <CalendarRange size={16} className="text-emerald-600" />
            <span className="sr-only">Select date range</span>
            <select value={range} onChange={(e) => setRange(e.target.value)} className="bg-transparent outline-none">
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last quarter</option>
            </select>
          </label>
        </div>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {kpis.map((kpi) => (
          <button key={kpi.label} className="text-left rounded-2xl focus-visible:outline-2 focus-visible:outline-emerald-500" title={`View details for ${kpi.label}`}>
            <KpiGauge {...kpi} />
          </button>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-600" /> Market Trends</h3>
            <span className="rounded-full bg-emerald-50 px-2 py-1 text-xs text-emerald-700">Live feed</span>
          </div>
          <MetricsBarChart title="Daily Filled Orders" data={volumeData} />
        </div>

        <div className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Custom Performance Graph</h3>
            <div className="flex gap-2">
              {(["7D", "1M", "3M"] as const).map((period) => (
                <button
                  key={period}
                  onClick={() => setActivePerfRange(period)}
                  className={`rounded-lg px-2.5 py-1 text-xs ${activePerfRange === period ? "bg-emerald-600 text-white" : "bg-slate-100 text-slate-700"}`}
                >
                  {period}
                </button>
              ))}
            </div>
          </div>
          <PerformanceLineChart title={`Portfolio Performance (${activePerfRange})`} data={performanceSeries[activePerfRange]} />
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">News and Insights</h3>
            <span className="text-xs text-slate-500">Based on your watchlist</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 mb-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <Newspaper size={14} className="text-emerald-600" />
            <span>{marketNews.join(" • ")}</span>
          </div>
          <DataTable
            title="Top Markets"
            columns={[
              { key: "pair", label: "Pair" },
              { key: "volume", label: "Volume" },
              { key: "spread", label: "Spread" },
              { key: "pnl", label: "PnL" },
            ]}
            rows={topPairs}
          />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900 mb-3">User Activity Feed</h3>
          <ul className="space-y-3">
            {activityFeed.map((activity) => (
              <li key={activity.action} className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                <p className="text-xs text-slate-600">{activity.detail}</p>
                <button className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1">Details <ChevronRight size={12} /></button>
                <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
              </li>
            ))}
          </ul>
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Bell size={16} className="text-emerald-600" /> Alerts & Notifications</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="rounded-lg bg-slate-50 p-2">Price alert: BTC crossed €58,000.</p>
            <p className="rounded-lg bg-slate-50 p-2">Risk threshold warning for SOL allocation.</p>
            <button className="mt-1 rounded-lg bg-emerald-600 px-3 py-2 text-white text-xs">Open Notification Center</button>
          </div>
        </article>
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2"><Users size={16} className="text-emerald-600" /> Community Engagement</h3>
          <div className="space-y-2 text-sm text-slate-700">
            <p className="rounded-lg bg-slate-50 p-2">Community poll: Which asset class should we analyze next?</p>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs">Visit Community Forum</button>
            <button className="rounded-lg border border-slate-300 px-3 py-2 text-xs">Vote in Poll</button>
          </div>
        </article>
      </section>

      <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-sm text-amber-800 flex items-center gap-2">
        <CircleAlert size={16} />
        Mobile-responsive layout is enabled: sidebar collapses and all sections stack for smaller screens.
      </section>
    </DashboardShell>
  );
}
