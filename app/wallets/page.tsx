"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageMain, PageShell, StickyPageHeader, SurfaceCard } from "@/components/ui/page-layout";
import { createClient } from "@/lib/supabase/client";

interface WalletRow {
  id: string;
  asset: string;
  balance: number;
  available_balance: number;
  locked_balance: number;
  status: string;
}

interface PortfolioAssetRow {
  symbol: string;
  change: number;
}

interface WalletData {
  id: string;
  name: string;
  currency: string;
  balance: number;
  available: number;
  frozen: number;
  change24h: number;
  icon: string;
}

type WalletFilter = "all" | "fiat" | "crypto";

const CURRENCY_ICONS: Record<string, string> = {
  EUR: "€",
  USDT: "₮",
  USDC: "$",
  BTC: "₿",
  ETH: "Ξ",
  SOL: "◎",
  BNB: "B",
  XRP: "✕",
};

const CURRENCY_NAMES: Record<string, string> = {
  EUR: "Euro Wallet",
  USDT: "Tether Wallet",
  USDC: "USD Coin Wallet",
  BTC: "Bitcoin Wallet",
  ETH: "Ethereum Wallet",
  SOL: "Solana Wallet",
  BNB: "BNB Wallet",
  XRP: "XRP Wallet",
};

const isFiat = (currency: string) => currency === "EUR" || currency === "USDT" || currency === "USDC";

