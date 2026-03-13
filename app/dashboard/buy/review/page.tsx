"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { SummaryRow, TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

export default function BuyReviewPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState("-");
  const [symbol, setSymbol] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [fee, setFee] = React.useState("0");
  const [total, setTotal] = React.useState("0");
  const [price, setPrice] = React.useState("0");
  const [receive, setReceive] = React.useState("0");
  const [isProcessing, setIsProcessing] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    setAsset(params.get("asset") || "-");
    setSymbol(params.get("symbol") || "-");
    setAmount(params.get("amount") || "0");
    setFee(params.get("fee") || "0");
    setTotal(params.get("total") || "0");
    setPrice(params.get("price") || "0");
    setReceive(params.get("receive") || "0");
  }, []);

  function confirm() {
    setIsProcessing(true);
    setTimeout(() => {
      const id = `BUY-${Date.now()}`;
      const params = new URLSearchParams({ asset: `${asset} (${symbol})`, amount, id });
      router.push(`/dashboard/buy/success?${params.toString()}`);
    }, 800);
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card">
          <TransactionPageHeader title="Kauf bestätigen" subtitle="Bitte überprüfen Sie die folgenden Details." />

          <div className={`price-estimate ${styles.summaryBlock}`}>
            <SummaryRow label="Asset" value={`${asset} (${symbol})`} />
            <SummaryRow label="Betrag" value={`${amount} €`} />
            <SummaryRow label="Marktpreis" value={`${price} €`} />
            <SummaryRow label="Geschätzter Erhalt" value={`${receive} ${symbol}`} />
            <SummaryRow label="Gebühr" value={`${fee} €`} />
            <SummaryRow label="Gesamtkosten" value={`${total} €`} isTotal />
          </div>

          <TransactionActionFooter
            compact
            secondary={<button className="btn" onClick={() => router.back()} disabled={isProcessing}>Zurück</button>}
            primary={<button className="btn btn-primary" onClick={confirm} disabled={isProcessing}>{isProcessing ? "Wird ausgeführt..." : "Jetzt kaufen"}</button>}
          />
        </main>
      </div>
    </div>
  );
}
