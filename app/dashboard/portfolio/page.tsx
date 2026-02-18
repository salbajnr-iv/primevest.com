"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import ListRow from "@/components/ListRow";
import { useRouter } from "next/navigation";
import { useTranslation } from "@/lib/i18n/hooks";

const holdings = [
  { 
    iconSrc: "/btc-logo.png", 
    name: "Bitcoin", 
    label: "BTC · Spot", 
    amount: "0,0021 BTC", 
    value: "2.10 €",
    change: "+2.4%"
  },
  { 
    iconSrc: "/eth-logo.png", 
    name: "Ethereum", 
    label: "ETH · Spot", 
    amount: "0,030 ETH", 
    value: "1.20 €",
    change: "-1.2%"
  },
  { 
    iconSrc: "/sol-logo.png", 
    name: "Solana", 
    label: "SOL · Spot", 
    amount: "0,50 SOL", 
    value: "12.50 €",
    change: "+5.8%"
  },
  { 
    iconSrc: "/bnb-logo.png", 
    name: "Binance Coin", 
    label: "BNB · Spot", 
    amount: "0,01 BNB", 
    value: "2.80 €",
    change: "+0.5%"
  },
];

const BuyIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 5v14M5 12h14" />
  </svg>
);

const SellIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M5 12h14" />
  </svg>
);

const SwapIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M7 16V4M7 4L3 8M7 4l4 4M17 8v12M17 20l4-4M17 20l-4-4" />
  </svg>
);

const DepositIcon = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 2v20M2 12h20" />
  </svg>
);