function formatAmount(value: number, currency: string) {
  const decimals = isFiat(currency) ? 2 : currency === "BTC" ? 8 : 4;
  const formatted = value.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${isFiat(currency) ? "€" : ""}${formatted} ${currency}`;
}

function getIcon(currency: string) {
  return CURRENCY_ICONS[currency.toUpperCase()] ?? currency.slice(0, 2).toUpperCase();
}

function getName(currency: string) {
  return CURRENCY_NAMES[currency.toUpperCase()] ?? `${currency} Wallet`;
}

function WalletCard({ wallet }: { wallet: WalletData }) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-semibold text-gray-800">
          {wallet.icon}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h3 className="text-sm font-semibold text-gray-900">{wallet.name}</h3>
              <p className="text-xs text-gray-600">Available {formatAmount(wallet.available, wallet.currency)}</p>
            </div>
            <Badge variant={wallet.change24h >= 0 ? "secondary" : "destructive"}>
              {wallet.change24h >= 0 ? "+" : ""}
              {wallet.change24h.toFixed(2)}%
            </Badge>
          </div>

          <div className="mt-2 text-sm font-semibold text-gray-900">{formatAmount(wallet.balance, wallet.currency)}</div>
          {wallet.frozen > 0 && <p className="mt-1 text-xs text-gray-500">Frozen {formatAmount(wallet.frozen, wallet.currency)}</p>}

          <div className="mt-3 flex flex-wrap gap-2">
            <Button asChild size="sm" variant="outline">
              <Link href={`/wallets/deposit?currency=${wallet.currency}`}>Deposit</Link>
            </Button>
            <Button asChild size="sm" variant="outline">
              <Link href={`/wallets/withdraw?currency=${wallet.currency}`}>Withdraw</Link>
            </Button>
            <Button asChild size="sm" variant="ghost">
              <Link href={`/wallets/transfer?currency=${wallet.currency}`}>Transfer</Link>
            </Button>
          </div>
        </div>
      </div>
    </article>
  );
}

function WalletSkeleton() {
  return (
    <article className="rounded-xl border bg-white p-4 animate-pulse">
      <div className="flex items-start gap-3">
        <div className="h-10 w-10 rounded-lg bg-gray-200" />
        <div className="flex-1 space-y-2">
          <div className="h-4 w-32 rounded bg-gray-200" />
          <div className="h-3 w-48 rounded bg-gray-200" />
          <div className="h-5 w-24 rounded bg-gray-200" />
        </div>
      </div>
    </article>
  );
}

export default function WalletsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<WalletFilter>("all");
  const [wallets, setWallets] = React.useState<WalletData[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const fetchWallets = React.useCallback(async () => {
    try {
      const [walletsRes, portfolioRes] = await Promise.all([
        fetch("/api/wallets"),
        fetch("/api/portfolio"),
      ]);

      if (!walletsRes.ok) {
        if (walletsRes.status === 401) {
          setError("Please sign in to view your wallets.");
          return;
        }
        throw new Error("Failed to fetch wallets");
      }

      const walletsData = await walletsRes.json() as { ok: boolean; wallets?: WalletRow[] };
      const portfolioData = portfolioRes.ok ? (await portfolioRes.json() as PortfolioAssetRow[]) : [];

      const changeBySymbol = new Map(
        (Array.isArray(portfolioData) ? portfolioData : []).map((a) => [a.symbol.toUpperCase(), a.change])
      );

      const mapped: WalletData[] = (walletsData.wallets ?? []).map((w) => ({
        id: w.id,
        name: getName(w.asset),
        currency: w.asset.toUpperCase(),
        balance: Number(w.balance ?? 0),
        available: Number(w.available_balance ?? 0),
        frozen: Number(w.locked_balance ?? 0),
        change24h: changeBySymbol.get(w.asset.toUpperCase()) ?? 0,
        icon: getIcon(w.asset),
      }));

      setWallets(mapped);
      setError(null);
    } catch {
      setError("Failed to load wallet data. Please try again.");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void fetchWallets();
  }, [fetchWallets]);

  React.useEffect(() => {
    const supabase = createClient();

    const channel = supabase
      .channel("wallets-live")
      .on("postgres_changes", { event: "*", schema: "public", table: "wallets" }, () => {
        void fetchWallets();
      })
      .on("postgres_changes", { event: "*", schema: "public", table: "balances" }, () => {
        void fetchWallets();
      })
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [fetchWallets]);

  const totalBalanceEur = wallets.reduce((sum, wallet) => {
    if (isFiat(wallet.currency)) return sum + wallet.balance;
    return sum;
  }, 0);

  const filteredWallets = wallets.filter((wallet) => {
    if (filter === "fiat") return isFiat(wallet.currency);
    if (filter === "crypto") return !isFiat(wallet.currency);
    return true;
  });

  return (
    <PageShell>
      <StickyPageHeader
        eyebrow="Assets"
        title="Wallets"
        action={
          <Button asChild>
            <Link href="/wallets/deposit">Deposit</Link>
          </Button>
        }
      />

      <PageMain>
        <SurfaceCard className="p-4">
          <p className="text-xs uppercase tracking-wide text-gray-500">Estimated fiat balance</p>
          {loading ? (
            <div className="mt-1 h-8 w-36 rounded bg-gray-200 animate-pulse" />
          ) : (
            <p className="mt-1 text-2xl font-bold text-gray-900">
              €{totalBalanceEur.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </p>
          )}
        </SurfaceCard>

        <SurfaceCard className="p-3">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", "fiat", "crypto"] as WalletFilter[]).map((tab) => (
                <Button key={tab} size="sm" variant={filter === tab ? "default" : "outline"} onClick={() => setFilter(tab)} className="capitalize">
                  {tab}
                </Button>
              ))}
            </div>
            <div className="flex gap-2">
              <Button asChild size="sm" variant="outline">
                <Link href="/wallets/exchange">Exchange</Link>
              </Button>
              <Button asChild size="sm" variant="ghost">
                <Link href="/wallets/transfer">Transfer</Link>
              </Button>
            </div>
          </div>
        </SurfaceCard>

        {error && (
          <div className="rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
            {error}
          </div>
        )}

        <section className="space-y-3">
          {loading ? (
            <>
              <WalletSkeleton />
              <WalletSkeleton />
              <WalletSkeleton />
            </>
          ) : !error && filteredWallets.length === 0 ? (
            <div className="rounded-xl border border-dashed border-gray-200 p-8 text-center">
              <p className="text-sm font-medium text-gray-900">No wallets found</p>
              <p className="mt-1 text-xs text-gray-500">
                {filter !== "all" ? `No ${filter} wallets yet.` : "Deposit funds to create your first wallet."}
              </p>
              <Button asChild size="sm" className="mt-4">
                <Link href="/wallets/deposit">Make a Deposit</Link>
              </Button>
            </div>
          ) : (
            filteredWallets.map((wallet) => <WalletCard key={wallet.id} wallet={wallet} />)
          )}
        </section>
      </PageMain>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </PageShell>
  );
}
