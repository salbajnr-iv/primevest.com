"use client";

import React from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { useRouter } from "next/navigation";

interface Asset {
  symbol: string;
  name: string;
  price: number; // EUR per unit
  balance: number; // user balance in units
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.5, balance: 0.0021 },
  { symbol: "ETH", name: "Ethereum", price: 2845.3, balance: 0.03 },
  { symbol: "SOL", name: "Solana", price: 156.92, balance: 0.5 },
  { symbol: "BNB", name: "Binance Coin", price: 583.4, balance: 0.01 },
];

export default function SellSelectPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState<Asset>(assets[0]);
  const [amount, setAmount] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAssets = assets.filter((a) =>
    a.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const estimatedValue = parsedAmount > 0 ? parsedAmount * asset.price : 0;
  const fee = estimatedValue > 0 ? estimatedValue * 0.01 : 0; // 1% fee
  const total = estimatedValue - fee;

  const hasBalance = parsedAmount <= asset.balance;
  const isValid = parsedAmount > 0 && hasBalance;

  function next() {
    if (!isValid) return;
    const params = new URLSearchParams({
      asset: `${asset.name} (${asset.symbol})`,
      amount: String(parsedAmount),
      estimated: String(estimatedValue.toFixed(2)),
      fee: String(fee.toFixed(2)),
      total: String(total.toFixed(2)),
    });
    router.push(`/dashboard/sell/review?${params.toString()}`);
  }

  const percentActions = [25, 50, 75, 100];

  return (
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Verkaufen</h2>
            <div className="subtitle">Verkaufen Sie Ihre Assets schnell und sicher</div>
          </div>

          {/* Asset Selector */}
          <div className="form-row">
            <label>Asset auswählen</label>
            <div className="asset-selector">
              <div
                className="asset-selector-input"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background:
                        asset.symbol === "BTC" ? "#f7931a" :
                        asset.symbol === "ETH" ? "#627eea" :
                        asset.symbol === "SOL" ? "#9945ff" : "#0f9d58",
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
                  style={{ width: 20, height: 20, color: "var(--muted)" }}
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
                      style={{ border: "none", padding: "8px 0", fontSize: 14 }}
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
                          background:
                            a.symbol === "BTC" ? "#f7931a" :
                            a.symbol === "ETH" ? "#627eea" :
                            a.symbol === "SOL" ? "#9945ff" : "#0f9d58",
                        }}
                      >
                        {a.symbol}
                      </div>
                      <div className="asset-option-info">
                        <div className="asset-option-name">{a.name}</div>
                        <div className="asset-option-symbol">{a.symbol}</div>
                      </div>
                      <div style={{ textAlign: "right" }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                          {a.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                        </div>
                        <div className="asset-balance">
                          {a.balance.toLocaleString("de-DE")} {a.symbol}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-row">
            <label>Menge ({asset.symbol})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.001"
              className="order-input"
              style={{ textAlign: "left", fontSize: 16 }}
            />
            <div className="input-hint">
              Verfügbar: {asset.balance.toLocaleString("de-DE", { maximumFractionDigits: 8 })} {asset.symbol}
            </div>

            {/* Quick percentage actions */}
            <div className="quick-amounts">
              {percentActions.map((p) => (
                <button
                  key={p}
                  type="button"
                  className={`quick-amount-btn ${amount === String((asset.balance * p) / 100) ? "active" : ""}`}
                  onClick={() => setAmount(String(parseFloat(((asset.balance * p) / 100).toFixed(6))))}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>

          {/* Estimate / Summary */}
          <div className="price-estimate">
            <div className="price-estimate-row">
              <span className="price-estimate-label">Preis</span>
              <span className="price-estimate-value">
                {asset.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
              </span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gegenwert</span>
              <span className="price-estimate-value">{estimatedValue.toFixed(2)} €</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gebühr (1%)</span>
              <span className="price-estimate-value">{fee.toFixed(2)} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: 600 }}>Auszahlung</span>
              <span className="price-estimate-value highlight" style={{ fontSize: 16 }}>{total.toFixed(2)} €</span>
            </div>
            {!hasBalance && (
              <div className="input-hint" style={{ color: "#d64545", marginTop: 6 }}>
                Ungültige Menge: übersteigt verfügbares Guthaben
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              className="btn"
              onClick={() => router.push("/dashboard/portfolio")}
              style={{ flex: 1, padding: 14, border: "1px solid var(--border)" }}
            >
              Abbrechen
            </button>
            <button
              className="btn-primary"
              onClick={next}
              disabled={!isValid}
              style={{ flex: 2, padding: 14 }}
            >
              Weiter zur Bestätigung
            </button>
          </div>
    </DashboardShell>
  );
}
