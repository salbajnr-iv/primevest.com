import {
  ActivityFeedItem,
  ActivityItem,
  DashboardData,
  KpiMetric,
  NewsHeadline,
  AlertNotificationItem,
  OrderHistoryItem,
  PerformanceSeriesResponse,
  PortfolioSummary,
  TopPairMetric,
  VolumeDataPoint,
} from "@/lib/dashboard/types";

export const portfolioSummary: PortfolioSummary = {
  userName: "User",
  portfolioValue: 12540.5,
  portfolioChangePct: 2.41,
  availableBalance: 8240.5,
  availableBalanceChangePct: 1.2,
  notificationCount: 3,
};

export const dashboardKpis: KpiMetric[] = [
  { label: "Portfolio Health", value: 86, valueLabel: "86/100", deltaLabel: "+3.5% vs last week" },
  { label: "Order Fill Rate", value: 92, valueLabel: "92%", deltaLabel: "+1.2% this month" },
  { label: "Risk Coverage", value: 74, valueLabel: "74%", deltaLabel: "Needs rebalance" },
];

export const dashboardVolumeData: VolumeDataPoint[] = [
  { label: "Mon", value: 12 },
  { label: "Tue", value: 18 },
  { label: "Wed", value: 9 },
  { label: "Thu", value: 21 },
  { label: "Fri", value: 25 },
];

export const dashboardTopPairs: TopPairMetric[] = [
  { pair: "BTC/EUR", volume: "€1.2M", spread: "0.09%", pnl: "+€8,210" },
  { pair: "ETH/EUR", volume: "€860K", spread: "0.12%", pnl: "+€4,144" },
  { pair: "SOL/EUR", volume: "€510K", spread: "0.22%", pnl: "+€1,982" },
];

export const dashboardActivityFeed: ActivityFeedItem[] = [
  { id: "activity-1", action: "Limit order executed", detail: "Bought 0.12 BTC at €58,240", time: "2 min ago" },
  { id: "activity-2", action: "Risk alert resolved", detail: "Hedging ratio back above 70%", time: "18 min ago" },
  { id: "activity-3", action: "Portfolio rebalance", detail: "Moved 8% from BTC to ETH", time: "1 hr ago" },
];

export const dashboardMarketNews: NewsHeadline[] = [
  { id: "news-1", text: "ECB signals slower pace of rate cuts, risk assets steady." },
  { id: "news-2", text: "Bitcoin ETF inflows rise for the fourth consecutive day." },
  { id: "news-3", text: "Gold and crypto correlation drops to monthly lows." },
];

export const dashboardAlerts: AlertNotificationItem[] = [
  { id: "alert-1", message: "Price alert: BTC crossed €58,000.", createdAt: "2026-02-08T14:30:00.000Z" },
  { id: "alert-2", message: "Risk threshold warning for SOL allocation.", createdAt: "2026-02-08T12:10:00.000Z" },
];

export const dashboardFreshness = {
  activityUpdatedAt: new Date().toISOString(),
  alertsUpdatedAt: new Date().toISOString(),
  aggregatesUpdatedAt: new Date().toISOString(),
};

export const dashboardPerformanceSeries: DashboardData["performanceSeries"] = {
  "7D": [
    { label: "D1", value: 108 },
    { label: "D2", value: 112 },
    { label: "D3", value: 111 },
    { label: "D4", value: 115 },
    { label: "D5", value: 117 },
  ],
  "1M": [
    { label: "W1", value: 100 },
    { label: "W2", value: 105 },
    { label: "W3", value: 103 },
    { label: "W4", value: 111 },
    { label: "W5", value: 116 },
  ],
  "3M": [
    { label: "M1", value: 95 },
    { label: "M2", value: 101 },
    { label: "M3", value: 116 },
    { label: "M4", value: 123 },
    { label: "M5", value: 130 },
  ],
};

export const fallbackDashboardData: DashboardData = {
  portfolioSummary,
  kpis: dashboardKpis,
  volumeData: dashboardVolumeData,
  topPairs: dashboardTopPairs,
  activityFeed: dashboardActivityFeed,
  marketNews: dashboardMarketNews,
  performanceSeries: dashboardPerformanceSeries,
  alerts: dashboardAlerts,
  freshness: dashboardFreshness,
};

