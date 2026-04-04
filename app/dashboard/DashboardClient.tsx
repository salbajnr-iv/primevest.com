"use client";

import * as React from "react";
import Link from "next/link";
import { AlertCircle, ArrowRight, CalendarRange, MessageCircle, TrendingUp, Users } from "@/lib/lucide-react";

import KpiGauge from "@/components/dashboard/analytics/KpiGauge";
import MetricsBarChart from "@/components/dashboard/analytics/MetricsBarChart";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";
import { MarketInsights } from "@/components/dashboard/MarketInsights";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { EmptyState } from "@/components/ui/LoadingStates";
import type {
  ActivityFeedItem,
  AlertNotificationItem,
  DashboardData,
  DashboardDateRange,
  DashboardTimestampMeta,
  DashboardWidgetContract,
  DashboardWidgetState,
  KpiGaugeInput,
  PerformanceRange,
} from "@/lib/dashboard/types";
import { createClient as createBrowserSupabaseClient } from "@/lib/supabase/client";

function formatLastUpdated(isoTimestamp: string): string {
  return `Last updated ${new Date(isoTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function parsePercentLabel(value: string): number {
  const normalized = value.replace("%", "").replace(",", "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

type LiveInsertPayload = {
  new: {
    id?: string | number;
    total_amount?: number | string;
    created_at?: string;
    message?: string;
  };
};

type DateRangeInterval = {
  from: Date;
  to: Date;
  label: string;
};

function getDateRangeInterval(range: DashboardDateRange, now = new Date()): DateRangeInterval {
  const to = new Date(now);
  const from = new Date(now);

  if (range === "Today") {
    from.setHours(0, 0, 0, 0);
  } else if (range === "Last 7 days") {
    from.setDate(from.getDate() - 7);
  } else if (range === "Last quarter") {
    from.setMonth(from.getMonth() - 3);
  } else {
    from.setDate(from.getDate() - 30);
  }

  return { from, to, label: `${from.toLocaleDateString()} - ${to.toLocaleDateString()}` };
}

export default function DashboardClient({ initialData }: { initialData: DashboardData }) {
  const [range, setRange] = React.useState<DashboardDateRange>("Last 30 days");
  const [dashboardData, setDashboardData] = React.useState(initialData);
  const [isRangeLoading, setIsRangeLoading] = React.useState(false);
  const [activePerfRange, setActivePerfRange] = React.useState<PerformanceRange>("1M");
  const [liveActivityFeed, setLiveActivityFeed] = React.useState<ActivityFeedItem[]>(initialData.activityFeed);
  const [liveAlerts, setLiveAlerts] = React.useState<AlertNotificationItem[]>(initialData.alerts);

  const [freshness, setFreshness] = React.useState<DashboardTimestampMeta>(initialData.freshness);

  const [kpiState, setKpiState] = React.useState<DashboardWidgetState>("ready");
  const [metricsState, setMetricsState] = React.useState<DashboardWidgetState>("ready");
  const [performanceState, setPerformanceState] = React.useState<DashboardWidgetState>("ready");
  const [tableState, setTableState] = React.useState<DashboardWidgetState>("ready");
  const activeDateInterval = React.useMemo(() => getDateRangeInterval(range), [range]);

  React.useEffect(() => {
    setKpiState(dashboardData.kpis.length ? "ready" : "empty");
    setMetricsState(dashboardData.volumeData.length ? "ready" : "empty");
    setPerformanceState(dashboardData.performanceSeries[activePerfRange].length ? "ready" : "empty");
    setTableState(dashboardData.topPairs.length ? "ready" : "empty");
  }, [activePerfRange, dashboardData]);

  const widgetContract: DashboardWidgetContract = React.useMemo(() => ({
    kpiGauges: (dashboardData.kpis as KpiGaugeInput[]).map((kpi) => ({
      ...kpi,
      state: kpiState,
      emptyStateLabel: "No orders yet. Place your first trade to unlock personalized KPI tracking and insights.",
      onRetry: () => setKpiState("loading"),
    })),
    metricsBarChart: {
      title: `Daily Filled Orders (${range})`,
      data: dashboardData.volumeData,
      emptyStateLabel: "No orders yet. Start trading to see your volume trends and market activity.",
      state: metricsState,
      onRetry: () => setMetricsState("loading"),
    },
    performanceLineChartByRange: {
      "7D": {
        title: `Portfolio Performance (7D · ${range})`,
        data: dashboardData.performanceSeries["7D"],
        emptyStateLabel: "No activity yet. Start trading to see your performance history and unlock advanced charts.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
      "1M": {
        title: `Portfolio Performance (1M · ${range})`,
        data: dashboardData.performanceSeries["1M"],
        emptyStateLabel: "No activity yet. Performance history will appear after your first transactions.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
      "3M": {
        title: `Portfolio Performance (3M · ${range})`,
        data: dashboardData.performanceSeries["3M"],
        emptyStateLabel: "No activity yet. Performance history will appear after your first transactions.",
        state: performanceState,
        onRetry: () => setPerformanceState("loading"),
      },
    },
    topMarketsTable: {
      title: `Top Markets (${range})`,
      columns: [
        { key: "pair", label: "Pair" },
        { key: "volume", label: "Volume" },
        { key: "spread", label: "Spread" },
        { key: "pnl", label: "PnL" },
      ],
      rows: dashboardData.topPairs,
      emptyStateLabel: "Your watchlist is empty. Add your favorite assets to unlock market insights, news, and alerts.",
      state: tableState,
      onRetry: () => setTableState("loading"),
    },
    loadingState: {
      isLoading: isRangeLoading || [kpiState, metricsState, performanceState, tableState].includes("loading"),
      isRefreshing: false,
      lastUpdatedAt: freshness.aggregatesUpdatedAt,
    },
  }), [dashboardData, freshness.aggregatesUpdatedAt, isRangeLoading, kpiState, metricsState, performanceState, range, tableState]);


  React.useEffect(() => {
    let isCancelled = false;

    async function loadRangeData() {
      setIsRangeLoading(true);
      setKpiState("loading");
      setMetricsState("loading");
      setPerformanceState("loading");
      setTableState("loading");

      try {
        const response = await fetch(`/api/dashboard/aggregates?range=${encodeURIComponent(range)}`, {
          cache: "no-store",
        });
        if (!response.ok) throw new Error("Failed to load dashboard range data");

        const payload = (await response.json()) as { data?: DashboardData };
        if (!isCancelled && payload.data) {
          setDashboardData(payload.data);
          setFreshness(payload.data.freshness);
        }
      } catch {
        if (!isCancelled) {
          setKpiState("error");
          setMetricsState("error");
          setPerformanceState("error");
          setTableState("error");
        }
      } finally {
        if (!isCancelled) setIsRangeLoading(false);
      }
    }

    void loadRangeData();

    return () => {
      isCancelled = true;
    };
  }, [range]);

  React.useEffect(() => {
    const supabase = createBrowserSupabaseClient();

    const activityChannel = supabase
      .channel("dashboard-live-activity")
      .on(
        "postgres_changes",
        { event: "INSERT", schema: "public", table: "orders" },
        (payload: LiveInsertPayload) => {
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
        (payload: LiveInsertPayload) => {
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
      const t = window.setTimeout(() => setKpiState(dashboardData.kpis.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [dashboardData.kpis.length, kpiState]);

  React.useEffect(() => {
    if (metricsState === "loading") {
      const t = window.setTimeout(() => setMetricsState(dashboardData.volumeData.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [dashboardData.volumeData.length, metricsState]);

  React.useEffect(() => {
    if (performanceState === "loading") {
      const t = window.setTimeout(() => setPerformanceState(dashboardData.performanceSeries[activePerfRange].length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [activePerfRange, dashboardData.performanceSeries, performanceState]);

  React.useEffect(() => {
    if (tableState === "loading") {
      const t = window.setTimeout(() => setTableState(dashboardData.topPairs.length ? "ready" : "empty"), 600);
      return () => window.clearTimeout(t);
    }
  }, [dashboardData.topPairs.length, tableState]);

  return (
    <DashboardShell
      title="Analytics Overview"
      subtitle="Unified KPI, live market pulse, and portfolio intelligence"
      summary={dashboardData.portfolioSummary}
    >
      <section className="dashboard-panel p-4 md:p-5">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
<h2 className="text-2xl md:text-3xl font-bold text-slate-900">Analytics Overview</h2>
        <p className="text-xl font-bold text-slate-900 mt-2 leading-tight">
              Welcome back, <span className="text-emerald-600 block">{dashboardData.portfolioSummary.userName}</span>
            </p>
            <p className="text-2xl font-black text-slate-900 mt-1 mb-4">
              {dashboardData.portfolioSummary.portfolioChangePct >= 0 
                ? <span className="text-emerald-600">+{dashboardData.portfolioSummary.portfolioChangePct.toFixed(1)}%</span> 
                : <span className="text-rose-600">-{Math.abs(dashboardData.portfolioSummary.portfolioChangePct).toFixed(1)}%</span>}
              <span className="text-slate-500 text-base font-normal ml-2">today</span>
            </p>
            <div className="flex flex-wrap gap-2 mt-4">
              <Link href="/dashboard/trade" className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                <TrendingUp size={16} />
                Start Trading
              </Link>
              <Link href="/watchlists" className="inline-flex items-center gap-2 rounded-xl border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                <Users size={16} />
                Add to Watchlist
              </Link>
            </div>
          </div>
          <label className="flex items-center gap-2 rounded-xl border border-slate-200 px-3 py-2 text-sm text-slate-700">
            <CalendarRange size={16} className="text-emerald-600" />
            <span className="sr-only">Select date range</span>
            <select value={range} onChange={(e) => setRange(e.target.value as DashboardDateRange)} className="bg-transparent outline-none">
              <option>Today</option>
              <option>Last 7 days</option>
              <option>Last 30 days</option>
              <option>Last quarter</option>
            </select>
          </label>
        </div>
        <p className="mt-3 text-sm font-semibold text-slate-900 bg-slate-50 px-4 py-2 rounded-xl inline-block">
          Active interval: <span className="font-black text-emerald-600">{activeDateInterval.label}</span>
        </p>
      </section>

      <section className="grid gap-3 md:grid-cols-3">
        {widgetContract.kpiGauges.map((kpi) => (
          <button key={kpi.label} className="text-left rounded-2xl focus-visible:outline-2 focus-visible:outline-emerald-500" title={`View details for ${kpi.label}`}>
            <KpiGauge {...kpi} />
          </button>
        ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <div className="dashboard-panel p-4">
          <div className="mb-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="text-lg font-bold text-slate-900 flex items-center gap-2"><TrendingUp size={16} className="text-emerald-600" /> Market Trends ({range})</h3>
              <span className="rounded-full bg-emerald-50 px-3 py-1.5 text-sm font-medium text-emerald-700">Live Insights</span>
            </div>
            {dashboardData.topPairs.length > 0 ? (
              <div className="grid grid-cols-2 gap-3 mb-4">
            {[...dashboardData.topPairs]
              .sort((a, b) => parsePercentLabel(b.pnl) - parsePercentLabel(a.pnl))
              .slice(0, 4)
              .map((pair, i) => (
                <div key={pair.pair || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border">
                  <span className="text-sm font-medium text-slate-900 truncate">{pair.pair}</span>
                  <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                    parsePercentLabel(pair.pnl) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {pair.pnl}
                  </span>
                </div>
              ))}
              </div>
            ) : (
              <div className="h-20 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-sm text-slate-500">
                No market data yet. Add watchlist assets to see top movers.
              </div>
            )}
            <MetricsBarChart {...widgetContract.metricsBarChart} />
            <p className="mt-3 font-semibold text-slate-900 text-sm">{formatLastUpdated(freshness.aggregatesUpdatedAt)}</p>
          </div>
        </div>

        <div className="dashboard-panel p-4">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="font-semibold text-slate-900">Custom Performance Graph ({range})</h3>
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
          {performanceState === 'empty' ? (
            <div className="h-[200px] rounded-xl border border-dashed border-slate-200 bg-gradient-to-br from-slate-50 to-slate-100 p-6 flex flex-col items-center justify-center text-sm text-slate-600">
              <TrendingUp className="h-12 w-12 text-slate-400 mb-3" />
              <h4 className="font-semibold text-slate-900 mb-1">Visualize Your Potential</h4>
              <p className="text-center mb-4 max-w-sm">Start trading to see real performance. This sample shows typical portfolio growth vs market benchmark.</p>
              <div className="w-full h-24 bg-gradient-to-r from-emerald-100 via-blue-100 to-emerald-100 rounded-lg overflow-hidden flex items-end gap-px p-1">
                <div className="flex-1 h-4/5 bg-gradient-to-t from-emerald-400 to-emerald-500 rounded" /> {/* Portfolio */}
                <div className="flex-1 h-3/5 bg-gradient-to-t from-blue-400 to-blue-500 rounded" /> {/* Benchmark */}
              </div>
              <p className="text-xs mt-2 text-slate-500">Sample: +12% vs +8% benchmark (7D)</p>
              <Link href="/dashboard/trade" className="mt-4 rounded-lg bg-emerald-600 px-4 py-2 text-xs font-medium text-white hover:bg-emerald-700">
                Start Trading Now
              </Link>
            </div>
          ) : (
            <PerformanceLineChart {...widgetContract.performanceLineChartByRange[activePerfRange]} />
          )}
          <p className="mt-2 text-sm font-semibold text-slate-900">{formatLastUpdated(freshness.aggregatesUpdatedAt)}</p>
        </div>
      </section>

      <MarketInsights 
        range={range}
        dashboardData={dashboardData}
        widgetContract={widgetContract}
        freshness={freshness}
        activeDateInterval={activeDateInterval}
      />

      <section className="grid gap-3 xl:grid-cols-3">
        <article className="dashboard-panel p-4 xl:col-span-2">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <h3 className="font-semibold text-slate-900">Daily Command Center</h3>
              <p className="text-xs text-slate-500">The most important actions and account signals, in one place.</p>
            </div>
            <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">Updated live</span>
          </div>
          <div className="grid gap-3 md:grid-cols-2">
            <div className="rounded-2xl border border-slate-200 bg-white p-4">
              <h4 className="text-sm font-semibold text-slate-900">Your next best move</h4>
              <p className="mt-1 text-xs text-slate-600">Based on this period, markets with the strongest momentum are highlighted in your trend cards.</p>
              <div className="mt-4 grid grid-cols-2 gap-2">
                <Link href="/dashboard/trade" className="rounded-xl bg-emerald-600 px-3 py-2 text-center text-xs font-semibold text-white hover:bg-emerald-700">Place trade</Link>
                <Link href="/watchlists" className="rounded-xl border border-slate-200 px-3 py-2 text-center text-xs font-semibold text-slate-700 hover:bg-slate-50">Manage watchlist</Link>
              </div>
            </div>
            <div className="rounded-2xl border border-slate-200 bg-gradient-to-br from-slate-50 to-white p-4">
              <h4 className="text-sm font-semibold text-slate-900">Session overview</h4>
              <ul className="mt-3 space-y-2 text-xs text-slate-600">
                <li className="flex items-center justify-between rounded-lg bg-white px-3 py-2"><span>Tracked pairs</span><strong>{dashboardData.topPairs.length}</strong></li>
                <li className="flex items-center justify-between rounded-lg bg-white px-3 py-2"><span>Active alerts</span><strong>{liveAlerts.length}</strong></li>
                <li className="flex items-center justify-between rounded-lg bg-white px-3 py-2"><span>Live feed events</span><strong>{liveActivityFeed.length}</strong></li>
              </ul>
              <p className="mt-3 text-[11px] font-medium text-slate-500">{formatLastUpdated(freshness.activityUpdatedAt)}</p>
            </div>
          </div>
        </article>

        <article className="dashboard-panel p-4">
          <h3 className="mb-3 font-semibold text-slate-900">User Activity Feed</h3>
{liveActivityFeed.length === 0 ? (
            <>
              <EmptyState title="No activity yet" message="Place your first order to unlock your activity feed and exclusive features like advanced analytics." />
              <div className="mt-4 flex flex-col sm:flex-row gap-2">
                <Link href="/dashboard/trade" className="flex-1 rounded-xl bg-emerald-600 px-6 py-3 text-center text-sm font-medium text-white shadow-sm hover:bg-emerald-700">
                  Place First Order
                </Link>
                <Link href="/tutorials" className="flex-1 rounded-xl border border-slate-200 px-6 py-3 text-center text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50">
                  Watch Tutorial
                </Link>
              </div>
            </>
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
        {/* Alerts & Notifications */}
        <div className="dashboard-panel p-4">
          <div className="flex items-center justify-between mb-6 pb-3 border-b border-slate-200">
            <div className="flex items-center gap-3">
              <div className="relative">
                <AlertCircle size={20} className="text-amber-600" />
                <div className="absolute -top-1 -right-1 w-4 h-4 bg-amber-500 border-2 border-white rounded-full flex items-center justify-center">
                  <span className="text-xs font-bold text-white">3</span>
                </div>
              </div>
              <div>
                <h3 className="font-black text-xl text-slate-900">Notifications</h3>
                <p className="text-sm text-slate-500">Live price alerts & account updates</p>
              </div>
            </div>
            <div className="flex items-center gap-2 text-sm font-semibold">
              <span className="text-emerald-600">{formatLastUpdated(freshness.alertsUpdatedAt)}</span>
              <div className="flex items-center gap-1 px-2 py-1 bg-emerald-100 text-emerald-800 rounded-full text-xs">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping" />
                Live
              </div>
            </div>
          </div>
          <div className="space-y-3">
            {liveAlerts.length > 0 ? (
              liveAlerts.map((alert) => (
                <div key={alert.id} className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border-l-4 border-amber-400">
                  <p className="text-sm font-medium text-slate-900">{alert.message}</p>
                  <p className="text-xs text-slate-500 mt-1">{new Date(alert.createdAt).toLocaleTimeString()}</p>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-sm text-slate-500">
                No alerts yet
                <div className="mt-3">
                  <Link href="/notifications" className="text-emerald-600 hover:text-emerald-700 font-medium text-xs">Manage preferences →</Link>
                </div>
              </div>
            )}
            <div className="space-y-3">
              <Link 
                href="/notifications" 
                className="group w-full block p-4 rounded-2xl bg-gradient-to-r from-emerald-500 to-emerald-600 text-center text-sm font-bold text-white shadow-lg hover:shadow-xl hover:from-emerald-600 hover:to-emerald-700 transform hover:-translate-y-0.5 transition-all duration-200"
              >
                <span>🔔 Open Notification Center</span>
                <p className="text-emerald-100 text-xs mt-1 opacity-90">Manage all alerts & preferences</p>
              </Link>
              <div className="grid grid-cols-2 gap-2 pt-2">
                <Link href="/notifications" className="p-3 rounded-lg bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 hover:shadow-md transition-all text-xs text-center font-medium text-amber-800">
                  Price Alerts
                </Link>
                <Link href="/settings" className="p-3 rounded-lg bg-gradient-to-r from-slate-50 to-slate-100 border border-slate-200 hover:shadow-md transition-all text-xs text-center font-medium text-slate-700">
                  Preferences
                </Link>
              </div>
            </div>
          </div>
        </div>

        {/* Community Engagement */}
        <div className="dashboard-panel p-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-bold text-lg text-slate-900 flex items-center gap-2">
              <Users size={18} className="text-blue-600" /> Community
            </h3>
            <div className="flex items-center gap-1 text-xs text-slate-500">
              <span>Live</span>
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            </div>
          </div>
          <div className="space-y-4">
            {/* Live Poll Results */}
            <div className="relative">
              <h4 className="font-bold text-lg text-slate-900 mb-4 flex items-center gap-2">
                <Users size={18} className="text-blue-600" />
                Community Poll
                <div className="flex items-center gap-1 px-2 py-1 bg-blue-100 text-blue-800 rounded-full text-xs font-semibold">
                  <div className="w-1.5 h-1.5 bg-blue-500 rounded-full animate-ping" />
                  Live • 1.2K votes
                </div>
              </h4>
              
              {/* Pie Chart */}
              <div className="relative mx-auto w-24 h-24 mb-4">
                <div className="absolute inset-0 rounded-full bg-gradient-to-r from-slate-100 to-slate-200 animate-spin-slow" style={{animationDuration: '20s'}} />
                <div 
                  className="w-full h-full rounded-full shadow-lg relative z-10"
                  style={{
                    background: 'conic-gradient(#10b981 0deg 244.8deg, #3b82f6 244.8deg 313.2deg, #8b5cf6 313.2deg 360deg)'
                  }}
                />
                <div className="absolute inset-0 flex items-center justify-center rounded-full bg-white shadow-inner">
                  <span className="text-2xl font-black text-slate-900">68%</span>
                </div>
              </div>
              
              {/* Legend */}
              <div className="space-y-2 mb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-emerald-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-900">BTC Analysis</span>
                  </div>
                  <span className="font-bold text-emerald-600 text-sm">68%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-blue-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-900">ETH Staking</span>
                  </div>
                  <span className="font-bold text-blue-600 text-sm">22%</span>
                </div>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-purple-500 rounded-full" />
                    <span className="text-sm font-medium text-slate-900">Altcoins</span>
                  </div>
                  <span className="font-bold text-purple-600 text-sm">10%</span>
                </div>
              </div>
              
              <div className="flex gap-2 pt-2">
                <Link href="/support/community" className="flex-1 text-xs bg-gradient-to-r from-blue-500 to-blue-600 px-4 py-2 rounded-xl text-center font-bold text-white shadow-lg hover:shadow-xl hover:from-blue-600 hover:to-blue-700 transition-all">
                  Vote Now
                </Link>
                <Link href="/support/community" className="flex-1 text-xs border border-slate-200 px-4 py-2 rounded-xl text-center font-medium text-slate-700 hover:bg-slate-50 transition-all">
                  View Results →
                </Link>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="pt-4 border-t border-slate-200">
              <div className="grid grid-cols-2 gap-2">
                <Link href="/support/community" className="p-3 rounded-lg bg-gradient-to-r from-blue-50 to-indigo-50 border hover:shadow-sm transition-all text-center text-xs">
                  <Users size={14} className="mx-auto mb-1 text-blue-600" />
                  Forum
                </Link>
                <Link href="https://discord.com" className="p-3 rounded-lg bg-gradient-to-r from-purple-50 to-pink-50 border hover:shadow-sm transition-all text-center text-xs">
                  <MessageCircle size={14} className="mx-auto mb-1 text-purple-600" />
                  Discord
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Help & Support Footer */}
      <section className="rounded-3xl border border-slate-200/50 bg-gradient-to-br from-slate-50/80 to-slate-100 p-8 shadow-2xl">
        <div className="flex items-start gap-6">
          <div className="flex-shrink-0">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-500 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          
          <div className="flex-1 space-y-6">
            <div>
              <h2 className="text-2xl font-black text-slate-900 mb-2">Need Help?</h2>
              <p className="text-lg text-slate-600">Everything you need to get started and succeed</p>
            </div>
            
            {/* Quick Links */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
              <Link href="/tutorials" className="group p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center group-hover:bg-emerald-200 transition-colors">
                    <svg className="w-5 h-5 text-emerald-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">📚 Documentation</h4>
                    <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">API guides & tutorials</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/tutorials" className="group p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-blue-100 rounded-xl flex items-center justify-center group-hover:bg-blue-200 transition-colors">
                    <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">🎥 Video Tutorials</h4>
                    <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Step-by-step guides</p>
                  </div>
                </div>
              </Link>
              
              <Link href="/support" className="group p-4 rounded-2xl bg-white border border-slate-200 hover:shadow-xl hover:border-slate-300 transition-all duration-300 hover:-translate-y-1">
                <div className="flex items-start gap-3">
                  <div className="w-10 h-10 bg-purple-100 rounded-xl flex items-center justify-center group-hover:bg-purple-200 transition-colors">
                    <svg className="w-5 h-5 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18.364 18.364A9 9 0 005.636 5.636m12.728 12.728L5.636 5.636m12.728 12.728L9.172 21.172a3 3 0 01-4.243-4.243L18.364 5.636z" />
                    </svg>
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-sm mb-1">💬 Support Chat</h4>
                    <p className="text-xs text-slate-600 group-hover:text-slate-900 transition-colors">Live help 24/7</p>
                  </div>
                </div>
              </Link>
            </div>
            
            {/* FAQs */}
            <div className="space-y-1">
              <h5 className="font-bold text-slate-900 text-base mb-3">Frequently Asked Questions</h5>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                  <span className="w-5 h-5 flex-shrink-0 bg-emerald-500 rounded-sm flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-slate-700">How do I place my first trade?</p>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">Select a pair → Enter amount → Review & confirm. Takes under 30 seconds.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3 p-3 bg-slate-50 rounded-xl hover:bg-slate-100 transition-colors cursor-pointer group">
                  <span className="w-5 h-5 flex-shrink-0 bg-emerald-500 rounded-sm flex items-center justify-center">
                    <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                    </svg>
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-slate-700">What are price alerts?</p>
                    <p className="text-slate-500 text-xs mt-1 line-clamp-2">Get notified when your watchlist assets hit target prices. Set multiple alerts per pair.</p>
                  </div>
                </div>
                <Link href="/support/faqs" className="block text-emerald-600 hover:text-emerald-700 font-semibold text-sm mt-2">View all FAQs →</Link>
              </div>
            </div>
          </div>
        </div>
      </section>
    </DashboardShell>
  );
}
