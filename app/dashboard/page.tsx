"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import PortfolioChart from "@/components/PortfolioChart";
import QuickActionsCard from "@/components/QuickActionsCard";
import ListRow from "@/components/ListRow";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { useAuth } from "@/contexts/AuthContext";
import CurrencyCard from "@/components/CurrencyCard";
import MarketOverview from "@/components/MarketOverview";
import TransactionsList from "@/components/TransactionsList";
import NotificationBadge from "@/components/NotificationBadge";
import StakingCard from "@/components/StakingCard";
import PerformanceChart from "@/components/PerformanceChart";
import CryptoIcon from "@/components/CryptoIcon";

// Portfolio data - realistic values
const portfolioData = {
  totalValue: "0.00",
  currency: "€",
  change: "0.00",
  changePercent: "0.00%",
  changePeriod: "today",
  dailyHigh: "0.00 €",
  dailyLow: "0.00 €",
};

// Quick actions data - realistic balances
const quickActions = [
  {
    title: "Available Balance",
    value: "0.00 €",
    subtitle: "Balance on wallets & orders",
  },
  {
    title: "Free Deposit",
    value: "Get Started →",
    subtitle: "0€ fees until 31.03.",
    tag: "EUR · SEPA",
    accent: true,
    href: "/dashboard/deposit",
  },
  {
    title: "Trading Fees",
    value: "-25%",
    subtitle: "with PREMIUM VIP Status",
    pill: "New!",
  },
  {
    title: "Staking Rewards",
    value: "0.00 €",
    subtitle: "this month · 12.5% APY",
    pill: "0.0%",
  },
];

// Portfolio Actions
const portfolioActions = [
  { icon: "buy", label: "Buy", href: "/dashboard/buy" },
  { icon: "sell", label: "Sell", href: "/dashboard/sell" },
  { icon: "swap", label: "Swap", href: "/dashboard/swap" },
  { icon: "deposit", label: "Deposit", href: "/dashboard/deposit" },
];

// Allocation data - realistic distribution
const allocationData = [
  {
    icon: "pie" as const,
    name: "Krypto",
    label: "BTC, ETH, SOL, mehr",
    amount: "68,5%",
    pill: "19.487,50 €",
  },
  {
    icon: "trending" as const,
    name: "Aktien",
    label: "Tech, Energie, ETFs",
    amount: "24,2%",
    pill: "6.882,80 €",
  },
  {
    icon: "dollar" as const,
    name: "Fiat",
    label: "EUR, USD, GBP",
    amount: "7,3%",
    pill: "2.087,02 €",
  },
];

// Top positions - realistic holdings with proper crypto icons
const topPositions = [
  { icon: "btc", name: "Bitcoin", label: "BTC · Spot", amount: "0.0000 BTC", pill: "0.0%", negative: false, value: "0.00 €" },
  { icon: "eth", name: "Ethereum", label: "ETH · Spot", amount: "0.0000 ETH", pill: "0.0%", negative: false, value: "0.00 €" },
  { icon: "sol", name: "Solana", label: "SOL · Staking", amount: "0.0000 SOL", pill: "0.0%", negative: false, value: "0.00 €" },
  { icon: "bnb", name: "Binance Coin", label: "BNB · Spot", amount: "0.0000 BNB", pill: "0.0%", negative: false, value: "0.00 €" },
  { icon: "xrp", name: "Ripple", label: "XRP · Spot", amount: "0.0000 XRP", pill: "0.0%", negative: false, value: "0.00 €" },
  { icon: "ada", name: "Cardano", label: "ADA · Staking", amount: "0.0000 ADA", pill: "0.0%", negative: false, value: "0.00 €" },
];

