"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function PortfolioManagePage() {
  const router = useRouter();

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Portfolio verwalten</h2>
          <p>Hier kannst du deine Positionen prüfen, Orders einsehen und Assets bearbeiten.</p>

          <div style={{ display: 'grid', gap: 12 }}>
            <button className="btn" onClick={() => router.push('/dashboard/buy')}>Kaufen</button>
            <button className="btn" onClick={() => router.push('/dashboard/sell')}>Verkaufen</button>
            <button className="btn" onClick={() => router.push('/dashboard/swap')}>Tauschen</button>
            <button className="btn" onClick={() => router.push('/dashboard/deposit')}>Einzahlen</button>
            <Link href="/dashboard/positions" className="btn btn-outline" style={{ textAlign: 'center' }}>Positionen-Einstellungen</Link>
            <Link href="/dashboard/orders" className="btn btn-outline" style={{ textAlign: 'center' }}>Orders anzeigen</Link>
          </div>
        </main>
      </div>
    </div>
  );
}
