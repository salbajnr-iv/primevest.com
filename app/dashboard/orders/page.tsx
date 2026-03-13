"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import DashboardFilters from "@/components/dashboard/analytics/DashboardFilters";
import ExportMenu from "@/components/dashboard/analytics/ExportMenu";
import DataTable from "@/components/dashboard/analytics/DataTable";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";
import { useAuth } from "@/contexts/AuthContext";

interface OrderRow {
  id: string;
  side: string;
  symbol: string;
  amount: string;
  total: string;
  status: string;
}

export default function OrdersPage() {
  const { session } = useAuth();
  const [side, setSide] = useState("all");
  const [status, setStatus] = useState("all");
  const [orders, setOrders] = useState<OrderRow[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch("/api/orders/history", {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to fetch order history");
      }
      setOrders(Array.isArray(payload.orders) ? payload.orders : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load order history");
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  useEffect(() => {
    void loadOrders();
  }, [loadOrders]);

  const filtered = useMemo(
    () =>
      orders.filter((order) => {
        const sideOk = side === "all" || order.side.toLowerCase() === side;
        const statusOk = status === "all" || order.status.toLowerCase() === status;
        return sideOk && statusOk;
      }),
    [orders, side, status],
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

      {isLoading ? (
        <LoadingSpinner text="Loading order history..." className="py-10" />
      ) : error ? (
        <ErrorState title="Unable to load orders" message={error} onRetry={() => void loadOrders()} />
      ) : filtered.length === 0 ? (
        <EmptyState title="No orders found" message="Try changing filters or place a new order." />
      ) : (
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
      )}
    </DashboardShell>
  );
}
