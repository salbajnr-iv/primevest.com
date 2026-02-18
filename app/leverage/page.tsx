"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, getCoinColor } from "@/hooks/usePriceSimulation";

const leverageAssets: MarketData[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.00, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.50, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.082, change24h: 5.67, marketCap: 11800000000, volume24h: 2100000000, high24h: 0.088, low24h: 0.075, iconSrc: "/doge-logo.png" },
  { id: "xrp", name: "XRP", symbol: "XRP", price: 0.62, change24h: 0.89, marketCap: 33800000000, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
];

const leverageOptions = [
  { leverage: 2, label: "2x" },
  { leverage: 5, label: "5x" },
  { leverage: 10, label: "10x" },
  { leverage: 25, label: "25x" },
];

export default function LeveragePage() {
  const { data: marketData } = usePriceSimulation(leverageAssets, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedAsset, setSelectedAsset] = React.useState<MarketData | null>(null);
  const [selectedLeverage, setSelectedLeverage] = React.useState(2);

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
            <span className="header-eyebrow">NEW</span>
            <div className="header-title">Leverage Trading</div>
          </div>
        </header>

        <section className="hero-section" style={{ background: "linear-gradient(135deg, #0ec02b 0%, #0a961d 100%)" }}>
          <span className="new-badge" style={{ background: "#fff", color: "#0ec02b", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12, display: "inline-block" }}>NEW</span>
          <h1 className="hero-title">Leverage Trading</h1>
          <p className="hero-subtitle">Go Long or Short on top cryptocurrencies with leverage</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">Up to 25x</span>
              <span className="hero-stat-label">Leverage</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">0.02%</span>
              <span className="hero-stat-label">Funding Rate</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Trading</span>
            </div>
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">How Leverage Works</h3>
          <div className="info-card">
            <div className="info-icon">📈</div>
            <div className="info-content">
              <h4>Go Long</h4>
              <p>Profit when the price goes up. Use leverage to amplify your gains.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📉</div>
            <div className="info-content">
              <h4>Go Short</h4>
              <p>Profit when the price goes down. Profit from market downturns.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">⚠️</div>
            <div className="info-content">
              <h4>Risk Warning</h4>
              <p>Leverage amplifies both gains and losses. Trade responsibly.</p>
            </div>
          </div>
        </section>

        <section style={{ padding: "0 16px" }}>
          <h3 className="section-title">Available for Leverage Trading</h3>
          <div className="leverage-selector" style={{ marginBottom: 16 }}>
            <span style={{ fontSize: 14, color: "var(--muted)", marginRight: 12 }}>Select Leverage:</span>
            {leverageOptions.map((opt) => (
              <button
                key={opt.leverage}
                onClick={() => setSelectedLeverage(opt.leverage)}
                style={{
                  padding: "8px 16px",
                  borderRadius: 8,
                  border: selectedLeverage === opt.leverage ? "2px solid #0ec02b" : "1px solid var(--border)",
                  background: selectedLeverage === opt.leverage ? "rgba(14, 192, 43, 0.1)" : "transparent",
                  color: selectedLeverage === opt.leverage ? "#0ec02b" : "var(--text)",
                  fontWeight: 600,
                  cursor: "pointer",
                  marginRight: 8
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>
          {marketData.map((asset) => (
            <div key={asset.id} className="market-row" onClick={() => setSelectedAsset(asset)}>
              <div className="market-asset">
                <div className="asset-icon" style={{ background: getCoinColor(asset.symbol) }}>
                  {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={20} height={20} style={{ borderRadius: "50%" }} />}
                </div>
                <div className="asset-info">
                  <span className="asset-name">{asset.name}</span>
                  <span className="asset-symbol">{asset.symbol}</span>
                </div>
              </div>
              <div className="market-price">
                <span className="price-value">€{formatPrice(asset.price, asset.symbol)}</span>
              </div>
              <div className={`market-change ${asset.change24h >= 0 ? "positive" : "negative"}`}>
                {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
              </div>
            </div>
          ))}
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #0ec02b 0%, #0a961d 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Start Leverage Trading
          </Link>
        </div>
      </div>

      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-icon" style={{ background: getCoinColor(selectedAsset.symbol), width: 44, height: 44 }}>
                  {selectedAsset.iconSrc && <Image src={selectedAsset.iconSrc} alt={selectedAsset.name} width={32} height={32} style={{ borderRadius: "50%" }} />}
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedAsset.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedAsset.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedAsset(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{formatPrice(selectedAsset.price, selectedAsset.symbol)}</div>
                <div className={`market-change ${selectedAsset.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedAsset.change24h >= 0 ? "+" : ""}{selectedAsset.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Selected Leverage: {selectedLeverage}x</strong>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/trade" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Long {selectedAsset.symbol}</Link>
                <Link href="/dashboard/trade" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Short {selectedAsset.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
