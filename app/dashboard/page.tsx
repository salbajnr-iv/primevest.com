"use client";

import * as React from "react";
<<<<<<< HEAD
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

/* ─── Types ─────────────────────────────────────────────────────── */

interface Account {
  id: string;
  name: string;
  label: string;
  balance: string;
  currency: string;
  change: string;
  trend: "up" | "down";
  equity: string;
  profit: string;
  leverage: string;
}

interface Market {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change: number;
  icon: string;
}

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit";
  asset: string;
  amount: string;
  value: string;
  time: string;
}

/* ─── Mock Data ─────────────────────────────────────────────────── */

const accounts: Account[] = [
  {
    id: "main",
    name: "Main Account",
    label: "Trade W",
    balance: "25,430.50",
    currency: "€",
    change: "+2.34%",
    trend: "up",
    equity: "25,430.50",
    profit: "+597.50",
    leverage: "1:100",
  },
  {
    id: "crypto",
    name: "Crypto Wallet",
    label: "BTC / ETH",
    balance: "18,750.00",
    currency: "€",
    change: "+5.67%",
    trend: "up",
    equity: "18,750.00",
    profit: "+1,006.25",
    leverage: "1:10",
  },
  {
    id: "savings",
    name: "Savings Account",
    label: "High Yield",
    balance: "8,250.00",
    currency: "€",
    change: "+0.85%",
    trend: "up",
    equity: "8,250.00",
    profit: "+69.63",
    leverage: "N/A",
  },
  {
    id: "trading",
    name: "Trading Account",
    label: "MT5",
    balance: "12,180.75",
    currency: "€",
    change: "-1.23%",
    trend: "down",
    equity: "12,180.75",
    profit: "-151.87",
    leverage: "1:500",
  },
];

const markets: Market[] = [
  { id: "1", name: "Bitcoin",  symbol: "BTC",  price: 43250.00, change: 2.45,  icon: "₿" },
  { id: "2", name: "Ethereum", symbol: "ETH",  price: 2280.50,  change: 1.82,  icon: "Ξ" },
  { id: "3", name: "Gold",     symbol: "XAU",  price: 2051.20,  change: -0.65, icon: "🥇" },
  { id: "4", name: "S&P 500",  symbol: "SPX",  price: 4521.75,  change: 0.89,  icon: "📈" },
];

const transactions: Transaction[] = [
  { id: "1", type: "buy",     asset: "BTC", amount: "0.025", value: "1,081.25",  time: "2 hours ago" },
  { id: "2", type: "sell",    asset: "ETH", amount: "0.5",   value: "1,140.25",  time: "5 hours ago" },
  { id: "3", type: "deposit", asset: "EUR", amount: "5,000", value: "5,000.00",  time: "1 day ago"   },
];

/* ─── Sidebar Icons ─────────────────────────────────────────────── */

function IconOverview() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <rect x="2" y="2" width="7" height="7" rx="1.5" />
      <rect x="11" y="2" width="7" height="7" rx="1.5" />
      <rect x="2" y="11" width="7" height="7" rx="1.5" />
      <rect x="11" y="11" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconAssets() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <circle cx="10" cy="10" r="8" />
      <path d="M10 10 L10 2" />
      <path d="M10 10 L16 14" />
      <path d="M10 10 L4 14" />
    </svg>
  );
}

function IconTransfer() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <path d="M4 6h12M13 3l3 3-3 3" />
      <path d="M16 14H4M7 11l-3 3 3 3" />
    </svg>
  );
}

function IconOrder() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <rect x="4" y="2" width="12" height="16" rx="1.5" />
      <path d="M7 7h6M7 10h6M7 13h4" />
    </svg>
  );
}

function IconVerification() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <path d="M10 2L3 5v5c0 4.4 3.1 8.5 7 9.5 3.9-1 7-5.1 7-9.5V5l-7-3z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function IconSettings() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <circle cx="10" cy="10" r="3" />
      <path d="M10 2v2M10 16v2M2 10h2M16 10h2M4.22 4.22l1.42 1.42M14.36 14.36l1.42 1.42M4.22 15.78l1.42-1.42M14.36 5.64l1.42-1.42" />
    </svg>
  );
}

