"use client";

import React from "react";
import { useRouter } from "next/navigation";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";

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
      const params = new URLSearchParams({
        asset: `${asset} (${symbol})`,
        amount,
        id,
      });
      router.push(`/dashboard/buy/success?${params.toString()}`);
    }, 800);
  }

  return (
    <DashboardShell mainClassName="pb-20" contentClassName="page-card">
          <h2>Kauf bestätigen</h2>
          <p className="subtitle" style={{ marginTop: -4 }}>Bitte überprüfen Sie die folgenden Details.</p>

          <div className="price-estimate" style={{ marginTop: 16 }}>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Asset</span>
              <span className="price-estimate-value">{asset} ({symbol})</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Betrag</span>
              <span className="price-estimate-value">{amount} €</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Marktpreis</span>
              <span className="price-estimate-value">{price} €</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Geschätzter Erhalt</span>
              <span className="price-estimate-value">{receive} {symbol}</span>
            </div>
            <div className="price-estimate-row">
              <span className="price-estimate-label">Gebühr</span>
              <span className="price-estimate-value">{fee} €</span>
            </div>
            <div className="price-estimate-row" style={{ borderTop: "none", paddingTop: 0 }}>
              <span className="price-estimate-label" style={{ fontWeight: 600 }}>Gesamtkosten</span>
              <span className="price-estimate-value highlight" style={{ fontSize: 16 }}>{total} €</span>
            </div>
          </div>

          <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
            <button className="btn" onClick={() => router.back()} disabled={isProcessing}>Zurück</button>
            <button className="btn btn-primary" onClick={confirm} disabled={isProcessing}>
              {isProcessing ? "Wird ausgeführt..." : "Jetzt kaufen"}
            </button>
          </div>
    </DashboardShell>
  );
}
