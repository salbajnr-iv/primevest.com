"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export default function DepositSuccessPage() {
  const router = useRouter();
  const [method, setMethod] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [id, setId] = React.useState("-");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setMethod(params.get("method") || "-");
    setAmount(params.get("amount") || "0");
    setId(params.get("id") || "-");
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Einzahlung eingegangen</h2>
          <p>Die Einzahlung wurde verarbeitet (simuliert).</p>
          <p><strong>Referenz:</strong> {id}</p>
          <p><strong>Betrag:</strong> {amount} €</p>
          <p><strong>Methode:</strong> {method}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.push('/dashboard')}>Zurück zum Dashboard</button>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard/portfolio')}>Portfolio anzeigen</button>
          </div>
        </main>
      </div>
    </div>
  );
}
