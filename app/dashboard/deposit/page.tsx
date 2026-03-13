"use client";

import React from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { useRouter } from "next/navigation";

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
    name: "SEPA Überweisung",
    description: "Banküberweisung innerhalb Europas",
    fee: "0€",
    processingTime: "1-2 Werktage",
    minAmount: 10,
    maxAmount: 50000,
    icon: "bank"
  },
  {
    id: "CARD",
    name: "Kredit-/Debitkarte",
    description: "Soforteinzahlung mit Visa oder Mastercard",
    fee: "1,5%",
    processingTime: "Sofort",
    minAmount: 25,
    maxAmount: 10000,
    icon: "card"
  },
  {
    id: "SOFORT",
    name: "Sofortüberweisung",
    description: "Online-Banking mit TAN",
    fee: "1,4%",
    processingTime: "Sofort",
    minAmount: 10,
    maxAmount: 20000,
    icon: "bank"
  },
  {
    id: "GIROPAY",
    name: "Giropay",
    description: "Online-Bezahlung mit PIN und TAN",
    fee: "1,9%",
    processingTime: "Sofort",
    minAmount: 10,
    maxAmount: 5000,
    icon: "bank"
  }
];

export default function DepositSelectPage() {
  const router = useRouter();
  const [selectedMethod, setSelectedMethod] = React.useState<PaymentMethod>(paymentMethods[0]);
  const [amount, setAmount] = React.useState("");
  const [iban, setIban] = React.useState("");

  const selectedPayment = paymentMethods.find(m => m.id === selectedMethod.id) || paymentMethods[0];
  const fee = selectedPayment.id === "SEPA" ? 0 : (parseFloat(amount || "0") * parseFloat(selectedPayment.fee.replace("%", "")) / 100);
  const totalAmount = parseFloat(amount || "0") + fee;
  const isValid = amount && parseFloat(amount) >= selectedPayment.minAmount && parseFloat(amount) <= selectedPayment.maxAmount;

  function next() {
    if (!isValid) return;
    const params = new URLSearchParams({ 
      method: selectedPayment.id, 
      amount: String(parseFloat(amount)), 
      fee: String(fee.toFixed(2)),
      total: String(totalAmount.toFixed(2)),
      ...(selectedPayment.id === "SEPA" && { iban })
    });
    router.push(`/dashboard/deposit/review?${params.toString()}`);
  }

  return (
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <div className="page-header" style={{ marginBottom: 16 }}>
            <h2 style={{ margin: 0 }}>Deposit</h2>
            <div className="subtitle">Add funds securely using your preferred method</div>
          </div>

          {/* Payment Methods */}
          <div className="form-row">
            <label>Payment Method</label>
            <div className="payment-methods-grid">
              {paymentMethods.map((method) => (
                <button
                  key={method.id}
                  className={`payment-method-card ${selectedMethod.id === method.id ? "active" : ""}`}
                  onClick={() => setSelectedMethod(method)}
                >
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

          {/* Amount Input */}
          <div className="form-row">
            <label>Amount (EUR)</label>
            <div className="amount-input-container">
              <input 
                type="number" 
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder={`Min: ${selectedPayment.minAmount}€ - Max: ${selectedPayment.maxAmount}€`}
                className="order-input"
                style={{ textAlign: "left", fontSize: "16px" }}
              />
              <div className="amount-info">
                {amount && parseFloat(amount) > 0 && (
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

          {/* SEPA Specific Fields */}
          {selectedPayment.id === "SEPA" && (
            <div className="form-row">
              <label>IBAN</label>
              <input 
                value={iban} 
                onChange={(e) => setIban(e.target.value)} 
                placeholder="DE89370400440532013000" 
                className="order-input"
              />
              <div className="input-hint">Enter your IBAN for SEPA transfer</div>
            </div>
          )}

          {/* Quick Amount Buttons */}
          <div className="form-row">
            <label>Quick Amounts</label>
            <div className="quick-amounts">
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
            </div>
          </div>

          {/* Action Buttons */}
          <div style={{ display: "flex", gap: "12px", marginTop: "20px" }}>
            <button 
              className="btn" 
              onClick={() => router.push('/dashboard')}
              style={{ flex: 1, padding: "14px", border: "1px solid var(--border)" }}
            >
              Cancel
            </button>
            <button 
              className="btn-primary" 
              onClick={next}
              disabled={!isValid}
              style={{ flex: 2, opacity: isValid ? 1 : 0.5 }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: "20px", height: "20px" }}>
                <path d="M12 2v20M2 12h20" />
              </svg>
              Continue to Confirmation
            </button>
          </div>
    </DashboardShell>
  );
}
