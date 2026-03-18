"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { PageSectionHeader } from "@/components/ui/PageSectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Button } from "@/components/ui/button";
import { QuickAmountChips, TransactionActionFooter } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  fee: string;
  processingTime: string;
  minAmount: number;
  maxAmount: number;
  icon: string;
}

const paymentMethods: PaymentMethod[] = [
  {
    id: "SEPA",
    name: "SEPA Transfer",
    description: "Standard European bank transfer",
    fee: "0%",
    processingTime: "1-2 business days",
    minAmount: 10,
    maxAmount: 50000,
    icon: "bank",
  },
  {
    id: "CARD",
    name: "Credit/Debit Card",
    description: "Instant top-up with Visa or Mastercard",
    fee: "1.5%",
    processingTime: "Instant",
    minAmount: 25,
    maxAmount: 10000,
    icon: "card",
  },
  {
    id: "SOFORT",
    name: "Sofort",
    description: "Online banking with TAN verification",
    fee: "1.4%",
    processingTime: "Instant",
    minAmount: 10,
    maxAmount: 20000,
    icon: "bank",
  },
  {
    id: "GIROPAY",
    name: "Giropay",
    description: "German online banking checkout",
    fee: "1.9%",
    processingTime: "Instant",
    minAmount: 10,
    maxAmount: 5000,
    icon: "bank",
  },
];

export default function DepositSelectPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>(paymentMethods[0]);
  const [amount, setAmount] = React.useState("");
  const [iban, setIban] = React.useState("");

  const selectedPayment = paymentMethods.find((m) => m.id === selectedMethod.id) || paymentMethods[0];
  const feeRate = parseFloat(selectedPayment.fee.replace("%", "")) / 100;
  const parsedAmount = parseFloat(amount || "0");
  const fee = selectedPayment.id === "SEPA" ? 0 : parsedAmount * feeRate;
  const totalAmount = parsedAmount + fee;
  const isValid = amount && parsedAmount >= selectedPayment.minAmount && parsedAmount <= selectedPayment.maxAmount;

  function next() {
    if (!isValid) return;
    const params = new URLSearchParams({
      method: selectedPayment.id,
      amount: String(parsedAmount),
      fee: String(fee.toFixed(2)),
      total: String(totalAmount.toFixed(2)),
      ...(selectedPayment.id === "SEPA" && { iban }),
    });
    router.push(`/dashboard/deposit/review?${params.toString()}`);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card space-y-5">
          <PageSectionHeader
            eyebrow="Payments"
            title="Deposit funds"
            description="Fund your account with secure payment rails and clear fee visibility."
          />

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <FeatureCard title="Payment method" description="Choose the rail that fits your speed and limits.">
              <div className="form-row">
                <div className="payment-methods-grid">
                  {paymentMethods.map((method) => (
                    <button key={method.id} className={`payment-method-card ${selectedMethod.id === method.id ? "active" : ""}`} onClick={() => setSelectedMethod(method)}>
                      <div className="payment-method-icon">
                        {method.icon === "card" ? (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                            <line x1="1" y1="10" x2="23" y2="10" />
                          </svg>
                        ) : (
                          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                            <polyline points="9 22 9 12 15 12 15 22" />
                          </svg>
                        )}
                      </div>
                      <div className="payment-method-info">
                        <div className="payment-method-name">{method.name}</div>
                        <div className="payment-method-desc">{method.description}</div>
                        <div className="payment-method-details">
                          <span className="fee">{method.fee} fee</span>
                          <span className="time">{method.processingTime}</span>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>
            </FeatureCard>

            <FeatureCard title="Funding details" description="Enter amount and review total credit before confirming.">
              <div className="space-y-4">
                <div className="form-row">
                  <label>Amount (EUR)</label>
                  <div className="amount-input-container">
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder={`Min: ${selectedPayment.minAmount}€ - Max: ${selectedPayment.maxAmount}€`}
                      className={`order-input ${styles.orderInput}`}
                    />
                    <div className="amount-info">
                      {amount && parsedAmount > 0 && (
                        <div className="fee-breakdown">
                          <div className="fee-row">
                            <span>Fee:</span>
                            <span>{fee.toFixed(2)} €</span>
                          </div>
                          <div className="fee-row total">
                            <span>Total:</span>
                            <span>{totalAmount.toFixed(2)} €</span>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {selectedPayment.id === "SEPA" && (
                  <div className="form-row">
                    <label>IBAN</label>
                    <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="DE89370400440532013000" className="order-input" />
                    <div className="input-hint">Required for SEPA transfer reconciliation.</div>
                  </div>
                )}

                <div className="form-row">
                  <label>Quick amounts</label>
                  <QuickAmountChips>
                    {[100, 250, 500, 1000, 2500].map((val) => (
                      <button
                        key={val}
                        className={`quick-amount-btn ${amount === String(val) ? "active" : ""}`}
                        onClick={() => setAmount(String(val))}
                        disabled={val < selectedPayment.minAmount || val > selectedPayment.maxAmount}
                      >
                        {val}€
                      </button>
                    ))}
                  </QuickAmountChips>
                </div>
              </div>
            </FeatureCard>
          </div>

          <TransactionActionFooter
            secondary={
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            }
            primary={
              <Button className="w-full sm:w-auto" onClick={next} disabled={!isValid}>
                Continue to review
              </Button>
            }
          />
        </main>
      </div>
    </div>
  );
}
