"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  balance?: number;
<<<<<<< HEAD
  change24h?: string;
  marketCap?: string;
  volume24h?: string;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.50, balance: 0.0021, change24h: "+5,24%", marketCap: "882 B€", volume24h: "28,5 B€" },
  { symbol: "ETH", name: "Ethereum", price: 2845.30, balance: 0.030, change24h: "+3,87%", marketCap: "393 B€", volume24h: "15,2 B€" },
  { symbol: "SOL", name: "Solana", price: 156.92, balance: 0.50, change24h: "+8,45%", marketCap: "72 B€", volume24h: "3,4 B€" },
  { symbol: "BNB", name: "Binance Coin", price: 583.40, balance: 0.01, change24h: "+1,21%", marketCap: "87 B€", volume24h: "1,8 B€" },
  { symbol: "XRP", name: "Ripple", price: 0.62, balance: 100, change24h: "-2,13%", marketCap: "35 B€", volume24h: "2,1 B€" },
  { symbol: "ADA", name: "Cardano", price: 0.38, balance: 500, change24h: "+4,78%", marketCap: "13 B€", volume24h: "0,8 B€" },
  { symbol: "DOGE", name: "Dogecoin", price: 0.08, balance: 1000, change24h: "+12,34%", marketCap: "11 B€", volume24h: "1,2 B€" },
  { symbol: "DOT", name: "Polkadot", price: 7.85, balance: 25, change24h: "+6,89%", marketCap: "9 B€", volume24h: "0,6 B€" },
  { symbol: "AVAX", name: "Avalanche", price: 23.45, balance: 15, change24h: "+9,12%", marketCap: "8 B€", volume24h: "0,4 B€" },
  { symbol: "MATIC", name: "Polygon", price: 0.92, balance: 850, change24h: "+2,56%", marketCap: "8 B€", volume24h: "0,3 B€" },
=======
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
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
<<<<<<< HEAD
  const fee = amount ? (parseFloat(amount) * 0.015).toFixed(2) : "0.00"; // 1.5% fee
  const total = amount ? (parseFloat(amount) + parseFloat(amount) * 0.015).toFixed(2) : "0.00";
  const savings = amount ? (parseFloat(amount) * 0.005).toFixed(2) : "0.00"; // 0.5% savings with VIP
=======
  const fee = amount ? (parseFloat(amount) * 0.01).toFixed(2) : "0.00";
  const total = amount ? (parseFloat(amount) + parseFloat(amount) * 0.01).toFixed(2) : "0.00";
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)

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
<<<<<<< HEAD
            <h2 style={{ margin: 0 }}>Buy</h2>
            <div className="subtitle">Purchase crypto securely in a few taps</div>
=======
            <h2 style={{ margin: 0 }}>Kaufen</h2>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
          </div>

          {/* Asset Selector */}
          <div className="form-row">
<<<<<<< HEAD
            <label>Asset</label>
=======
            <label>Asset auswählen</label>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
<<<<<<< HEAD
                      placeholder="Search..."
=======
                      placeholder="Suchen..."
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
<<<<<<< HEAD
                        {a.change24h && (
                          <div style={{ fontSize: "11px", color: a.change24h.startsWith("+") ? "var(--success)" : "var(--danger)" }}>
                            {a.change24h}
                          </div>
                        )}
=======
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
<<<<<<< HEAD
            <label>Amount (EUR)</label>
=======
            <label>Betrag (EUR)</label>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
            <input 
              type="number" 
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
<<<<<<< HEAD
              placeholder="e.g. 100"
=======
              placeholder="z. B. 100"
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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

<<<<<<< HEAD
          {/* Enhanced Price Estimate */}
          <div className="price-estimate">
            <div className="price-estimate-row">
              <span className="price-estimate-label">Price</span>
=======
          {/* Price Estimate */}
          <div className="price-estimate">
            <div className="price-estimate-row">
              <span className="price-estimate-label">Aktueller Preis</span>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
              <span className="price-estimate-value">
                {asset.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="price-estimate-row">
<<<<<<< HEAD
              <span className="price-estimate-label">You get</span>
=======
              <span className="price-estimate-label">Erhaltene Menge</span>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
              <span className="price-estimate-value highlight">
                {estimatedAmount} {asset.symbol}
              </span>
            </div>
            <div className="price-estimate-row">
<<<<<<< HEAD
              <span className="price-estimate-label">Fee (1.5%)</span>
              <span className="price-estimate-value">{fee} €</span>
            </div>
            {parseFloat(savings) > 0 && (
              <div className="price-estimate-row" style={{ color: "var(--success)" }}>
                <span className="price-estimate-label">VIP Discount</span>
                <span className="price-estimate-value">-{savings} €</span>
              </div>
            )}
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: "600" }}>Total</span>
=======
              <span className="price-estimate-label">Gebühr (1%)</span>
              <span className="price-estimate-value">{fee} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: "600" }}>Gesamt</span>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
<<<<<<< HEAD
              Cancel
            </button>
            <button 
              className="btn-primary" 
=======
              Abbrechen
            </button>
            <button 
              className="btn-enhanced buy" 
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
              onClick={next}
              disabled={!amount || parseFloat(amount) <= 0}
              style={{ flex: 2 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                <path d="M12 5v14M5 12h14" />
              </svg>
<<<<<<< HEAD
              Continue to Confirmation
=======
              Weiter zur Bestätigung
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}

