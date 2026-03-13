import type { DashboardSectionContract } from "@/lib/dashboard/types";

export const dashboardSectionContracts: DashboardSectionContract[] = [
  {
    section: "Header summary",
    source: "public.profiles, public.notifications",
    requiredFields: ["profiles.full_name", "profiles.account_balance", "notifications.id"],
    refreshCadence: "periodic",
    ownership: "getDashboardData -> mapProfileToSummary -> DashboardShell header",
  },
  {
    section: "KPI cards",
    source: "public.orders",
    requiredFields: ["orders.id", "orders.status", "orders.order_type", "orders.total_amount"],
    refreshCadence: "periodic",
    ownership: "getDashboardData -> mapOrdersToKpis -> KpiGauge",
  },
  {
    section: "Market Trends",
    source: "public.orders",
    requiredFields: ["orders.created_at", "orders.id"],
    refreshCadence: "realtime",
    ownership: "getDashboardData -> mapOrdersToVolumeData -> MetricsBarChart",
  },
  {
    section: "Performance chart",
    source: "public.orders",
    requiredFields: ["orders.created_at", "orders.total_amount"],
    refreshCadence: "periodic",
    ownership: "getDashboardData -> mapOrdersToPerformance -> PerformanceLineChart",
  },
  {
    section: "News and insights",
    source: "fallbackDashboardData.marketNews",
    requiredFields: ["marketNews[].id", "marketNews[].text"],
    refreshCadence: "periodic",
    ownership: "fallback dataset -> News and Insights strip",
  },
  {
    section: "Top Markets table",
    source: "public.orders",
    requiredFields: ["orders.symbol", "orders.total_amount", "orders.status"],
    refreshCadence: "on-demand",
    ownership: "getDashboardData -> mapOrdersToTopPairs -> DataTable",
  },
  {
    section: "User Activity Feed",
    source: "public.orders realtime postgres_changes INSERT",
    requiredFields: ["orders.id", "orders.total_amount", "orders.symbol", "orders.created_at"],
    refreshCadence: "realtime",
    ownership: "DashboardClient realtime subscription -> activity feed",
  },
  {
    section: "Alerts & Notifications",
    source: "public.notifications realtime postgres_changes INSERT",
    requiredFields: ["notifications.id", "notifications.message", "notifications.created_at"],
    refreshCadence: "realtime",
    ownership: "DashboardClient realtime subscription -> Alerts card",
  },
  {
    section: "Reports & Tables",
    source: "server fetched report endpoints",
    requiredFields: ["filters", "pagination", "sort"],
    refreshCadence: "on-demand",
    ownership: "reports/tables via user-triggered fetch",
  },
];
