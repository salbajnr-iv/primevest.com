"use client";

import { useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import DashboardFilters from "@/components/dashboard/analytics/DashboardFilters";
import ExportMenu from "@/components/dashboard/analytics/ExportMenu";
import DataTable from "@/components/dashboard/analytics/DataTable";

const orders = [
  { id: "ORD-1001", side: "Buy", symbol: "BTC", amount: "0.42", total: "€12,580", status: "Completed" },
  { id: "ORD-1002", side: "Sell", symbol: "ETH", amount: "3.10", total: "€8,640", status: "Pending" },
  { id: "ORD-1003", side: "Swap", symbol: "SOL/ADA", amount: "50", total: "€6,210", status: "Completed" },
  { id: "ORD-1004", side: "Buy", symbol: "XRP", amount: "1200", total: "€1,010", status: "Cancelled" },
];

export default function OrdersPage() {
  const [side, setSide] = useState("all");
  const [status, setStatus] = useState("all");

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const sideOk = side === "all" || order.side.toLowerCase() === side;
        const statusOk = status === "all" || order.status.toLowerCase() === status;
        return sideOk && statusOk;
      }),
    [side, status],
  );

  return (
    <DashboardShell title="Orders Analytics" subtitle="Advanced filtering and export-ready order book">
      <section className="grid gap-3 lg:grid-cols-[2fr_1fr]">
        <div className="space-y-3">
          <DashboardFilters
            title="Order Type"
            active={side}
            onChange={setSide}
            filters={[
              { label: "All", value: "all" },
              { label: "Buy", value: "buy" },
              { label: "Sell", value: "sell" },
              { label: "Swap", value: "swap" },
            ]}
          />
          <DashboardFilters
            title="Status"
            active={status}
            onChange={setStatus}
            filters={[
              { label: "All", value: "all" },
              { label: "Completed", value: "completed" },
              { label: "Pending", value: "pending" },
              { label: "Cancelled", value: "cancelled" },
            ]}
          />
        </div>

        <section className="rounded-2xl border p-4" style={{ borderColor: "var(--border)", background: "var(--surface)" }}>
          <h3 className="mb-3 text-sm font-semibold">Export</h3>
          <ExportMenu title="Orders Report" rows={filtered} />
        </section>
      </section>

      <DataTable
        title="Order History"
        columns={[
          { key: "id", label: "Order ID" },
          { key: "side", label: "Type" },
          { key: "symbol", label: "Market" },
          { key: "amount", label: "Amount" },
          { key: "total", label: "Total" },
          { key: "status", label: "Status" },
        ]}
        rows={filtered}
      />
    </DashboardShell>
  );
}
