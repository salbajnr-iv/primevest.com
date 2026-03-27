"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
import BottomNav from "@/components/BottomNav";
import type { MarketListing, MarketListResponse } from "@/lib/market/listings";
import { formatCompact, getAssetColor } from "@/lib/market/listings";

export default function StocksPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedStock, setSelectedStock] = React.useState<MarketListing | null>(null);
  const [stocks, setStocks] = React.useState<MarketListing[]>([]);
  const [feedUpdatedAt, setFeedUpdatedAt] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    let isMounted = true;

    const loadStocks = async () => {
      try {
        const response = await fetch("/api/market/list?category=stocks", { cache: "no-store" });
        const payload = (await response.json().catch(() => null)) as MarketListResponse | null;
        if (!response.ok || !payload?.ok || !isMounted) return;

        setStocks(payload.listings);
        setFeedUpdatedAt(payload.freshness.latestPricedAt);
      } catch {
        // keep empty fallback
      }
    };

    void loadStocks();
    const interval = window.setInterval(loadStocks, 30000);

    return () => {
      isMounted = false;
      window.clearInterval(interval);
    };
  }, []);

  const filteredStocks = React.useMemo(() => {
    if (!searchQuery) return stocks;
    const query = searchQuery.toLowerCase();
    return stocks.filter((s) => s.name.toLowerCase().includes(query) || s.symbol.toLowerCase().includes(query));
  }, [searchQuery, stocks]);

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
            <div className="header-title">Stocks*</div>
          </div>
        </header>

        <section className="hero-section" style={{ backgroundImage: "url(/vectors/bg-stocks.svg)", backgroundSize: "cover", backgroundPosition: "center", border: "1px solid rgba(255,255,255,0.08)" }}>
          <h1 className="hero-title">Invest in Stocks*</h1>
          <p className="hero-subtitle">Trade real stocks with zero commissions</p>
          <div className="hero-stats">
            <div className="hero-stat"><span className="hero-stat-value">2,500+</span><span className="hero-stat-label">Stocks</span></div>
            <div className="hero-stat"><span className="hero-stat-value">€0</span><span className="hero-stat-label">Commission</span></div>
            <div className="hero-stat"><span className="hero-stat-value">24/7</span><span className="hero-stat-label">Trading</span></div>
          </div>
          <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 12 }}>*CFD service. Your capital is at risk.</p>
          {feedUpdatedAt && <p style={{ fontSize: 11, color: "var(--muted)", marginTop: 6 }}>Live feed updated: {new Date(feedUpdatedAt).toLocaleString("en-US")}</p>}
        </section>

        <div className="market-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search stocks..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <section className="market-list">
          <div className="market-list-header"><span>Asset</span><span>Price</span><span>24h</span><span>Market Cap</span></div>
          <div className="market-list-body">
            {filteredStocks.map((stock) => (
              <div key={stock.id} className="market-row" onClick={() => setSelectedStock(stock)}>
                <div className="market-asset">
                  <div className="asset-icon" style={{ background: getAssetColor(stock.symbol) }}>
                    {stock.iconSrc ? <Image src={stock.iconSrc} alt={stock.name} width={20} height={20} unoptimized style={{ borderRadius: "50%" }} /> : <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>{stock.symbol.slice(0, 2)}</span>}
                  </div>
                  <div className="asset-info"><span className="asset-name">{stock.name}</span><span className="asset-symbol">{stock.symbol}</span></div>
                </div>
                <div className="market-price"><span className="price-value">€{stock.price.toFixed(2)}</span></div>
                <div className={`market-change ${stock.change24h >= 0 ? "positive" : "negative"}`}>{stock.change24h >= 0 ? "+" : ""}{stock.change24h.toFixed(2)}%</div>
                <div className="market-cap"><span className="cap-value">{formatCompact(stock.marketCap)}</span></div>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Why trade Stocks with us?</h3>
          <div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-coins.svg" alt="zero commission" width={28} height={28} /></div><div className="info-content"><h4>Zero Commissions</h4><p>Trade stocks without paying any commission fees.</p></div></div>
          <div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-analytics.svg" alt="professional trading" width={28} height={28} /></div><div className="info-content"><h4>Professional Trading</h4><p>Advanced tools and real-time market data.</p></div></div>
          <div className="info-card"><div className="info-icon"><Image src="/vectors/icons/icon-shield.svg" alt="secure platform" width={28} height={28} /></div><div className="info-content"><h4>Secure Platform</h4><p>Your investments are protected with industry-leading security.</p></div></div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #1a73e8 0%, #1557b0 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>Start Trading Stocks</Link>
        </div>
      </div>

      {selectedStock && (
        <div className="modal-overlay" onClick={() => setSelectedStock(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-icon" style={{ background: getAssetColor(selectedStock.symbol), width: 44, height: 44 }}>
                  {selectedStock.iconSrc ? <Image src={selectedStock.iconSrc} alt={selectedStock.name} width={32} height={32} unoptimized style={{ borderRadius: "50%" }} /> : <span style={{ color: "#fff", fontWeight: 700 }}>{selectedStock.symbol.slice(0, 2)}</span>}
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedStock.name}</h3><span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedStock.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedStock(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{selectedStock.price.toFixed(2)}</div>
                <div className={`market-change ${selectedStock.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>{selectedStock.change24h >= 0 ? "+" : ""}{selectedStock.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/trade" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Buy {selectedStock.symbol}</Link>
                <Link href="/dashboard/trade" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>Sell {selectedStock.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
