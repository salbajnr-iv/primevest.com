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

import { ActivityFeedItem } from "@/lib/dashboard/types";

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
  activityFeed: ActivityFeedItem[];
  showHeader?: boolean;
  maxItems?: number;
}

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

function mapActivityToTransaction(activity: ActivityFeedItem): Transaction {
  const type = activity.action.toLowerCase().includes('buy') ? 'buy' :
               activity.action.toLowerCase().includes('sell') ? 'sell' :
               activity.action.toLowerCase().includes('deposit') ? 'deposit' :
               activity.action.toLowerCase().includes('withdraw') ? 'withdrawal' : 'transfer';
  
  const date = new Date(activity.time).toLocaleDateString('de-DE', { day: 'numeric', month: 'short' });
  const time = new Date(activity.time).toLocaleTimeString('de-DE', { hour: '2-digit', minute: '2-digit' });
  
  return {
    id: activity.id,
    type,
    asset: 'Asset', // From detail parsing if needed
    assetSymbol: 'N/A',
    amount: activity.detail.split('•')[0] || 'N/A',
    value: activity.detail,
    date,
    time,
    status: "completed",
  };
}

export default function TransactionsList({
  activityFeed,
  showHeader = true,
  maxItems,
}: TransactionsListProps) {
  const transactions = activityFeed.map(mapActivityToTransaction);
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

