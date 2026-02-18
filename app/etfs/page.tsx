"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const etfsData = [
  { id: "btc", name: "Bitcoin ETN", symbol: "BTCE", price: 28.45, change24h: 2.35, marketCap: 1200000000, volume24h: 45000000, iconSrc: "https://assets.coingecko.com/coins/images/1/small/bitcoin.png" },
  { id: "eth", name: "Ethereum ETN", symbol: "ETHE", price: 18.92, change24h: 1.82, marketCap: 850000000, volume24h: 28000000, iconSrc: "https://assets.coingecko.com/coins/images/279/small/ethereum.png" },
  { id: "sp500", name: "S&P 500 ETF", symbol: "CSPX", price: 45.23, change24h: 0.45, marketCap: 4500000000, volume24h: 12000000, iconSrc: "https://via.placeholder.com/32/1a73e8/ffffff?text=SP" },
  { id: "msci", name: "MSCI World ETF", symbol: "SWDA", price: 38.50, change24h: 0.28, marketCap: 3200000000, volume24h: 8500000, iconSrc: "https://via.placeholder.com/32/34a853/ffffff?text=MS" },
  { id: "reit", name: "Global REITs ETF", symbol: "REET", price: 22.15, change24h: -0.52, marketCap: 450000000, volume24h: 3200000, iconSrc: "https://via.placeholder.com/32/fbbc04/000000?text=RE" },
  { id: "tech", name: "Tech ETF", symbol: "CHN9", price: 32.80, change24h: 1.15, marketCap: 680000000, volume24h: 5600000, iconSrc: "https://via.placeholder.com/32/ea4335/ffffff?text=TX" },
];

export default function EtfsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedEtf, setSelectedEtf] = React.useState<typeof etfsData[0] | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredEtfs = React.useMemo(() => {
    if (!searchQuery) return etfsData;
    const query = searchQuery.toLowerCase();
    return etfsData.filter(e => e.name.toLowerCase().includes(query) || e.symbol.toLowerCase().includes(query));
  }, [searchQuery]);

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">INVEST</span>
            <div className="header-title">ETFs*</div>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">Invest in ETFs*</h1>
          <p className="hero-subtitle">Diversify your portfolio with ETFs 24/7</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">200+</span>
              <span className="hero-stat-label">ETFs</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">€0</span>
              <span className="hero-stat-label">Commission</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Trading</span>
            </div>
          </div>
          <p className="etf-disclaimer">*CFD service. Your capital is at risk.</p>
        </section>

        <div className="market-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search ETFs..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <section className="market-list">
          <div className="market-list-header"><span>Asset</span><span>Price</span><span>24h</span><span>Market Cap</span></div>
          <div className="market-list-body">
            {filteredEtfs.map((etf) => (
              <div key={etf.id} className="market-row" onClick={() => setSelectedEtf(etf)}>
                <div className="market-asset">
                  <div className="asset-icon etf-icon">
                    <span className="etf-symbol">{etf.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="asset-info">
                    <span className="asset-name">{etf.name}</span>
                    <span className="asset-symbol">{etf.symbol}</span>
                  </div>
                </div>
                <div className="market-price"><span className="price-value">€{etf.price.toFixed(2)}</span></div>
                <div className={`market-change ${etf.change24h >= 0 ? "positive" : "negative"}`}>{etf.change24h >= 0 ? "+" : ""}{etf.change24h.toFixed(2)}%</div>
                <div className="market-cap"><span className="cap-value">€{(etf.marketCap / 1e9).toFixed(2)}B</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Why invest in ETFs?</h3>
          <div className="info-card">
            <div className="info-icon">🎯</div>
            <div className="info-content">
              <h4>Instant Diversification</h4>
              <p>Get exposure to hundreds of assets with a single trade.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">💰</div>
            <div className="info-content">
              <h4>Low Costs</h4>
              <p>Benefit from low expense ratios and zero commission trading.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">🕐</div>
            <div className="info-content">
              <h4>24/7 Trading</h4>
              <p>Trade ETFs round the clock, even outside market hours.</p>
            </div>
          </div>
        </section>

        <div className="cta-section">
          <Link href="/dashboard/trade" className="cta-button">
            Start Trading ETFs
          </Link>
        </div>
      </div>

      {selectedEtf && (
        <div className="modal-overlay" onClick={() => setSelectedEtf(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-asset-header">
                <div className="asset-icon etf-icon etf-icon-large">
                  <span className="etf-symbol etf-symbol-large">{selectedEtf.symbol.slice(0, 2)}</span>
                </div>
                <div><h3 className="modal-asset-name">{selectedEtf.name}</h3><span className="modal-asset-symbol">{selectedEtf.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedEtf(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-price-section">
                <div className="modal-price">€{selectedEtf.price.toFixed(2)}</div>
                <div className={`modal-change ${selectedEtf.change24h >= 0 ? "positive" : "negative"}`}>{selectedEtf.change24h >= 0 ? "+" : ""}{selectedEtf.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div className="modal-action-buttons">
                <Link href="/dashboard/trade" className="order-button buy">Buy {selectedEtf.symbol}</Link>
                <Link href="/dashboard/trade" className="order-button sell">Sell {selectedEtf.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
