"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Transaction {
  id: string;
  type: "buy" | "sell" | "deposit" | "withdrawal" | "transfer";
  asset: string;
  amount: string;
  value: string;
  date: string;
  status: "completed" | "pending" | "failed";
  icon?: string;
}

const transactions: Transaction[] = [
  {
    id: "1",
    type: "buy",
    asset: "Bitcoin",
    amount: "0.005 BTC",
    value: "€256.50",
    date: "Today, 14:32",
    status: "completed",
  },
  {
    id: "2",
    type: "sell",
    asset: "Ethereum",
    amount: "0.15 ETH",
    value: "€412.80",
    date: "Today, 10:15",
    status: "completed",
  },
  {
    id: "3",
    type: "deposit",
    asset: "EUR",
    amount: "€1,000.00",
    value: "",
    date: "Yesterday",
    status: "completed",
  },
  {
    id: "4",
    type: "withdrawal",
    asset: "EUR",
    amount: "€500.00",
    value: "",
    date: "Jan 15, 2024",
    status: "completed",
  },
  {
    id: "5",
    type: "transfer",
    asset: "USDT",
    amount: "100 USDT",
    value: "€92.40",
    date: "Jan 14, 2024",
    status: "completed",
  },
  {
    id: "6",
    type: "buy",
    asset: "Solana",
    amount: "5 SOL",
    value: "€680.00",
    date: "Jan 13, 2024",
    status: "completed",
  },
  {
    id: "7",
    type: "buy",
    asset: "Bitcoin",
    amount: "0.002 BTC",
    value: "€102.60",
    date: "Jan 12, 2024",
    status: "pending",
  },
];

<<<<<<< HEAD
function TransactionItem({ transaction }: { transaction: Transaction }) {
  // Define type-specific styling
  const getTypeStyle = () => {
    switch(transaction.type) {
      case 'buy':
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#0f9d58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          ),
          bgColor: 'rgba(15, 157, 88, 0.1)',
          textColor: '#0f9d58'
        };
      case 'sell':
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#d64545" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          ),
          bgColor: 'rgba(214, 69, 69, 0.1)',
          textColor: '#d64545'
        };
      case 'deposit':
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#0f9d58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="23" />
              <path d="M8 19l8-5 8 5" />
            </svg>
          ),
          bgColor: 'rgba(15, 157, 88, 0.1)',
          textColor: '#0f9d58'
        };
      case 'withdrawal':
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="9" />
              <path d="M8 5l8 5-8 5" />
            </svg>
          ),
          bgColor: 'rgba(255, 152, 0, 0.1)',
          textColor: '#ff9800'
        };
      case 'transfer':
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          ),
          bgColor: 'rgba(0, 122, 255, 0.1)',
          textColor: '#007aff'
        };
      default:
        return { 
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          ),
          bgColor: 'rgba(0, 122, 255, 0.1)',
          textColor: '#007aff'
        };
    }
  };

  const { icon, bgColor } = getTypeStyle();
=======
const typeConfig = {
  buy: { color: "#2cec9a", label: "Buy" },
  sell: { color: "#d64545", label: "Sell" },
  deposit: { color: "#0f9d58", label: "Deposit" },
  withdrawal: { color: "#ff9800", label: "Withdrawal" },
  transfer: { color: "#007aff", label: "Transfer" },
};

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const config = typeConfig[transaction.type];
>>>>>>> 02bdcb7 (Initial commit)

  return (
    <div className="transaction-item">
      <div className="transaction-left">
        <div 
<<<<<<< HEAD
          className={`transaction-icon ${bgColor ? 'bg-custom' : ''}`}
          data-bg-color={bgColor}
        >
          {icon}
=======
          className="transaction-icon"
          style={{ backgroundColor: `${config.color}20` }}
        >
          {transaction.type === "buy" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="1" x2="12" y2="23" />
              <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          )}
          {transaction.type === "sell" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
              <polyline points="17 18 23 18 23 12" />
            </svg>
          )}
          {transaction.type === "deposit" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="19" x2="12" y2="23" />
              <path d="M8 19l8-5 8 5" />
            </svg>
          )}
          {transaction.type === "withdrawal" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="12" y1="5" x2="12" y2="9" />
              <path d="M8 5l8 5-8 5" />
            </svg>
          )}
          {transaction.type === "transfer" && (
            <svg viewBox="0 0 24 24" fill="none" stroke={config.color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="17 1 21 5 17 9" />
              <path d="M3 11V9a4 4 0 0 1 4-4h14" />
              <polyline points="7 23 3 19 7 15" />
              <path d="M21 13v2a4 4 0 0 1-4 4H3" />
            </svg>
          )}
>>>>>>> 02bdcb7 (Initial commit)
        </div>
        <div className="transaction-info">
          <span className="transaction-asset">{transaction.asset}</span>
          <span className="transaction-date">{transaction.date}</span>
        </div>
      </div>
      <div className="transaction-right">
<<<<<<< HEAD
        <span className={`transaction-amount ${transaction.type === "sell" || transaction.type === "withdrawal" ? "amount-negative" : "amount-positive"}`}>
=======
        <span className="transaction-amount" style={{ color: transaction.type === "sell" || transaction.type === "withdrawal" ? "#d64545" : "#0f9d58" }}>
>>>>>>> 02bdcb7 (Initial commit)
          {transaction.type === "buy" || transaction.type === "deposit" ? "+" : "-"}{transaction.amount}
        </span>
        {transaction.value && (
          <span className="transaction-value">{transaction.value}</span>
        )}
        <span className={`transaction-status ${transaction.status}`}>
          {transaction.status === "completed" ? "Done" : transaction.status === "pending" ? "Pending" : "Failed"}
        </span>
      </div>
    </div>
  );
}

