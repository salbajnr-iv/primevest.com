"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import TradeWHeader from "@/components/TradeWHeader";
import TradeWAccountOverview from "@/components/TradeWAccountOverview";
import TradeWPositions from "@/components/TradeWPositions";
import TradeWSecurityCard from "@/components/TradeWSecurityCard";
import TradeWRecommendations from "@/components/TradeWRecommendations";
import TradeWMobileBanner from "@/components/TradeWMobileBanner";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

// ---- TRADE W DATA ----

const accounts = [
  {
    id: "1",
    name: "Main Account",
    label: "Trade W",
    balance: "25,430.50",
    currency: "€",
    change: "+2.34%",
    trend: "up" as const,
  },
  {
    id: "2",
    name: "Crypto Wallet",
    label: "BTC/ETH",
    balance: "18,750.00",
    currency: "€",
    change: "+5.67%",
    trend: "up" as const,
  },
  {
    id: "3",
    name: "Savings Account",
    label: "High Yield",
    balance: "8,250.00",
    currency: "€",
    change: "+0.85%",
    trend: "up" as const,
  },
  {
    id: "4",
    name: "Trading Account",
    label: "MT5",
    balance: "12,180.75",
    currency: "€",
    change: "-1.23%",
    trend: "down" as const,
  },
];

const portfolioSummary = {
  totalValue: 64611.25,
  dailyChange: 1245.50,
  dailyChangePercent: 1.96,
  totalReturn: 8934.75,
  totalReturnPercent: 16.04,
};

const recentTransactions = [
  {
    id: "1",
    type: "buy" as const,
    asset: "BTC",
    amount: "0.025",
    value: "1,081.25",
    time: "2 hours ago",
    status: "completed" as const,
  },
  {
    id: "2",
    type: "sell" as const,
    asset: "ETH",
    amount: "0.5",
    value: "1,140.25",
    time: "5 hours ago",
    status: "completed" as const,
  },
  {
    id: "3",
    type: "deposit" as const,
    asset: "EUR",
    amount: "5,000",
    value: "5,000.00",
    time: "1 day ago",
    status: "completed" as const,
  },
];

const marketHighlights = [
  {
    id: "1",
    name: "Bitcoin",
    symbol: "BTC",
    price: 43250.00,
    change: 2.45,
    icon: "₿",
  },
  {
    id: "2",
    name: "Ethereum",
    symbol: "ETH",
    price: 2280.50,
    change: 1.82,
    icon: "Ξ",
  },
  {
    id: "3",
    name: "Gold",
    symbol: "XAU",
    price: 2051.20,
    change: -0.65,
    icon: "🥇",
  },
  {
    id: "4",
    name: "S&P 500",
    symbol: "SPX",
    price: 4521.75,
    change: 0.89,
    icon: "📈",
  },
];

const positions = [
  {
    id: "1",
    symbol: "EUR/USD",
    type: "buy" as const,
    volume: "0.10",
    openPrice: "1.0856",
    currentPrice: "1.0892",
    profit: "+36.00",
    profitPercent: "+0.33",
  },
  {
    id: "2",
    symbol: "GBP/USD",
    type: "sell" as const,
    volume: "0.15",
    openPrice: "1.2745",
    currentPrice: "1.2728",
    profit: "+25.50",
    profitPercent: "+0.13",
  },
  {
    id: "3",
    symbol: "XAU/USD",
    type: "buy" as const,
    volume: "0.05",
    openPrice: "2,045.80",
    currentPrice: "2,051.20",
    profit: "+27.00",
    profitPercent: "+0.26",
  },
];

const recommendations = [
  {
    id: "1",
    name: "EUR/USD",
    price: "1.0892",
    change: "0.0036",
    changePercent: "0.33",
    trend: "up" as const,
  },
  {
    id: "2",
    name: "GBP/JPY",
    price: "183.45",
    change: "-0.82",
    changePercent: "0.45",
    trend: "down" as const,
  },
  {
    id: "3",
    name: "XAU/USD",
    price: "2,051.20",
    change: "5.40",
    changePercent: "0.26",
    trend: "up" as const,
  },
  {
    id: "4",
    name: "BTC/USD",
    price: "43,250.00",
    change: "-125.00",
    changePercent: "0.29",
    trend: "down" as const,
  },
];

