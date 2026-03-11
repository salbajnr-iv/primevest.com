import { SupabaseClient } from "@supabase/supabase-js";
import {
  DashboardData,
  KpiMetric,
  PortfolioSummary,
  TopPairMetric,
  VolumeDataPoint,
} from "@/lib/dashboard/types";
import { fallbackDashboardData } from "@/lib/dashboard/mock-data";

const ENABLE_DASHBOARD_MOCK_FALLBACK = process.env.NEXT_PUBLIC_DASHBOARD_MOCK_FALLBACK === "true";

type ProfileRowDto = {
  full_name: string | null;
  account_balance: number | null;
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

function toRelativeTime(isoDate: string): string {
  const seconds = Math.floor((Date.now() - new Date(isoDate).getTime()) / 1000);
  if (seconds < 60) return "just now";
  if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)} hr ago`;
  return `${Math.floor(seconds / 86400)} day ago`;
}

function mapProfileToSummary(profile: ProfileRowDto | null, notificationCount: number): PortfolioSummary {
  const balance = Number(profile?.account_balance ?? fallbackDashboardData.portfolioSummary.portfolioValue);
  return {
    userName: profile?.full_name?.split(" ")[0] ?? fallbackDashboardData.portfolioSummary.userName,
    portfolioValue: balance,
    portfolioChangePct: fallbackDashboardData.portfolioSummary.portfolioChangePct,
    availableBalance: balance,
    availableBalanceChangePct: fallbackDashboardData.portfolioSummary.availableBalanceChangePct,
    notificationCount,
  };
}

function mapOrdersToKpis(rows: OrderRowDto[]): KpiMetric[] {
  if (!rows.length) return fallbackDashboardData.kpis;

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
  if (!rows.length) return fallbackDashboardData.volumeData;

  const weekdays = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
  const grouped = new Map<string, number>();
  rows.forEach((row) => {
    const day = weekdays[new Date(row.created_at).getDay()];
    grouped.set(day, (grouped.get(day) ?? 0) + 1);
  });

  return Array.from(grouped.entries()).map(([label, value]) => ({ label, value }));
}

function mapOrdersToTopPairs(rows: OrderRowDto[]): TopPairMetric[] {
  if (!rows.length) return fallbackDashboardData.topPairs;

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
  if (!rows.length) return fallbackDashboardData.activityFeed;

  return rows.slice(0, 5).map((row) => ({
    id: row.id,
    action: `${row.order_type?.toUpperCase() ?? "ORDER"} order ${row.status ?? "updated"}`,
    detail: `${row.symbol ?? "Asset"} • ${currencyFormatter.format(Number(row.total_amount ?? row.price ?? 0))}`,
    time: toRelativeTime(row.created_at),
  }));
}

function mapOrdersToPerformance(rows: OrderRowDto[]): DashboardData["performanceSeries"] {
  if (!rows.length) return fallbackDashboardData.performanceSeries;

  const sorted = [...rows].sort((a, b) => +new Date(a.created_at) - +new Date(b.created_at));
  const points = sorted.map((row, index) => ({ label: `P${index + 1}`, value: Math.round(Number(row.total_amount ?? 0) / 10) || 100 + index * 2 }));

  return {
    "7D": points.slice(-5),
    "1M": points.slice(-5),
    "3M": points.slice(-5),
  };
}

export async function getDashboardData(supabase: SupabaseClient): Promise<DashboardData> {
  const [{ data: profileData }, { count: notificationCount }, { data: ordersData }] = await Promise.all([
    supabase.from("profiles").select("full_name, account_balance").maybeSingle(),
    supabase.from("notifications").select("id", { count: "exact", head: true }),
    supabase
      .from("orders")
      .select("id, order_type, status, total_amount, price, created_at, symbol")
      .order("created_at", { ascending: false })
      .limit(20),
  ]);

  const orders = (ordersData ?? []) as OrderRowDto[];
  const profile = (profileData ?? null) as ProfileRowDto | null;

  const assembled: DashboardData = {
    portfolioSummary: mapProfileToSummary(profile, notificationCount ?? 0),
    kpis: mapOrdersToKpis(orders),
    volumeData: mapOrdersToVolumeData(orders),
    topPairs: mapOrdersToTopPairs(orders),
    activityFeed: mapOrdersToActivityFeed(orders),
    marketNews: fallbackDashboardData.marketNews,
    performanceSeries: mapOrdersToPerformance(orders),
  };

  if (!ENABLE_DASHBOARD_MOCK_FALLBACK) return assembled;

  return {
    portfolioSummary: assembled.portfolioSummary,
    kpis: assembled.kpis.length ? assembled.kpis : fallbackDashboardData.kpis,
    volumeData: assembled.volumeData.length ? assembled.volumeData : fallbackDashboardData.volumeData,
    topPairs: assembled.topPairs.length ? assembled.topPairs : fallbackDashboardData.topPairs,
    activityFeed: assembled.activityFeed.length ? assembled.activityFeed : fallbackDashboardData.activityFeed,
    marketNews: assembled.marketNews.length ? assembled.marketNews : fallbackDashboardData.marketNews,
    performanceSeries: assembled.performanceSeries,
  };
}
