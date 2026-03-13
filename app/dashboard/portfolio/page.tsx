"use client";

import { useMemo, useState } from "react";

import AllocationPieChart from "@/components/dashboard/analytics/AllocationPieChart";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import DataTable from "@/components/dashboard/analytics/DataTable";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";
import { dashboardTokens } from "@/components/dashboard/analytics/types";

const allocation = [
  { name: "BTC", value: 40, color: "#16a34a" },
  { name: "ETH", value: 28, color: "#22c55e" },
  { name: "SOL", value: 14, color: "#84cc16" },
  { name: "Stablecoins", value: 18, color: "#a3e635" },
];

const performance = [
  { label: "Jan", value: 92 },
  { label: "Feb", value: 98 },
  { label: "Mar", value: 101 },
  { label: "Apr", value: 109 },
  { label: "May", value: 113 },
  { label: "Jun", value: 117 },
];

const holdings = [
  { asset: "Bitcoin", symbol: "BTC", allocation: "40%", price: "€62,210", value: "€124,420", pnl: "+12.5%" },
  { asset: "Ethereum", symbol: "ETH", allocation: "28%", price: "€3,010", value: "€87,870", pnl: "+8.2%" },
  { asset: "Solana", symbol: "SOL", allocation: "14%", price: "€146", value: "€43,120", pnl: "+16.4%" },
  { asset: "USDC", symbol: "USDC", allocation: "18%", price: "€1.00", value: "€56,300", pnl: "+0.1%" },
];

type HoldingsSort = "allocation" | "value" | "pnl";
type SortDirection = "asc" | "desc";

function parsePercent(value: string): number {
  return Number.parseFloat(value.replace("%", ""));
}

function parseEuro(value: string): number {
  return Number.parseFloat(value.replace("€", "").replaceAll(",", ""));
}

const riskInsights = [
  { metric: "Portfolio Volatility", value: "14.3%", status: "Moderate" },
  { metric: "Sharpe Ratio", value: "1.86", status: "Strong" },
  { metric: "Max Drawdown", value: "-8.1%", status: "Healthy" },
  { metric: "VaR (95%)", value: "€2,640", status: "Controlled" },
];

const recentActivity = [
  { type: "Rebalance", asset: "BTC / ETH", amount: "€4,000", date: "2026-03-03", result: "Completed" },
  { type: "Buy", asset: "SOL", amount: "€1,250", date: "2026-03-02", result: "Completed" },
  { type: "Take Profit", asset: "ETH", amount: "€2,100", date: "2026-03-01", result: "Completed" },
  { type: "Deposit", asset: "EUR Wallet", amount: "€5,000", date: "2026-02-27", result: "Settled" },
];

const summaryCards = [
  { label: "Total Portfolio Value", value: "€311,710", delta: "+4.6% (30d)" },
  { label: "Unrealized PnL", value: "+€22,310", delta: "+1.1% (24h)" },
  { label: "Cash & Stable Allocation", value: "18%", delta: "Target: 15-20%" },
  { label: "Next Rebalance Window", value: "In 4 days", delta: "Mar 14, 10:00 CET" },
];

const strategyNotes = [
  "Reduce BTC concentration by 2-3% over next two rebalancing windows.",
  "Increase defensive stable exposure if volatility crosses 18%.",
  "Set staggered take-profit brackets for SOL around key resistance levels.",
  "Maintain minimum cash buffer of €45,000 for event-driven opportunities.",
];

const watchlistSignals = [
  { pair: "BTC/EUR", signal: "Momentum Building", confidence: "78%", action: "Hold / Trail Stop" },
  { pair: "ETH/EUR", signal: "Breakout Watch", confidence: "71%", action: "Accumulate on Pullback" },
  { pair: "SOL/EUR", signal: "High Beta Trend", confidence: "82%", action: "Scale-Out Plan Active" },
  { pair: "LINK/EUR", signal: "Relative Strength", confidence: "64%", action: "Watchlist" },
];

