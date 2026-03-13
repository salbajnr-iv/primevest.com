"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarRange, MessageCircle, TrendingUp, Users } from "lucide-react";
import { useWindowSize } from "@/hooks/useWindowSize";
import KpiGauge from "@/components/dashboard/analytics/KpiGauge";
import MetricsBarChart from "@/components/dashboard/analytics/MetricsBarChart";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";
import DataTable from "@/components/dashboard/analytics/DataTable";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { EmptyState } from "@/components/ui/LoadingStates";
import type { DashboardData, DashboardWidgetContract, DashboardWidgetState, KpiGaugeInput } from "@/lib/dashboard/types";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

function formatLastUpdated(isoTimestamp: string): string {
  return `Last updated ${new Date(isoTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [range, setRange] = React.useState("Last 30 days");
  const [activePerfRange, setActivePerfRange] = React.useState<keyof DashboardData["performanceSeries"]>("1M");
  const [liveActivityFeed, setLiveActivityFeed] = React.useState(initialData.activityFeed);
  const [liveAlerts, setLiveAlerts] = React.useState<AlertNotificationItem[]>(initialData.alerts);
  const [freshness, setFreshness] = React.useState(initialData.freshness);
  const { isReady, breakpoint, width, height } = useWindowSize();

  const [kpiState, setKpiState] = React.useState<DashboardWidgetState>("ready");
  const [metricsState, setMetricsState] = React.useState<DashboardWidgetState>("ready");
  const [performanceState, setPerformanceState] = React.useState<DashboardWidgetState>("ready");
  const [tableState, setTableState] = React.useState<DashboardWidgetState>("ready");

  React.useEffect(() => {
    setKpiState(initialData.kpis.length ? "ready" : "empty");
    setMetricsState(initialData.volumeData.length ? "ready" : "empty");
    setPerformanceState(initialData.performanceSeries[activePerfRange].length ? "ready" : "empty");
    setTableState(initialData.topPairs.length ? "ready" : "empty");
  }, [activePerfRange, initialData]);

  const widgetContract: DashboardWidgetContract = React.useMemo(() => ({
    kpiGauges: (initialData.kpis as KpiGaugeInput[]).map((kpi) => ({
      ...kpi,
      state: kpiState,
      emptyStateLabel: "No orders yet. Place your first order to unlock KPI tracking.",
      onRetry: () => setKpiState("loading"),
    })),
    metricsBarChart: {
      title: "Daily Filled Orders",
      data: initialData.volumeData,
      emptyStateLabel: "No orders yet. Your filled orders will show up here.",
      state: metricsState,
      onRetry: () => setMetricsState("loading"),
    },
    performanceLineChartByRange: {
      "7D": {
        title: "Portfolio Performance (7D)",
        data: initialData.performanceSeries["7D"],
        emptyStateLabel: "No activity yet. Performance history will appear after your first transactions.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
      "1M": {
        title: "Portfolio Performance (1M)",
        data: initialData.performanceSeries["1M"],
        emptyStateLabel: "No activity yet. Performance history will appear after your first transactions.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
      "3M": {
        title: "Portfolio Performance (3M)",
        data: initialData.performanceSeries["3M"],
        emptyStateLabel: "No activity yet. Performance history will appear after your first transactions.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
    },
    topMarketsTable: {
      title: "Top Markets",
      columns: [
        { key: "pair", label: "Pair" },
        { key: "volume", label: "Volume" },
        { key: "spread", label: "Spread" },
        { key: "pnl", label: "PnL" },
      ],
      rows: initialData.topPairs,
      emptyStateLabel: "Your watchlist is empty. Add assets to get market insights.",
      state: tableState,
      onRetry: () => setTableState("loading"),
    },
    loadingState: {
      isLoading: [kpiState, metricsState, performanceState, tableState].includes("loading"),
      isRefreshing: false,
      lastUpdatedAt: freshness.aggregatesUpdatedAt,
    },
  }), [initialData, kpiState, metricsState, performanceState, tableState]);

  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();
    if (!supabase) return;

    const activityChannel = supabase
      .channel("dashboard-live-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload) => {
          const amount = Number((payload.new as { total_amount?: number }).total_amount ?? 0);
          const createdAt = String((payload.new as { created_at?: string }).created_at ?? new Date().toISOString());

          setLiveActivityFeed((current) => [
            {
              id: String(payload.new.id ?? Date.now()),
              action: "Live order update",
              detail: `New order • €${amount.toFixed(2)}`,
              time: "just now",
            },
            ...current,
          ].slice(0, 5));

          setFreshness((current) => ({ ...current, activityUpdatedAt: createdAt }));
        }
      )
      .subscribe();

    const alertsChannel = supabase
      .channel("dashboard-live-alerts")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "notifications" },
        (payload) => {
          const createdAt = String((payload.new as { created_at?: string }).created_at ?? new Date().toISOString());
          const message = String((payload.new as { message?: string }).message ?? "New account notification");

          setLiveAlerts((current) => [
            {
              id: String(payload.new.id ?? Date.now()),
              message,
              createdAt,
            },
            ...current,
          ].slice(0, 3));

          setFreshness((current) => ({ ...current, alertsUpdatedAt: createdAt }));
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(activityChannel);
      void supabase.removeChannel(alertsChannel);
    };
  }, []);

  React.useEffect(() => {
    if (kpiState === "loading") {
      const t = window.setTimeout(() => setKpiState(initialData.kpis.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [initialData.kpis.length, kpiState]);

  React.useEffect(() => {
    if (metricsState === "loading") {
      const t = window.setTimeout(() => setMetricsState(initialData.volumeData.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [initialData.volumeData.length, metricsState]);

  React.useEffect(() => {
    if (performanceState === "loading") {
      const t = window.setTimeout(() => setPerformanceState(initialData.performanceSeries[activePerfRange].length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [activePerfRange, initialData.performanceSeries, performanceState]);

  React.useEffect(() => {
    if (tableState === "loading") {
      const t = window.setTimeout(() => setTableState(initialData.topPairs.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [initialData.topPairs.length, tableState]);

  return (
    <DashboardShell
      title="Analytics Overview"
      subtitle="Unified KPI, live market pulse, and portfolio intelligence"
      header={{
        userName: initialData.portfolioSummary.userName,
        portfolioValue: `${initialData.portfolioSummary.portfolioValue.toLocaleString()} €`,
        portfolioChange: `${initialData.portfolioSummary.portfolioChangePct >= 0 ? "+" : ""}${initialData.portfolioSummary.portfolioChangePct.toFixed(2)}%`,
        notificationCount: initialData.portfolioSummary.notificationCount,
      }}
    >
      <section className="rounded-2xl border border-slate-200 bg-white p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900">Analytics Overview</h2>
            <p className="text-sm text-slate-600 mt-1">Welcome back, {initialData.portfolioSummary.userName}! Here&apos;s your real-time investment snapshot.</p>
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
        {widgetContract.kpiGauges.map((kpi) => (
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
          <MetricsBarChart {...widgetContract.metricsBarChart} />
          <p className="mt-2 text-xs text-slate-500">{formatLastUpdated(freshness.aggregatesUpdatedAt)}</p>
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
          <PerformanceLineChart {...widgetContract.performanceLineChartByRange[activePerfRange]} />
          <p className="mt-2 text-xs text-slate-500">{formatLastUpdated(freshness.aggregatesUpdatedAt)}</p>
        </div>
      </section>

      <section className="grid gap-3 xl:grid-cols-3">
        <article className="rounded-2xl border border-slate-200 bg-white p-4 xl:col-span-2">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold text-slate-900">News and Insights</h3>
            <span className="text-xs text-slate-500">Based on your watchlist</span>
          </div>
          <div className="rounded-xl bg-slate-50 p-3 text-sm text-slate-700 mb-3 flex items-center gap-2 overflow-x-auto whitespace-nowrap">
            <MessageCircle size={14} className="text-emerald-600" />
            <span>{initialData.marketNews.length ? initialData.marketNews.map((item) => item.text).join(" • ") : "Your watchlist is empty. Add assets to receive tailored news."}</span>
          </div>
          <DataTable {...widgetContract.topMarketsTable} />
        </article>

        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <h3 className="font-semibold text-slate-900 mb-3">User Activity Feed</h3>
          {liveActivityFeed.length === 0 ? (
            <EmptyState title="No activity yet" message="No activity yet. Place your first order to start your activity feed." />
          ) : (
            <ul className="space-y-3">
              {liveActivityFeed.map((activity) => (
                <li key={activity.id} className="rounded-xl border border-slate-100 p-3 hover:bg-slate-50">
                  <p className="text-sm font-medium text-slate-900">{activity.action}</p>
                  <p className="text-xs text-slate-600">{activity.detail}</p>
                  <button className="mt-2 text-xs text-emerald-700 inline-flex items-center gap-1">Details <ArrowRight size={12} /></button>
                  <p className="text-[11px] text-slate-400 mt-1">{activity.time}</p>
                </li>
              ))}
            </ul>
          )}
        </article>
      </section>

      <section className="grid gap-3 md:grid-cols-2">
        <article className="rounded-2xl border border-slate-200 bg-white p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900 flex items-center gap-2"><AlertCircle size={16} className="text-emerald-600" /> Alerts & Notifications</h3>
            <span className="text-xs text-slate-500">{formatLastUpdated(freshness.alertsUpdatedAt)}</span>
          </div>
          <div className="space-y-2 text-sm text-slate-700">
            {liveAlerts.map((alert) => (
              <p key={alert.id} className="rounded-lg bg-slate-50 p-2">{alert.message}</p>
            ))}
            <div className="flex gap-2"><button className="mt-1 rounded-lg bg-emerald-600 px-3 py-2 text-white text-xs">Open Notification Center</button><Link href="/support/contact" className="mt-1 rounded-lg border border-slate-300 px-3 py-2 text-xs">Get help</Link></div>
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
        <AlertCircle size={16} />
        <span>Mobile-responsive layout is enabled: sidebar collapses and all sections stack for smaller screens.</span>
        {isReady && (
          <span className="ml-auto text-xs bg-amber-100 px-2 py-1 rounded">
            {breakpoint.toUpperCase()} ({width}x{height})
          </span>
        )}
      </section>
    </DashboardShell>
  );
}
