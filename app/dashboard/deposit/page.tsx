"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

export default function DepositSelectPage() {
  const router = useRouter();
  const [method, setMethod] = React.useState("SEPA");
  const [amount, setAmount] = React.useState(0);
  const [iban, setIban] = React.useState("");

  function next() {
    if (!amount || amount <= 0) return;
    const params = new URLSearchParams({ method, amount: String(amount), iban });
    router.push(`/dashboard/deposit/review?${params.toString()}`);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Einzahlen</h2>

          <div className="form-row">
            <label>Zahlungsmethode</label>
            <select value={method} onChange={(e) => setMethod(e.target.value)}>
              <option value="SEPA">SEPA Überweisung</option>
              <option value="CARD">Kredit-/Debitkarte</option>
            </select>
          </div>

          <div className="form-row">
            <label>Betrag (EUR)</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          {method === "SEPA" && (
            <div className="form-row">
              <label>IBAN</label>
              <input value={iban} onChange={(e) => setIban(e.target.value)} placeholder="DE..." />
            </div>
          )}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.push('/dashboard')}>Abbrechen</button>
            <button className="btn btn-primary" onClick={next}>Weiter</button>
          </div>
        </main>
      </div>
    </div>
  );
}
