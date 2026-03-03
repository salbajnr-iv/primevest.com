"use client";

import * as React from "react";
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
      </div>
    );
  }

  return (
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
    </div>
  );
}

