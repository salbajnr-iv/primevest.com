
"use client";

import * as React from "react";
import { TrendingUp, TrendingDown, LineChart, ShieldCheck } from "lucide-react";
import { cn } from "@/lib/utils";
import type { MarketStats } from "@/lib/dashboard/market-data";

interface MarketOverviewProps {
  stats: MarketStats;
}

export default function MarketOverview({ stats }: MarketOverviewProps) {
  const getFearGreedColor = (index: number) => {
    if (index < 25) return "text-red-500";
    if (index < 45) return "text-orange-500";
    if (index < 55) return "text-yellow-500";
    if (index < 75) return "text-emerald-400";
    return "text-emerald-500";
  };

  const getFearGreedBg = (index: number) => {
    if (index < 25) return "bg-red-500/10";
    if (index < 45) return "bg-orange-500/10";
    if (index < 55) return "bg-yellow-500/10";
    if (index < 75) return "bg-emerald-500/10";
    return "bg-emerald-600/10";
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {/* Total Market Cap */}
      <div className="card-premium group p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Market Cap</span>
          <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-600 group-hover:scale-110 transition-transform">
            <LineChart size={16} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{stats.totalMarketCap}</h3>
          <p className="flex items-center gap-1 mt-1 text-sm font-semibold text-emerald-600">
            <TrendingUp size={14} />
            {stats.totalMarketCapChange}
          </p>
        </div>
      </div>

      {/* 24h Volume */}
      <div className="card-premium group p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">24h Volume</span>
          <div className="p-2 rounded-lg bg-blue-500/10 text-blue-600 group-hover:scale-110 transition-transform">
            <LineChart size={16} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{stats.volume24h}</h3>
          <p className="flex items-center gap-1 mt-1 text-sm font-semibold text-red-500">
            <TrendingDown size={14} />
            {stats.volumeChange}
          </p>
        </div>
      </div>

      {/* BTC Dominance */}
      <div className="card-premium group p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">BTC Dominance</span>
          <div className="p-2 rounded-lg bg-amber-500/10 text-amber-600 group-hover:scale-110 transition-transform">
            <ShieldCheck size={16} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{stats.btcDominance}</h3>
          <p className="flex items-center gap-1 mt-1 text-sm font-semibold text-slate-500">
            {stats.btcDominanceChange}
          </p>
        </div>
      </div>

      {/* Market Sentiment */}
      <div className="card-premium group p-5 flex flex-col justify-between">
        <div className="flex items-center justify-between mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">Sentiment</span>
          <div className={cn("p-2 rounded-lg group-hover:scale-110 transition-transform", getFearGreedBg(stats.fearGreedIndex))}>
            <div className={cn("w-4 h-4 rounded-full border-2 border-current animate-pulse")} />
          </div>
        </div>
        <div>
          <h3 className="text-2xl font-bold tracking-tight text-slate-900">{stats.fearGreedIndex}</h3>
          <p className={cn("mt-1 text-sm font-bold", getFearGreedColor(stats.fearGreedIndex))}>
            {stats.fearGreedLabel}
          </p>
        </div>
      </div>
    </section>
  );
}