export default function PortfolioPage() {
  const [holdingsSearch, setHoldingsSearch] = useState("");
  const [holdingsSort, setHoldingsSort] = useState<HoldingsSort>("allocation");
  const [holdingsDirection, setHoldingsDirection] = useState<SortDirection>("desc");

  const filteredAndSortedHoldings = useMemo(() => {
    const query = holdingsSearch.trim().toLowerCase();
    const filtered = holdings.filter((holding) => {
      if (!query) return true;
      return holding.asset.toLowerCase().includes(query) || holding.symbol.toLowerCase().includes(query);
    });

    const sorted = [...filtered].sort((a, b) => {
      let left = 0;
      let right = 0;

      if (holdingsSort === "allocation") {
        left = parsePercent(a.allocation);
        right = parsePercent(b.allocation);
      }

      if (holdingsSort === "value") {
        left = parseEuro(a.value);
        right = parseEuro(b.value);
      }

      if (holdingsSort === "pnl") {
        left = parsePercent(a.pnl);
        right = parsePercent(b.pnl);
      }

      return holdingsDirection === "asc" ? left - right : right - left;
    });

    return sorted;
  }, [holdingsSearch, holdingsSort, holdingsDirection]);

  const hasActiveHoldingControls = holdingsSearch.trim().length > 0 || holdingsSort !== "allocation" || holdingsDirection !== "desc";

  const resetHoldingsControls = () => {
    setHoldingsSearch("");
    setHoldingsSort("allocation");
    setHoldingsDirection("desc");
  };

  return (
    <DashboardShell title="Portfolio Analytics" subtitle="Allocation, performance trend, holdings, risk, and activity overview">
      <section className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {summaryCards.map((card) => (
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
        <AllocationPieChart title="Asset Allocation" data={allocation} />
        <PerformanceLineChart title="6-Month Performance" data={performance} />
      </section>

      <section className="grid gap-3 lg:grid-cols-3">
        <article
          className="rounded-2xl border p-4 lg:col-span-1"
          style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}
        >
          <h3 className="text-sm font-semibold uppercase tracking-wide" style={{ color: dashboardTokens.textMuted }}>
            Portfolio Strategy Notes
          </h3>
          <ul className="mt-3 space-y-2">
            {strategyNotes.map((note) => (
              <li key={note} className="flex gap-2 text-sm">
                <span className="mt-1 h-2 w-2 rounded-full" style={{ background: dashboardTokens.brand }} />
                <span>{note}</span>
              </li>
            ))}
          </ul>
        </article>

        <DataTable
          title="Market Watchlist Signals"
          columns={[
            { key: "pair", label: "Pair" },
            { key: "signal", label: "Signal" },
            { key: "confidence", label: "Confidence" },
            { key: "action", label: "Action" },
          ]}
          rows={watchlistSignals}
        />
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <DataTable
          title="Risk & Stability Insights"
          columns={[
            { key: "metric", label: "Metric" },
            { key: "value", label: "Current" },
            { key: "status", label: "Status" },
          ]}
          rows={riskInsights}
        />
        <DataTable
          title="Recent Portfolio Activity"
          columns={[
            { key: "type", label: "Type" },
            { key: "asset", label: "Asset" },
            { key: "amount", label: "Amount" },
            { key: "date", label: "Date" },
            { key: "result", label: "Result" },
          ]}
          rows={recentActivity}
        />
      </section>

      <section className="rounded-2xl border p-4" style={{ borderColor: dashboardTokens.border, background: dashboardTokens.panel }}>
        <div className="mb-3 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h3 className="text-sm font-semibold">Holdings</h3>
            <p className="text-xs" style={{ color: dashboardTokens.textMuted }}>
              Filter by symbol/name and sort by allocation, value, or return.
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
              onClick={resetHoldingsControls}
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
              onChange={(event) => setHoldingsSearch(event.target.value)}
              placeholder="e.g. BTC or Ethereum"
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: dashboardTokens.border }}
            />
          </label>

          <label className="text-xs" style={{ color: dashboardTokens.textMuted }}>
            Sort by
            <select
              value={holdingsSort}
              onChange={(event) => setHoldingsSort(event.target.value as HoldingsSort)}
              className="mt-1 w-full rounded-lg border bg-transparent px-3 py-2 text-sm"
              style={{ borderColor: dashboardTokens.border }}
            >
              <option value="allocation">Allocation</option>
              <option value="value">Market value</option>
              <option value="pnl">PnL</option>
            </select>
          </label>

          <label className="text-xs" style={{ color: dashboardTokens.textMuted }}>
            Direction
            <select
              value={holdingsDirection}
              onChange={(event) => setHoldingsDirection(event.target.value as SortDirection)}
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
            { key: "allocation", label: "Allocation" },
            { key: "price", label: "Price" },
            { key: "value", label: "Market Value" },
            { key: "pnl", label: "Return" },
          ]}
          rows={filteredAndSortedHoldings}
          emptyStateLabel="No holdings match your active filter."
        />
      </section>
    </DashboardShell>
  );
}
