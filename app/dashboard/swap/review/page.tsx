"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";

export default function SwapReviewPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState("-");
  const [to, setTo] = React.useState("-");
  const [amount, setAmount] = React.useState("0");

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setFrom(params.get("from") || "-");
    setTo(params.get("to") || "-");
    setAmount(params.get("amount") || "0");
  }, []);

  function confirm() {
    setTimeout(() => {
      router.push(`/dashboard/swap/success?from=${from}&to=${to}&amount=${amount}&id=SWP-${Date.now()}`);
    }, 700);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Tauschen bestätigen</h2>
          <p><strong>Von:</strong> {from}</p>
          <p><strong>Nach:</strong> {to}</p>
          <p><strong>Betrag:</strong> {amount} {from}</p>
          <p><strong>Geschätzte Gebühr:</strong> 0,0001 {from}</p>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.back()}>Zurück</button>
            <button className="btn btn-primary" onClick={confirm}>Tauschen</button>
          </div>
        </main>
      </div>
    </div>
  );
}
