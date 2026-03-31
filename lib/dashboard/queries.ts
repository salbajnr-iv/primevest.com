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
const percentFormatter = new Intl.NumberFormat("en", { signDisplay: "always", maximumFractionDigits: 2 });
const COINGECKO_URL = "https://api.coingecko.com/api/v3";

type CoinGeckoMarket = {
  id: string;
  symbol: string;
  name: string;
  current_price: number;
  price_change_percentage_24h: number | null;
  total_volume: number;
};

type CoinGeckoMarketChart = {
  prices?: [number, number][];
};

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
  // Use full name if available, fallback to email prefix, then fallback to "User"
  const userName = profile?.full_name?.trim() 
    ? profile.full_name.trim()
    : profile?.email ? profile.email.split("@")[0] : "User";
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

function mapMarketToSummary(
  profile: ProfileRowDto | null,
  notificationCount: number,
  markets: CoinGeckoMarket[],
): PortfolioSummary {
  const summary = mapProfileToSummary(profile, notificationCount);
  if (!markets.length) {
    return summary;
  }

  const changes = markets
    .map((market) => Number(market.price_change_percentage_24h ?? 0))
    .filter((value) => Number.isFinite(value));
  if (!changes.length) {
    return summary;
  }

  const avgChange = changes.reduce((sum, value) => sum + value, 0) / changes.length;
  return {
    ...summary,
    portfolioChangePct: avgChange,
    availableBalanceChangePct: avgChange,
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

function mapOrdersToTopPairs(rows: OrderRowDto[], marketBySymbol: Map<string, CoinGeckoMarket>): TopPairMetric[] {
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
    .map(([pair, metric], index) => {
      const market = marketBySymbol.get(pair.toLowerCase());
      const change24h = Number(market?.price_change_percentage_24h ?? 0);

      return {
      pair,
      volume: `€${compactFormatter.format(metric.volume)}`,
      spread: `${(0.08 + index * 0.03).toFixed(2)}%`,
      pnl: `${percentFormatter.format(change24h)}%`,
    };
    });
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

function mapCoinGeckoToKpis(markets: CoinGeckoMarket[]): KpiMetric[] {
  if (!markets.length) return [];

  const winners = markets.filter((market) => Number(market.price_change_percentage_24h ?? 0) >= 0).length;
  const losers = Math.max(0, markets.length - winners);
  const avgMove =
    markets.reduce((sum, market) => sum + Number(market.price_change_percentage_24h ?? 0), 0) / markets.length;

  return [
    {
      label: "24h Winners",
      value: Math.round((winners / markets.length) * 100),
      valueLabel: `${winners}/${markets.length}`,
      deltaLabel: "Assets trading green",
    },
    {
      label: "24h Losers",
      value: Math.round((losers / markets.length) * 100),
      valueLabel: `${losers}/${markets.length}`,
      deltaLabel: "Assets trading red",
    },
    {
      label: "Avg 24h Move",
      value: Math.min(100, Math.round(Math.abs(avgMove) * 5)),
      valueLabel: `${percentFormatter.format(avgMove)}%`,
      deltaLabel: "CoinGecko market breadth",
    },
  ];
}

function mapCoinGeckoToTopPairs(markets: CoinGeckoMarket[]): TopPairMetric[] {
  if (!markets.length) return [];

  return [...markets]
    .sort((a, b) => Number(b.total_volume ?? 0) - Number(a.total_volume ?? 0))
    .slice(0, 6)
    .map((market) => ({
      pair: `${market.symbol.toUpperCase()}/EUR`,
      volume: `€${compactFormatter.format(Number(market.total_volume ?? 0))}`,
      spread: "Live",
      pnl: `${percentFormatter.format(Number(market.price_change_percentage_24h ?? 0))}%`,
    }));
}

function mapCoinGeckoToVolumeData(markets: CoinGeckoMarket[]): VolumeDataPoint[] {
  if (!markets.length) return [];

  return [...markets]
    .sort((a, b) => Number(b.total_volume ?? 0) - Number(a.total_volume ?? 0))
    .slice(0, 7)
    .map((market) => ({
      label: market.symbol.toUpperCase(),
      value: Math.round(Number(market.total_volume ?? 0) / 1_000_000),
    }));
}

function normalizeSeries(prices: [number, number][], points: number): { label: string; value: number }[] {
  if (!prices.length) return [];

  const sliceSize = Math.min(points, prices.length);
  const sampled = prices.slice(-sliceSize);
  const first = sampled[0]?.[1] ?? 1;

  return sampled.map(([, price], index) => ({
    label: `P${index + 1}`,
    value: Math.max(0, Math.round((price / first) * 100)),
  }));
}

function mapCoinGeckoToPerformance(chart: CoinGeckoMarketChart | null): DashboardData["performanceSeries"] {
  const prices = chart?.prices ?? [];
  if (!prices.length) return { "7D": [], "1M": [], "3M": [] };

  return {
    "7D": normalizeSeries(prices, 7),
    "1M": normalizeSeries(prices, 30),
    "3M": normalizeSeries(prices, 90),
  };
}

async function fetchCoinGeckoDashboardFeed(): Promise<{
  markets: CoinGeckoMarket[];
  chart: CoinGeckoMarketChart | null;
}> {
  try {
    const [marketsResponse, chartResponse] = await Promise.all([
      fetch(
        `${COINGECKO_URL}/coins/markets?vs_currency=eur&order=market_cap_desc&per_page=12&page=1&sparkline=false&price_change_percentage=24h`,
        { cache: "no-store", headers: { accept: "application/json" } },
      ),
      fetch(`${COINGECKO_URL}/coins/bitcoin/market_chart?vs_currency=eur&days=90&interval=daily`, {
        cache: "no-store",
        headers: { accept: "application/json" },
      }),
    ]);

    const markets = marketsResponse.ok ? ((await marketsResponse.json()) as CoinGeckoMarket[]) : [];
    const chart = chartResponse.ok ? ((await chartResponse.json()) as CoinGeckoMarketChart) : null;

    return { markets, chart };
  } catch {
    return { markets: [], chart: null };
  }
}

export async function getDashboardData(
  supabase: SupabaseClient,
  userId: string,
  range: DashboardDateRange = "Last 30 days",
): Promise<DashboardData> {
  const rangeStartIso = getRangeStartIso(range);

  const [{ data: profileData }, { count: notificationCount }, { data: notificationsData }, { data: ordersData }, coinGeckoData] = await Promise.all([
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
    fetchCoinGeckoDashboardFeed(),
  ]);

  const profile = (profileData ?? null) as ProfileRowDto | null;
  if (!profile && !(ordersData?.length || notificationsData?.length)) {
    return buildEmptyDashboard();
  }

  const orders = (ordersData ?? []) as OrderRowDto[];
  const notifications = (notificationsData ?? []) as NotificationRowDto[];
  const markets = coinGeckoData.markets;
  const marketBySymbol = new Map(markets.map((market) => [market.symbol.toLowerCase(), market]));
  const nowIso = new Date().toISOString();

  const kpis = orders.length ? mapOrdersToKpis(orders) : mapCoinGeckoToKpis(markets);
  const volumeData = orders.length ? mapOrdersToVolumeData(orders) : mapCoinGeckoToVolumeData(markets);
  const topPairs = orders.length ? mapOrdersToTopPairs(orders, marketBySymbol) : mapCoinGeckoToTopPairs(markets);
  const performanceSeries = orders.length ? mapOrdersToPerformance(orders) : mapCoinGeckoToPerformance(coinGeckoData.chart);

  return {
    portfolioSummary: mapMarketToSummary(profile, notificationCount ?? 0, markets),
    kpis,
    volumeData,
    topPairs,
    activityFeed: mapOrdersToActivityFeed(orders),
    marketNews: [],
    performanceSeries,
    alerts: mapNotificationsToAlerts(notifications),
    freshness: {
      activityUpdatedAt: orders[0]?.created_at ?? nowIso,
      alertsUpdatedAt: notifications[0]?.created_at ?? nowIso,
      aggregatesUpdatedAt: nowIso,
    },
  };
}
