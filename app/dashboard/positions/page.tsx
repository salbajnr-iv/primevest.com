"use client";

import React from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import TradeWPositions from "@/components/TradeWPositions";
import { usePositions } from "@/docs/hooks/usePositions";
import { useAuth } from "@/contexts/AuthContext";



export default function PositionsPage() {
  const { user } = useAuth();
  const { positions } = usePositions(user?.id);

  const summary = React.useMemo(() => {
    const tabPositions = positions.filter(p => p.accountType === 'tradew'); // Default to tradew for summary
    const count = tabPositions.length;
    const totalValue = tabPositions.reduce((sum, p) => sum + (p.currentPrice * p.volume), 0);
    const totalPnL = tabPositions.reduce((sum, p) => sum + p.profit, 0);
    return { count, totalValue: totalValue.toFixed(2), totalPnL: totalPnL.toFixed(2) };
  }, [positions]);

  return (
    <DashboardShell
      mainClassName="space-y-6 pb-20"
      pageHeader={
        <div className="flex items-center gap-2 py-3 mb-4">
          <Link 
            href="/dashboard" 
            className="inline-flex items-center gap-2 px-3 py-2 rounded-lg border bg-card hover:bg-accent hover:text-accent-foreground text-sm font-medium transition-all text-muted-foreground border-border"
          >
            ← Dashboard
          </Link>
          <h1 className="text-2xl font-bold flex-1 m-0">Positions</h1>
        </div>
      }
    >
      <Card className="mt-3">
          <CardContent className="p-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Positions</div>
              <div className="text-3xl font-bold text-card-foreground">{summary.count}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Total Value</div>
              <div className="text-2xl font-bold text-card-foreground">€{summary.totalValue}</div>
            </div>
            <div className="text-center">
              <div className="text-xs font-medium uppercase tracking-wide text-muted-foreground mb-2">Total P&L</div>
              <div className={cn(
                "text-2xl font-bold",
                parseFloat(summary.totalPnL) >= 0 ? "text-green-500" : "text-destructive"
              )}>
                {parseFloat(summary.totalPnL) >= 0 ? '+' : ''}€{summary.totalPnL}
              </div>
            </div>
          </CardContent>
        </Card>

        <TradeWPositions />

        <Card className="mt-8">
          <CardContent className="p-6 pt-0 space-y-3">
            <h3 className="uppercase tracking-wider text-xs font-semibold text-muted-foreground">Settings</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card border-border">
                <span className="text-sm font-semibold text-foreground">Auto-rebalancing</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              </div>
              <div className="flex items-center justify-between p-4 border rounded-lg bg-card border-border">
                <span className="text-sm font-semibold text-foreground">Price alerts</span>
                <input type="checkbox" defaultChecked className="w-5 h-5 rounded cursor-pointer" />
              </div>
            </div>
          </CardContent>
        </Card>
    </DashboardShell>
  );
}
