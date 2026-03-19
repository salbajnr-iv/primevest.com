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

interface Asset {
  symbol: string;
  name: string;
  price: number;
  balance: number;
}

const assets: Asset[] = [
  { symbol: "BTC", name: "Bitcoin", price: 45234.5, balance: 0.0021 },
  { symbol: "ETH", name: "Ethereum", price: 2845.3, balance: 0.03 },
  { symbol: "SOL", name: "Solana", price: 156.92, balance: 0.5 },
  { symbol: "BNB", name: "Binance Coin", price: 583.4, balance: 0.01 },
];

export default function SellSelectPage() {
  const router = useRouter();
  const [asset, setAsset] = React.useState<Asset>(assets[0]);
  const [amount, setAmount] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  const filteredAssets = assets.filter((a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()));

  const parsedAmount = amount ? parseFloat(amount) : 0;
  const estimatedValue = parsedAmount > 0 ? parsedAmount * asset.price : 0;
  const fee = estimatedValue > 0 ? estimatedValue * 0.01 : 0;
  const total = estimatedValue - fee;

  const hasBalance = parsedAmount <= asset.balance;
  const isValid = parsedAmount > 0 && hasBalance;

  function next() {
    if (!isValid) return;
    const params = new URLSearchParams({
      asset: `${asset.name} (${asset.symbol})`,
      amount: String(parsedAmount),
      estimated: String(estimatedValue.toFixed(2)),
      fee: String(fee.toFixed(2)),
      total: String(total.toFixed(2)),
    });
    router.push(`/dashboard/sell/review?${params.toString()}`);
  }

  const percentActions = [25, 50, 75, 100];

  return (
    <div className="dashboard-container">
        <div className="dashboard-app">
          <DashboardHeader summary={{ userName: "User", portfolioValue: 0, portfolioChangePct: 0, availableBalance: 0, availableBalanceChangePct: 0, notificationCount: 0 }} />

        <main className="page-card space-y-5">
          <PageSectionHeader
            eyebrow="Trading"
            title="Sell assets"
            description="Use a consistent quote flow to liquidate part of your holdings."
          />

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <FeatureCard title="Order details" description="Select your asset and amount to sell.">
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
                            <div className={styles.assetMetaRight}>
                              <div className={styles.assetPrice}>{a.price.toLocaleString("en-US", { style: "currency", currency: "EUR" })}</div>
                              <div className="asset-balance">{a.balance.toLocaleString("en-US")} {a.symbol}</div>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <label>Amount ({asset.symbol})</label>
                  <input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.001" className={`order-input ${styles.orderInput}`} />
                  <div className="input-hint">Available: {asset.balance.toLocaleString("en-US", { maximumFractionDigits: 8 })} {asset.symbol}</div>

                  <QuickAmountChips>
                    {percentActions.map((p) => (
                      <button
                        key={p}
                        type="button"
                        className={`quick-amount-btn ${amount === String((asset.balance * p) / 100) ? "active" : ""}`}
                        onClick={() => setAmount(String(parseFloat(((asset.balance * p) / 100).toFixed(6))))}
                      >
                        {p}%
                      </button>
                    ))}
                  </QuickAmountChips>
                </div>
              </div>
            </FeatureCard>

            <FeatureCard title="Estimated proceeds" description="Preview sale value and deducted fees.">
              <div className="price-estimate">
                <SummaryRow label="Price" value={asset.price.toLocaleString("en-US", { style: "currency", currency: "EUR" })} />
                <SummaryRow label="Gross value" value={`${estimatedValue.toFixed(2)} €`} />
                <SummaryRow label="Fee (1%)" value={`${fee.toFixed(2)} €`} />
                <SummaryRow label="Payout" value={`${total.toFixed(2)} €`} isTotal />
                {!hasBalance && <div className={`input-hint ${styles.errorText}`}>Amount exceeds available balance.</div>}
              </div>
            </FeatureCard>
          </div>

          <TransactionActionFooter
            secondary={
              <Button variant="outline" className="w-full sm:w-auto" onClick={() => router.push("/dashboard/portfolio")}>
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
