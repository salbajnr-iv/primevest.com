"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowDownRight, Check, Wallet, DollarSign } from "lucide-react";

type DepositMethod = "SEPA" | "CARD";

const methodConfig = {
  SEPA: { feePercent: 0, min: 10, max: 50000, label: "SEPA Bank Transfer" },
  CARD: { feePercent: 1.5, min: 20, max: 10000, label: "Credit/Debit Card" },
};

export default function DepositPage() {
  const [step, setStep] = React.useState<"form" | "review" | "success">("form");
  const [method, setMethod] = React.useState<DepositMethod>("SEPA");
  const [amount, setAmount] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [isProcessing, setIsProcessing] = React.useState(false);

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const config = methodConfig[method];
  const fee = parsedAmount > 0 ? (parsedAmount * config.feePercent) / 100 : 0;
  const total = parsedAmount + fee;
  const isAmountValid = parsedAmount >= config.min && parsedAmount <= config.max;
  const canContinue = isAmountValid;

  function submitDeposit() {
    setIsProcessing(true);
    setTimeout(() => {
      setReference(`DEP-${Date.now()}`);
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
            <span className="header-eyebrow">DEPOSIT</span>
            <div className="header-title">Add Funds</div>
          </div>
        </header>

        <section className="quick-transfer">
          <h3 className="section-title">{step === "form" ? "Deposit Details" : step === "review" ? "Review Deposit" : "Deposit Successful"}</h3>
          <div className="transfer-form">
            {step === "form" && (
              <>
                <div className="form-group">
                  <label>Method</label>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                    <button className={`action-card ${method === "SEPA" ? "deposit" : ""}`} onClick={() => setMethod("SEPA")}>
                      <Wallet size={20} className="action-icon" />
                      <span className="action-label">SEPA</span>
                    </button>
                    <button className={`action-card ${method === "CARD" ? "deposit" : ""}`} onClick={() => setMethod("CARD")}>
                      <DollarSign size={20} className="action-icon" />
                      <span className="action-label">Card</span>
                    </button>
                  </div>
                </div>

                <div className="form-group">
                  <label>Amount (EUR)</label>
                  <input
                    type="number"
                    className="form-input"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    placeholder={`${config.min} - ${config.max}`}
                  />
                  <div className="balance-hint">
                    Limits: {config.min}€ - {config.max}€ · Fee: {config.feePercent}%
                  </div>
                </div>

                <div className="price-estimate">
                  <div className="price-estimate-row"><span className="price-estimate-label">Method</span><span className="price-estimate-value">{config.label}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Fee</span><span className="price-estimate-value">{fee.toFixed(2)} €</span></div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}><span className="price-estimate-label" style={{ fontWeight: 600 }}>Total debit</span><span className="price-estimate-value highlight">{total.toFixed(2)} €</span></div>
                </div>

                <button className="order-button buy" disabled={!canContinue} onClick={() => setStep("review")}>
                  <ArrowDownRight size={16} style={{ marginRight: 8 }} /> Continue to Review
                </button>
              </>
            )}

            {step === "review" && (
              <>
                <div className="price-estimate">
                  <div className="price-estimate-row"><span className="price-estimate-label">Method</span><span className="price-estimate-value">{config.label}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Deposit amount</span><span className="price-estimate-value">{parsedAmount.toFixed(2)} €</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Fee</span><span className="price-estimate-value">{fee.toFixed(2)} €</span></div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}><span className="price-estimate-label" style={{ fontWeight: 600 }}>Total debit</span><span className="price-estimate-value highlight">{total.toFixed(2)} €</span></div>
                </div>

                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn" onClick={() => setStep("form")}>Back</button>
                  <button className="btn btn-primary" disabled={isProcessing} onClick={submitDeposit}>
                    {isProcessing ? "Processing..." : "Confirm Deposit"}
                  </button>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Check color="#22c55e" />
                  <strong>Deposit initiated successfully.</strong>
                </div>
                <p className="balance-hint" style={{ marginBottom: 12 }}>Reference: {reference}</p>
                <div className="price-estimate">
                  <div className="price-estimate-row"><span className="price-estimate-label">Method</span><span className="price-estimate-value">{config.label}</span></div>
                  <div className="price-estimate-row"><span className="price-estimate-label">Amount</span><span className="price-estimate-value">{parsedAmount.toFixed(2)} €</span></div>
                </div>
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