export default function TransactionsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<string>("all");
  const [dateRange, setDateRange] = React.useState<string>("all");
  const [transactionsState, setTransactionsState] = React.useState<Transaction[]>(transactions);
  const supabase = createClient();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setTransactionsState(transactions);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Transactions table not available, using mock data', error);
          setTransactionsState(transactions);
        } else if (data && data.length > 0) {
<<<<<<< HEAD
          interface SupabaseTransaction {
            id: number;
            type: 'buy' | 'sell' | 'deposit' | 'withdrawal' | 'transfer';
            asset: string;
            amount: string;
            value: string;
            date?: string;
            created_at?: string;
            status: 'completed' | 'pending' | 'failed';
          }
          
          const mapped = data.map((row: SupabaseTransaction) => ({
=======
          const mapped = data.map((row: any) => ({
>>>>>>> 02bdcb7 (Initial commit)
            id: String(row.id),
            type: row.type || 'transfer',
            asset: row.asset || 'USD',
            amount: row.amount || '',
            value: row.value || '',
<<<<<<< HEAD
            date: row.date || (row.created_at ? new Date(row.created_at).toLocaleString() : ''),
=======
            date: row.date || new Date(row.created_at).toLocaleString(),
>>>>>>> 02bdcb7 (Initial commit)
            status: row.status || 'completed',
          }));
          setTransactionsState(mapped);
        } else {
          setTransactionsState(transactions);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setTransactionsState(transactions);
      }
    })();
  }, [authLoading, authUser, supabase]);

  const filteredTransactions = transactionsState.filter((t) => {
    if (filter !== "all" && t.type !== filter) return false;
    return true;
  });

  if (!isClient || authLoading) {
    return (
<<<<<<< HEAD
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
=======
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
>>>>>>> 02bdcb7 (Initial commit)
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">ACTIVITY</span>
            <div className="header-title">Transactions</div>
          </div>
<<<<<<< HEAD
          <div className="header-actions">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* SUMMARY */}
        <section className="section">
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">Total Transactions</span>
              <span className="summary-value">{transactionsState.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Completed</span>
              <span className="summary-value">{transactionsState.filter(t => t.status === 'completed').length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Pending</span>
              <span className="summary-value">{transactionsState.filter(t => t.status === 'pending').length}</span>
            </div>
          </div>
        </section>

        {/* FILTERS */}
        <section className="section">
          <div className="card">
            <div className="filters-container">
              <div className="filter-tabs">
                {["all", "buy", "sell", "deposit", "withdrawal"].map((f) => (
                  <button
                    key={f}
                    className={`filter-tab ${filter === f ? "active" : ""}`}
                    onClick={() => setFilter(f)}
                  >
                    {f.charAt(0).toUpperCase() + f.slice(1)}
                  </button>
                ))}
              </div>
              <div className="date-filter">
                <select 
                  value={dateRange} 
                  aria-label="Date range filter"
                  onChange={(e) => setDateRange(e.target.value)}
                  className="form-select"
                >
                  <option value="all">All Time</option>
                  <option value="week">Last Week</option>
                  <option value="month">Last Month</option>
                  <option value="year">Last Year</option>
                </select>
              </div>
            </div>
          </div>
        </section>

        {/* TRANSACTIONS LIST */}
        <section className="section">
          <h3 className="section-title">Transaction History</h3>
          <div className="card">
            {filteredTransactions.length > 0 ? (
              <div className="transactions-container">
                {filteredTransactions.map((transaction) => (
                  <TransactionItem key={transaction.id} transaction={transaction} />
                ))}
              </div>
=======
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* FILTERS */}
        <div className="transaction-filters">
          <div className="filter-tabs">
            {["all", "buy", "sell", "deposit", "withdrawal"].map((f) => (
              <button
                key={f}
                className={`filter-tab ${filter === f ? "active" : ""}`}
                onClick={() => setFilter(f)}
              >
                {f.charAt(0).toUpperCase() + f.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* TRANSACTIONS LIST */}
        <section className="transactions-section">
          <div className="transactions-list">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => (
                <TransactionItem key={transaction.id} transaction={transaction} />
              ))
>>>>>>> 02bdcb7 (Initial commit)
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
                <p>No transactions found</p>
              </div>
            )}
          </div>
        </section>

        {/* EXPORT */}
<<<<<<< HEAD
        <section className="section">
          <div className="card">
            <div className="export-actions">
              <button className="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Export Transactions
              </button>
            </div>
          </div>
        </section>
=======
        <div className="export-section">
          <button className="export-button">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
            Export Transactions
          </button>
        </div>
>>>>>>> 02bdcb7 (Initial commit)
      </div>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />
    </div>
  );
}

<<<<<<< HEAD

=======
>>>>>>> 02bdcb7 (Initial commit)
