"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
<<<<<<< HEAD
import Link from "next/link";
=======
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)

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
<<<<<<< HEAD
            <Link href="/dashboard/positions" className="btn btn-outline" style={{ textAlign: 'center' }}>Positionen-Einstellungen</Link>
            <Link href="/dashboard/orders" className="btn btn-outline" style={{ textAlign: 'center' }}>Orders anzeigen</Link>
=======
            <button className="btn btn-outline" onClick={() => alert('Hier würden Positions-Einstellungen angezeigt werden (Referenzseite).')}>Positions-Einstellungen</button>
            <button className="btn btn-outline" onClick={() => alert('Orders & Trading History (Referenzseite).')}>Orders anzeigen</button>
>>>>>>> 815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
          </div>
        </main>
      </div>
    </div>
  );
}
