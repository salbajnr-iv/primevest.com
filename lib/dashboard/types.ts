export type OrderType = "buy" | "sell" | "swap";
export type OrderStatus = "completed" | "pending" | "cancelled";

export interface PortfolioSummary {
  userName: string;
  portfolioValue: number;
  portfolioChangePct: number;
  availableBalance: number;
  availableBalanceChangePct: number;
  notificationCount: number;
}

export interface KpiMetric {
  label: string;
  value: number;
  valueLabel: string;
  deltaLabel: string;
}

export interface VolumeDataPoint {
  label: string;
  value: number;
}

export interface TopPairMetric {
  pair: string;
  volume: string;
  spread: string;
  pnl: string;
}

export interface NewsHeadline {
  id: string;
  text: string;
}

export interface ActivityFeedItem {
  id: string;
  action: string;
  detail: string;
  time: string;
}

export interface ActivityItem {
  id: string;
  type: string;
  amountLabel: string;
  status: OrderStatus;
  href: string;
  createdAt: string;
}

export interface OrderHistoryItem {
  id: string;
  type: OrderType;
  asset: string;
  symbol: string;
  amount: number;
  priceLabel: string;
  total: number;
  currency: string;
  createdAt: string;
  status: OrderStatus;
}

export interface ChartSeriesPoint {
  timestamp: string;
  portfolioValue: number;
  benchmarkValue: number;
}

export interface PerformanceStats {
  bestPerformer: string;
  worstPerformer: string;
  beatMarketLabel: string;
}

export interface PerformanceSeriesResponse {
  period: string;
  portfolioChangePct: number;
  benchmarkChangePct: number;
  points: ChartSeriesPoint[];
  stats: PerformanceStats;
}

export type PerformanceRange = "7D" | "1M" | "3M";

export interface DashboardData {
  portfolioSummary: PortfolioSummary;
  kpis: KpiMetric[];
  volumeData: VolumeDataPoint[];
  topPairs: TopPairMetric[];
  activityFeed: ActivityFeedItem[];
  marketNews: NewsHeadline[];
  performanceSeries: Record<PerformanceRange, { label: string; value: number }[]>;
}