// Currency list - live market data with proper crypto icons
const currencies = [
  { symbol: "BTC", name: "Bitcoin", price: "45.089,50 €", change: "+5,24%", changeValue: "+2.234 €", marketCap: "882 B€", volume24h: "28,5 B€", icon: "btc" },
  { symbol: "ETH", name: "Ethereum", price: "3.267,80 €", change: "+3,87%", changeValue: "+121,50 €", marketCap: "393 B€", volume24h: "15,2 B€", icon: "eth" },
  { symbol: "BNB", name: "Binance Coin", price: "583,40 €", change: "+1,21%", changeValue: "+6,98 €", marketCap: "87 B€", volume24h: "1,8 B€", icon: "bnb" },
  { symbol: "SOL", name: "Solana", price: "156,92 €", change: "+8,45%", changeValue: "+12,23 €", marketCap: "72 B€", volume24h: "3,4 B€", icon: "sol" },
  { symbol: "XRP", name: "Ripple", price: "0,62 €", change: "-2,13%", changeValue: "-0,01 €", marketCap: "35 B€", volume24h: "2,1 B€", icon: "xrp" },
  { symbol: "ADA", name: "Cardano", price: "0,38 €", change: "+4,78%", changeValue: "+0,02 €", marketCap: "13 B€", volume24h: "0,8 B€", icon: "ada" },
];

// Watchlist
const watchlist = [
  { name: "Bitcoin", symbol: "BTC", price: "66.234,50 €", change: "+2,34%", isPositive: true, iconSrc: "/btc-logo.png" },
  { name: "Ethereum", symbol: "ETH", price: "3.261,80 €", change: "+1,87%", isPositive: true, iconSrc: "/eth-logo.png" },
  { name: "Solana", symbol: "SOL", price: "156,72 €", change: "-0,94%", isPositive: false, iconSrc: "/sol-logo.png" },
];

