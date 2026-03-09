"use client";

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

const perfData = [
  { label: "W1", value: 100 },
  { label: "W2", value: 105 },
  { label: "W3", value: 103 },
  { label: "W4", value: 111 },
  { label: "W5", value: 116 },
];

const topPairs = [
  { pair: "BTC/EUR", volume: "€1.2M", spread: "0.09%", pnl: "+€8,210" },
  { pair: "ETH/EUR", volume: "€860K", spread: "0.12%", pnl: "+€4,144" },
  { pair: "SOL/EUR", volume: "€510K", spread: "0.22%", pnl: "+€1,982" },
];

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <DashboardShell title="Analytics Overview" subtitle="Unified KPI, chart, and trading snapshot">
      <section className="grid gap-3 md:grid-cols-3">
        {kpis.map((kpi) => <KpiGauge key={kpi.label} {...kpi} />)}
      </section>

      <section className="grid gap-3 lg:grid-cols-2">
        <MetricsBarChart title="Daily Filled Orders" data={volumeData} />
        <PerformanceLineChart title="Portfolio Performance" data={perfData} />
      </section>

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
    </DashboardShell>
  );
}
