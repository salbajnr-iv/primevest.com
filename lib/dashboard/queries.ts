import { SupabaseClient } from "@supabase/supabase-js";
import {
  AlertNotificationItem,
  DashboardData,
  DashboardDateRange,
  KpiMetric,
  PortfolioSummary,
  TopPairMetric,
  VolumeDataPoint,
} from "@/lib/dashboard/types";

type ProfileRowDto = {
  id: string;
  full_name: string | null;
  account_balance: number | null;
};

type NotificationRowDto = {
  id: string;
  message: string | null;
  created_at: string;
};

type OrderRowDto = {
  id: string;
  order_type: string | null;
  status: string | null;
  total_amount: number | null;
  price: number | null;
  created_at: string;
  symbol: string | null;
};

const currencyFormatter = new Intl.NumberFormat("en-IE", { style: "currency", currency: "EUR", maximumFractionDigits: 2 });
const compactFormatter = new Intl.NumberFormat("en", { notation: "compact", maximumFractionDigits: 1 });

function getRangeStartIso(range: DashboardDateRange, now = new Date()): string {
  const start = new Date(now);

  if (range === "Today") {
    start.setHours(0, 0, 0, 0);
  } else if (range === "Last 7 days") {
    start.setDate(start.getDate() - 7);
  } else if (range === "Last quarter") {
    start.setMonth(start.getMonth() - 3);
  } else {
    start.setDate(start.getDate() - 30);
  }

  return start.toISOString();
}

function toRelativeTime(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
}

function buildEmptyDashboard(userName = "User"): DashboardData {
  const now = new Date().toISOString();
  return {
    portfolioSummary: {
      userName,
      portfolioValue: 0,
      portfolioChangePct: 0,
      availableBalance: 0,
      availableBalanceChangePct: 0,
      notificationCount: 0,
    },
    kpis: [],
    volumeData: [],
    topPairs: [],
    activityFeed: [],
    marketNews: [],
    performanceSeries: { "7D": [], "1M": [], "3M": [] },
    alerts: [],
    freshness: {
      activityUpdatedAt: now,
      alertsUpdatedAt: now,
      aggregatesUpdatedAt: now,
    },
  };
}

function mapProfileToSummary(profile: ProfileRowDto | null, notificationCount: number): PortfolioSummary {
  const userName = profile?.full_name?.split(" ")[0] ?? "User";
  const balance = Number(profile?.account_balance ?? 0);
  return {
    userName,
    portfolioValue: balance,
    portfolioChangePct: 0,
    availableBalance: balance,
    availableBalanceChangePct: 0,
    notificationCount,
  };
}

function mapOrdersToKpis(rows: OrderRowDto[]): KpiMetric[] {
  if (!rows.length) return [];

  const completed = rows.filter((row) => row.status === "completed").length;
  const fillRate = Math.round((completed / rows.length) * 100);
  const avgTicket = rows.reduce((sum, row) => sum + Number(row.total_amount ?? 0), 0) / rows.length;
  const buyRatio = Math.round((rows.filter((row) => row.order_type === "buy").length / rows.length) * 100);

  return [
    { label: "Order Fill Rate", value: fillRate, valueLabel: `${fillRate}%`, deltaLabel: `${completed}/${rows.length} completed` },
    { label: "Average Ticket", value: Math.min(100, Math.round(avgTicket / 100)), valueLabel: currencyFormatter.format(avgTicket), deltaLabel: "Avg order size" },
    { label: "Buy-side Ratio", value: buyRatio, valueLabel: `${buyRatio}%`, deltaLabel: "Share of buy orders" },
  ];
}

