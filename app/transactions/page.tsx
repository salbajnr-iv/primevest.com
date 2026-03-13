"use client";

import * as React from "react";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageMain, PageShell, StickyPageHeader, SurfaceCard } from "@/components/ui/page-layout";
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
}

type TransactionFilter = "all" | "buy" | "sell" | "deposit" | "withdrawal" | "transfer";
type DateRange = "all" | "week" | "month" | "year";

const transactions: Transaction[] = [
  { id: "1", type: "buy", asset: "Bitcoin", amount: "0.005 BTC", value: "€256.50", date: "Today, 14:32", status: "completed" },
  { id: "2", type: "sell", asset: "Ethereum", amount: "0.15 ETH", value: "€412.80", date: "Today, 10:15", status: "completed" },
  { id: "3", type: "deposit", asset: "EUR", amount: "€1,000.00", value: "", date: "Yesterday", status: "completed" },
  { id: "4", type: "withdrawal", asset: "EUR", amount: "€500.00", value: "", date: "Jan 15, 2024", status: "completed" },
  { id: "5", type: "transfer", asset: "USDT", amount: "100 USDT", value: "€92.40", date: "Jan 14, 2024", status: "completed" },
  { id: "6", type: "buy", asset: "Solana", amount: "5 SOL", value: "€680.00", date: "Jan 13, 2024", status: "completed" },
  { id: "7", type: "buy", asset: "Bitcoin", amount: "0.002 BTC", value: "€102.60", date: "Jan 12, 2024", status: "pending" },
];

function TransactionItem({ transaction }: { transaction: Transaction }) {
  const styleByType = {
    buy: { tone: "bg-green-100 text-green-700", icon: "↗" },
    sell: { tone: "bg-red-100 text-red-700", icon: "↘" },
    deposit: { tone: "bg-emerald-100 text-emerald-700", icon: "↓" },
    withdrawal: { tone: "bg-amber-100 text-amber-700", icon: "↑" },
    transfer: { tone: "bg-blue-100 text-blue-700", icon: "⇄" },
  } as const;

  const statusVariant = {
    completed: "default",
    pending: "secondary",
    failed: "destructive",
  } as const;

  const typeStyle = styleByType[transaction.type];
  const signedAmount = transaction.type === "buy" || transaction.type === "deposit" ? `+${transaction.amount}` : `-${transaction.amount}`;

  return (
    <article className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg font-semibold ${typeStyle.tone}`}>
          <span aria-hidden>{typeStyle.icon}</span>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-gray-900">{transaction.asset}</h4>
              <p className="text-sm capitalize text-gray-600">{transaction.type}</p>
            </div>
            <Button variant="ghost" size="icon" className="h-8 w-8">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                <circle cx="12" cy="12" r="1" />
                <circle cx="19" cy="12" r="1" />
                <circle cx="5" cy="12" r="1" />
              </svg>
            </Button>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{transaction.date}</span>
            <Badge variant={statusVariant[transaction.status]} className="capitalize">{transaction.status}</Badge>
            {transaction.value && <span>{transaction.value}</span>}
          </div>

          <p className="mt-2 text-sm font-semibold text-gray-900">{signedAmount}</p>
        </div>
      </div>
    </article>
  );
}

export default function TransactionsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<TransactionFilter>("all");
  const [dateRange, setDateRange] = React.useState<DateRange>("all");
  const [transactionsState, setTransactionsState] = React.useState<Transaction[]>(transactions);
  const [currentTimestamp] = React.useState(() => Date.now());
  const supabase = createClient();

  React.useEffect(() => setIsClient(true), []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setTransactionsState(transactions);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from("transactions")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error || !data || data.length === 0) {
          setTransactionsState(transactions);
          return;
        }

        interface SupabaseTransaction {
          id: number;
          type: Transaction["type"];
          asset: string;
          amount: string;
          value: string;
          date?: string;
          created_at?: string;
          status: Transaction["status"];
        }

        const mapped = data.map((row: SupabaseTransaction) => ({
          id: String(row.id),
          type: row.type || "transfer",
          asset: row.asset || "USD",
          amount: row.amount || "",
          value: row.value || "",
          date: row.date || (row.created_at ? new Date(row.created_at).toLocaleString() : ""),
          status: row.status || "completed",
        }));
        setTransactionsState(mapped);
      } catch {
        setTransactionsState(transactions);
      }
    })();
  }, [authLoading, authUser, supabase]);

  const dateFilteredTransactions = React.useMemo(() => {
    if (dateRange === "all") return transactionsState;
    const thresholds: Record<Exclude<DateRange, "all">, number> = {
      week: 7 * 24 * 60 * 60 * 1000,
      month: 30 * 24 * 60 * 60 * 1000,
      year: 365 * 24 * 60 * 60 * 1000,
    };

    return transactionsState.filter((transaction) => {
      const parsed = new Date(transaction.date).getTime();
      if (Number.isNaN(parsed)) return true;
      return currentTimestamp - parsed <= thresholds[dateRange];
    });
  }, [currentTimestamp, dateRange, transactionsState]);

  const filteredTransactions = dateFilteredTransactions.filter((transaction) => {
    if (filter !== "all" && transaction.type !== filter) return false;
    return true;
  });

  const pendingCount = transactionsState.filter((t) => t.status === "pending").length;

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

  return (
    <PageShell>
      <StickyPageHeader
        eyebrow="Activity"
        title="Transactions"
        badge={pendingCount > 0 ? <Badge variant="secondary">{pendingCount} pending</Badge> : undefined}
        action={<Button variant="outline">Export CSV</Button>}
      />

      <PageMain>
          <SurfaceCard className="p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["all", "buy", "sell", "deposit", "withdrawal", "transfer"] as TransactionFilter[]).map((tab) => (
                  <Button
                    key={tab}
                    variant={filter === tab ? "default" : "outline"}
                    size="sm"
                    onClick={() => setFilter(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <select
                value={dateRange}
                aria-label="Date range filter"
                onChange={(e) => setDateRange(e.target.value as DateRange)}
                className="h-9 rounded-md border border-input bg-background px-3 text-sm"
              >
                <option value="all">All time</option>
                <option value="week">Last week</option>
                <option value="month">Last month</option>
                <option value="year">Last year</option>
              </select>
            </div>
          </SurfaceCard>

          <section className="space-y-3">
            {filteredTransactions.length > 0 ? (
              filteredTransactions.map((transaction) => <TransactionItem key={transaction.id} transaction={transaction} />)
            ) : (
              <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-600">No transactions found</div>
            )}
          </section>
      </PageMain>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </PageShell>
  );
}