function IconPlatform() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <path d="M3 14l4-5 3 3 3-4 4 6" />
      <rect x="2" y="2" width="16" height="14" rx="1.5" />
    </svg>
  );
}

function IconTasks() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <path d="M5 3h10a2 2 0 012 2v10a2 2 0 01-2 2H5a2 2 0 01-2-2V5a2 2 0 012-2z" />
      <path d="M7 10l2 2 4-4" />
    </svg>
  );
}

function IconSupport() {
  return (
    <svg viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" width="17" height="17">
      <path d="M3 10a7 7 0 1114 0" />
      <path d="M3 10v2a2 2 0 002 2h1M17 10v2a2 2 0 01-2 2h-1" />
    </svg>
  );
}

/* ─── Nav Config ────────────────────────────────────────────────── */

const navGroups = [
  {
    label: "Account",
    items: [
      { href: "/dashboard/overview", label: "Overview",          Icon: IconOverview,      active: false },
      { href: "/dashboard",          label: "Assets",            Icon: IconAssets,        active: true  },
      { href: "/wallets/transfer",   label: "Internal Transfer", Icon: IconTransfer,      active: false },
      { href: "/dashboard/orders",   label: "Order",             Icon: IconOrder,         active: false },
      { href: "/dashboard/verify",   label: "Verification",      Icon: IconVerification,  active: false },
      { href: "/settings",           label: "Settings",          Icon: IconSettings,      active: false },
    ],
  },
  {
    label: "Platform",
    items: [
      { href: "/platforms",  label: "Platform",          Icon: IconPlatform, active: false },
      { href: "/tools",      label: "Task Center",       Icon: IconTasks,    active: false },
      { href: "/support",    label: "Customer Service",  Icon: IconSupport,  active: false },
    ],
  },
];

/* ─── Sidebar Component ─────────────────────────────────────────── */

function DashboardSidebar() {
  return (
    <aside className="tw-sidebar">
      <div className="tw-sidebar-header">
        <Link href="/dashboard" className="tw-logo">
          <span className="tw-logo-icon">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
            </svg>
          </span>
          PrimeVest
        </Link>
      </div>

      <nav className="tw-nav">
        {navGroups.map((group) => (
          <div key={group.label} className="tw-nav-group">
            <span className="tw-nav-group-label">{group.label}</span>
            {group.items.map((item) => (
              <Link
                key={item.label}
                href={item.href}
                className={`tw-nav-item${item.active ? " tw-nav-item--active" : ""}`}
              >
                <span className="tw-nav-icon">
                  <item.Icon />
                </span>
                {item.label}
              </Link>
            ))}
          </div>
        ))}
      </nav>
    </aside>
  );
}

/* ─── Page Header ───────────────────────────────────────────────── */

function PageHeader({ userName }: { userName: string }) {
  return (
    <header className="tw-header">
      <div className="tw-breadcrumb">
        <span>Dashboard</span>
        <span className="tw-breadcrumb-sep">/</span>
        <span>Asset Center</span>
      </div>

      <div className="tw-header-user">
        <div className="tw-avatar">{userName.charAt(0).toUpperCase()}</div>
        <div>
          <p className="tw-user-name">{userName}</p>
          <p className="tw-user-status">⚠ Not Verified</p>
        </div>
      </div>
    </header>
  );
}

/* ─── Asset Summary Banner ──────────────────────────────────────── */