// ---- COMPONENT ----

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const userName = user?.email?.split("@")[0] || "User";

  const handleSecurityUpgrade = () => {
    router.push("/dashboard/security");
  };

  const handleMobileDownload = () => {
    window.open("https://apps.apple.com", "_blank");
  };

  const totalBalance = accounts.reduce((sum, account) => {
    return sum + parseFloat(account.balance.replace(",", ""));
  }, 0).toFixed(2);

  const quickActions = [
    { id: "buy", label: "Buy", icon: "📈", href: "/dashboard/trade?side=buy" },
    { id: "sell", label: "Sell", icon: "📉", href: "/dashboard/trade?side=sell" },
    { id: "transfer", label: "Transfer", icon: "💸", href: "/dashboard/transfer" },
    { id: "deposit", label: "Deposit", icon: "💰", href: "/dashboard/deposit" },
  ];

  const formatCurrency = (amount: number, currency: string = "€") => {
    return `${currency}${amount.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  const formatChange = (change: number, percent: boolean = false) => {
    const sign = change >= 0 ? "+" : "";
    const value = percent ? `${change.toFixed(2)}%` : formatCurrency(Math.abs(change));
    return { sign, value, isPositive: change >= 0 };
  };

  if (loading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="tradew-dashboard">
      {/* Trade W Header */}
      <TradeWHeader activeTab="overview" />

      {/* Trade W Main Layout */}
      <div className="tradew-main">
        {/* Main Content Area */}
        <div className="tradew-overview">
          <div className="tradew-overview-header">
            <h1 className="tradew-overview-title">Overview</h1>
            <div className="tradew-overview-actions">
              <button className="tradew-btn tradew-btn-outline" aria-label="Select time period - Last 7 days">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M8 2v6l2.5 2.5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                Last 7 days
              </button>
              <button className="tradew-btn tradew-btn-outline" aria-label="Compare portfolio data">
                <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
                  <path d="M2 8h12M8 2v12" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                Compare
              </button>
            </div>
          </div>

          {/* Portfolio Summary Card */}
          <div className="tradew-portfolio-summary">
            <div className="tradew-portfolio-header">
              <h2 className="tradew-portfolio-title">Portfolio Overview</h2>
              <div className="tradew-portfolio-period">
                <select className="tradew-period-select">
                  <option>24H</option>
                  <option>7D</option>
                  <option>30D</option>
                  <option>1Y</option>
                </select>
              </div>
            </div>
            
            <div className="tradew-portfolio-value">
              <span className="tradew-portfolio-amount">{formatCurrency(portfolioSummary.totalValue)}</span>
              <div className="tradew-portfolio-change">
                {(() => {
                  const change = formatChange(portfolioSummary.dailyChange);
                  return (
                    <span className={`tradew-change ${change.isPositive ? "positive" : "negative"}`}>
                      {change.sign}{change.value} ({change.sign}{portfolioSummary.dailyChangePercent.toFixed(2)}%)
                    </span>
                  );
                })()}
                <span className="tradew-change-label">Today</span>
              </div>
            </div>

            <div className="tradew-portfolio-stats">
              <div className="tradew-stat">
                <span className="tradew-stat-label">Total Return</span>
                {(() => {
                  const totalReturn = formatChange(portfolioSummary.totalReturn);
                  return (
                    <span className={`tradew-stat-value ${totalReturn.isPositive ? "positive" : "negative"}`}>
                      {totalReturn.sign}{totalReturn.value} ({totalReturn.sign}{portfolioSummary.totalReturnPercent.toFixed(2)}%)
                    </span>
                  );
                })()}
              </div>
              <div className="tradew-stat">
                <span className="tradew-stat-label">Assets</span>
                <span className="tradew-stat-value">{accounts.length}</span>
              </div>
            </div>

            <div className="tradew-quick-actions">
              {quickActions.map((action) => (
                <Link key={action.id} href={action.href} className="tradew-quick-action">
                  <span className="tradew-action-icon">{action.icon}</span>
                  <span className="tradew-action-label">{action.label}</span>
                </Link>
              ))}
            </div>
          </div>

          {/* Account Overview */}
          <TradeWAccountOverview
            totalBalance={totalBalance}
            currency="€"
            accounts={accounts}
          />

          {/* Market Highlights */}
          <div className="tradew-market-highlights">
            <div className="tradew-highlights-header">
              <h3 className="tradew-highlights-title">Market Highlights</h3>
              <Link href="/markets" className="tradew-highlights-more">View all</Link>
            </div>
            <div className="tradew-highlights-grid">
              {marketHighlights.map((market) => (
                <div key={market.id} className="tradew-highlight-card">
                  <div className="tradew-highlight-header">
                    <span className="tradew-highlight-icon">{market.icon}</span>
                    <div className="tradew-highlight-info">
                      <span className="tradew-highlight-name">{market.name}</span>
                      <span className="tradew-highlight-symbol">{market.symbol}</span>
                    </div>
                  </div>
                  <div className="tradew-highlight-price">{formatCurrency(market.price)}</div>
                  <div className={`tradew-highlight-change ${market.change >= 0 ? "positive" : "negative"}`}>
                    {market.change >= 0 ? "+" : ""}{market.change.toFixed(2)}%
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Recent Transactions */}
          <div className="tradew-recent-transactions">
            <div className="tradew-transactions-header">
              <h3 className="tradew-transactions-title">Recent Activity</h3>
              <Link href="/dashboard/history" className="tradew-transactions-more">View all</Link>
            </div>
            <div className="tradew-transactions-list">
              {recentTransactions.map((transaction) => (
                <div key={transaction.id} className="tradew-transaction-item">
                  <div className={`tradew-transaction-icon tradew-transaction-${transaction.type}`}>
                    {transaction.type === "buy" && "📈"}
                    {transaction.type === "sell" && "📉"}
                    {transaction.type === "deposit" && "💰"}
                  </div>
                  <div className="tradew-transaction-info">
                    <div className="tradew-transaction-asset">
                      {transaction.type === "deposit" ? "Deposit" : `${transaction.type.toUpperCase()} ${transaction.asset}`}
                    </div>
                    <div className="tradew-transaction-time">{transaction.time}</div>
                  </div>
                  <div className="tradew-transaction-amount">
                    <div className="tradew-transaction-value">{formatCurrency(parseFloat(transaction.value))}</div>
                    <div className="tradew-transaction-quantity">
                      {transaction.type !== "deposit" && `${transaction.amount} ${transaction.asset}`}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Positions Table */}
          <TradeWPositions positions={positions} />

          {/* Mobile App Banner */}
          <TradeWMobileBanner onDownloadClick={handleMobileDownload} />
        </div>

        {/* Sidebar */}
        <div className="tradew-sidebar">
          <TradeWSecurityCard
            securityLevel="medium"
            onUpgrade={handleSecurityUpgrade}
          />
          
          <TradeWRecommendations recommendations={recommendations} />
        </div>
      </div>

      {/* Mobile Navigation */}
      <BottomNav />

      {/* Mobile Sidebar */}
      {isClient && (
        <Sidebar
          isOpen={isSidebarOpen}
          onClose={() => setIsSidebarOpen(false)}
        />
      )}
    </div>
  );
}
