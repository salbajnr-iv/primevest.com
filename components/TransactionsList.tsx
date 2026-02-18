"use client";

import * as React from "react";
import Link from "next/link";

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "transfer";
  asset: string;
  assetSymbol: string;
  amount: string;
  value: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "failed";
}

interface TransactionsListProps {
  transactions?: Transaction[];
  showHeader?: boolean;
  maxItems?: number;
}

const defaultTransactions: Transaction[] = [
  {
    id: "1",
    type: "buy",
    asset: "Bitcoin",
    assetSymbol: "BTC",
    amount: "0,0054 BTC",
    value: "≈ 356,78 €",
    date: "Heute",
    time: "14:32",
    status: "completed",
  },
  {
    id: "2",
    type: "deposit",
    asset: "Euro",
    assetSymbol: "EUR",
    amount: "1.500,00 €",
    value: "Eingezahlt",
    date: "Heute",
    time: "10:15",
    status: "completed",
  },
  {
    id: "3",
    type: "sell",
    asset: "Ethereum",
    assetSymbol: "ETH",
    amount: "0,15 ETH",
    value: "≈ 489,25 €",
    date: "Gestern",
    time: "16:48",
    status: "completed",
  },
  {
    id: "4",
    type: "transfer",
    asset: "Solana",
    assetSymbol: "SOL",
    amount: "12,5 SOL",
    value: "≈ 1.875,00 €",
    date: "Gestern",
    time: "09:22",
    status: "completed",
  },
  {
    id: "5",
    type: "buy",
    asset: "Cardano",
    assetSymbol: "ADA",
    amount: "2.500 ADA",
    value: "≈ 925,00 €",
    date: "19.01.2025",
    time: "20:05",
    status: "completed",
  },
  {
    id: "6",
    type: "withdrawal",
    asset: "Euro",
    assetSymbol: "EUR",
    amount: "500,00 €",
    value: "Abgehoben",
    date: "18.01.2025",
    time: "11:30",
    status: "completed",
  },
];

const typeIcons: Record<string, React.ReactNode> = {
  buy: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M5 12h14" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  sell: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M5 12h14" />
      <circle cx="12" cy="12" r="10" />
    </svg>
  ),
  deposit: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 5v14M19 12l-7 7-7-7" />
    </svg>
  ),
  withdrawal: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M12 19V5M5 12l7-7 7 7" />
    </svg>
  ),
  transfer: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M17 1l4 4-4 4" />
      <path d="M3 11V9a4 4 0 0 1 4-4h14" />
      <path d="M7 23l-4-4 4-4" />
      <path d="M21 13v2a4 4 0 0 1-4 4H3" />
    </svg>
  ),
};

const typeLabels: Record<string, string> = {
  buy: "Gekauft",
  sell: "Verkauft",
  deposit: "Einzahlung",
  withdrawal: "Auszahlung",
  transfer: "Transfer",
};

export default function TransactionsList({
  transactions = defaultTransactions,
  showHeader = true,
  maxItems,
}: TransactionsListProps) {
  const displayTransactions = maxItems 
    ? transactions.slice(0, maxItems) 
    : transactions;

  return (
    <div className="transactions-list">
      {showHeader && (
        <div className="transactions-header">
          <h3 className="section-title">Letzte Aktivität</h3>
          <Link href="/transactions" className="view-all-link">
            Alle anzeigen →
          </Link>
        </div>
      )}
      
      <div className="transactions-card">
        {displayTransactions.map((tx, index) => (
          <div 
            key={tx.id} 
            className={`transaction-row ${index !== displayTransactions.length - 1 ? "has-border" : ""}`}
          >
            <div className={`transaction-type-icon ${tx.type}`}>
              {typeIcons[tx.type]}
            </div>
            <div className="transaction-info">
              <div className="transaction-asset">
                <span className="asset-name">{tx.asset}</span>
                <span className="asset-symbol">{tx.assetSymbol}</span>
              </div>
              <div className="transaction-meta">
                <span className="tx-type-label">{typeLabels[tx.type]}</span>
                <span className="tx-date">{tx.date}</span>
              </div>
            </div>
            <div className="transaction-amounts">
              <div className="tx-amount">{tx.amount}</div>
              <div className="tx-value">{tx.value}</div>
            </div>
            <div className={`transaction-status ${tx.status}`}>
              {tx.status === "completed" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M20 6L9 17l-5-5" />
                </svg>
              )}
              {tx.status === "pending" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M12 6v6l4 2" />
                </svg>
              )}
              {tx.status === "failed" && (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M15 9l-6 6M9 9l6 6" />
                </svg>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

