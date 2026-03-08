"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftRight, Check } from "lucide-react";

type Currency = "EUR" | "BTC" | "ETH" | "USDT";

const rates: Record<Currency, Record<Currency, number>> = {
  EUR: { EUR: 1, BTC: 1 / 45234.5, ETH: 1 / 2845.3, USDT: 1.08 },
  BTC: { EUR: 45234.5, BTC: 1, ETH: 15.9, USDT: 48853 },
  ETH: { EUR: 2845.3, BTC: 0.0629, ETH: 1, USDT: 3072 },
  USDT: { EUR: 0.92, BTC: 1 / 48853, ETH: 1 / 3072, USDT: 1 },
};

const balances: Record<Currency, number> = {
  EUR: 12000,
  BTC: 0.42,
  ETH: 3,
  USDT: 4800,
};

export default function ExchangePage() {
  const [step, setStep] = React.useState<"form" | "review" | "success">("form");
  const [fromCurrency, setFromCurrency] = React.useState<Currency>("EUR");
  const [toCurrency, setToCurrency] = React.useState<Currency>("BTC");
  const [amount, setAmount] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [reference, setReference] = React.useState("");

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const rate = rates[fromCurrency][toCurrency];
  const feePercent = 0.5;
  const fee = parsedAmount > 0 ? parsedAmount * (feePercent / 100) : 0;
  const receiveAmount = (parsedAmount - fee) * rate;
  const canContinue = parsedAmount > 0 && parsedAmount <= balances[fromCurrency] && fromCurrency !== toCurrency;

  function confirmExchange() {
    setIsProcessing(true);
    setTimeout(() => {
      setReference(`EXC-${Date.now()}`);
      setStep("success");
      setIsProcessing(false);
    }, 900);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/wallets" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">EXCHANGE</span>
            <div className="header-title">Convert Assets</div>
          </div>
        </header>

        <section className="quick-transfer">
          <h3 className="section-title">{step === "form" ? "Exchange Details" : step === "review" ? "Review Exchange" : "Exchange Completed"}</h3>
          <div className="transfer-form">
            {step === "form" && (
              <>
                <div className="form-group">
                  <label>From</label>
                  <select value={fromCurrency} onChange={(e) => setFromCurrency(e.target.value as Currency)} className="form-input">
                    {Object.keys(balances).map((currency) => (
                      <option key={currency} value={currency}>{currency} ({balances[currency as Currency]})</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>To</label>
                  <select value={toCurrency} onChange={(e) => setToCurrency(e.target.value as Currency)} className="form-input">
                    {Object.keys(balances).map((currency) => (
                      <option key={currency} value={currency}>{currency}</option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label>Amount ({fromCurrency})</label>
                  <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  <div className="balance-hint">Available: {balances[fromCurrency]} {fromCurrency}</div>
                </div>

                <div className="price-estimate">
                  <div className="price-estimate-row"><span className="price-estimate-label">Rate</span><span className="price-estimate-value">1 {fromCurrency} = {rate.toFixed(8)} {toCurrency}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Fee (0.5%)</span><span className="price-estimate-value">{fee.toFixed(8)} {fromCurrency}</span></div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}><span className="price-estimate-label" style={{ fontWeight: 600 }}>You receive</span><span className="price-estimate-value highlight">{receiveAmount > 0 ? receiveAmount.toFixed(8) : "0.00000000"} {toCurrency}</span></div>
                </div>

                <button className="order-button buy" disabled={!canContinue} onClick={() => setStep("review")}>
                  <ArrowLeftRight size={16} style={{ marginRight: 8 }} /> Continue to Review
                </button>
              </>
            )}

            {step === "review" && (
              <>
                <div className="price-estimate">
                  <div className="price-estimate-row"><span className="price-estimate-label">Pair</span><span className="price-estimate-value">{fromCurrency} → {toCurrency}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Amount</span><span className="price-estimate-value">{parsedAmount} {fromCurrency}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Fee</span><span className="price-estimate-value">{fee.toFixed(8)} {fromCurrency}</span></div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}><span className="price-estimate-label" style={{ fontWeight: 600 }}>Receive</span><span className="price-estimate-value highlight">{receiveAmount.toFixed(8)} {toCurrency}</span></div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn" onClick={() => setStep("form")}>Back</button>
                  <button className="btn btn-primary" disabled={isProcessing} onClick={confirmExchange}>{isProcessing ? "Processing..." : "Confirm Exchange"}</button>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Check color="#22c55e" />
                  <strong>Exchange completed successfully.</strong>
                </div>
                <p className="balance-hint">Reference: {reference}</p>
                <p className="balance-hint" style={{ marginBottom: 12 }}>{parsedAmount} {fromCurrency} → {receiveAmount.toFixed(8)} {toCurrency}</p>
                <Link href="/wallets" className="order-button buy" style={{ textAlign: "center" }}>Back to Wallets</Link>
              </>
            )}
          </div>
        </section>

        <BottomNav />
      </div>
    </div>
  );
}