// Market overview - realistic market data
const marketOverviewData = {
  marketCap: "2,58 T€",
  marketCapChange: "+3,2%",
  volume24h: "125,8 Mrd. €",
  volumeChange: "+12,4%",
  topGainer: { name: "Solana", symbol: "SOL", change: "+18,4%" },
  topLoser: { name: "Ripple", symbol: "XRP", change: "-2,1%" },
  btcDominance: "48,2%",
  fearGreedIndex: 68,
  fearGreedLabel: "Gier",
  marketTrend: "bullish",
  activeCryptos: 9.847,
  marketCapAll: "2,58 T€",
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [activeRange, setActiveRange] = React.useState("1D");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notificationCount] = React.useState(3);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const userName = React.useMemo(() => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  }, [user]);

  if (!isClient || loading) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <DashboardHeader 
          userName={userName}
          portfolioValue={portfolioData.totalValue + portfolioData.currency}
          portfolioChange={portfolioData.change}
          notificationCount={notificationCount}
        />

        {/* HEADER ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <NotificationBadge 
            count={notificationCount} 
            onClick={() => router.push("/notifications")} 
          />
        </div>

        {/* PORTFOLIO CARD */}
        <section className="portfolio">
          <div className="portfolio-inner">
            <small>Total Value</small>

            <div className="value-row">
              <div>
                <div className="value">
                  {portfolioData.totalValue}
                  <span className="value-currency">{portfolioData.currency}</span>
                </div>
                <div className="portfolio-stats" style={{ fontSize: "12px", color: "var(--muted)", marginTop: "4px" }}>
                  <span>H: {portfolioData.dailyHigh}</span>
                  <span style={{ margin: "0 8px" }}>·</span>
                  <span>L: {portfolioData.dailyLow}</span>
                </div>
              </div>

              <div className="value-detail">
                <div className="value-label">Today</div>
                <div className={`change ${portfolioData.change.startsWith("+") ? "" : "negative"}`}>
                  {portfolioData.change.startsWith("+") ? "▲" : "▼"} {portfolioData.changePercent}
                  <span>({portfolioData.change} $)</span>
                </div>
              </div>
            </div>

            <PortfolioChart
              activeRange={activeRange}
              onRangeChange={setActiveRange}
            />
          </div>
        </section>

        {/* PORTFOLIO ACTIONS */}
        <h3 className="section-title">Manage Portfolio</h3>
        <section className="portfolio-actions">
          {portfolioActions.map((action, index) => (
            <Link key={index} href={action.href || '/dashboard'} className="action-btn">
              <div className={`action-icon ${action.icon}`}>
                {action.icon === "buy" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                {action.icon === "sell" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                    <circle cx="12" cy="12" r="10" />
                  </svg>
                )}
                {action.icon === "swap" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 1l4 4-4 4" />
                    <path d="M3 11V9a4 4 0 0 1 4-4h14" />
                    <path d="M7 23l-4-4 4-4" />
                    <path d="M21 13v2a4 4 0 0 1-4 4H3" />
                  </svg>
                )}
                {action.icon === "deposit" && (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 19V5M19 12l-7 7-7-7" />
                  </svg>
                )}
              </div>
              <span>{action.label}</span>
            </Link>
          ))}
        </section>

        {/* QUICK ACTIONS */}
        <h3 className="section-title">Actions</h3>
        <section className="cards">
          {quickActions.map((action, index) => (
            <QuickActionsCard
              key={index}
              title={action.title}
              value={action.value}
              subtitle={action.subtitle}
              tag={action.tag}
              accent={action.accent}
              href={action.href}
            />
          ))}
        </section>

        {/* PERFORMANCE CHART */}
        <PerformanceChart 
          portfolioValue={1336}
          portfolioChange={5.42}
          benchmarkValue={1336}
          benchmarkChange={3.21}
        />

        {/* STAKING CARD */}
        <StakingCard 
          totalStaked={1250.50}
          apy={12.5}
          rewards={45.80}
        />

        {/* MARKET OVERVIEW */}
        <MarketOverview
          marketCap={marketOverviewData.marketCap}
          marketCapChange={marketOverviewData.marketCapChange}
          volume24h={marketOverviewData.volume24h}
          volumeChange={marketOverviewData.volumeChange}
          topGainer={marketOverviewData.topGainer}
          topLoser={marketOverviewData.topLoser}
          btcDominance={marketOverviewData.btcDominance}
          fearGreedIndex={marketOverviewData.fearGreedIndex}
          fearGreedLabel={marketOverviewData.fearGreedLabel}
        />

        {/* CURRENCY LIST */}
        <section className="currency-list">
          <div className="currency-list-header">
            <span className="currency-list-title">Kurse</span>
            <a href="/markets" className="view-all-currencies">
              Alle anzeigen →
            </a>
          </div>
          {currencies.map((currency, index) => (
            <CurrencyCard
              key={index}
              symbol={currency.symbol}
              name={currency.name}
              price={currency.price}
              change={currency.change}
              marketCap={currency.marketCap}
              icon={currency.icon}
              isPositive={currency.change.startsWith("+")}
            />
          ))}
        </section>

        {/* WATCHLIST */}
        <section className="watchlist-section">
          <div className="watchlist-header">
            <h3 className="section-title" style={{ marginTop: 0 }}>
              <svg className="watchlist-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
              </svg>
              Watchlist
            </h3>
          </div>
          <div className="watchlist-items">
            {watchlist.map((item, index) => (
              <div key={index} className="watchlist-item">
                <div className="watchlist-left">
                  <div className="watchlist-asset">
                    <CryptoIcon symbol={item.symbol} size={20} />
                  </div>
                  <div className="watchlist-name">{item.name}</div>
                </div>
                <div className="watchlist-right">
                  <div className="watchlist-price">{item.price}</div>
                  <div className={`watchlist-change ${item.change.startsWith("+") ? "positive" : "negative"}`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALLOCATION */}
        <h3 className="section-title">Allocation</h3>
        <section className="list-card">
          {allocationData.map((item, index) => (
            <ListRow
              key={index}
              icon={item.icon}
              name={item.name}
              label={item.label}
              amount={item.amount}
              pill={item.pill}
            />
          ))}
        </section>

        {/* TOP POSITIONS */}
        <h3 className="section-title">Top Positions</h3>
        <section className="list-card">
          {topPositions.map((item, index) => (
            <ListRow
              key={index}
              icon={item.icon}
              name={item.name}
              label={item.label}
              amount={item.amount}
              pill={item.pill}
              negative={item.negative}
            />
          ))}
        </section>

        {/* RECENT ACTIVITY */}
        <TransactionsList maxItems={4} />
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />

      <BottomNav
        onMenuClick={() => setIsSidebarOpen(true)}
        isMenuActive={isSidebarOpen}
      />
    </div>
  );
}

