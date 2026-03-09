import {
  ActivityItem,
  OrderHistoryItem,
  PerformanceSeriesResponse,
  PortfolioSummary,
} from "@/lib/dashboard/types";

export const portfolioSummary: PortfolioSummary = {
  userName: "User",
  portfolioValue: 12540.5,
  portfolioChangePct: 2.41,
  availableBalance: 8240.5,
  availableBalanceChangePct: 1.2,
  notificationCount: 3,
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
