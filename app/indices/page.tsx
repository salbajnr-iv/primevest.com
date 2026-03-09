"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

const indicesData = [
  { id: "bci", name: "PrimeVest Crypto Index", symbol: "BCI", price: 125.45, change24h: 2.15, marketCap: 85000000, description: "Top 10 cryptocurrencies by market cap", holdings: ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT", "AVAX", "LINK"] },
  { id: "bci20", name: "PrimeVest Crypto Index 20", symbol: "BCI20", price: 98.30, change24h: 1.85, marketCap: 45000000, description: "Top 20 cryptocurrencies by market cap", holdings: ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT", "AVAX", "LINK", "MATIC", "LTC", "UNI", "ATOM", "XLM", "ALGO", "VET", "FIL", "THETA", "AAVE"] },
  { id: "bci50", name: "PrimeVest Crypto Index 50", symbol: "BCI50", price: 78.90, change24h: 1.45, marketCap: 32000000, description: "Top 50 cryptocurrencies by market cap", holdings: ["BTC", "ETH", "BNB", "SOL", "XRP", "ADA", "DOGE", "DOT", "AVAX", "LINK", "MATIC", "LTC", "UNI", "ATOM", "XLM", "ALGO", "VET", "FIL", "THETA", "AAVE", "EOS", "XTZ", "FLOW", "CHZ", "MANA", "SAND", "AXS", "GALA", "ENJ", "BAT", "ZEC", "DASH", "ZRX", "COMP", "SNX", "YFI", "MKR", "SUSHI", "CRV", "RUNE", "ONE", "ZIL", "NEAR", "FTM", "ALICE", "SOL", "QNT", "GRT", "HBAR", "NEO", "KAVA", "ROSE"] },
  { id: "defi", name: "DeFi Index", symbol: "DEFI", price: 45.20, change24h: 3.25, marketCap: 18000000, description: "Leading DeFi tokens", holdings: ["UNI", "AAVE", "MKR", "COMP", "SNX", "SUSHI", "CRV", "YFI", "BAL", "REN"] },
  { id: "metaverse", name: "Metaverse Index", symbol: "META", price: 32.80, change24h: -1.45, marketCap: 12000000, description: "Top metaverse and gaming tokens", holdings: ["MANA", "SAND", "AXS", "GALA", "ENJ", "ALICE", "ILV", "YGG", "MAGIC", "BLUR"] },
];

export default function IndicesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedIndex, setSelectedIndex] = React.useState<typeof indicesData[0] | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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
            <div className="header-title">Crypto Indices</div>
          </div>
        </header>

        <section className="hero-section" style={{ backgroundImage: "url(/vectors/bg-indices.svg)", backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 className="hero-title">Crypto Indices</h1>
          <p className="hero-subtitle">The world&apos;s first real crypto indices</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">5</span>
              <span className="hero-stat-label">Indices</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">€0</span>
              <span className="hero-stat-label">Trading Fees</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Trading</span>
            </div>
          </div>
        </section>

        <section className="asset-grid" style={{ padding: "0 16px" }}>
          {indicesData.map((index) => (
            <div key={index.id} className="asset-card" onClick={() => setSelectedIndex(index)}>
              <div className="asset-card-header">
                <div className="asset-card-icon" style={{ background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)" }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{index.symbol.slice(0, 2)}</span>
                </div>
                <div className="asset-card-info">
                  <span className="asset-card-name">{index.name}</span>
                  <span className="asset-card-symbol">{index.symbol}</span>
                </div>
              </div>
              <div className="asset-card-price">
                <span className="price-value">€{index.price.toFixed(2)}</span>
                <span className={`change-value ${index.change24h >= 0 ? "positive" : "negative"}`}>
                  {index.change24h >= 0 ? "+" : ""}{index.change24h.toFixed(2)}%
                </span>
              </div>
              <p style={{ fontSize: 12, color: "var(--muted)", marginTop: 8 }}>{index.description}</p>
              <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                {index.holdings.slice(0, 5).map((h) => (
                  <span key={h} style={{ fontSize: 10, padding: "2px 6px", background: "var(--surface-hover)", borderRadius: 4 }}>{h}</span>
                ))}
{index.holdings.length > 5 && <span style={{ fontSize: 10, color: "var(--muted)" }}>+{index.holdings.length - 5} more</span>}
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">Why invest in Crypto Indices?</h3>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-diversify.svg" alt="instant diversification" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Instant Diversification</h4>
              <p>Get exposure to multiple cryptocurrencies with a single trade.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-analytics.svg" alt="automatic rebalancing" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Automatic Rebalancing</h4>
              <p>Indices are automatically rebalanced to maintain optimal allocation.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-shield.svg" alt="reduced risk" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Reduced Risk</h4>
              <p>Spread your investment across multiple assets to reduce volatility.</p>
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #8e44ad 0%, #6c3483 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Start Trading Indices
          </Link>
        </div>
      </div>

      {selectedIndex && (
        <div className="modal-overlay" onClick={() => setSelectedIndex(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-card-icon" style={{ background: "linear-gradient(135deg, #8e44ad 0%, #9b59b6 100%)", width: 44, height: 44 }}>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{selectedIndex.symbol.slice(0, 2)}</span>
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedIndex.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedIndex.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedIndex(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{selectedIndex.price.toFixed(2)}</div>
                <div className={`market-change ${selectedIndex.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedIndex.change24h >= 0 ? "+" : ""}{selectedIndex.change24h.toFixed(2)}% (24h)</div>
              </div>
              <p style={{ marginBottom: 16 }}>{selectedIndex.description}</p>
              <div style={{ marginBottom: 16 }}>
                <strong>Holdings:</strong>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 4, marginTop: 8 }}>
                  {selectedIndex.holdings.map((h) => (
                    <span key={h} style={{ fontSize: 12, padding: "4px 8px", background: "var(--surface-hover)", borderRadius: 4 }}>{h}</span>
                  ))}
                </div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/trade" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Buy {selectedIndex.symbol}</Link>
                <Link href="/dashboard/trade" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Sell {selectedIndex.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
