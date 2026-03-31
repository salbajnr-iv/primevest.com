"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import AllocationPieChart from "@/components/dashboard/analytics/AllocationPieChart";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import DataTable from "@/components/dashboard/analytics/DataTable";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";
import { dashboardTokens } from "@/components/dashboard/analytics/types";
import { createClient } from "@/lib/supabase/client";
import type { PortfolioSummary } from "@/lib/dashboard/types";

interface PortfolioAsset {
  symbol: string;
  name: string;
  holdings: number;
  value: number;
  change: number;
  priceEur: number;
}

interface OrderRow {
  id: string;
  side: string;
  symbol: string;
  amount: string;
  total: string;
  status: string;
}

interface PerformancePoint {
  timestamp: string;
  portfolioValue: number;
}

type HoldingsSort = "allocation" | "value" | "pnl";
type SortDirection = "asc" | "desc";

const CHART_COLORS = [
  "#16a34a", "#22c55e", "#84cc16", "#a3e635", "#4ade80",
  "#2563eb", "#7c3aed", "#db2777", "#ea580c", "#ca8a04",
];

const EMPTY_SUMMARY: PortfolioSummary = {
  userName: "User",
  portfolioValue: 0,
  portfolioChangePct: 0,
  availableBalance: 0,
  availableBalanceChangePct: 0,
  notificationCount: 0,
};

const euroFmt = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const pctFmt = new Intl.NumberFormat("en", { signDisplay: "always", maximumFractionDigits: 2 });

function SkeletonCard() {
  return (
    <div className="rounded-2xl border p-4 animate-pulse" style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}>
      <div className="h-3 w-24 rounded bg-gray-200 mb-3" />
      <div className="h-7 w-32 rounded bg-gray-200 mb-2" />
      <div className="h-3 w-20 rounded bg-gray-200" />
    </div>
  );
}

