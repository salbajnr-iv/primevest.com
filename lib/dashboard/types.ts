import type { ReactNode } from "react";

export type OrderType = "buy" | "sell" | "swap";
export type OrderStatus = "completed" | "pending" | "cancelled";

export type PerformanceRange = "7D" | "1M" | "3M";
export type DashboardDateRange = "Today" | "Last 7 days" | "Last 30 days" | "Last quarter";
export type DashboardRefreshCadence = "realtime" | "interval" | "on-load";
export type DashboardWidgetState = "loading" | "ready" | "empty" | "error";
export type DashboardRefreshCadence = "realtime" | "periodic" | "on-demand";

export interface DashboardTimestampMeta {
  activityUpdatedAt: string;
  alertsUpdatedAt: string;
  aggregatesUpdatedAt: string;
}

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
  deltaLabel?: string;
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

export interface AlertNotificationItem {
  id: string;
  message: string;
  createdAt: string;
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

export interface DashboardLoadingState {
  isLoading: boolean;
  isRefreshing?: boolean;
  lastUpdatedAt?: string;
  error?: string;
}

export interface DashboardSectionContract {
  section: string;
  source: string;
  requiredFields: string[];
  refreshCadence: DashboardRefreshCadence;
  ownership: string;
}

export interface KpiGaugeInput {
  label: string;
  value: number;
  target?: number;
  valueLabel: string;
  deltaLabel?: string;
  state?: DashboardWidgetState;
  emptyStateLabel?: string;
  errorMessage?: string;
  onRetry?: () => void;
}

export interface AnalyticsChartPoint {
  label: string;
  value: number;
}

export interface MetricsBarChartInput {
  title: string;
  data: AnalyticsChartPoint[];
  emptyStateLabel?: string;
  state?: DashboardWidgetState;
  errorMessage?: string;
  onRetry?: () => void;
}

export interface PerformanceLineChartInput {
  title: string;
  data: AnalyticsChartPoint[];
  emptyStateLabel?: string;
  state?: DashboardWidgetState;
  errorMessage?: string;
  onRetry?: () => void;
}

export interface DataTableColumnInput<T extends object> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export interface DataTableInput<T extends object> {
  title: string;
  columns: DataTableColumnInput<T>[];
  rows: T[];
  emptyStateLabel?: string;
  state?: DashboardWidgetState;
  errorMessage?: string;
  onRetry?: () => void;
}

export interface DashboardWidgetContract {
  kpiGauges: KpiGaugeInput[];
  metricsBarChart: MetricsBarChartInput;
  performanceLineChartByRange: Record<PerformanceRange, PerformanceLineChartInput>;
  topMarketsTable: DataTableInput<TopPairMetric>;
  loadingState?: DashboardLoadingState;
}

export interface DashboardData {
  portfolioSummary: PortfolioSummary;
  kpis: KpiMetric[];
  volumeData: VolumeDataPoint[];
  topPairs: TopPairMetric[];
  activityFeed: ActivityFeedItem[];
  marketNews: NewsHeadline[];
  performanceSeries: Record<PerformanceRange, AnalyticsChartPoint[]>;
  alerts: AlertNotificationItem[];
  freshness: DashboardTimestampMeta;
}