export default function PortfolioPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [sortBy, setSortBy] = React.useState<'value' | 'change' | 'name'>('value');
  const [sortOrder, setSortOrder] = React.useState<'asc' | 'desc'>('desc');
  const [filter, setFilter] = React.useState<'all' | 'gaining' | 'losing'>('all');
  
  const quickActions = [
    { 
      label: t('dashboard.buy'), 
      href: "/dashboard/buy",
      icon: <BuyIcon />,
      color: "buy"
    },
    { 
      label: t('dashboard.sell'), 
      href: "/dashboard/sell",
      icon: <SellIcon />,
      color: "sell"
    },
    { 
      label: t('dashboard.swap'), 
      href: "/dashboard/swap",
      icon: <SwapIcon />,
      color: "swap"
    },
    { 
      label: t('dashboard.deposit'), 
      href: "/dashboard/deposit",
      icon: <DepositIcon />,
      color: "deposit"
    },
  ];

  // Calculate totals
  const totalValue = holdings.reduce((acc, h) => acc + parseFloat(h.value.replace("€", "").replace(",", ".")), 0);
  const portfolioChange = "+1.8%";

  // Filter holdings
  const filteredHoldings = holdings.filter(h => {
    if (filter === 'gaining') return h.change.startsWith('+');
    if (filter === 'losing') return h.change.startsWith('-');
    return true;
  });

  // Sort holdings
  const sortedHoldings = [...filteredHoldings].sort((a, b) => {
    let aVal, bVal;
    
    if (sortBy === 'value') {
      aVal = parseFloat(a.value.replace("€", "").replace(",", "."));
      bVal = parseFloat(b.value.replace("€", "").replace(",", "."));
    } else if (sortBy === 'change') {
      aVal = parseFloat(a.change.replace("%", "").replace(",", "."));
      bVal = parseFloat(b.change.replace("%", "").replace(",", "."));
    } else {
      aVal = a.name.localeCompare(b.name);
      bVal = 0;
    }

    if (sortOrder === 'desc') {
      return typeof aVal === 'number' ? bVal - aVal : (bVal === 0 ? -1 : 1);
    }
    return typeof aVal === 'number' ? aVal - bVal : (bVal === 0 ? 1 : -1);
  });

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main>
          {/* Portfolio Value Card */}
          <section className="portfolio">
            <div className="portfolio-inner">
              <small>{t('portfolio.totalValue')}</small>
              <div className="value-row">
                <div className="value">
                  {totalValue.toFixed(2)}<span className="value-currency">€</span>
                </div>
                <div className="value-detail">
                  <div className="value-label">24h</div>
                  <div className={`change ${portfolioChange.startsWith("+") ? "" : "negative"}`}>
                    {portfolioChange}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Quick Actions Grid */}
          <section style={{ marginTop: "16px" }}>
            <div className="portfolio-actions">
              {quickActions.map((action, i) => (
                <button 
                  key={i} 
                  className="action-btn"
                  onClick={() => router.push(action.href)}
                >
                  <div className={`action-icon ${action.color}`}>
                    {action.icon}
                  </div>
                  <span>{action.label}</span>
                </button>
              ))}
            </div>
          </section>

          {/* Holdings Section */}
          <section style={{ marginTop: "20px" }}>
            <div className="page-header">
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: 0 }}>
                {t('portfolio.holdings')}
              </h3>
              <button 
                className="btn btn-outline"
                onClick={() => router.push('/dashboard/portfolio/manage')}
                style={{ padding: "8px 14px", fontSize: "13px" }}
              >
                {t('portfolio.manage')}
              </button>
            </div>

            {/* Filters and Sort Controls */}
            <div className="portfolio-controls">
              <div className="filter-buttons">
                <button 
                  className={`filter-btn ${filter === 'all' ? 'active' : ''}`}
                  onClick={() => setFilter('all')}
                >
                  {t('portfolio.all')}
                </button>
                <button 
                  className={`filter-btn ${filter === 'gaining' ? 'active' : ''}`}
                  onClick={() => setFilter('gaining')}
                >
                  {t('portfolio.gaining')}
                </button>
                <button 
                  className={`filter-btn ${filter === 'losing' ? 'active' : ''}`}
                  onClick={() => setFilter('losing')}
                >
                  {t('portfolio.losing')}
                </button>
              </div>

              <div className="sort-controls">
                <select 
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as 'value' | 'change' | 'name')}
                  className="sort-select"
                >
                  <option value="value">Sort by Value</option>
                  <option value="change">Sort by Change</option>
                  <option value="name">Sort by Name</option>
                </select>
                <button
                  className="sort-order-btn"
                  onClick={() => setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc')}
                >
                  {sortOrder === 'desc' ? '↓' : '↑'}
                </button>
              </div>
            </div>

            <div className="list-card">
              {sortedHoldings.length > 0 ? (
                sortedHoldings.map((h, i) => (
                  <ListRow 
                    key={i} 
                    iconSrc={h.iconSrc} 
                    name={h.name} 
                    label={h.label} 
                    amount={h.amount} 
                    pill={h.value}
                    pillClass={h.change.startsWith("+") ? "" : "negative"}
                  />
                ))
              ) : (
                <div style={{ padding: '20px', textAlign: 'center', color: 'var(--color-neutrals-text-secondary)' }}>
                  {t('portfolio.noHoldings')}
                </div>
              )}
            </div>
          </section>

          {/* Asset Performance Chart Placeholder */}
          <section style={{ marginTop: "20px" }}>
            <div className="page-header">
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: 0 }}>
                Performance
              </h3>
              <div className="times">
                <span>1T</span>
                <span>1W</span>
                <span className="active">1M</span>
                <span>1J</span>
              </div>
            </div>
            
            <div className="chart">
              <div className="chart-grid"></div>
              <svg viewBox="0 0 300 100" preserveAspectRatio="none">
                <path 
                  d="M0,80 C20,75 30,60 50,65 C70,70 80,40 100,45 C120,50 130,30 150,35 C170,40 180,20 200,25 C220,30 230,10 250,15 C270,20 280,5 300,10 L300,100 L0,100 Z" 
                  fill="rgba(15, 157, 88, 0.1)"
                  stroke="none"
                />
                <path 
                  d="M0,80 C20,75 30,60 50,65 C70,70 80,40 100,45 C120,50 130,30 150,35 C170,40 180,20 200,25 C220,30 230,10 250,15 C270,20 280,5 300,10" 
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                />
              </svg>
            </div>
          </section>

          {/* Recent Transactions */}
          <section style={{ marginTop: "20px" }}>
            <div className="page-header">
              <h3 className="section-title" style={{ marginTop: 0, marginBottom: 0 }}>
                {t('portfolio.recentActivity')}
              </h3>
              <button 
                className="view-all-link"
                onClick={() => router.push('/dashboard/transactions')}
              >
                {t('portfolio.viewAll')}
              </button>
            </div>

            <div className="transactions-card">
              <div className="transaction-row has-border">
                <div className="transaction-type-icon buy">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 5v14M5 12h14" />
                  </svg>
                </div>
                <div className="transaction-info">
                  <div className="transaction-asset">
                    <span className="asset-name">Bitcoin</span>
                    <span className="asset-symbol">BTC</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="tx-type-label">{t('transactions.buy')}</span>
                    <span className="tx-date">· Today, 14:32</span>
                  </div>
                </div>
                <div className="transaction-amounts">
                  <div className="tx-amount">+0,001 BTC</div>
                  <div className="tx-value">≈ 45,00 €</div>
                </div>
                <div className="transaction-status completed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <div className="transaction-row has-border">
                <div className="transaction-type-icon deposit">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <div className="transaction-info">
                  <div className="transaction-asset">
                    <span className="asset-name">Euro</span>
                    <span className="asset-symbol">EUR</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="tx-type-label">{t('transactions.deposit')}</span>
                    <span className="tx-date">· Yesterday, 09:15</span>
                  </div>
                </div>
                <div className="transaction-amounts">
                  <div className="tx-amount">+500,00 €</div>
                </div>
                <div className="transaction-status completed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>

              <div className="transaction-row">
                <div className="transaction-type-icon sell">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14" />
                  </svg>
                </div>
                <div className="transaction-info">
                  <div className="transaction-asset">
                    <span className="asset-name">Ethereum</span>
                    <span className="asset-symbol">ETH</span>
                  </div>
                  <div className="transaction-meta">
                    <span className="tx-type-label">{t('transactions.sell')}</span>
                    <span className="tx-date">· 15.01.2025</span>
                  </div>
                </div>
                <div className="transaction-amounts">
                  <div className="tx-amount pill negative">-0,05 ETH</div>
                  <div className="tx-value">≈ 120,00 €</div>
                </div>
                <div className="transaction-status completed">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M20 6L9 17l-5-5" />
                  </svg>
                </div>
              </div>
            </div>
          </section>
        </main>
      </div>
    </div>
  );
}

