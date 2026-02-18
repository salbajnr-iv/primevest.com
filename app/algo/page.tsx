"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const botStrategies = [
  { id: "grid", name: "Grid Trading", description: "Automatically buy low and sell high within a price range", icon: "📊", performance: "+24.5%", risk: "Medium" },
  { id: "dca", name: "DCA Bot", description: "Dollar-cost averaging - invest fixed amounts at regular intervals", icon: "💰", performance: "+18.2%", risk: "Low" },
  { id: "signal", name: "Signal Trading", description: "Copy trading signals from professional traders", icon: "📡", performance: "+32.1%", risk: "High" },
  { id: "arbitrage", name: "Arbitrage", description: "Profit from price differences between exchanges", icon: "⚡", performance: "+8.5%", risk: "Low" },
];

const features = [
  { icon: "🤖", title: "Automated Trading", description: "Let bots trade for you 24/7" },
  { icon: "📈", title: "Backtesting", description: "Test strategies with historical data" },
  { icon: "⚙️", title: "Customizable", description: "Configure parameters to match your risk tolerance" },
  { icon: "🔒", title: "Secure", description: "Your funds remain in your control" },
];

export default function AlgoTradingPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedStrategy, setSelectedStrategy] = React.useState<typeof botStrategies[0] | null>(null);

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
            <span className="header-eyebrow">TRADING</span>
            <div className="header-title">Algo Trading</div>
          </div>
        </header>

        <section className="hero-section" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)" }}>
          <span className="new-badge" style={{ background: "#fff", color: "#7c3aed", padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, marginBottom: 12, display: "inline-block" }}>NEW</span>
          <h1 className="hero-title">Algo Trading</h1>
          <p className="hero-subtitle">Automate your trading with intelligent bots</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">4+</span>
              <span className="hero-stat-label">Bot Strategies</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Automated</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">€0</span>
              <span className="hero-stat-label">Setup Fee</span>
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
          <h3 className="section-title">Trading Bots</h3>
          {botStrategies.map((strategy) => (
            <div key={strategy.id} className="market-row" onClick={() => setSelectedStrategy(strategy)}>
              <div className="market-asset">
                <div className="asset-icon" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", fontSize: 24 }}>
                  {strategy.icon}
                </div>
                <div className="asset-info">
                  <span className="asset-name">{strategy.name}</span>
                  <span className="asset-symbol" style={{ fontSize: 12 }}>{strategy.description}</span>
                </div>
              </div>
              <div className="market-price">
                <span className="price-value" style={{ color: "#0ec02b" }}>{strategy.performance}</span>
              </div>
              <div className="market-change" style={{ fontSize: 12 }}>
                <span style={{ 
                  padding: "2px 8px", 
                  borderRadius: 4, 
                  background: strategy.risk === "Low" ? "rgba(15, 157, 88, 0.1)" : strategy.risk === "Medium" ? "rgba(251, 188, 4, 0.1)" : "rgba(234, 67, 53, 0.1)",
                  color: strategy.risk === "Low" ? "#0f9d58" : strategy.risk === "Medium" ? "#fbbc04" : "#ea4335"
                }}>
                  {strategy.risk} Risk
                </span>
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">How It Works</h3>
          <div className="steps-container">
            <div className="step-item">
              <div className="step-number">1</div>
              <div className="step-content">
                <h4>Choose a Strategy</h4>
                <p>Select from our proven bot strategies or create your own</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">2</div>
              <div className="step-content">
                <h4>Configure Parameters</h4>
                <p>Set your investment amount, risk level, and preferences</p>
              </div>
            </div>
            <div className="step-item">
              <div className="step-number">3</div>
              <div className="step-content">
                <h4>Activate Bot</h4>
                <p>Start automated trading and monitor your profits</p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/dashboard/trade" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Start Algo Trading
          </Link>
        </div>
      </div>

      {selectedStrategy && (
        <div className="modal-overlay" onClick={() => setSelectedStrategy(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="asset-icon" style={{ background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", width: 44, height: 44, fontSize: 24 }}>
                  {selectedStrategy.icon}
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedStrategy.name}</h3></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedStrategy(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>{selectedStrategy.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <small style={{ color: "var(--muted)" }}>Performance</small>
                  <div style={{ color: "#0ec02b", fontWeight: 600 }}>{selectedStrategy.performance}</div>
                </div>
                <div>
                  <small style={{ color: "var(--muted)" }}>Risk Level</small>
                  <div style={{ fontWeight: 600 }}>{selectedStrategy.risk}</div>
                </div>
              </div>
              <Link href="/dashboard/trade" style={{ display: "block", width: "100%", padding: 14, background: "linear-gradient(135deg, #7c3aed 0%, #4c1d95 100%)", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, textAlign: "center", textDecoration: "none" }}>
                Configure Bot
              </Link>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
