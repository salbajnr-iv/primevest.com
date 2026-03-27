"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import type { MarketListing, MarketListResponse } from "@/lib/market/listings";
import { getAssetColor, formatPrice } from "@/lib/market/listings";

export default function MetalsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedMetal, setSelectedMetal] = React.useState<MarketListing | null>(null);
  const [metals, setMetals] = React.useState<MarketListing[]>([]);

  React.useEffect(() => setIsClient(true), []);

  React.useEffect(() => {
    let isMounted = true;

    const loadMetals = async () => {
      try {
        const response = await fetch("/api/market/list?category=metals", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as MarketListResponse | null;
        if (!response.ok || !payload?.ok || !isMounted) return;
        setMetals(payload.listings);
      } catch {
        // keep fallback
      }
    };

    void loadMetals();
    const interval = window.setInterval(loadMetals, 30000);
    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header"><div className="header-left"><Link href="/" className="header-back"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg></Link><span className="header-eyebrow">INVEST</span><div className="header-title">Precious Metals</div></div></header>

        <section className="hero-section" style={{ backgroundImage: "url(/vectors/bg-metals.svg)", backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 className="hero-title">Invest in Precious Metals</h1><p className="hero-subtitle">Invest in gold, silver, palladium and platinum</p>
          <div className="hero-stats"><div className="hero-stat"><span className="hero-stat-value">{metals.length || 4}</span><span className="hero-stat-label">Metals</span></div><div className="hero-stat"><span className="hero-stat-value">€0</span><span className="hero-stat-label">Trading Fees</span></div><div className="hero-stat"><span className="hero-stat-value">24/7</span><span className="hero-stat-label">Trading</span></div></div>
        </section>

        <section className="asset-grid" style={{ padding: "0 16px" }}>
          {metals.map((metal) => (
            <div key={metal.id} className="asset-card" onClick={() => setSelectedMetal(metal)}>
              <div className="asset-card-header"><div className="asset-card-icon" style={{ background: getAssetColor(metal.symbol) }}>{metal.iconSrc ? <Image src={metal.iconSrc} alt={metal.name} width={20} height={20} unoptimized style={{ borderRadius: "50%" }} /> : <span style={{ color: "#fff", fontWeight: 700 }}>{metal.symbol.slice(0, 1)}</span>}</div><div className="asset-card-info"><span className="asset-card-name">{metal.name}</span><span className="asset-card-symbol">{metal.symbol}</span></div></div>
              <div className="asset-card-price"><span className="price-value">€{formatPrice(metal.price)}</span><span className={`change-value ${metal.change24h >= 0 ? "positive" : "negative"}`}>{metal.change24h >= 0 ? "+" : ""}{metal.change24h.toFixed(2)}%</span></div>
            </div>
          ))}
        </section>

        <section className="info-section"><h3 className="section-title">Why invest in Precious Metals?</h3><div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-coins.svg" alt="inflation hedge" width={28} height={28} /></div><div className="info-content"><h4>Hedge Against Inflation</h4><p>Precious metals have historically maintained their value over time.</p></div></div><div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-shield.svg" alt="safe haven" width={28} height={28} /></div><div className="info-content"><h4>Safe Haven Asset</h4><p>Investors turn to metals during economic uncertainty.</p></div></div><div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-diversify.svg" alt="portfolio diversification" width={28} height={28} /></div><div className="info-content"><h4>Portfolio Diversification</h4><p>Add stability to your investment portfolio.</p></div></div></section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}><Link href="/dashboard/buy" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #ffd700 0%, #b8860b 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>Start Trading Metals</Link></div>
      </div>

      {selectedMetal && <div className="modal-overlay" onClick={() => setSelectedMetal(null)}><div className="modal-content" onClick={(e) => e.stopPropagation()}><div className="modal-header"><div style={{ display: "flex", alignItems: "center", gap: 12 }}><div className="asset-card-icon" style={{ background: getAssetColor(selectedMetal.symbol), width: 44, height: 44 }}>{selectedMetal.iconSrc ? <Image src={selectedMetal.iconSrc} alt={selectedMetal.name} width={32} height={32} unoptimized style={{ borderRadius: "50%" }} /> : <span style={{ color: "#fff", fontWeight: 700 }}>{selectedMetal.symbol.slice(0, 1)}</span>}</div><div><h3 style={{ margin: 0 }}>{selectedMetal.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedMetal.symbol}</span></div></div><button className="modal-close" onClick={() => setSelectedMetal(null)}>✕</button></div><div className="modal-body"><div style={{ textAlign: "center", marginBottom: 20 }}><div style={{ fontSize: 32, fontWeight: 800 }}>€{formatPrice(selectedMetal.price)}</div><div className={`market-change ${selectedMetal.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedMetal.change24h >= 0 ? "+" : ""}{selectedMetal.change24h.toFixed(2)}% (24h)</div></div><div style={{ display: "flex", gap: 10 }}><Link href="/dashboard/buy" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Buy {selectedMetal.symbol}</Link><Link href="/dashboard/sell" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Sell {selectedMetal.symbol}</Link></div></div></div></div>}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
