"use client";

import React from "react";
import DashboardHeader from "@/components/DashboardHeader";
import { useRouter } from "next/navigation";
import { PageSectionHeader } from "@/components/ui/PageSectionHeader";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { Button } from "@/components/ui/button";
import {
  getAssetColorClass,
  QuickAmountChips,
  SummaryRow,
  TransactionActionFooter,
} from "@/components/ui/transactional-page";
import styles from "@/components/ui/transactional-pages.module.css";
import { calculateMarketImpactPercent, formatImpactPercent } from "@/lib/swap/market-impact";
import { DASHBOARD_BUY_SUMMARY } from "@/app/dashboard/buy/mock-summary";

interface Asset {
  symbol: string;
  name: string;
  price: number;
  liquidityEur: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.5, liquidityEur: 8_500_000 },
  { symbol: "ETH", name: "Ethereum", price: 2845.3, liquidityEur: 6_100_000 },
  { symbol: "SOL", name: "Solana", price: 156.92, liquidityEur: 2_250_000 },
  { symbol: "BNB", name: "Binance Coin", price: 583.4, liquidityEur: 3_450_000 },
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
  const impactPct = calculateMarketImpactPercent({ amountEur: parsedEur, liquidityEur: asset.liquidityEur });
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
      impactPct: impactPct.toFixed(2),
    });

    router.push(`/dashboard/buy/review?${params.toString()}`);
  }

  const quickAmounts = [100, 250, 500, 1000];

  const mockSummary = {
    userName: "User",
    portfolioValue: 12500.50,
    portfolioChangePct: 2.34,
    availableBalance: 2450.2,
    availableBalanceChangePct: 1.12,
    notificationCount: 3,
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader summary={DASHBOARD_BUY_SUMMARY} />

        <main className="page-card space-y-5">
          <PageSectionHeader
            eyebrow="Trading"
            title="Buy assets"
            description="Build your position with transparent pricing and instant execution estimates."
          />

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <FeatureCard title="Order details" description="Select an asset and set your EUR amount.">
              <div className="space-y-4">
                <div className="form-row">
                  <label>Asset</label>
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
                            placeholder="Search assets"
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
                            <div className={styles.assetPrice}>{a.price.toLocaleString("en-US", { style: "currency", currency: "EUR" })}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <label>Amount (EUR)</label>
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
              </div>
            </FeatureCard>

            <FeatureCard title="Estimated summary" description="Review rate, fees, and final quantity before confirmation.">
              <div className="price-estimate">
                <SummaryRow label={`Price (${asset.symbol})`} value={`${asset.price.toFixed(2)} €`} />
                <SummaryRow label="Estimated receive" value={`${estimatedReceive.toFixed(8)} ${asset.symbol}`} />
                <SummaryRow label="Market impact" value={formatImpactPercent(impactPct)} />
                <SummaryRow label="Fee (1%)" value={`${fee.toFixed(2)} €`} />
                <SummaryRow label="Total" value={`${total.toFixed(2)} €`} isTotal />
              </div>
            </FeatureCard>
          </div>

          <TransactionActionFooter
            secondary={
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard")}>
                Cancel
              </Button>
            }
            primary={
              <Button className="w-full sm:w-auto" onClick={next} disabled={!isValid}>
                Continue to review
              </Button>
            }
          />
        </main>
      </div>
    </div>
  );
}
