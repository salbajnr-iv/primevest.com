import React from "react";
import styles from "./transactional-pages.module.css";
import { cn } from "@/lib/utils";

export function getAssetColorClass(symbol: string) {
  if (symbol === "BTC") return styles.assetColorBTC;
  if (symbol === "ETH") return styles.assetColorETH;
  if (symbol === "SOL") return styles.assetColorSOL;
  return styles.assetColorDefault;
}

export function TransactionPageHeader({ title, subtitle }: { title: string; subtitle: string }) {
  return (
    <div className={styles.pageHeader}>
      <h2 className={styles.pageTitle}>{title}</h2>
      <div className={cn("subtitle", styles.subtitle)}>{subtitle}</div>
    </div>
  );
}

export function QuickAmountChips({ children }: { children: React.ReactNode }) {
  return <div className={cn("quick-amounts", styles.quickAmountsTight)}>{children}</div>;
}

export function SummaryRow({
  label,
  value,
  isTotal,
}: {
  label: string;
  value: React.ReactNode;
  isTotal?: boolean;
}) {
  return (
    <div className={cn("price-estimate-row", isTotal && styles.summaryTotalRow)}>
      <span className={cn("price-estimate-label", isTotal && styles.summaryTotalLabel)}>{label}</span>
      <span className={cn("price-estimate-value", isTotal && "highlight", isTotal && styles.summaryTotalValue)}>{value}</span>
    </div>
  );
}

export function TransactionActionFooter({
  secondary,
  primary,
  compact,
}: {
  secondary: React.ReactNode;
  primary: React.ReactNode;
  compact?: boolean;
}) {
  return <div className={compact ? styles.actionPair : styles.actionFooter}>{secondary}{primary}</div>;
}