function mapOrdersToVolumeData(rows: OrderRowDto[]): VolumeDataPoint[] {
  if (!rows.length) return [];

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = new Map<string, number>();
  rows.forEach((row) => {
    const day = weekdays[new Date(row.created_at).getDay()];
    grouped.set(day, (grouped.get(day) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }));
}

function mapOrdersToTopPairs(rows: OrderRowDto[]): TopPairMetric[] {
  if (!rows.length) return [];

  const aggregated = new Map<string, { volume: number; pnl: number }>();
  rows.forEach((row) => {
    const pair = row.symbol ?? "N/A";
    const current = aggregated.get(pair) ?? { volume: 0, pnl: 0 };
    current.volume += Number(row.total_amount ?? 0);
    current.pnl += row.status === "completed" ? Number(row.total_amount ?? 0) * 0.01 : 0;
    aggregated.set(pair, current);
  });

  return Array.from(aggregated.entries())
    .sort(([, left], [, right]) => right.volume - left.volume)
    .slice(0, 3)
    .map(([pair, metric], index) => ({
      pair,
      volume: `€${compactFormatter.format(metric.volume)}`,
      spread: `${(0.08 + index * 0.03).toFixed(2)}%`,
      pnl: `+${currencyFormatter.format(metric.pnl)}`,
    }));
}

function mapOrdersToActivityFeed(rows: OrderRowDto[]): DashboardData["activityFeed"] {
  if (!rows.length) return [];

  return rows.slice(0, 5).map((row) => ({
    id: row.id,
    action: `${row.order_type?.toUpperCase() ?? "ORDER"} order ${row.status ?? "updated"}`,
    detail: `${row.symbol ?? "Asset"} • ${currencyFormatter.format(Number(row.total_amount ?? row.price ?? 0))}`,
    time: toRelativeTime(row.created_at),
  }));
}

function mapNotificationsToAlerts(rows: NotificationRowDto[]): AlertNotificationItem[] {
  if (!rows.length) return [];

  return rows.slice(0, 3).map((row) => ({
    id: row.id,
    message: row.message ?? "New account notification",
    createdAt: row.created_at,
  }));
}

function mapOrdersToPerformance(rows: OrderRowDto[]): DashboardData["performanceSeries"] {
  if (!rows.length) return { "7D": [], "1M": [], "3M": [] };

  const sorted = [...rows].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const points = sorted.map((row, index) => ({ label: `P${index + 1}`, value: Math.round(Number(row.total_amount ?? 0) / 10) || 100 + index * 2 }));

  return {
    "7D": points.slice(-5),
    "1M": points.slice(-5),
    "3M": points.slice(-5),
  };
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
  range: DashboardDateRange = "Last 30 days",
): Promise<DashboardData> {
  const rangeStartIso = getRangeStartIso(range);

  const [{ data: profileData }, { count: notificationCount }, { data: notificationsData }, { data: ordersData }] = await Promise.all([
    supabase.from("profiles").select("id, full_name, account_balance").eq("id", userId).maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }).eq("user_id", userId),
    supabase
      .from("notifications")
      .select("id, message, created_at")
      .eq("user_id", userId)
      .gte("created_at", rangeStartIso)
      .order("created_at", { ascending: false })
      .limit(5),
    supabase
      .from("orders")
      .select("id, order_type, status, total_amount, price, created_at, symbol")
      .eq("user_id", userId)
      .gte("created_at", rangeStartIso)
      .order("created_at", { ascending: false })
      .limit(120),
  ]);

  const profile = (profileData ?? null) as ProfileRowDto | null;
  if (!profile && !(ordersData?.length || notificationsData?.length)) {
    return buildEmptyDashboard();
  }

  const orders = (ordersData ?? []) as OrderRowDto[];
  const notifications = (notificationsData ?? []) as NotificationRowDto[];
  const nowIso = new Date().toISOString();

  return {
    portfolioSummary: mapProfileToSummary(profile, notificationCount ?? 0),
    kpis: mapOrdersToKpis(orders),
    volumeData: mapOrdersToVolumeData(orders),
    topPairs: mapOrdersToTopPairs(orders),
    activityFeed: mapOrdersToActivityFeed(orders),
    marketNews: [],
    performanceSeries: mapOrdersToPerformance(orders),
    alerts: mapNotificationsToAlerts(notifications),
    freshness: {
      activityUpdatedAt: orders[0]?.created_at ?? nowIso,
      alertsUpdatedAt: notifications[0]?.created_at ?? nowIso,
      aggregatesUpdatedAt: nowIso,
    },
  };
}
