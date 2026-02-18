"use client";

import * as React from "react";
import Image from "next/image";
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

// Portfolio data
const portfolioData = {
  totalValue: "13,36",
  currency: "€",
  change: "-1,69%",
  changePeriod: "in 1 Tag",
};

// Quick actions data
const quickActions = [
  {
    title: "Verfügbares Guthaben",
    value: "0,00 €",
    subtitle: "Guthaben auf Wallets & Orders",
  },
  {
    title: "Gratis einzahlen",
    value: "Jetzt starten →",
    subtitle: "",
    tag: "EUR · SEPA",
    accent: true,
    href: "/dashboard/deposit",
  },
  {
    title: "Trading-Gebühren",
    value: "-20%",
    subtitle: "mit BEST VIP Level",
  },
  {
    title: "Staking Rewards",
    value: "bis 30%",
    subtitle: "für ausgewählte Assets",
  },
];

// Portfolio Actions
const portfolioActions = [
  { icon: "buy", label: "Kaufen", href: "/dashboard/buy" },
  { icon: "sell", label: "Verkaufen", href: "/dashboard/sell" },
  { icon: "swap", label: "Tauschen", href: "/dashboard/swap" },
  { icon: "deposit", label: "Einzahlen", href: "/dashboard/deposit" },
];

// Allocation data
const allocationData = [
  {
    icon: "pie" as const,
    name: "Krypto",
    label: "BTC, ETH, mehr",
    amount: "100%",
    pill: "13,36 €",
  },
];

// Top positions
const topPositions = [
  { iconSrc: "/btc-logo.png", name: "Bitcoin", label: "BTC · Spot", amount: "0,0000 BTC", pill: "-1,2%", negative: true },
  { iconSrc: "/eth-logo.png", name: "Ethereum", label: "ETH · Spot", amount: "0,0000 ETH", pill: "0,0%", negative: false },
  { iconSrc: "/bnb-logo.png", name: "Binance Coin", label: "BNB · Spot", amount: "0,0000 BNB", pill: "+2,4%", negative: false },
  { iconSrc: "/sol-logo.png", name: "Solana", label: "SOL · Spot", amount: "0,0000 SOL", pill: "-0,8%", negative: true },
  { iconSrc: "/xrp-logo.png", name: "Ripple", label: "XRP · Spot", amount: "0,0000 XRP", pill: "+1,5%", negative: false },
  { iconSrc: "/ada-logo.png", name: "Cardano", label: "ADA · Spot", amount: "0,0000 ADA", pill: "-3,2%", negative: true },
];

// Currency list
const currencies = [
  { name: "Bitcoin", symbol: "BTC", price: "66.234,50 €", change: "2,34%", changeValue: "+1.512 €", marketCap: "1,3 B€", iconSrc: "/btc-logo.png", isPositive: true },
  { name: "Ethereum", symbol: "ETH", price: "3.261,80 €", change: "1,87%", changeValue: "+59,80 €", marketCap: "392 B€", iconSrc: "/eth-logo.png", isPositive: true },
  { name: "Binance Coin", symbol: "BNB", price: "582,40 €", change: "4,21%", changeValue: "+23,50 €", marketCap: "87 B€", iconSrc: "/bnb-logo.png", isPositive: true },
  { name: "Solana", symbol: "SOL", price: "156,72 €", change: "-0,94%", changeValue: "-1,49 €", marketCap: "72 B€", iconSrc: "/sol-logo.png", isPositive: false },
  { name: "Ripple", symbol: "XRP", price: "0,62 €", change: "3,45%", changeValue: "+0,02 €", marketCap: "35 B€", iconSrc: "/xrp-logo.png", isPositive: true },
  { name: "Cardano", symbol: "ADA", price: "0,38 €", change: "-2,12%", changeValue: "-0,01 €", marketCap: "13 B€", iconSrc: "/ada-logo.png", isPositive: false },
];

// Watchlist
const watchlist = [
  { name: "Bitcoin", symbol: "BTC", price: "66.234,50 €", change: "+2,34%", isPositive: true, iconSrc: "/btc-logo.png" },
  { name: "Ethereum", symbol: "ETH", price: "3.261,80 €", change: "+1,87%", isPositive: true, iconSrc: "/eth-logo.png" },
  { name: "Solana", symbol: "SOL", price: "156,72 €", change: "-0,94%", isPositive: false, iconSrc: "/sol-logo.png" },
];

// Market overview
const marketOverviewData = {
  marketCap: "2,45 B€",
  marketCapChange: "+2,3%",
  volume24h: "98,5 Mrd. €",
  volumeChange: "-5,8%",
  topGainer: { name: "SEI", symbol: "SEI", change: "+18,4%" },
  topLoser: { name: "ARB", symbol: "ARB", change: "-7,2%" },
  btcDominance: "52,4%",
  fearGreedIndex: 72,
  fearGreedLabel: "Gier",
};

// Notifications
const notifications = [
  { id: 1, title: "BTC reached new daily high", time: "2 min ago", unread: true },
  { id: 2, title: "Your order has been executed", time: "1 hour ago", unread: true },
  { id: 3, title: "Staking rewards distributed", time: "3 hours ago", unread: true },
];

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [isClient, setIsClient] = React.useState(false);
  const [activeRange, setActiveRange] = React.useState("1D");
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notificationCount, setNotificationCount] = React.useState(3);

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
            <small>Gesamtwert</small>

            <div className="value-row">
              <div>
                <div className="value">
                  {portfolioData.totalValue}
                  <span className="value-currency">{portfolioData.currency}</span>
                </div>
              </div>

              <div className="value-detail">
                <div className="value-label">Heute</div>
                <div className="change">
                  ▼ {portfolioData.change}
                  <span>in {portfolioData.changePeriod}</span>
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
        <h3 className="section-title">Portfolio verwalten</h3>
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
        <h3 className="section-title">Aktionen</h3>
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
              name={currency.name}
              symbol={currency.symbol}
              price={currency.price}
              change={currency.change}
              changeValue={currency.changeValue}
              marketCap={currency.marketCap}
              iconSrc={currency.iconSrc}
              isPositive={currency.isPositive}
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
                    <Image src={item.iconSrc} alt={item.name} width={24} height={24} />
                  </div>
                  <div className="watchlist-name">{item.name}</div>
                </div>
                <div className="watchlist-right">
                  <div className="watchlist-price">{item.price}</div>
                  <div className={`watchlist-change ${item.isPositive ? "positive" : "negative"}`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* ALLOCATION */}
        <h3 className="section-title">Allokation</h3>
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

        {/* TOP POSITIONEN */}
        <h3 className="section-title">Top Positionen</h3>
        <section className="list-card">
          {topPositions.map((item, index) => (
            <ListRow
              key={index}
              iconSrc={item.iconSrc}
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

