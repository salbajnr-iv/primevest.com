"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";

const commoditiesData = [
  { id: "oil", name: "Crude Oil", symbol: "USOIL", price: 78.45, change24h: 1.25, marketCap: 0, volume24h: 250000000, category: "Energy" },
  { id: "natural-gas", name: "Natural Gas", symbol: "NATGAS", price: 2.85, change24h: -2.15, marketCap: 0, volume24h: 85000000, category: "Energy" },
  { id: "gold", name: "Gold", symbol: "XAU", price: 2045.30, change24h: 0.45, marketCap: 0, volume24h: 8500000, category: "Precious Metals" },
  { id: "silver", name: "Silver", symbol: "XAG", price: 23.45, change24h: 1.12, marketCap: 0, volume24h: 1200000, category: "Precious Metals" },
  { id: "copper", name: "Copper", symbol: "COPPER", price: 3.85, change24h: 0.85, marketCap: 0, volume24h: 45000000, category: "Base Metals" },
  { id: "wheat", name: "Wheat", symbol: "WHEAT", price: 612.50, change24h: -0.75, marketCap: 0, volume24h: 18000000, category: "Agriculture" },
];

const categories = ["All", "Energy", "Precious Metals", "Base Metals", "Agriculture"];

export default function CommoditiesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [selectedCommodity, setSelectedCommodity] = React.useState<typeof commoditiesData[0] | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredCommodities = React.useMemo(() => {
    if (activeCategory === "All") return commoditiesData;
    return commoditiesData.filter(c => c.category === activeCategory);
  }, [activeCategory]);

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
            <div className="header-title">Commodities*</div>
          </div>
        </header>

        <section className="hero-section" style={{ backgroundImage: "url(/vectors/bg-commodities.svg)", backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 className="hero-title">Invest in Commodities*</h1>
          <p className="hero-subtitle">Trade commodities 24/7 with competitive spreads</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">6+</span>
              <span className="hero-stat-label">Commodities</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">0.0%</span>
              <span className="hero-stat-label">Commission</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Trading</span>
            </div>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>*CFD service. Your capital is at risk.</p>
        </section>

        <div className="market-categories" style={{ marginTop: 16 }}>
          {categories.map((cat) => (
            <button key={cat} className={`category-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        <section className="market-list" style={{ marginTop: 16 }}>
          <div className="market-list-header"><span>Asset</span><span>Price</span><span>24h</span><span>Category</span></div>
          <div className="market-list-body">
            {filteredCommodities.map((commodity) => (
              <div key={commodity.id} className="market-row" onClick={() => setSelectedCommodity(commodity)}>
                <div className="market-asset">
                  <div className="asset-icon" style={{ background: commodity.category === "Energy" ? "#e67e22" : commodity.category === "Precious Metals" ? "#f1c40f" : commodity.category === "Agriculture" ? "#27ae60" : "#95a5a6" }}>
                    <span style={{ color: "#fff", fontWeight: 700, fontSize: 10 }}>{commodity.symbol.slice(0, 2)}</span>
                  </div>
                  <div className="asset-info">
                    <span className="asset-name">{commodity.name}</span>
                    <span className="asset-symbol">{commodity.symbol}</span>
                  </div>
                </div>
                <div className="market-price"><span className="price-value">€{commodity.price.toLocaleString()}</span></div>
                <div className={`market-change ${commodity.change24h >= 0 ? "positive" : "negative"}`}>{commodity.change24h >= 0 ? "+" : ""}{commodity.change24h.toFixed(2)}%</div>
                <div className="market-cap"><span className="cap-value" style={{ fontSize: 12 }}>{commodity.category}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Why trade Commodities?</h3>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-diversify.svg" alt="global market access" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Global Market Access</h4>
              <p>Access commodity markets from anywhere, anytime.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-analytics.svg" alt="inflation hedge" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Hedge Against Inflation</h4>
              <p>Commodities often serve as a hedge against inflation.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon"><Image src="/vectors/icons/icon-bolt.svg" alt="leverage trading" width={28} height={28} /></div>
            <div className="info-content">
              <h4>Leverage Trading</h4>
              <p>Trade with leverage to amplify your potential returns.</p>
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #e67e22 0%, #d35400 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Start Trading Commodities
          </Link>
        </div>
      </div>

      {selectedCommodity && (
        <div className="modal-overlay" onClick={() => setSelectedCommodity(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-icon" style={{ background: selectedCommodity.category === "Energy" ? "#e67e22" : selectedCommodity.category === "Precious Metals" ? "#f1c40f" : selectedCommodity.category === "Agriculture" ? "#27ae60" : "#95a5a6", width: 44, height: 44 }}>
                  <span style={{ color: "#fff", fontWeight: 700 }}>{selectedCommodity.symbol.slice(0, 2)}</span>
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedCommodity.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedCommodity.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCommodity(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{selectedCommodity.price.toLocaleString()}</div>
                <div className={`market-change ${selectedCommodity.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedCommodity.change24h >= 0 ? "+" : ""}{selectedCommodity.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div style={{ marginBottom: 16 }}>
                <strong>Category:</strong> <span>{selectedCommodity.category}</span>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/trade" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Buy {selectedCommodity.symbol}</Link>
                <Link href="/dashboard/trade" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Sell {selectedCommodity.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
