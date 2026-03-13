"use client";

import React from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { useRouter } from "next/navigation";

interface Asset {
  symbol: string;
  name: string;
  price: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.5 },
  { symbol: "ETH", name: "Ethereum", price: 2845.3 },
  { symbol: "SOL", name: "Solana", price: 156.92 },
  { symbol: "BNB", name: "Binance Coin", price: 583.4 },
];

export default function DashboardBuyPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState<Asset>(assets[0]);
  const [amountEur, setAmountEur] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const parsedEur = amountEur ? parseFloat(amountEur) : 0;
  const fee = parsedEur > 0 ? parsedEur * 0.01 : 0;
  const total = parsedEur + fee;
  const estimatedReceive = parsedEur > 0 ? parsedEur / asset.price : 0;
  const isValid = parsedEur > 0;

  function next() {
    if (!isValid) return;

    const params = new URLSearchParams({
      asset: asset.name,
      symbol: asset.symbol,
      amount: parsedEur.toFixed(2),
      fee: fee.toFixed(2),
      total: total.toFixed(2),
      price: asset.price.toFixed(2),
      receive: estimatedReceive.toFixed(8),
    });

    router.push(`/dashboard/buy/review?${params.toString()}`);
  }

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Kaufen</h2>
            <div className="subtitle">Kaufen Sie Assets mit EUR zum aktuellen Marktpreis</div>
          </div>

          <div className="form-row">
            <label>Asset auswählen</label>
            <div className="asset-selector">
              <div className="asset-selector-input" onClick={() => setShowDropdown(!showDropdown)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background:
                        asset.symbol === "BTC"
                          ? "#f7931a"
                          : asset.symbol === "ETH"
                            ? "#627eea"
                            : asset.symbol === "SOL"
                              ? "#9945ff"
                              : "#0f9d58",
                    }}
                  >
                    {asset.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{asset.name}</div>
                    <div className="asset-option-symbol">{asset.symbol}</div>
                  </div>
                </div>
                <svg style={{ width: 20, height: 20, color: "var(--muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                            a.symbol === "BTC"
                              ? "#f7931a"
                              : a.symbol === "ETH"
                                ? "#627eea"
                                : a.symbol === "SOL"
                                  ? "#9945ff"
                                  : "#0f9d58",
                        }}
                      >
                        {a.symbol}
                      </div>
                      <div className="asset-option-info">
                        <div className="asset-option-name">{a.name}</div>
                        <div className="asset-option-symbol">{a.symbol}</div>
                      </div>
                      <div style={{ fontSize: 14, fontWeight: 600, color: "var(--text)" }}>
                        {a.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>Betrag (EUR)</label>
            <input
              type="number"
              value={amountEur}
              onChange={(e) => setAmountEur(e.target.value)}
              placeholder="100.00"
              className="order-input"
              style={{ textAlign: "left", fontSize: 16 }}
            />

            <div className="quick-amounts">
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  className={`quick-amount-btn ${amountEur === String(quickAmount) ? "active" : ""}`}
                  onClick={() => setAmountEur(String(quickAmount))}
                >
                  {quickAmount}€
                </button>
              ))}
            </div>
          </div>

          <div className="price-estimate">
            <div className="price-estimate-row">
              <span className="price-estimate-label">Preis ({asset.symbol})</span>
              <span className="price-estimate-value">{asset.price.toFixed(2)} €</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Geschätzter Erhalt</span>
              <span className="price-estimate-value">{estimatedReceive.toFixed(8)} {asset.symbol}</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gebühr (1%)</span>
              <span className="price-estimate-value">{fee.toFixed(2)} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: 600 }}>Gesamt</span>
              <span className="price-estimate-value highlight" style={{ fontSize: 16 }}>{total.toFixed(2)} €</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn" onClick={() => router.push("/dashboard")} style={{ flex: 1, padding: 14, border: "1px solid var(--border)" }}>
              Abbrechen
            </button>
            <button className="btn-primary" onClick={next} disabled={!isValid} style={{ flex: 2, padding: 14 }}>
              Weiter zur Bestätigung
            </button>
          </div>
    </DashboardShell>
  );
}
