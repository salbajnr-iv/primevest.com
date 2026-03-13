"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export default function SwapSuccessPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState("-");
  const [to, setTo] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [id, setId] = React.useState("-");
  const [received, setReceived] = React.useState("0");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get("from") || "-");
    setTo(params.get("to") || "-");
    setAmount(params.get("amount") || "0");
    setId(params.get("id") || "-");
    setReceived(params.get("received") || "0");
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Tausch abgeschlossen</h2>
          <p>Dein Tausch wurde erfolgreich ausgeführt.</p>
          <p><strong>Transaktion:</strong> {id}</p>
          <p><strong>Von:</strong> {from}</p>
          <p><strong>Nach:</strong> {to}</p>
          <p><strong>Betrag:</strong> {amount} {from}</p>
          <p><strong>Erhalten:</strong> {received} {to}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.push('/dashboard')}>Zum Dashboard</button>
            <button className="btn btn-primary" onClick={() => router.push('/dashboard/portfolio')}>Portfolio anzeigen</button>
          </div>
        </main>
      </div>
    </div>
  );
}
