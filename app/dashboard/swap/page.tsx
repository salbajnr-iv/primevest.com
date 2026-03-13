"use client";

import React from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { useRouter } from "next/navigation";

const assets = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "Binance Coin" },
];

type Asset = (typeof assets)[number];

type QuoteApiErrorCode = "quote_expired" | "insufficient_liquidity" | "amount_bounds" | "invalid_quote" | "invalid_pair" | "slippage_out_of_range";

export default function SwapSelectPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState<Asset>(assets[0]);
  const [to, setTo] = React.useState<Asset>(assets[1]);
  const [amount, setAmount] = React.useState<string>("");
  const [slippageTolerance, setSlippageTolerance] = React.useState<string>("0.50");

  const [showFromDropdown, setShowFromDropdown] = React.useState(false);
  const [showToDropdown, setShowToDropdown] = React.useState(false);
  const [searchFrom, setSearchFrom] = React.useState("");
  const [searchTo, setSearchTo] = React.useState("");
  const [isFetchingQuote, setIsFetchingQuote] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const filteredFrom = assets.filter(
    (a) => a.name.toLowerCase().includes(searchFrom.toLowerCase()) || a.symbol.toLowerCase().includes(searchFrom.toLowerCase()),
  );
  const filteredTo = assets.filter(
    (a) => a.name.toLowerCase().includes(searchTo.toLowerCase()) || a.symbol.toLowerCase().includes(searchTo.toLowerCase()),
  );

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const parsedSlippage = slippageTolerance ? parseFloat(slippageTolerance) : 0;
  const slippageInRange = parsedSlippage >= 0.1 && parsedSlippage <= 5;
  const isValid = parsedAmount > 0 && from.symbol !== to.symbol && slippageInRange;

  function getErrorMessage(code?: QuoteApiErrorCode) {
    switch (code) {
      case "insufficient_liquidity":
        return "Insufficient liquidity for this amount. Try a smaller swap size.";
      case "amount_bounds":
        return "Amount is outside supported limits for the selected asset.";
      case "quote_expired":
        return "Quote expired before confirmation. Please request a new one.";
      case "slippage_out_of_range":
        return "Slippage tolerance must stay between 0.10% and 5.00%.";
      case "invalid_quote":
      case "invalid_pair":
      default:
        return "Unable to fetch quote. Check your inputs and try again.";
    }
  }

  async function next() {
    if (!isValid || isFetchingQuote) return;
    setError(null);
    setIsFetchingQuote(true);

    try {
      const response = await fetch("/api/swap/quote", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          from: from.symbol,
          to: to.symbol,
          amount: parsedAmount,
          slippageTolerance: parsedSlippage,
        }),
      });

      const data = await response.json();
      if (!response.ok || !data?.ok || !data?.quote) {
        setError(getErrorMessage(data?.code));
        return;
      }

      const params = new URLSearchParams({
        from: from.symbol,
        to: to.symbol,
        amount: String(parsedAmount),
        slippageTolerance: String(parsedSlippage),
        quoteId: String(data.quote.quoteId),
        rate: String(data.quote.rate),
        fee: String(data.quote.fee),
        slippageEstimate: String(data.quote.slippageEstimate),
        minReceived: String(data.quote.minReceived),
        expectedReceive: String(data.quote.expectedReceive),
        expiresAt: String(data.quote.expiresAt),
      });
      router.push(`/dashboard/swap/review?${params.toString()}`);
    } catch {
      setError("Network error while requesting quote. Please retry.");
    } finally {
      setIsFetchingQuote(false);
    }
  }

  return (
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Swap</h2>
            <div className="subtitle">Instantly exchange one asset for another</div>
          </div>

          <div className="form-row">
            <label>From</label>
            <div className="asset-selector">
              <div className="asset-selector-input" onClick={() => setShowFromDropdown(!showFromDropdown)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background:
                        from.symbol === "BTC" ? "#f7931a" : from.symbol === "ETH" ? "#627eea" : from.symbol === "SOL" ? "#9945ff" : "#0f9d58",
                    }}
                  >
                    {from.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{from.name}</div>
                    <div className="asset-option-symbol">{from.symbol}</div>
                  </div>
                </div>
                <svg style={{ width: 20, height: 20, color: "var(--muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                          background: a.symbol === "BTC" ? "#f7931a" : a.symbol === "ETH" ? "#627eea" : a.symbol === "SOL" ? "#9945ff" : "#0f9d58",
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

          <div className="form-row">
            <label>To</label>
            <div className="asset-selector">
              <div className="asset-selector-input" onClick={() => setShowToDropdown(!showToDropdown)}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                  <div
                    className="asset-option-icon"
                    style={{
                      background: to.symbol === "BTC" ? "#f7931a" : to.symbol === "ETH" ? "#627eea" : to.symbol === "SOL" ? "#9945ff" : "#0f9d58",
                    }}
                  >
                    {to.symbol}
                  </div>
                  <div>
                    <div className="asset-option-name">{to.name}</div>
                    <div className="asset-option-symbol">{to.symbol}</div>
                  </div>
                </div>
                <svg style={{ width: 20, height: 20, color: "var(--muted)" }} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
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
                          background: a.symbol === "BTC" ? "#f7931a" : a.symbol === "ETH" ? "#627eea" : a.symbol === "SOL" ? "#9945ff" : "#0f9d58",
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

          <div className="form-row">
            <label>Slippage tolerance (%)</label>
            <input
              type="number"
              min={0.1}
              max={5}
              step={0.1}
              value={slippageTolerance}
              onChange={(e) => setSlippageTolerance(e.target.value)}
              className="order-input"
              style={{ textAlign: "left", fontSize: 16 }}
            />
            {!slippageInRange && (
              <div className="input-hint" style={{ color: "#d64545", marginTop: 6 }}>
                Enter a value between 0.10% and 5.00%
              </div>
            )}
          </div>

          {error && (
            <div style={{ color: "#d64545", marginTop: 8, fontSize: 14 }}>{error}</div>
          )}

          <div style={{ display: "flex", gap: 12, marginTop: 20 }}>
            <button className="btn" onClick={() => router.push("/dashboard")} style={{ flex: 1, padding: 14, border: "1px solid var(--border)" }}>
              Cancel
            </button>
            <button className="btn-primary" onClick={next} disabled={!isValid || isFetchingQuote} style={{ flex: 2, padding: 14 }}>
              {isFetchingQuote ? "Fetching quote..." : "Continue to Confirmation"}
            </button>
          </div>
    </DashboardShell>
  );
}
