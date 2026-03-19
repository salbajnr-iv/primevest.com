"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { SummaryRow, TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

export default function SellReviewPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [estimated, setEstimated] = React.useState("0");
  const [fee, setFee] = React.useState("0");
  const [total, setTotal] = React.useState("0");
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAsset(params.get("asset") || "-");
    setAmount(params.get("amount") || "0");
    setEstimated(params.get("estimated") || "0");
    setFee(params.get("fee") || "0");
    setTotal(params.get("total") || "0");
  }, []);

  function confirm() {
    setIsProcessing(true);
    setTimeout(() => {
      const id = `SEL-${Date.now()}`;
      const params = new URLSearchParams({ asset, amount, id });
      router.push(`/dashboard/sell/success?${params.toString()}`);
    }, 800);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader summary={{ userName: "User", portfolioValue: 0, portfolioChangePct: 0, availableBalance: 0, availableBalanceChangePct: 0, notificationCount: 0 }} />

        <main className="page-card">
          <TransactionPageHeader title="Verkauf bestätigen" subtitle="Bitte überprüfen Sie die folgenden Details." />

          <div className={`price-estimate ${styles.summaryBlock}`}>
            <SummaryRow label="Asset" value={asset} />
            <SummaryRow label="Menge" value={amount} />
            <SummaryRow label="Geschätzter Gegenwert" value={`${estimated} €`} />
            <SummaryRow label="Gebühr" value={`${fee} €`} />
            <SummaryRow label="Auszahlung" value={`${total} €`} isTotal />
          </div>

          <TransactionActionFooter
            compact
            secondary={<button className="btn" onClick={() => router.back()} disabled={isProcessing}>Zurück</button>}
            primary={<button className="btn btn-primary" onClick={confirm} disabled={isProcessing}>{isProcessing ? "Wird ausgeführt..." : "Jetzt verkaufen"}</button>}
          />
        </main>
      </div>
    </div>
  );
}
