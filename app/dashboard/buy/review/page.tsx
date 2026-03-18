"use client";

import React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import DashboardHeader from "@/components/DashboardHeader";
import { SummaryRow, TransactionActionFooter, TransactionPageHeader } from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";
import {
  formatImpactPercent,
  getImpactSeverity,
  isImpactBlocked,
  MARKET_IMPACT_THRESHOLDS,
  requiresImpactConfirmation,
} from "@/lib/swap/market-impact";

export default function BuyReviewPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [asset, setAsset] = React.useState("-");
  const [symbol, setSymbol] = React.useState("-");
  const [amount, setAmount] = React.useState("0");
  const [fee, setFee] = React.useState("0");
  const [total, setTotal] = React.useState("0");
  const [price, setPrice] = React.useState("0");
  const [receive, setReceive] = React.useState("0");
  const [impactPct, setImpactPct] = React.useState(0);
  const [isProcessing, setIsProcessing] = React.useState(false);
  const [impactConfirmed, setImpactConfirmed] = React.useState(false);

  React.useEffect(() => {
    const params = new URLSearchParams(searchParams.toString());
    setAsset(params.get("asset") || "-");
    setSymbol(params.get("symbol") || "-");
    setAmount(params.get("amount") || "0");
    setFee(params.get("fee") || "0");
    setTotal(params.get("total") || "0");
    setPrice(params.get("price") || "0");
    setReceive(params.get("receive") || "0");
    setImpactPct(Number(params.get("impactPct") || "0"));
  }, [searchParams]);

  const impactSeverity = getImpactSeverity(impactPct);
  const shouldConfirmImpact = requiresImpactConfirmation(impactPct);
  const blockedByImpact = isImpactBlocked(impactPct);
  const canSubmit = !isProcessing && !blockedByImpact && (!shouldConfirmImpact || impactConfirmed);

  const impactClassName =
    impactSeverity === "high" ? styles.impactHigh : impactSeverity === "warn" ? styles.impactWarn : styles.impactNormal;

  function confirm() {
    if (!canSubmit) {
      return;
    }

    setIsProcessing(true);
    setTimeout(() => {
      const id = `BUY-${Date.now()}`;
      const params = new URLSearchParams({ asset: `${asset} (${symbol})`, amount, id });
      router.push(`/dashboard/buy/success?${params.toString()}`);
    }, 800);
  }

  const mockSummary = {
    userName: "User",
    portfolioValue: 12500.50,
    portfolioChangePct: 2.34,
    notificationCount: 3,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader summary={mockSummary} />

        <main className="page-card">
          <TransactionPageHeader title="Kauf bestätigen" subtitle="Bitte überprüfen Sie die folgenden Details." />

          <div className={`price-estimate ${styles.summaryBlock}`}>
            <SummaryRow label="Asset" value={`${asset} (${symbol})`} />
            <SummaryRow label="Betrag" value={`${amount} €`} />
            <SummaryRow label="Marktpreis" value={`${price} €`} />
            <SummaryRow label="Geschätzter Erhalt" value={`${receive} ${symbol}`} />
            <SummaryRow label="Markt-Impact" value={<span className={impactClassName}>{formatImpactPercent(impactPct)}</span>} />
            <SummaryRow label="Gebühr" value={`${fee} €`} />
            <SummaryRow label="Gesamtkosten" value={`${total} €`} isTotal />
          </div>

          {shouldConfirmImpact && !blockedByImpact && (
            <label className={styles.impactConfirmBox}>
              <input type="checkbox" checked={impactConfirmed} onChange={(e) => setImpactConfirmed(e.target.checked)} />
              <span>
                Ich bestätige den erhöhten Markt-Impact von {formatImpactPercent(impactPct)}
                {impactSeverity === "high" ? " (hohes Risiko)" : ""}.
              </span>
            </label>
          )}

          {blockedByImpact && (
            <div className={styles.errorTextTight}>
              Dieser Kauf ist blockiert, da der geschätzte Markt-Impact {formatImpactPercent(impactPct)} beträgt und damit den Grenzwert von{" "}
              {formatImpactPercent(MARKET_IMPACT_THRESHOLDS.blockPct)} überschreitet.
            </div>
          )}

          <TransactionActionFooter
            compact
            secondary={<button className="btn" onClick={() => router.back()} disabled={isProcessing}>Zurück</button>}
            primary={
              <button className="btn btn-primary" onClick={confirm} disabled={!canSubmit}>
                {isProcessing ? "Wird ausgeführt..." : "Jetzt kaufen"}
              </button>
            }
          />
        </main>
      </div>
    </div>
  );
}
