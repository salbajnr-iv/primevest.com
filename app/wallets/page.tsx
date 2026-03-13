"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageMain, PageShell, StickyPageHeader, SurfaceCard } from "@/components/ui/page-layout";

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

const walletsData: WalletData[] = [
  { id: "1", name: "Euro Wallet", currency: "EUR", balance: 12500.5, available: 12000, frozen: 500.5, change24h: 0, icon: "€" },
  { id: "2", name: "Bitcoin Wallet", currency: "BTC", balance: 0.45, available: 0.42, frozen: 0.03, change24h: 2.45, icon: "₿" },
  { id: "3", name: "Ethereum Wallet", currency: "ETH", balance: 3.2, available: 3, frozen: 0.2, change24h: 1.82, icon: "Ξ" },
  { id: "4", name: "USDT Wallet", currency: "USDT", balance: 5000, available: 4800, frozen: 200, change24h: -0.05, icon: "₮" },
];

const isFiat = (currency: string) => currency === "EUR" || currency === "USDT";

function formatAmount(value: number, currency: string) {
  const decimals = isFiat(currency) ? 2 : currency === "BTC" ? 8 : 4;
  const formatted = value.toLocaleString("de-DE", { minimumFractionDigits: decimals, maximumFractionDigits: decimals });
  return `${isFiat(currency) ? "€" : ""}${formatted} ${currency}`;
}

function WalletCard({ wallet }: { wallet: WalletData }) {
  return (
    <article className="rounded-xl border bg-white p-4">
      <div className="flex items-start gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-gray-100 font-semibold text-gray-800">{wallet.icon}</div>
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

export default function WalletsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<WalletFilter>("all");

  React.useEffect(() => setIsClient(true), []);

  const totalBalance = walletsData.reduce((sum, wallet) => {
    if (isFiat(wallet.currency)) return sum + wallet.balance;
    return sum + wallet.balance * 30000;
  }, 0);

  const filteredWallets = walletsData.filter((wallet) => {
    if (filter === "fiat") return isFiat(wallet.currency);
    if (filter === "crypto") return !isFiat(wallet.currency);
    return true;
  });

  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

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
            <p className="text-xs uppercase tracking-wide text-gray-500">Estimated total balance</p>
            <p className="mt-1 text-2xl font-bold text-gray-900">€{totalBalance.toLocaleString("de-DE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
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

          <section className="space-y-3">
            {filteredWallets.map((wallet) => (
              <WalletCard key={wallet.id} wallet={wallet} />
            ))}
          </section>
      </PageMain>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </PageShell>
  );
}