function AssetSummary({
  totalBalance,
  accounts,
  onAccountClick,
}: {
  totalBalance: number;
  accounts: Account[];
  onAccountClick: (id: string) => void;
}) {
  const fmt = (n: number) =>
    `€${n.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="tw-asset-summary">
      <div className="tw-asset-total">
        <p className="tw-asset-total-label">Total assets</p>
        <p className="tw-asset-total-value">{fmt(totalBalance)}</p>
      </div>

      <div className="tw-asset-accounts">
        {accounts.map((acct) => (
          <div
            key={acct.id}
            className="tw-asset-account-col"
            role="button"
            tabIndex={0}
            onClick={() => onAccountClick(acct.id)}
            onKeyDown={(e) => e.key === "Enter" && onAccountClick(acct.id)}
          >
            <p className="tw-asset-account-name">{acct.name}</p>
            <p className="tw-asset-account-value">
              {acct.currency}{acct.balance}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ─── Account Tab Panel ─────────────────────────────────────────── */

function AccountTabPanel({ account }: { account: Account }) {
  return (
    <div className="tw-tab-panel">
      {/* Header row */}
      <div className="tw-account-detail-header">
        <div>
          <p className="tw-account-detail-name">{account.name}</p>
          <p className="tw-account-detail-sublabel">{account.label}</p>
        </div>
        <div className="tw-account-detail-balance">
          <p className="tw-account-detail-balance-value">
            {account.currency}{account.balance}
          </p>
          <p className={`tw-account-detail-balance-change ${account.trend === "up" ? "tw-change-up" : "tw-change-down"}`}>
            {account.change}
          </p>
        </div>
      </div>

      {/* Info grid */}
      <div className="tw-account-info-grid">
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">Balance</p>
          <p className="tw-account-info-value">{account.currency}{account.balance}</p>
        </div>
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">Equity</p>
          <p className="tw-account-info-value">{account.currency}{account.equity}</p>
        </div>
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">Profit / Loss</p>
          <p className={`tw-account-info-value ${account.trend === "up" ? "tw-change-up" : "tw-change-down"}`}>
            {account.currency}{account.profit}
          </p>
        </div>
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">24h Change</p>
          <p className={`tw-account-info-value ${account.trend === "up" ? "tw-change-up" : "tw-change-down"}`}>
            {account.change}
          </p>
        </div>
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">Leverage</p>
          <p className="tw-account-info-value">{account.leverage}</p>
        </div>
        <div className="tw-account-info-item">
          <p className="tw-account-info-label">Currency</p>
          <p className="tw-account-info-value">EUR</p>
        </div>
      </div>

      {/* Actions */}
      <div className="tw-account-detail-actions">
        <button className="tw-btn tw-btn--primary">Deposit</button>
        <button className="tw-btn">Withdraw</button>
        <button className="tw-btn">Transfer</button>
        <Link href="/dashboard/trade" className="tw-btn">Trade</Link>
      </div>
    </div>
  );
}

/* ─── Market Highlights ─────────────────────────────────────────── */

function MarketHighlights({ markets }: { markets: Market[] }) {
  const fmtPrice = (p: number) =>
    `€${p.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <section className="tw-section">
      <div className="tw-section-header">
        <h2 className="tw-section-title">Market Highlights</h2>
        <Link href="/crypto" className="tw-view-all">View all →</Link>
      </div>

      <div className="tw-market-grid">
        {markets.map((m) => (
          <div key={m.id} className="tw-market-card">
            <div className="tw-market-card-header">
              <div>
                <p className="tw-market-card-name">{m.name}</p>
                <p className="tw-market-card-symbol">{m.symbol}</p>
              </div>
              <div className="tw-market-card-icon">{m.icon}</div>
            </div>
            <p className="tw-market-card-price">{fmtPrice(m.price)}</p>
            <p className={`tw-market-card-change ${m.change >= 0 ? "tw-change-up" : "tw-change-down"}`}>
              {m.change >= 0 ? "+" : ""}{m.change.toFixed(2)}%
            </p>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Recent Activity ───────────────────────────────────────────── */

function RecentActivity({ transactions }: { transactions: Transaction[] }) {
  const txLabel = (tx: Transaction) =>
    tx.type === "deposit" ? "Deposit" : `${tx.type.charAt(0).toUpperCase()}${tx.type.slice(1)} ${tx.asset}`;

  return (
    <section className="tw-section">
      <div className="tw-section-header">
        <h2 className="tw-section-title">Recent Activity</h2>
        <Link href="/reports" className="tw-view-all">View all →</Link>
      </div>

      <div className="tw-activity-card">
        {transactions.map((tx) => (
          <div key={tx.id} className="tw-activity-item">
            <div className={`tw-activity-icon tw-activity-icon--${tx.type}`}>
              {tx.type === "buy" ? "↑" : tx.type === "sell" ? "↓" : "+"}
            </div>

            <div className="tw-activity-info">
              <p className="tw-activity-title">{txLabel(tx)}</p>
              <p className="tw-activity-time">{tx.time}</p>
            </div>

            <div className="tw-activity-amount">
              <p className="tw-activity-value">€{tx.value}</p>
              {tx.type !== "deposit" && (
                <p className="tw-activity-units">{tx.amount} {tx.asset}</p>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}

/* ─── Main Dashboard ────────────────────────────────────────────── */

function DashboardContent() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = React.useState<string>("main");

  React.useEffect(() => {
    if (!loading && !user) {
      router.push("/auth/login");
    }
  }, [user, loading, router]);

  const totalBalance = accounts.reduce(
    (sum, a) => sum + parseFloat(a.balance.replace(/,/g, "")),
    0
  );

  const userName = user?.email?.split("@")[0] || "User";
  const activeAccount = accounts.find((a) => a.id === activeTab) ?? accounts[0];

  if (loading || !user) {
    return (
      <div className="tw-loading">
        <div className="tw-spinner" />
        <span>Loading dashboard…</span>
=======
import Image from "next/image";
import Link from "next/link";
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
>>>>>>> 02bdcb7 (Initial commit)
      </div>
    );
  }

  return (
<<<<<<< HEAD
    <div className="tw-dashboard">
      <div className="tw-layout">
        {/* Sidebar */}
        <DashboardSidebar />

        {/* Main */}
        <main className="tw-main">
          <PageHeader userName={userName} />

          <div className="tw-content">
            {/* Page title */}
            <h1 className="tw-page-title">Asset</h1>

            {/* Total asset summary */}
            <AssetSummary
              totalBalance={totalBalance}
              accounts={accounts}
              onAccountClick={setActiveTab}
            />

            {/* Account type tabs */}
            <div className="tw-tabs">
              <div className="tw-tabs-list">
                {accounts.map((acct) => (
                  <button
                    key={acct.id}
                    className={`tw-tab${activeTab === acct.id ? " tw-tab--active" : ""}`}
                    onClick={() => setActiveTab(acct.id)}
                  >
                    {acct.name}
                  </button>
                ))}
              </div>

              <div style={{ marginTop: "16px" }}>
                <AccountTabPanel account={activeAccount} />
              </div>
            </div>

            {/* Market Highlights */}
            <MarketHighlights markets={markets} />

            {/* Recent Activity */}
            <RecentActivity transactions={transactions} />
          </div>

          <footer className="tw-footer">
            © 2016–2026 PrimeVest Financial Solutions, Inc. All Rights Reserved
          </footer>
        </main>
      </div>

      {/* Mobile nav */}
      <BottomNav onMenuClick={() => {}} isMenuActive={false} />
=======
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <DashboardHeader userName={userName} />

        {/* HEADER ACTIONS */}
        <div style={{ display: "flex", gap: 10, marginTop: 8 }}>
          <NotificationBadge 
            count={notificationCount} 
            onClick={() => {}} 
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
>>>>>>> 02bdcb7 (Initial commit)
    </div>
  );
}

<<<<<<< HEAD
export default function DashboardPage() {
  return (
    <React.Suspense
      fallback={
        <div className="tw-loading">
          <div className="tw-spinner" />
          <span>Loading…</span>
        </div>
      }
    >
      <DashboardContent />
    </React.Suspense>
  );
}
=======
>>>>>>> 02bdcb7 (Initial commit)
