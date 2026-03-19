"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";
import { useDashboardSummary } from "@/lib/dashboard/use-dashboard-summary";

export default function BuySuccessPage() {
  const router = useRouter();
  const { summary } = useDashboardSummary();
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
        <DashboardHeader summary={summary} />

        <main className="page-card">
          <TransactionPageHeader title="Erfolgreich gekauft" subtitle="Dein Kauf wurde ausgeführt." />
          <div className={styles.successDetails}>
            <p><strong>Auftragsnummer:</strong> {id}</p>
            <p><strong>Asset:</strong> {asset}</p>
            <p><strong>Betrag (EUR):</strong> {amount} €</p>
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
