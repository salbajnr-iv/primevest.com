"use client";

import AllocationPieChart from "@/components/dashboard/analytics/AllocationPieChart";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import DataTable from "@/components/dashboard/analytics/DataTable";
import PerformanceLineChart from "@/components/dashboard/analytics/PerformanceLineChart";

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
  { asset: "Bitcoin", allocation: "40%", price: "€62,210", value: "€124,420", pnl: "+12.5%" },
  { asset: "Ethereum", allocation: "28%", price: "€3,010", value: "€87,870", pnl: "+8.2%" },
  { asset: "Solana", allocation: "14%", price: "€146", value: "€43,120", pnl: "+16.4%" },
  { asset: "USDC", allocation: "18%", price: "€1.00", value: "€56,300", pnl: "+0.1%" },
];

export default function PortfolioPage() {
  return (
    <DashboardShell title="Portfolio Analytics" subtitle="Allocation, performance trend, and holdings insights">
      <section className="grid gap-3 lg:grid-cols-2">
        <AllocationPieChart title="Asset Allocation" data={allocation} />
        <PerformanceLineChart title="6-Month Performance" data={performance} />
      </section>

      <DataTable
        title="Holdings"
        columns={[
          { key: "asset", label: "Asset" },
          { key: "allocation", label: "Allocation" },
          { key: "price", label: "Price" },
          { key: "value", label: "Market Value" },
          { key: "pnl", label: "Return" },
        ]}
        rows={holdings}
      />
    </DashboardShell>
  );
}
