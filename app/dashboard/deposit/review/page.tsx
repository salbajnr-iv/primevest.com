"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export default function DepositReviewPage() {
  const router = useRouter();
  const [method, setMethod] = React.useState("SEPA");
  const [amount, setAmount] = React.useState("0");
  const [iban, setIban] = React.useState("");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMethod(params.get("method") || "SEPA");
    setAmount(params.get("amount") || "0");
    setIban(params.get("iban") || "");
  }, []);

  function confirm() {
    setTimeout(() => {
      router.push(`/dashboard/deposit/success?method=${method}&amount=${amount}&id=DEP-${Date.now()}`);
    }, 700);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Einzahlung prüfen</h2>
          <p><strong>Methode:</strong> {method}</p>
          <p><strong>Betrag:</strong> {amount} €</p>
          {method === 'SEPA' && <p><strong>IBAN:</strong> {iban}</p>}

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.back()}>Zurück</button>
            <button className="btn btn-primary" onClick={confirm}>Einzahlen</button>
          </div>
        </main>
      </div>
    </div>
  );
}