export default function PortfolioPage() {
  const [portfolio, setPortfolio] = useState<PortfolioAsset[]>([]);
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [perfPoints, setPerfPoints] = useState<{ label: string; value: number }[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [holdingsSearch, setHoldingsSearch] = useState("");
  const [holdingsSort, setHoldingsSort] = useState<HoldingsSort>("allocation");
  const [holdingsDirection, setHoldingsDirection] = useState<SortDirection>("desc");

  const fetchData = useCallback(async () => {
    try {
      const [portfolioRes, ordersRes, perfRes] = await Promise.all([
        fetch("/api/portfolio"),
        fetch("/api/orders/history"),
        fetch("/api/dashboard/performance?period=7D"),
      ]);

      if (portfolioRes.status === 401) {
        setError("Please sign in to view your portfolio.");
        setLoading(false);
        return;
      }

      const portfolioData = portfolioRes.ok ? (await portfolioRes.json() as PortfolioAsset[]) : [];
      const ordersData = ordersRes.ok ? (await ordersRes.json() as { ok: boolean; orders?: OrderRow[] }) : { ok: false };
      const perfData = perfRes.ok ? (await perfRes.json() as { ok: boolean; data?: { performance?: { points: PerformancePoint[] } } }) : { ok: false };

      setPortfolio(Array.isArray(portfolioData) ? portfolioData : []);
      setOrders(ordersData.ok && ordersData.orders ? ordersData.orders.slice(0, 10) : []);

      const rawPoints = perfData.ok ? (perfData.data?.performance?.points ?? []) : [];
      if (rawPoints.length > 0) {
        const firstVal = rawPoints[0].portfolioValue || 1;
        setPerfPoints(
          rawPoints.map((p, i) => ({
            label: `P${i + 1}`,
            value: Math.max(0, Math.round((p.portfolioValue / firstVal) * 100)),
          }))
        );
      } else {
        setPerfPoints([]);
      }

      setError(null);
    } catch {
      setError("Failed to load portfolio data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    void fetchData();
  }, [fetchData]);

  useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("portfolio-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "balances" }, () => {
        void fetchData();
      })
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "orders" }, () => {
        void fetchData();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchData]);

  const totalValue = useMemo(() => portfolio.reduce((sum, a) => sum + a.value, 0), [portfolio]);

  const allocation = useMemo(() =>
    portfolio.map((asset, i) => ({
      name: asset.symbol,
      value: totalValue > 0 ? Math.round((asset.value / totalValue) * 100) : 0,
      color: CHART_COLORS[i % CHART_COLORS.length],
    })),
    [portfolio, totalValue]
  );

  const avgChange = useMemo(() => {
    if (!portfolio.length) return 0;
    return portfolio.reduce((sum, a) => sum + a.change, 0) / portfolio.length;
  }, [portfolio]);

  const summary: PortfolioSummary = useMemo(() => ({
    userName: "User",
    portfolioValue: totalValue,
    portfolioChangePct: avgChange,
    availableBalance: totalValue,
    availableBalanceChangePct: avgChange,
    notificationCount: 0,
  }), [totalValue, avgChange]);

  const holdingsTableRows = useMemo(() => {
    const query = holdingsSearch.trim().toLowerCase();
    const filtered = portfolio.filter((a) =>
      !query || a.name.toLowerCase().includes(query) || a.symbol.toLowerCase().includes(query)
    );

    return [...filtered].sort((a, b) => {
      const allocA = totalValue > 0 ? a.value / totalValue : 0;
      const allocB = totalValue > 0 ? b.value / totalValue : 0;

      let left = 0;
      let right = 0;
      if (holdingsSort === "allocation") { left = allocA; right = allocB; }
      if (holdingsSort === "value") { left = a.value; right = b.value; }
      if (holdingsSort === "pnl") { left = a.change; right = b.change; }

      return holdingsDirection === "asc" ? left - right : right - left;
    }).map((a) => ({
      asset: a.name,
      symbol: a.symbol,
      holdings: `${a.holdings.toLocaleString("de-DE", { maximumFractionDigits: 8 })} ${a.symbol}`,
      price: euroFmt.format(a.priceEur),
      value: euroFmt.format(a.value),
      allocation: totalValue > 0 ? `${((a.value / totalValue) * 100).toFixed(1)}%` : "0%",
      pnl: `${pctFmt.format(a.change)}%`,
    }));
  }, [portfolio, holdingsSearch, holdingsSort, holdingsDirection, totalValue]);

  const recentActivityRows = useMemo(() =>
    orders.map((o) => ({
      type: o.side,
      asset: o.symbol,
      amount: o.total,
      date: o.id.replace("ORD-", "").slice(0, 8),
      result: o.status,
    })),
    [orders]
  );

  const summaryCards = useMemo(() => [
    {
      label: "Total Portfolio Value",
      value: loading ? "—" : euroFmt.format(totalValue),
      delta: loading ? "" : `${pctFmt.format(avgChange)}% (24h avg)`,
    },
    {
      label: "Assets Held",
      value: loading ? "—" : String(portfolio.length),
      delta: portfolio.length > 0 ? "Across all positions" : "No positions yet",
    },
    {
      label: "Best Performer (24h)",
      value: loading ? "—" : portfolio.length > 0
        ? `${[...portfolio].sort((a, b) => b.change - a.change)[0]?.symbol ?? "—"}`
        : "—",
      delta: portfolio.length > 0
        ? `${pctFmt.format([...portfolio].sort((a, b) => b.change - a.change)[0]?.change ?? 0)}%`
        : "No data",
    },
    {
      label: "Worst Performer (24h)",
      value: loading ? "—" : portfolio.length > 0
        ? `${[...portfolio].sort((a, b) => a.change - b.change)[0]?.symbol ?? "—"}`
        : "—",
      delta: portfolio.length > 0
        ? `${pctFmt.format([...portfolio].sort((a, b) => a.change - b.change)[0]?.change ?? 0)}%`
        : "No data",
    },
  ], [loading, totalValue, avgChange, portfolio]);

  const hasActiveHoldingControls = holdingsSearch.trim().length > 0 || holdingsSort !== "allocation" || holdingsDirection !== "desc";

  if (error) {
    return (
      <DashboardShell title="Portfolio Analytics" subtitle="Allocation, performance, holdings and activity" summary={EMPTY_SUMMARY}>
        <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-center text-sm text-red-700">
          {error}
        </div>
      </DashboardShell>
    );
  }

  return (
    <DashboardShell title="Portfolio Analytics" subtitle="Allocation, performance, holdings and activity" summary={summary}>
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {loading
          ? Array.from({ length: 4 }).map((_, i) => <SkeletonCard key={i} />)
          : summaryCards.map((card) => (
            <article
              key={card.label}
              className="rounded-2xl border p-4"
              style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}
            >
              <p className="text-xs font-medium uppercase tracking-wide" style={{ color: dashboardTokens.textMuted }}>
                {card.label}
              </p>
              <p className="mt-2 text-2xl font-semibold">{card.value}</p>
              <p className="mt-2 text-xs" style={{ color: dashboardTokens.textMuted }}>
                {card.delta}
              </p>
            </article>
          ))}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        {allocation.length > 0 ? (
          <AllocationPieChart title="Asset Allocation (Live)" data={allocation} />
        ) : (
          <div
            className="rounded-2xl border p-8 flex items-center justify-center text-sm"
            style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel, color: dashboardTokens.textMuted }}
          >
            {loading ? "Loading allocation..." : "No holdings yet. Start trading to see your allocation."}
          </div>
        )}

        {perfPoints.length > 0 ? (
          <PerformanceLineChart title="7-Day Performance (Live)" data={perfPoints} />
        ) : (
          <div
            className="rounded-2xl border p-8 flex items-center justify-center text-sm"
            style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel, color: dashboardTokens.textMuted }}
          >
            {loading ? "Loading performance..." : "No performance data yet. Start trading to see your chart."}
          </div>
        )}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <DataTable
          title="Recent Order Activity (Live)"
          columns={[
            { key: "type", label: "Type" },
            { key: "asset", label: "Asset" },
            { key: "amount", label: "Amount" },
            { key: "result", label: "Status" },
          ]}
          rows={recentActivityRows}
          emptyStateLabel={loading ? "Loading activity..." : "No recent orders. Place your first trade to see activity here."}
        />

        <div
          className="rounded-2xl border p-4"
          style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide mb-3" style={{ color: dashboardTokens.textMuted }}>
            Live Price Snapshot
          </h3>
          {loading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <div key={i} className="h-10 rounded bg-gray-100 animate-pulse" />)}
            </div>
          ) : portfolio.length > 0 ? (
            <ul className="space-y-2">
              {portfolio.slice(0, 8).map((asset) => (
                <li key={asset.symbol} className="flex items-center justify-between rounded-lg bg-gray-50 px-3 py-2">
                  <div>
                    <span className="text-sm font-semibold text-gray-900">{asset.symbol}</span>
                    <span className="ml-2 text-xs text-gray-500">{asset.name}</span>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{euroFmt.format(asset.priceEur)}</p>
                    <p className={`text-xs font-semibold ${asset.change >= 0 ? "text-emerald-600" : "text-rose-600"}`}>
                      {pctFmt.format(asset.change)}%
                    </p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm text-center py-6" style={{ color: dashboardTokens.textMuted }}>
              No assets in portfolio. Deposit funds and start trading.
            </p>
          )}
        </div>
      </section>

      <section className="rounded-2xl border p-4" style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Holdings (Live)</h3>
            <p className="text-xs" style={{ color: dashboardTokens.textMuted }}>
              Real-time data from your Supabase balances. Filter by symbol/name and sort by allocation, value, or return.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2 text-xs">
            <span className="rounded-full border px-2 py-1" style={{ borderColor: dashboardTokens.border, color: dashboardTokens.textMuted }}>
              Sort: {holdingsSort} ({holdingsDirection})
            </span>
            <span className="rounded-full border px-2 py-1" style={{ borderColor: dashboardTokens.border, color: dashboardTokens.textMuted }}>
              Filter: {holdingsSearch.trim() || "none"}
            </span>
            <button
              type="button"
              onClick={() => { setHoldingsSearch(""); setHoldingsSort("allocation"); setHoldingsDirection("desc"); }}
              disabled={!hasActiveHoldingControls}
              className="rounded-lg border px-3 py-1.5 disabled:cursor-not-allowed disabled:opacity-50"
              style={{ borderColor: dashboardTokens.border }}
            >
              Reset controls
            </button>
          </div>
        </div>

        <div className="mb-3 grid gap-2 sm:grid-cols-3">
          <label className="text-xs" style={{ color: dashboardTokens.textMuted }}>
            Search asset or symbol
            <input
              value={holdingsSearch}
              onChange={(e) => setHoldingsSearch(e.target.value)}
              placeholder="e.g. BTC or Bitcoin"
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: dashboardTokens.border }}
            />
          </label>

          <label className="text-xs" style={{ color: dashboardTokens.textMuted }}>
            Sort by
            <select
              value={holdingsSort}
              onChange={(e) => setHoldingsSort(e.target.value as HoldingsSort)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: dashboardTokens.border }}
            >
              <option value="allocation">Allocation</option>
              <option value="value">Market value</option>
              <option value="pnl">24h Return</option>
            </select>
          </label>

          <label className="text-xs" style={{ color: dashboardTokens.textMuted }}>
            Direction
            <select
              value={holdingsDirection}
              onChange={(e) => setHoldingsDirection(e.target.value as SortDirection)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: dashboardTokens.border }}
            >
              <option value="desc">High to low</option>
              <option value="asc">Low to high</option>
            </select>
          </label>
        </div>

        <DataTable
          title="Holdings breakdown"
          columns={[
            { key: "asset", label: "Asset" },
            { key: "symbol", label: "Symbol" },
            { key: "holdings", label: "Holdings" },
            { key: "price", label: "Price (EUR)" },
            { key: "value", label: "Market Value" },
            { key: "allocation", label: "Allocation" },
            { key: "pnl", label: "24h Return" },
          ]}
          rows={holdingsTableRows}
          emptyStateLabel={
            loading
              ? "Loading holdings..."
              : holdingsSearch
              ? "No holdings match your filter."
              : "No holdings yet. Deposit funds and trade to see your portfolio here."
          }
        />
      </section>
    </DashboardShell>
  );
}
