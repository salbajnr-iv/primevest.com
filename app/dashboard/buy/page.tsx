"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  balance?: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.50, balance: 0.0021 },
  { symbol: "ETH", name: "Ethereum", price: 2845.30, balance: 0.030 },
  { symbol: "SOL", name: "Solana", price: 98.45, balance: 0.50 },
  { symbol: "BNB", name: "Binance Coin", price: 312.80, balance: 0.01 },
  { symbol: "XRP", name: "Ripple", price: 0.52, balance: 100 },
  { symbol: "ADA", name: "Cardano", price: 0.45, balance: 500 },
  { symbol: "DOGE", name: "Dogecoin", price: 0.08, balance: 1000 },
  { symbol: "DOT", name: "Polkadot", price: 7.85, balance: 25 },
];

export default function BuySelectPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState<Asset>(assets[0]);
  const [amount, setAmount] = React.useState<string>("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showDropdown, setShowDropdown] = React.useState(false);

  const filteredAssets = assets.filter(a => 
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const estimatedAmount = amount ? (parseFloat(amount) / asset.price).toFixed(6) : "0";
  const fee = amount ? (parseFloat(amount) * 0.01).toFixed(2) : "0.00";
  const total = amount ? (parseFloat(amount) + parseFloat(amount) * 0.01).toFixed(2) : "0.00";

  function next() {
    if (!amount || parseFloat(amount) <= 0) return;
    const params = new URLSearchParams({ 
      asset: `${asset.name} (${asset.symbol})`, 
      amount: amount,
      estimated: estimatedAmount,
      fee: fee,
      total: total
    });
    router.push(`/dashboard/buy/review?${params.toString()}`);
  }

  const quickAmounts = [25, 50, 100, 250, 500];

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <div className="page-header" style={{ marginBottom: "16px" }}>
            <h2 style={{ margin: 0 }}>Kaufen</h2>
          </div>

          {/* Asset Selector */}
          <div className="form-row">
            <label>Asset auswählen</label>
            <div className="asset-selector">
              <div 
                className="asset-selector-input"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                  <div 
                    className="asset-option-icon"
                    style={{ 
                      background: asset.symbol === "BTC" ? "#f7931a" : 
                                  asset.symbol === "ETH" ? "#627eea" : 
                                  asset.symbol === "SOL" ? "#9945ff" : "#0f9d58"
                    }}
                  >
                    {asset.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{asset.name}</div>
                    <div className="asset-option-symbol">{asset.symbol}</div>
                  </div>
                </div>
                <svg 
                  style={{ width: "20px", height: "20px", color: "var(--muted)" }} 
                  viewBox="0 0 24 24" 
                  fill="none" 
                  stroke="currentColor" 
                  strokeWidth="2"
                >
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>
              
              {showDropdown && (
                <div className="asset-selector-dropdown">
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="asset-selector-input"
                      style={{ border: "none", padding: "8px 0", fontSize: "14px" }}
                      autoFocus
                    />
                  </div>
                  {filteredAssets.map((a) => (
                    <div 
                      key={a.symbol} 
                      className="asset-option"
                      onClick={() => {
                        setAsset(a);
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                    >
                      <div 
                        className="asset-option-icon"
                        style={{ 
                          background: a.symbol === "BTC" ? "#f7931a" : 
                                      a.symbol === "ETH" ? "#627eea" : 
                                      a.symbol === "SOL" ? "#9945ff" : "#0f9d58"
                        }}
                      >
                        {a.symbol}
                      </div>
                      <div className="asset-option-info">
                        <div className="asset-option-name">{a.name}</div>
                        <div className="asset-option-symbol">{a.symbol}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: "14px", fontWeight: "600", color: "var(--text)" }}>
                          {a.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                        </div>
                        {a.balance && (
                          <div className="asset-balance">
                            {a.balance.toLocaleString("de-DE")} {a.symbol}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-row">
            <label>Betrag (EUR)</label>
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="z. B. 100"
              className="order-input"
              style={{ textAlign: "left", fontSize: "16px" }}
            />
            
            {/* Quick Amount Buttons */}
            <div className="quick-amounts">
              {quickAmounts.map((val) => (
                <button
                  key={val}
                  className={`quick-amount-btn ${amount === String(val) ? "active" : ""}`}
                  onClick={() => setAmount(String(val))}
                >
                  {val}€
                </button>
              ))}
            </div>
          </div>

          {/* Price Estimate */}
          <div className="price-estimate">
            <div className="price-estimate-row">
              <span className="price-estimate-label">Aktueller Preis</span>
              <span className="price-estimate-value">
                {asset.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Erhaltene Menge</span>
              <span className="price-estimate-value highlight">
                {estimatedAmount} {asset.symbol}
              </span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gebühr (1%)</span>
              <span className="price-estimate-value">{fee} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: "600" }}>Gesamt</span>
              <span className="price-estimate-value highlight" style={{ fontSize: "16px" }}>
                {total} €
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button 
              className="btn" 
              onClick={() => router.push('/dashboard/portfolio')}
              style={{ flex: 1, padding: "14px", border: "1px solid var(--border)" }}
            >
              Abbrechen
            </button>
            <button 
              className="btn-enhanced buy" 
              onClick={next}
              disabled={!amount || parseFloat(amount) <= 0}
              style={{ flex: 2 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
              Weiter zur Bestätigung
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

