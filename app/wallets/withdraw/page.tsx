"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowUpRight, Check, Wallet } from "lucide-react";
import { ErrorState, LoadingButton, LoadingSpinner } from "@/components/ui/LoadingStates";
import { useAuth } from "@/contexts/AuthContext";

type Currency = "EUR" | "BTC" | "ETH" | "USDT";

const availableBalances: Record<Currency, number> = {
  EUR: 12000,
  BTC: 0.42,
  ETH: 3,
  USDT: 4800,
};

const networkFee: Record<Currency, number> = {
  EUR: 1,
  BTC: 0.0002,
  ETH: 0.003,
  USDT: 2,
};

const amountPrecision: Record<Currency, number> = {
  EUR: 2,
  USDT: 2,
  BTC: 6,
  ETH: 6,
};

const destinationValidators: Record<Currency, RegExp> = {
  EUR: /^[A-Z]{2}\d{2}[A-Z0-9]{11,30}$/,
  BTC: /^(bc1|[13])[a-zA-HJ-NP-Z0-9]{25,62}$/,
  ETH: /^0x[a-fA-F0-9]{40}$/,
  USDT: /^(T[1-9A-HJ-NP-Za-km-z]{33}|0x[a-fA-F0-9]{40})$/,
};

export default function WithdrawPage() {
  const { session } = useAuth();
  const [step, setStep] = React.useState<"form" | "review" | "success">("form");
  const [currency, setCurrency] = React.useState<Currency>("EUR");
  const [amount, setAmount] = React.useState("");
  const [destination, setDestination] = React.useState("");
  const [reference, setReference] = React.useState("");
  const [withdrawalStatus, setWithdrawalStatus] = React.useState("pending");
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const fee = networkFee[currency];
  const payout = parsedAmount > fee ? parsedAmount - fee : 0;
  const hasFunds = parsedAmount > 0 && parsedAmount <= availableBalances[currency];
  const hasDestination = destinationValidators[currency].test(destination.trim());
  const canContinue = hasFunds && hasDestination;

  const formatAmount = (value: number, curr: Currency) => {
    const precision = amountPrecision[curr];
    return `${value.toFixed(precision)} ${curr}`;
  };

  const submitWithdrawal = async () => {
    setIsProcessing(true);
    setError(null);

    try {
      if (!session?.access_token) {
        throw new Error("Please sign in to submit a withdrawal request.");
      }

      const response = await fetch("/api/wallets/withdraw", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({
          currency,
          amount: parsedAmount,
          destination: destination.trim(),
          fee,
        }),
      });

      const payload = await response.json();
      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to create withdrawal request.");
      }

      setReference(payload.reference);
      setWithdrawalStatus(payload.withdrawal?.status || "pending");
      setStep("success");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to submit withdrawal.");
    } finally {
      setIsProcessing(false);
    }
  };

  React.useEffect(() => {
    if (step !== "success" || !reference || !session?.access_token) return;

    const interval = setInterval(async () => {
      try {
        const response = await fetch(`/api/wallets/withdraw?reference=${reference}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        });
        const payload = await response.json();
        if (response.ok && payload.ok && payload.status) {
          setWithdrawalStatus(payload.status);
        }
      } catch {
        // Keep existing status if polling fails
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [reference, session?.access_token, step]);

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
            <span className="header-eyebrow">WITHDRAW</span>
            <div className="header-title">Withdraw Funds</div>
          </div>
        </header>

        <section className="quick-transfer">
          <h3 className="section-title">{step === "form" ? "Withdrawal Details" : step === "review" ? "Review Withdrawal" : "Withdrawal Submitted"}</h3>
          <div className="transfer-form">
            {error && <ErrorState title="Withdrawal error" message={error} onRetry={() => setError(null)} retryText="Dismiss" />}

            {step === "form" && (
              <>
                <div className="form-group">
                  <label>Currency</label>
                  <select value={currency} onChange={(e) => setCurrency(e.target.value as Currency)} className="form-input">
                    {Object.entries(availableBalances).map(([curr, balance]) => (
                      <option key={curr} value={curr}>
                        {curr} ({balance})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="form-group">
                  <label>Amount ({currency})</label>
                  <input type="number" className="form-input" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
                  <div className="balance-hint">Available: {formatAmount(availableBalances[currency], currency)}</div>
                </div>

                <div className="form-group">
                  <label>{currency === "EUR" ? "IBAN" : "Wallet address"}</label>
                  <input
                    type="text"
                    className="form-input"
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder={currency === "EUR" ? "DE89370400440532013000" : "Enter destination address"}
                  />
                </div>

                <div className="price-estimate">
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Amount</span>
                    <span className="price-estimate-value">{formatAmount(parsedAmount || 0, currency)}</span>
                  </div>
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Network/processing fee</span>
                    <span className="price-estimate-value">{formatAmount(fee, currency)}</span>
                  </div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
                    <span className="price-estimate-label" style={{ fontWeight: 600 }}>
                      Estimated payout
                    </span>
                    <span className="price-estimate-value highlight">{formatAmount(payout, currency)}</span>
                  </div>
                </div>

                <button className="order-button sell" disabled={!canContinue} onClick={() => setStep("review")}>
                  <ArrowUpRight size={16} style={{ marginRight: 8 }} /> Continue to Review
                </button>
              </>
            )}

            {step === "review" && (
              <>
                <div className="price-estimate">
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Currency</span>
                    <span className="price-estimate-value">{currency}</span>
                  </div>
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Destination</span>
                    <span className="price-estimate-value">{destination}</span>
                  </div>
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Amount</span>
                    <span className="price-estimate-value">{formatAmount(parsedAmount, currency)}</span>
                  </div>
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Fee</span>
                    <span className="price-estimate-value">{formatAmount(fee, currency)}</span>
                  </div>
                  <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
                    <span className="price-estimate-label" style={{ fontWeight: 600 }}>
                      Payout
                    </span>
                    <span className="price-estimate-value highlight">{formatAmount(payout, currency)}</span>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 12 }}>
                  <button className="btn" onClick={() => setStep("form")}>
                    Back
                  </button>
                  <LoadingButton className="btn btn-primary" loading={isProcessing} loadingText="Processing..." onClick={submitWithdrawal}>
                    Confirm Withdrawal
                  </LoadingButton>
                </div>
              </>
            )}

            {step === "success" && (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 8 }}>
                  <Check color="#22c55e" />
                  <strong>Withdrawal request created.</strong>
                </div>
                <p className="balance-hint">Reference: {reference}</p>
                <p className="balance-hint" style={{ marginBottom: 12 }}>
                  Status: {withdrawalStatus}
                </p>
                <div className="price-estimate">
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Currency</span>
                    <span className="price-estimate-value">{currency}</span>
                  </div>
                  <div className="price-estimate-row">
                    <span className="price-estimate-label">Payout</span>
                    <span className="price-estimate-value">{formatAmount(payout, currency)}</span>
                  </div>
                </div>
                {withdrawalStatus === "pending" && <LoadingSpinner size="sm" text="Tracking status updates..." className="justify-start py-2" />}
                <Link href="/wallets" className="order-button sell" style={{ textAlign: "center" }}>
                  <Wallet size={16} style={{ marginRight: 8 }} /> Back to Wallets
                </Link>
              </>
            )}
          </div>
        </section>

        <BottomNav />
      </div>
    </div>
  );
}
