"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface StatementItem {
  id: string;
  date: string;
  description: string;
  amount: string;
  balance: string;
  type: "credit" | "debit";
}

const statementData: StatementItem[] = [
  { id: "1", date: "Jan 31, 2024", description: "Opening Balance", amount: "", balance: "€5,000.00", type: "credit" },
  { id: "2", date: "Jan 30, 2024", description: "Buy - Bitcoin", amount: "-€256.50", balance: "€5,000.00", type: "debit" },
  { id: "3", date: "Jan 29, 2024", description: "Deposit - SEPA", amount: "+€1,000.00", balance: "€5,256.50", type: "credit" },
  { id: "4", date: "Jan 28, 2024", description: "Sell - Ethereum", amount: "+€412.80", balance: "€4,256.50", type: "credit" },
  { id: "5", date: "Jan 27, 2024", description: "Buy - Solana", amount: "-€680.00", balance: "€3,843.70", type: "debit" },
  { id: "6", date: "Jan 26, 2024", description: "Withdrawal", amount: "-€500.00", balance: "€4,523.70", type: "debit" },
  { id: "7", date: "Jan 25, 2024", description: "Deposit - SEPA", amount: "+€2,000.00", balance: "€5,023.70", type: "credit" },
  { id: "8", date: "Jan 24, 2024", description: "Buy - Bitcoin", amount: "-€150.00", balance: "€3,023.70", type: "debit" },
  { id: "9", date: "Jan 23, 2024", description: "Trading Fee", amount: "-€2.50", balance: "€3,173.70", type: "debit" },
  { id: "10", date: "Jan 22, 2024", description: "Buy - Ethereum", amount: "-€320.00", balance: "€3,176.20", type: "debit" },
];

export default function StatementPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedMonth] = React.useState("January 2024");
  const [statementDataState, setStatementDataState] = React.useState<StatementItem[]>([]);
  const supabase = createClient();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setStatementDataState(statementData);
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
          console.warn('Transactions table is not available or query failed. Falling back to mock data.', error);
          setStatementDataState(statementData);
        } else if (data && data.length > 0) {
          interface SupabaseTransaction {
            id: number;
            date?: string;
            created_at?: string;
            description: string;
            type: 'credit' | 'debit';
            amount: string;
            balance: string;
          }
          
          const mapped: StatementItem[] = data.map((row: SupabaseTransaction) => ({
            id: String(row.id),
            date: row.date || (row.created_at ? new Date(row.created_at).toLocaleDateString() : ''),
            description: row.description || row.type || 'Transaction',
            amount: row.amount || '',
            balance: row.balance || '',
            type: row.type === 'credit' ? 'credit' : 'debit',
          }));
          setStatementDataState(mapped);
        } else {
          setStatementDataState(statementData);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setStatementDataState(statementData);
      }
    })();
  }, [authLoading, authUser, supabase]);

  if (!isClient || authLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalCredits = statementDataState
    .filter(item => item.amount.startsWith("+"))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/[€,+]/g, "")), 0);

  const totalDebits = statementDataState
    .filter(item => item.amount.startsWith("-"))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/[€-]/g, "")), 0);

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
            <span className="header-eyebrow">ACCOUNT</span>
            <div className="header-title">Statement</div>
          </div>
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

        {/* DATE SELECTOR */}
        <section className="section">
          <div className="card">
            <div className="date-selector">
              <button className="btn btn-icon" aria-label="Previous month">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="15 18 9 12 15 6" />
                </svg>
              </button>
              <span className="selected-date">{selectedMonth}</span>
              <button className="btn btn-icon" aria-label="Next month">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="9 18 15 12 9 6" />
                </svg>
              </button>
            </div>
          </div>
        </section>

        {/* SUMMARY */}
        <section className="section">
          <div className="summary-card">
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Opening Balance</span>
                <span className="summary-value">€5,000.00</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Closing Balance</span>
                <span className="summary-value">€3,176.20</span>
              </div>
            </div>
            <div className="summary-divider"></div>
            <div className="summary-row">
              <div className="summary-item">
                <span className="summary-label">Total Credits</span>
                <span className="summary-value credit">+€{totalCredits.toFixed(2)}</span>
              </div>
              <div className="summary-item">
                <span className="summary-label">Total Debits</span>
                <span className="summary-value debit">-€{totalDebits.toFixed(2)}</span>
              </div>
            </div>
          </div>
        </section>

        {/* STATEMENT TABLE */}
        <section className="section">
          <h3 className="section-title">Transaction Details</h3>
          <div className="card">
            <div className="statement-container">
              <div className="statement-header">
                <span>Date</span>
                <span>Description</span>
                <span>Amount</span>
                <span>Balance</span>
              </div>
              <div className="statement-body">
                {statementDataState.map((item) => (
                  <div key={item.id} className="statement-row">
                    <span className="row-date">{item.date}</span>
                    <span className="row-description">{item.description}</span>
                    <span className={`row-amount ${item.type}`}>
                      {item.amount || "—"}
                    </span>
                    <span className="row-balance">{item.balance}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* EXPORT */}
        <section className="section">
          <div className="card">
            <div className="export-actions">
              <button className="btn btn-primary">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                  <polyline points="7 10 12 15 17 10" />
                  <line x1="12" y1="15" x2="12" y2="3" />
                </svg>
                Download Statement (PDF)
              </button>
            </div>
          </div>
        </section>
      </div>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />
    </div>
  );
}

