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
import { FreshnessBadge } from "@/components/ui/FreshnessBadge";
import styles from "@/components/ui/transactional-pages.module.css";
import { calculateMarketImpactPercent, formatImpactPercent } from "@/lib/swap/market-impact";
import { useDashboardSummary } from "@/lib/dashboard/use-dashboard-summary";
import { useLiveMarket, type LiveMarketAsset } from "@/lib/market/use-live-market";
import { useQuote } from "@/lib/market/use-quote";
import type { MarketFreshnessState } from "@/lib/market/freshness";

interface Asset extends Omit<LiveMarketAsset, "price"> {
  price: number;
  liquidityEur: number;
}

const DEFAULT_LIQUIDITY_EUR: Record<string, number> = {
  BTC: 8_500_000,
  ETH: 6_100_000,
  SOL: 2_250_000,
  BNB: 3_450_000,
};

export default function DashboardBuyPage() {
  const router = useRouter();
  const { summary } = useDashboardSummary();
  const { assets: liveAssets, loading: marketLoading, error: marketError, hasStaleData, hasUnavailableData, lastSyncedAt } = useLiveMarket();
  const assets = React.useMemo<Asset[]>(
    () => liveAssets
      .filter((a): a is LiveMarketAsset & { price: number } => typeof a.price === 'number' && a.price > 0)
      .map((a) => ({ ...a, liquidityEur: DEFAULT_LIQUIDITY_EUR[a.symbol] ?? 1_000_000 })),
    [liveAssets],
  );
  const [asset, setAsset] = React.useState<Asset | null>(null);
  const [amountEur, setAmountEur] = React.useState<string>("");
  const [showDropdown, setShowDropdown] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");

  React.useEffect(() => {
    if (!asset && assets.length > 0) {
      setAsset(assets[0]);
    }
  }, [asset, assets]);

  React.useEffect(() => {
    if (!asset) return;
    const nextAsset = assets.find((item) => item.symbol === asset.symbol);
    if (nextAsset) {
      setAsset(nextAsset);
    }
  }, [asset, assets]);

  const filteredAssets = assets.filter(
    (a) => a.name.toLowerCase().includes(searchQuery.toLowerCase()) || a.symbol.toLowerCase().includes(searchQuery.toLowerCase()),
  );

  const parsedEur = amountEur ? parseFloat(amountEur) : 0;
  const fee = parsedEur > 0 ? parsedEur * 0.01 : 0;
  const total = parsedEur + fee;
  const estimatedReceive = parsedEur > 0 && asset?.price ? parsedEur / asset.price : 0;
  const impactPct = calculateMarketImpactPercent({ amountEur: parsedEur, liquidityEur: asset?.liquidityEur ?? 1_000_000 });
  const availableCashBalance = Number(summary.availableBalance ?? 0);
  const hasCashBalance = total <= availableCashBalance;
  const { quote: selectedQuote } = useQuote(asset?.symbol ?? '');
  const quoteStale = selectedQuote?.freshness === 'stale';
  const isValid = parsedEur > 0 && hasCashBalance && Boolean(asset?.price) && !quoteStale;

  function next() {
    if (!isValid || !asset) return;

    const params = new URLSearchParams({
      asset: asset.name,
      symbol: asset.symbol,
      amount: parsedEur.toFixed(2),
      fee: fee.toFixed(2),
      total: total.toFixed(2),
      price: (asset?.price ?? 0).toFixed(2),
      receive: estimatedReceive.toFixed(8),
      impactPct: impactPct.toFixed(2),
    });

    router.push(`/dashboard/buy/review?${params.toString()}`);
  }

  const quickAmounts = [100, 250, 500, 1000];

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader summary={summary} />

        <main className="page-card space-y-5">
          <PageSectionHeader
            eyebrow="Trading"
            title="Buy assets"
            description="Build your position with transparent pricing and instant execution estimates."
          />

          {marketLoading && <div className="input-hint">Loading live market data…</div>}
          {marketError && <div className={`input-hint ${styles.errorText}`}>Live pricing unavailable: {marketError}</div>}
          {!marketLoading && !marketError && hasStaleData && <div className="input-hint">Some quotes are stale. Verify before submitting.</div>}
          {!marketLoading && !marketError && hasUnavailableData && <div className="input-hint">Some assets are temporarily unavailable.</div>}
          {!marketLoading && !marketError && lastSyncedAt && (
            <div className="input-hint">
              Last synced: {new Date(lastSyncedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}
            </div>
          )}

          <div className="grid gap-4 lg:grid-cols-[1.3fr_0.9fr]">
            <FeatureCard title="Order details" description="Select an asset and set your EUR amount.">
              <div className="space-y-4">
                <div className="form-row">
                  <label>Asset</label>
                  <div className="asset-selector">
                    <div className="asset-selector-input" onClick={() => setShowDropdown(!showDropdown)}>
                      <div className={styles.assetSelectorContent}>
                        {asset ? <div className={`asset-option-icon ${getAssetColorClass(asset.symbol)}`}>{asset.symbol}</div> : <div className={`asset-option-icon ${getAssetColorClass("BTC")}`}>--</div>}
                        <div>
                          <div className="asset-option-name">{asset?.name ?? "No asset available"}</div>
                          <div className="flex items-center gap-1">
                            <span>{asset?.symbol ?? "--"}</span>
                            {asset?.freshnessStatus !== 'unavailable' && typeof asset?.freshnessStatus === 'string' && <FreshnessBadge freshness={asset.freshnessStatus as MarketFreshnessState} size="sm" />}
                          </div>
                        </div>
                      </div>
                      <svg className={styles.chevronIcon} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9l6 6 6-6" />
                      </svg>
                    </div>

                    {showDropdown && assets.length > 0 && (
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
                              {a.freshnessStatus !== "unavailable" && a.freshnessStatus && <FreshnessBadge freshness={a.freshnessStatus as MarketFreshnessState} size="sm" />}
                            </div>
                <div className={styles.assetPrice}>{a.price?.toLocaleString("en-US", { style: "currency", currency: "EUR" })}</div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                <div className="form-row">
                  <label>Amount (EUR)</label>
                  <input type="number" value={amountEur} onChange={(e) => setAmountEur(e.target.value)} placeholder="100.00" className={`order-input ${styles.orderInput}`} />
                  <div className="input-hint">
                    Available cash balance: {availableCashBalance.toLocaleString("de-DE", { style: "currency", currency: "EUR" })}
                  </div>

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
                <SummaryRow label={`Price (${asset?.symbol ?? "--"})`} value={asset?.price ? `${asset.price.toFixed(2)} €` : "Unavailable"} />
                <SummaryRow label="Estimated receive" value={asset ? `${estimatedReceive.toFixed(8)} ${asset.symbol}` : "Unavailable"} />
                <SummaryRow label="Market impact" value={formatImpactPercent(impactPct)} />
                <SummaryRow label="Fee (1%)" value={`${fee.toFixed(2)} €`} />
                <SummaryRow label="Total" value={`${total.toFixed(2)} €`} isTotal />
                {!hasCashBalance && parsedEur > 0 && <div className={`input-hint ${styles.errorText}`}>Total exceeds your available cash balance.</div>}
                {!asset?.price && <div className={`input-hint ${styles.errorText}`}>Live price unavailable for the selected asset.</div>}
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