export const recentActivity: ActivityItem[] = [
  { id: "DEP-94821", type: "Deposit", amountLabel: "+500.00 €", status: "completed", href: "/dashboard/deposit", createdAt: "2026-02-08T14:32:00.000Z" },
  { id: "BUY-94807", type: "Buy BTC", amountLabel: "-250.00 €", status: "completed", href: "/dashboard/buy", createdAt: "2026-02-08T10:12:00.000Z" },
  { id: "SWP-94791", type: "Swap ETH → BTC", amountLabel: "0.14 ETH", status: "pending", href: "/dashboard/swap", createdAt: "2026-02-07T18:40:00.000Z" },
];

export const orderHistory: OrderHistoryItem[] = [
  { id: "1", type: "buy", asset: "Bitcoin", symbol: "BTC", amount: 0.25, priceLabel: "€42,156.00", total: 10539, currency: "EUR", createdAt: "2026-02-08T14:32:00.000Z", status: "completed" },
  { id: "2", type: "sell", asset: "Ethereum", symbol: "ETH", amount: 2.0, priceLabel: "€3,261.80", total: 6523.6, currency: "EUR", createdAt: "2026-02-07T11:15:00.000Z", status: "completed" },
  { id: "3", type: "buy", asset: "Solana", symbol: "SOL", amount: 10.0, priceLabel: "€156.72", total: 1567.2, currency: "EUR", createdAt: "2026-02-06T09:45:00.000Z", status: "completed" },
  { id: "4", type: "buy", asset: "Bitcoin", symbol: "BTC", amount: 0.1, priceLabel: "€41,500.00", total: 4150, currency: "EUR", createdAt: "2026-02-05T16:22:00.000Z", status: "pending" },
  { id: "5", type: "swap", asset: "ETH → SOL", symbol: "ETH/SOL", amount: 1.0, priceLabel: "Market", total: 3261.8, currency: "EUR", createdAt: "2026-02-04T13:08:00.000Z", status: "completed" },
];

const baseSeries: Record<string, { portfolio: number[]; benchmark: number[] }> = {
  "1D": {
    portfolio: [12290, 12305, 12340, 12310, 12360, 12410, 12430, 12420, 12480, 12540.5],
    benchmark: [12180, 12195, 12210, 12205, 12240, 12280, 12295, 12310, 12320, 12360],
  },
  "7D": {
    portfolio: [11850, 11920, 11980, 12060, 12120, 12240, 12310, 12420, 12480, 12540.5],
    benchmark: [11890, 11930, 11970, 12010, 12050, 12110, 12160, 12210, 12270, 12310],
  },
  "30D": {
    portfolio: [11020, 11140, 11300, 11420, 11600, 11740, 11920, 12110, 12340, 12540.5],
    benchmark: [11110, 11190, 11280, 11370, 11460, 11550, 11640, 11730, 11830, 11920],
  },
  "1Y": {
    portfolio: [9050, 9300, 9550, 9800, 10120, 10490, 10940, 11420, 12010, 12540.5],
    benchmark: [9100, 9260, 9420, 9590, 9760, 9940, 10120, 10310, 10500, 10680],
  },
  ALL: {
    portfolio: [4200, 4700, 5200, 6100, 7000, 8100, 9300, 10600, 11850, 12540.5],
    benchmark: [4300, 4600, 4900, 5400, 6000, 6600, 7300, 8100, 9000, 9850],
  },
};

const periodStartOffsets: Record<string, number> = {
  "1D": 9,
  "7D": 9,
  "30D": 29,
  "1Y": 364,
  ALL: 1200,
};

export function getPerformanceSeries(period: string): PerformanceSeriesResponse {
  const selectedPeriod = baseSeries[period] ? period : "1D";
  const data = baseSeries[selectedPeriod];
  const now = new Date();
  const start = new Date(now);
  start.setDate(now.getDate() - periodStartOffsets[selectedPeriod]);

  const points = data.portfolio.map((portfolioValue, index) => {
    const timestamp = new Date(start);
    const step = periodStartOffsets[selectedPeriod] / Math.max(data.portfolio.length - 1, 1);
    timestamp.setDate(start.getDate() + Math.round(step * index));

    return {
      timestamp: timestamp.toISOString(),
      portfolioValue,
      benchmarkValue: data.benchmark[index],
    };
  });

  const portfolioChangePct = ((data.portfolio.at(-1)! - data.portfolio[0]) / data.portfolio[0]) * 100;
  const benchmarkChangePct = ((data.benchmark.at(-1)! - data.benchmark[0]) / data.benchmark[0]) * 100;

  return {
    period: selectedPeriod,
    portfolioChangePct,
    benchmarkChangePct,
    points,
    stats: {
      bestPerformer: "SOL +12.4%",
      worstPerformer: "DOT -3.2%",
      beatMarketLabel: "65% of time",
    },
  };
}
