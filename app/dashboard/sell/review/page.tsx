"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";

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
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <h2>Verkauf bestätigen</h2>
          <p className="subtitle" style={{ marginTop: -4 }}>Bitte überprüfen Sie die folgenden Details.</p>

          <div className="price-estimate" style={{ marginTop: 16 }}>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Asset</span>
              <span className="price-estimate-value">{asset}</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Menge</span>
              <span className="price-estimate-value">{amount}</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Geschätzter Gegenwert</span>
              <span className="price-estimate-value">{estimated} €</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gebühr</span>
              <span className="price-estimate-value">{fee} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: 600 }}>Auszahlung</span>
              <span className="price-estimate-value highlight" style={{ fontSize: 16 }}>{total} €</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.back()} disabled={isProcessing}>Zurück</button>
            <button className="btn btn-primary" onClick={confirm} disabled={isProcessing}>
              {isProcessing ? "Wird ausgeführt..." : "Jetzt verkaufen"}
            </button>
          </div>
    </DashboardShell>
  );
}
