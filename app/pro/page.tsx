"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, getCoinColor } from "@/hooks/usePriceSimulation";

const tradingPairs: MarketData[] = [
  { id: "btc-eur", name: "Bitcoin", symbol: "BTC/EUR", price: 43250.00, change24h: 2.45, marketCap: 0, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth-eur", name: "Ethereum", symbol: "ETH/EUR", price: 2280.50, change24h: 1.82, marketCap: 0, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb-eur", name: "Binance Coin", symbol: "BNB/EUR", price: 312.40, change24h: -0.54, marketCap: 0, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol-eur", name: "Solana", symbol: "SOL/EUR", price: 98.75, change24h: 4.21, marketCap: 0, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp-eur", name: "Ripple", symbol: "XRP/EUR", price: 0.62, change24h: 0.89, marketCap: 0, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
];

const orderTypes = [
  { id: "limit", name: "Limit", description: "Set your desired price" },
  { id: "market", name: "Market", description: "Instant execution at best price" },
  { id: "stop-loss", name: "Stop Loss", description: "Auto-exit when price drops" },
  { id: "take-profit", name: "Take Profit", description: "Auto-exit when target reached" },
];

const features = [
  { icon: "📊", title: "Advanced Charts", description: "Professional tradingview charts with indicators" },
  { icon: "⚡", title: "Fast Execution", description: "Sub-millisecond order execution" },
  { icon: "📉", title: "Short Selling", description: "Profit from falling prices" },
  { icon: "🔒", title: "Stop Loss & Take Profit", description: "Automated risk management" },
];

export default function ProTradingPage() {
  const { data: marketData } = usePriceSimulation(tradingPairs, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedPair, setSelectedPair] = React.useState<MarketData | null>(null);
  const [orderType, setOrderType] = React.useState("limit");
  const [orderSide, setOrderSide] = React.useState<"buy" | "sell">("buy");
  const [price, setPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (selectedPair) {
      setPrice(selectedPair.price.toString());
    }
  }, [selectedPair]);

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">NEW</span>
            <div className="header-title">Pro Trading</div>
          </div>
        </header>

        <section className="hero-section" style={{ background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)" }}>
          <span className="new-badge" style={{ background: "#fff", color: "#1a73e8", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12, display: "inline-block" }}>NEW</span>
          <h1 className="hero-title">Pro Trading</h1>
          <p className="hero-subtitle">Advanced trading for professionals</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">0.02%</span>
              <span className="hero-stat-label">Maker Fee</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">0.05%</span>
              <span className="hero-stat-label">Taker Fee</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">300+</span>
              <span className="hero-stat-label">Trading Pairs</span>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Key Features</h3>
          <div className="features-grid">
            {features.map((feature, index) => (
              <div key={index} className="feature-card">
                <div className="feature-icon">{feature.icon}</div>
                <div className="feature-content">
                  <h4>{feature.title}</h4>
                  <p>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section style={{ padding: "0 16px" }}>
          <h3 className="section-title">Trading Pairs</h3>
          {marketData.map((pair) => (
            <div key={pair.id} className="market-row" onClick={() => setSelectedPair(pair)}>
              <div className="market-asset">
                <div className="asset-icon" style={{ background: getCoinColor(pair.symbol.split("/")[0]) }}>
                  <span style={{ color: "#fff", fontWeight: 700, fontSize: 10 }}>{pair.symbol.split("/")[0].slice(0, 2)}</span>
                </div>
                <div className="asset-info">
                  <span className="asset-name">{pair.name}</span>
                  <span className="asset-symbol">{pair.symbol}</span>
                </div>
              </div>
              <div className="market-price">
                <span className="price-value">€{formatPrice(pair.price, pair.symbol)}</span>
              </div>
              <div className={`market-change ${pair.change24h >= 0 ? "positive" : "negative"}`}>
                {pair.change24h >= 0 ? "+" : ""}{pair.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">Order Types</h3>
          <div className="order-types-grid">
            {orderTypes.map((type) => (
              <button
                key={type.id}
                className={`order-type-card ${orderType === type.id ? "active" : ""}`}
                onClick={() => setOrderType(type.id)}
              >
                <strong>{type.name}</strong>
                <small>{type.description}</small>
              </button>
            ))}
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Open Pro Trading
          </Link>
        </div>
      </div>

      {selectedPair && (
        <div className="modal-overlay" onClick={() => setSelectedPair(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-icon" style={{ background: getCoinColor(selectedPair.symbol.split("/")[0]), width: 44, height: 44 }}>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{selectedPair.symbol.split("/")[0].slice(0, 2)}</span>
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedPair.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedPair.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedPair(null)} aria-label="Close" title="Close">✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{formatPrice(selectedPair.price, selectedPair.symbol)}</div>
                <div className={`market-change ${selectedPair.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedPair.change24h >= 0 ? "+" : ""}{selectedPair.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginBottom: 16 }}>
                <button onClick={() => setOrderSide("buy")} style={{ flex: 1, padding: 12, background: orderSide === "buy" ? "#0ec02b" : "var(--surface-hover)", color: orderSide === "buy" ? "#fff" : "var(--text)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Buy</button>
                <button onClick={() => setOrderSide("sell")} style={{ flex: 1, padding: 12, background: orderSide === "sell" ? "#ea4335" : "var(--surface-hover)", color: orderSide === "sell" ? "#fff" : "var(--text)", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>Sell</button>
              </div>
              <div style={{ marginBottom: 12 }}>
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Price (EUR)</label>
                <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <div style={{ marginBottom: 16 }}>
                <label style={{ fontSize: 12, color: "var(--muted)", display: "block", marginBottom: 4 }}>Amount</label>
                <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" style={{ width: "100%", padding: "12px 16px", borderRadius: 8, border: "1px solid var(--border)", background: "var(--surface)", color: "var(--text)" }} />
              </div>
              <Link href="/dashboard/trade" style={{ display: "block", width: "100%", padding: 14, background: orderSide === "buy" ? "#0ec02b" : "#ea4335", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                {orderSide === "buy" ? "Buy" : "Sell"} {selectedPair.symbol.split("/")[0]}
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
