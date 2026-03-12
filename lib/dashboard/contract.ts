import type { DashboardSectionContract } from "@/lib/dashboard/types";

export const dashboardSectionContracts: DashboardSectionContract[] = [
  {
    section: "Header summary",
    source: "public.profiles, public.notifications",
    requiredFields: ["profiles.full_name", "profiles.account_balance", "notifications.id"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapProfileToSummary -> DashboardShell header",
  },
  {
    section: "KPI cards",
    source: "public.orders",
    requiredFields: ["orders.id", "orders.status", "orders.order_type", "orders.total_amount"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapOrdersToKpis -> KpiGauge",
  },
  {
    section: "Market Trends",
    source: "public.orders",
    requiredFields: ["orders.created_at", "orders.id"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapOrdersToVolumeData -> MetricsBarChart",
  },
  {
    section: "Performance chart",
    source: "public.orders",
    requiredFields: ["orders.created_at", "orders.total_amount"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapOrdersToPerformance -> PerformanceLineChart",
  },
  {
    section: "News and insights",
    source: "fallbackDashboardData.marketNews",
    requiredFields: ["marketNews[].id", "marketNews[].text"],
    refreshCadence: "interval",
    ownership: "fallback dataset -> News and Insights strip",
  },
  {
    section: "Top Markets table",
    source: "public.orders",
    requiredFields: ["orders.symbol", "orders.total_amount", "orders.status"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapOrdersToTopPairs -> DataTable",
  },
  {
    section: "User Activity Feed (initial)",
    source: "public.orders",
    requiredFields: ["orders.id", "orders.order_type", "orders.status", "orders.symbol", "orders.total_amount", "orders.price", "orders.created_at"],
    refreshCadence: "on-load",
    ownership: "getDashboardData -> mapOrdersToActivityFeed -> activity feed",
  },
  {
    section: "User Activity Feed (live)",
    source: "public.orders realtime postgres_changes INSERT",
    requiredFields: ["orders.id", "orders.total_amount"],
    refreshCadence: "realtime",
    ownership: "DashboardClient realtime subscription -> activity feed",
  },
];
