"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

const assets = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "Binance Coin" },
];

type Asset = typeof assets[number];

export default function SwapSelectPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState<Asset>(assets[0]);
  const [to, setTo] = React.useState<Asset>(assets[1]);
  const [amount, setAmount] = React.useState<string>("");

  const [showFromDropdown, setShowFromDropdown] = React.useState(false);
  const [showToDropdown, setShowToDropdown] = React.useState(false);
  const [searchFrom, setSearchFrom] = React.useState("");
  const [searchTo, setSearchTo] = React.useState("");

  const filteredFrom = assets.filter(
    (a) => a.name.toLowerCase().includes(searchFrom.toLowerCase()) || a.symbol.toLowerCase().includes(searchFrom.toLowerCase())
  );
  const filteredTo = assets.filter(
    (a) => a.name.toLowerCase().includes(searchTo.toLowerCase()) || a.symbol.toLowerCase().includes(searchTo.toLowerCase())
  );

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const isValid = parsedAmount > 0 && from.symbol !== to.symbol;

  function next() {
    if (!isValid) return;
    const params = new URLSearchParams({ from: from.symbol, to: to.symbol, amount: String(parsedAmount) });
    router.push(`/dashboard/swap/review?${params.toString()}`);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Swap</h2>
            <div className="subtitle">Instantly exchange one asset for another</div>
          </div>

          {/* From Asset Selector */}
          <div className="form-row">
            <label>From</label>
            <div className="asset-selector">
              <div
                className="asset-selector-input"
                onClick={() => setShowFromDropdown(!showFromDropdown)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background:
                        from.symbol === "BTC" ? "#f7931a" :
                        from.symbol === "ETH" ? "#627eea" :
                        from.symbol === "SOL" ? "#9945ff" : "#0f9d58",
                    }}
                  >
                    {from.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{from.name}</div>
                    <div className="asset-option-symbol">{from.symbol}</div>
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

              {showFromDropdown && (
                <div className="asset-selector-dropdown">
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      className="asset-selector-input"
                      style={{ border: "none", padding: "8px 0", fontSize: 14 }}
                      autoFocus
                    />
                  </div>
                  {filteredFrom.map((a) => (
                    <div
                      key={a.symbol}
                      className="asset-option"
                      onClick={() => {
                        setFrom(a);
                        setShowFromDropdown(false);
                        setSearchFrom("");
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* To Asset Selector */}
          <div className="form-row">
            <label>To</label>
            <div className="asset-selector">
              <div
                className="asset-selector-input"
                onClick={() => setShowToDropdown(!showToDropdown)}
              >
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background:
                        to.symbol === "BTC" ? "#f7931a" :
                        to.symbol === "ETH" ? "#627eea" :
                        to.symbol === "SOL" ? "#9945ff" : "#0f9d58",
                    }}
                  >
                    {to.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{to.name}</div>
                    <div className="asset-option-symbol">{to.symbol}</div>
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

              {showToDropdown && (
                <div className="asset-selector-dropdown">
                  <div style={{ padding: "12px 16px", borderBottom: "1px solid var(--border)" }}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      className="asset-selector-input"
                      style={{ border: "none", padding: "8px 0", fontSize: 14 }}
                      autoFocus
                    />
                  </div>
                  {filteredTo.map((a) => (
                    <div
                      key={a.symbol}
                      className="asset-option"
                      onClick={() => {
                        setTo(a);
                        setShowToDropdown(false);
                        setSearchTo("");
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
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="form-row">
            <label>Amount ({from.symbol})</label>
            <input
              type="number"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder={`e.g. 0.10`}
              className="order-input"
              style={{ textAlign: "left", fontSize: 16 }}
            />
            {from.symbol === to.symbol && (
              <div className="input-hint" style={{ color: "#d64545", marginTop: 6 }}>
                Select two different assets to swap
              </div>
            )}
          </div>

          {/* Actions */}
          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button
              className="btn"
              onClick={() => router.push("/dashboard")}
              style={{ flex: 1, padding: 14, border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button
              className="btn-primary"
              onClick={next}
              disabled={!isValid}
              style={{ flex: 2, padding: 14 }}
            >
              Continue to Confirmation
            </button>
          </div>
        </main>
      </div>
    </div>
  );
}
