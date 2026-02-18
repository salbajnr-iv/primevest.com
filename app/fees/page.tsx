"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const feeSections = [
  {
    title: "Cryptocurrency Trading",
    description: "Trade cryptocurrencies with low fees",
    fees: [
      { volume: "€0 - €10,000", maker: "0.15%", taker: "0.15%" },
      { volume: "€10,000 - €50,000", maker: "0.10%", taker: "0.12%" },
      { volume: "€50,000 - €100,000", maker: "0.08%", taker: "0.10%" },
      { volume: "€100,000+", maker: "0.05%", taker: "0.08%" },
    ]
  },
  {
    title: "Stock & ETF Trading",
    description: "Trade stocks and ETFs with zero commission",
    fees: [
      { volume: "All volumes", maker: "€0", taker: "€0", note: "CFD spread applies" },
    ]
  },
  {
    title: "Metals Trading",
    description: "Trade precious metals",
    fees: [
      { volume: "All volumes", maker: "0.20%", taker: "0.25%" },
    ]
  },
  {
    title: "Leverage Trading",
    description: "Trade with leverage",
    fees: [
      { volume: "Funding rate", maker: "0.01% / 4h", taker: "0.01% / 4h" },
    ]
  },
];

const depositMethods = [
  { method: "SEPA Bank Transfer", fee: "Free", time: "1-2 business days" },
  { method: "Credit/Debit Card", fee: "2.5%", time: "Instant" },
  { method: "Skrill", fee: "1%", time: "Instant" },
  { method: "Neteller", fee: "1%", time: "Instant" },
  { method: "Apple Pay", fee: "1.5%", time: "Instant" },
  { method: "Google Pay", fee: "1.5%", time: "Instant" },
];

const withdrawalMethods = [
  { method: "SEPA Bank Transfer", fee: "€1", time: "1-2 business days" },
  { method: "Crypto Withdrawal", fee: "Network fee", time: "15-30 minutes" },
];

export default function FeesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);

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
            <span className="header-eyebrow">INFO</span>
            <div className="header-title">Fees</div>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">Transparent Pricing</h1>
          <p className="hero-subtitle">Simple, transparent fees with no hidden costs</p>
        </section>

        <section className="info-section">
          <h3 className="section-title">Trading Fees</h3>
          {feeSections.map((section, index) => (
            <div key={index} className="fee-section">
              <h4 className="fee-section-title">{section.title}</h4>
              <p className="fee-section-description">{section.description}</p>
              <div className="fee-table">
                <div className="fee-table-header">
                  <span>Volume</span>
                  <span>Maker</span>
                  <span>Taker</span>
                </div>
                {section.fees.map((fee, feeIndex) => (
                  <div key={feeIndex} className="fee-table-row">
                    <span>{fee.volume}</span>
                    <span>{fee.maker}</span>
                    <span>{"note" in fee && fee.note ? fee.note : fee.taker}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">Deposit Fees</h3>
          <div className="fee-table">
            <div className="fee-table-header">
              <span>Method</span>
              <span>Fee</span>
              <span>Time</span>
            </div>
            {depositMethods.map((method, index) => (
              <div key={index} className="fee-table-row">
                <span>{method.method}</span>
                <span>{method.fee}</span>
                <span>{method.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Withdrawal Fees</h3>
          <div className="fee-table">
            <div className="fee-table-header">
              <span>Method</span>
              <span>Fee</span>
              <span>Time</span>
            </div>
            {withdrawalMethods.map((method, index) => (
              <div key={index} className="fee-table-row">
                <span>{method.method}</span>
                <span>{method.fee}</span>
                <span>{method.time}</span>
              </div>
            ))}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Fee Discounts</h3>
          <div className="info-card">
            <div className="info-icon">💎</div>
            <div className="info-content">
              <h4>HOLD Token Discount</h4>
              <p>Get up to 50% discount on trading fees when you hold BEST tokens.</p>
            </div>
          </div>
          <div className="info-card">
            <div className="info-icon">📈</div>
            <div className="info-content">
              <h4>Volume Discounts</h4>
              <p>Trade more to unlock lower fees. Our tiered pricing rewards active traders.</p>
            </div>
          </div>
        </section>

        <section className="info-section">
          <div style={{ background: "var(--surface-hover)", padding: 16, borderRadius: 12 }}>
            <h4 style={{ marginBottom: 8 }}>⚠️ Important Note</h4>
            <p style={{ fontSize: 14, color: "var(--muted)" }}>
              Fees may vary based on market conditions and payment method. Always check the final fee before confirming any transaction. CFD trading involves significant risk and may not be suitable for all investors.
            </p>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/auth/signup" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #1a73e8 0%, #0d47a1 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Start Trading
          </Link>
        </div>
      </div>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
