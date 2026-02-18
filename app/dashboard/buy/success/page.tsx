"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export default function BuySuccessPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [id, setId] = React.useState("-");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAsset(params.get("asset") || "-");
    setAmount(params.get("amount") || "0");
    setId(params.get("id") || "-");
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Erfolgreich gekauft</h2>
          <p>Dein Kauf wurde ausgeführt.</p>
          <p><strong>Auftragsnummer:</strong> {id}</p>
          <p><strong>Asset:</strong> {asset}</p>
          <p><strong>Betrag (EUR):</strong> {amount} €</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.push('/dashboard')}>Zurück zum Dashboard</button>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard/portfolio')}>Portfolio anzeigen</button>
          </div>
        </main>
      </div>
    </div>
  );
}
