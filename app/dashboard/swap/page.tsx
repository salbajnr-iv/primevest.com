"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";

const assets = ["BTC", "ETH", "SOL", "BNB"];

export default function SwapSelectPage() {
  const router = useRouter();
  const [from, setFrom] = React.useState(assets[0]);
  const [to, setTo] = React.useState(assets[1]);
  const [amount, setAmount] = React.useState(0);

  function next() {
    if (!amount || amount <= 0 || from === to) return;
    const params = new URLSearchParams({ from, to, amount: String(amount) });
    router.push(`/dashboard/swap/review?${params.toString()}`);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Tauschen</h2>

          <div className="form-row">
            <label>Von</label>
            <select value={from} onChange={(e) => setFrom(e.target.value)}>
              {assets.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label>Nach</label>
            <select value={to} onChange={(e) => setTo(e.target.value)}>
              {assets.map((a) => <option key={a} value={a}>{a}</option>)}
            </select>
          </div>

          <div className="form-row">
            <label>Betrag ({from})</label>
            <input type="number" value={amount} onChange={(e) => setAmount(Number(e.target.value))} />
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.push('/dashboard')}>Abbrechen</button>
            <button className="btn btn-primary" onClick={next}>Weiter</button>
          </div>
        </main>
      </div>
    </div>
  );
}
