"use client";

import React from "react";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { useRouter } from "next/navigation";
import {
  getAssetColorClass,
  QuickAmountChips,
  SummaryRow,
  TransactionActionFooter,
  TransactionPageHeader,
} from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";

interface Asset {
  symbol: string;
  name: string;
  price: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.5 },
  { symbol: "ETH", name: "Ethereum", price: 2845.3 },
  { symbol: "SOL", name: "Solana", price: 156.92 },
  { symbol: "BNB", name: "Binance Coin", price: 583.4 },
];

export default function DashboardBuyPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState<Asset>(assets[0]);
  const [amountEur, setAmountEur] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const parsedEur = amountEur ? parseFloat(amountEur) : 0;
  const fee = parsedEur > 0 ? parsedEur * 0.01 : 0;
  const total = parsedEur + fee;
  const estimatedReceive = parsedEur > 0 ? parsedEur / asset.price : 0;
  const isValid = parsedEur > 0;

  function next() {
    if (!isValid) return;

    const params = new URLSearchParams({
      asset: asset.name,
      symbol: asset.symbol,
      amount: parsedEur.toFixed(2),
      fee: fee.toFixed(2),
      total: total.toFixed(2),
      price: asset.price.toFixed(2),
      receive: estimatedReceive.toFixed(8),
    });

    router.push(`/dashboard/buy/review?${params.toString()}`);
  }

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <main className="page-card">
          <TransactionPageHeader title="Kaufen" subtitle="Kaufen Sie Assets mit EUR zum aktuellen Marktpreis" />

          <div className="form-row">
            <label>Asset auswählen</label>
            <div className="asset-selector">
              <div className="asset-selector-input" onClick={() => setShowDropdown(!showDropdown)}>
                <div className={styles.assetSelectorContent}>
                  <div className={`asset-option-icon ${getAssetColorClass(asset.symbol)}`}>{asset.symbol}</div>
                  <div>
                    <div className="asset-option-name">{asset.name}</div>
                    <div className="asset-option-symbol">{asset.symbol}</div>
                  </div>
                </div>
                <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M6 9l6 6 6-6" />
                </svg>
              </div>

              {showDropdown && (
                <div className="asset-selector-dropdown">
                  <div className={styles.dropdownSearchWrap}>
                    <input
                      type="text"
                      placeholder="Suchen..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className={`${styles.dropdownSearchInput} asset-selector-input`}
                      autoFocus
                    />
                  </div>
                  {filteredAssets.map((a) => (
                    <div
                      key={a.symbol}
                      className="asset-option"
                      onClick={() => {
                        setAsset(a);
                        setShowDropdown(false);
                        setSearchQuery("");
                      }}
                    >
                      <div className={`asset-option-icon ${getAssetColorClass(a.symbol)}`}>{a.symbol}</div>
                      <div className="asset-option-info">
                        <div className="asset-option-name">{a.name}</div>
                        <div className="asset-option-symbol">{a.symbol}</div>
                      </div>
                      <div className={styles.assetPrice}>{a.price.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <div className="form-row">
            <label>Betrag (EUR)</label>
            <input type="number" value={amountEur} onChange={(e) => setAmountEur(e.target.value)} placeholder="100.00" className={`order-input ${styles.orderInput}`} />

            <QuickAmountChips>
              {quickAmounts.map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  className={`quick-amount-btn ${amountEur === String(quickAmount) ? "active" : ""}`}
                  onClick={() => setAmountEur(String(quickAmount))}
                >
                  {quickAmount}€
                </button>
              ))}
            </QuickAmountChips>
          </div>

          <div className="price-estimate">
            <SummaryRow label={`Preis (${asset.symbol})`} value={`${asset.price.toFixed(2)} €`} />
            <SummaryRow label="Geschätzter Erhalt" value={`${estimatedReceive.toFixed(8)} ${asset.symbol}`} />
            <SummaryRow label="Gebühr (1%)" value={`${fee.toFixed(2)} €`} />
            <SummaryRow label="Gesamt" value={`${total.toFixed(2)} €`} isTotal />
          </div>

          <TransactionActionFooter
            secondary={
              <button className={`btn ${styles.actionSecondary}`} onClick={() => router.push("/dashboard")}>
                Abbrechen
              </button>
            }
            primary={
              <button className={`btn-primary ${styles.actionPrimary}`} onClick={next} disabled={!isValid}>
                Weiter zur Bestätigung
              </button>
            }
          />
        </main>
      </div>
    </div>
  );
}
