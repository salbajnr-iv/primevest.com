"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

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
        <DashboardHeader userName="User" />

        <main className="page-card">
          <TransactionPageHeader title="Einzahlung eingegangen" subtitle="Die Einzahlung wurde verarbeitet (simuliert)." />
          <div className={styles.successDetails}>
            <p><strong>Referenz:</strong> {id}</p>
            <p><strong>Betrag:</strong> {amount} €</p>
            <p><strong>Methode:</strong> {method}</p>
          </div>

          <TransactionActionFooter
            compact
            secondary={<button className="btn" onClick={() => router.push("/dashboard")}>Zurück zum Dashboard</button>}
            primary={<button className="btn btn-primary" onClick={() => router.push("/dashboard/portfolio")}>Portfolio anzeigen</button>}
          />
        </main>
      </div>
    </div>
  );
}
