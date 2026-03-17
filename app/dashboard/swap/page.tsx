"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { getAssetColorClass, TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

const assets = [
  { symbol: "BTC", name: "Bitcoin" },
  { symbol: "ETH", name: "Ethereum" },
  { symbol: "SOL", name: "Solana" },
  { symbol: "BNB", name: "Binance Coin" },
];

type Asset = (typeof assets)[number];

type QuoteApiErrorCode = "quote_expired" | "insufficient_liquidity" | "amount_bounds" | "invalid_quote" | "invalid_pair" | "slippage_out_of_range" | "invalid_slippage_tolerance" | "quote_stale" | "min_received_violation";

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

  const filteredFrom = assets.filter((a) => a.name.toLowerCase().includes(searchFrom.toLowerCase()) || a.symbol.toLowerCase().includes(searchFrom.toLowerCase()));
  const filteredTo = assets.filter((a) => a.name.toLowerCase().includes(searchTo.toLowerCase()) || a.symbol.toLowerCase().includes(searchTo.toLowerCase()));

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
      case "invalid_slippage_tolerance":
        return "Slippage tolerance must stay between 0.10% and 5.00%.";
      case "quote_stale":
        return "Quote is stale. Request a fresh quote and try again.";
      case "min_received_violation":
        return "Current market output is below your minimum received amount.";
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
        body: JSON.stringify({ from: from.symbol, to: to.symbol, amount: parsedAmount, slippageTolerance: parsedSlippage }),
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
        quoteTimestamp: String(data.quote.quoteTimestamp),
        expectedRate: String(data.quote.expectedRate),
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
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card">
          <TransactionPageHeader title="Swap" subtitle="Instantly exchange one asset for another" />

          <div className="form-row">
            <label>From</label>
            <div className="asset-selector">
              <div className="asset-selector-input" onClick={() => setShowFromDropdown(!showFromDropdown)}>
                <div className={styles.assetSelectorContent}>
                  <div className={`asset-option-icon ${getAssetColorClass(from.symbol)}`}>{from.symbol}</div>
                  <div>
                    <div className="asset-option-name">{from.name}</div>
                    <div className="asset-option-symbol">{from.symbol}</div>
                  </div>
                </div>
                <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {showFromDropdown && (
                <div className="asset-selector-dropdown">
                  <div className={styles.dropdownSearchWrap}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchFrom}
                      onChange={(e) => setSearchFrom(e.target.value)}
                      className={`${styles.dropdownSearchInput} asset-selector-input`}
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
                      <div className={`asset-option-icon ${getAssetColorClass(a.symbol)}`}>{a.symbol}</div>
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
                <div className={styles.assetSelectorContent}>
                  <div className={`asset-option-icon ${getAssetColorClass(to.symbol)}`}>{to.symbol}</div>
                  <div>
                    <div className="asset-option-name">{to.name}</div>
                    <div className="asset-option-symbol">{to.symbol}</div>
                  </div>
                </div>
                <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {showToDropdown && (
                <div className="asset-selector-dropdown">
                  <div className={styles.dropdownSearchWrap}>
                    <input
                      type="text"
                      placeholder="Search..."
                      value={searchTo}
                      onChange={(e) => setSearchTo(e.target.value)}
                      className={`${styles.dropdownSearchInput} asset-selector-input`}
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
                      <div className={`asset-option-icon ${getAssetColorClass(a.symbol)}`}>{a.symbol}</div>
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
            <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="e.g. 0.10" className={`order-input ${styles.orderInput}`} />
            {from.symbol === to.symbol && <div className={`input-hint ${styles.errorText}`}>Select two different assets to swap</div>}
          </div>

          <div className="form-row">
            <label>Slippage tolerance (%)</label>
            <input type="number" min={0.1} max={5} step={0.1} value={slippageTolerance} onChange={(e) => setSlippageTolerance(e.target.value)} className={`order-input ${styles.orderInput}`} />
            {!slippageInRange && <div className={`input-hint ${styles.errorText}`}>Enter a value between 0.10% and 5.00%</div>}
          </div>

          {error && <div className={styles.errorTextTight}>{error}</div>}

          <TransactionActionFooter
            secondary={
              <button className={`btn ${styles.actionSecondary}`} onClick={() => router.push("/dashboard")}>
                Cancel
              </button>
            }
            primary={
              <button className={`btn-primary ${styles.actionPrimary}`} onClick={next} disabled={!isValid || isFetchingQuote}>
                {isFetchingQuote ? "Fetching quote..." : "Continue to Confirmation"}
              </button>
            }
          />
        </main>
      </div>
    </div>
  );
}
