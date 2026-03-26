
"use client";

import React from "react";
import MarketOverview from "@/components/MarketOverview";
import MarketTable from "@/components/MarketTable";
import { useMarketData } from "@/hooks/use-market-data";
import { LineChart, Zap, AlertCircle } from "lucide-react";
import Link from "next/link";
import { ROUTES } from "@/lib/routes";

export default function DashboardMarketPage() {
  const { assets, stats, lastTickSymbol, tickDirection } = useMarketData();

  return (
    <main className="mx-auto w-full max-w-7xl p-4 sm:p-6 lg:p-8 space-y-8 animate-fadeIn">
      {/* Header Section */}
      <header className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-6 border-b border-slate-100">
        <div className="space-y-3">
          <div className="flex items-center gap-2 px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full w-fit">
            <Zap size={12} className="animate-pulse" />
            <span className="text-[10px] font-bold uppercase tracking-widest">Real-time Markets Live</span>
          </div>
          <h1 className="text-4xl font-bold tracking-tight text-slate-900 font-primevest-compressed">Market Insights</h1>
          <p className="text-base text-slate-500 max-w-2xl font-medium">
            Track global market sentiment, real-time asset fluctuations, and deep liquidity movers in one unified view.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Link 
            href={ROUTES.markets.news}
            className="flex items-center gap-2 px-5 py-2.5 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-50 hover:border-emerald-500 transition-all shadow-sm"
          >
            <LineChart size={16} />
            Market News
          </Link>
          <button className="p-2.5 bg-slate-100 text-slate-500 rounded-xl hover:bg-slate-200 transition-colors">
            <AlertCircle size={20} />
          </button>
        </div>
      </header>

      {/* Bento Overview */}
      <MarketOverview stats={stats} />

      {/* Market Table Section */}
      <section className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            Trending Assets
            <span className="text-[10px] bg-emerald-500 text-white px-2 py-0.5 rounded-full animate-pulse">LIVE</span>
          </h2>
          <Link 
            href={ROUTES.dashboard.gainersLosers}
            className="text-sm font-bold text-emerald-600 hover:text-emerald-700 hover:underline transition-all"
          >
            View all movers →
          </Link>
        </div>
        
        <MarketTable 
          assets={assets} 
          lastTickSymbol={lastTickSymbol}
          tickDirection={tickDirection}
        />
      </section>

      {/* Disclaimer */}
      <footer className="pt-8 border-t border-slate-100">
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 text-[11px] text-slate-400 leading-relaxed italic text-center">
          Market data provided is for informational purposes only and may be subject to delays or inaccuracies. Trading digital assets involves significant risk. PrimeVest does not provide investment advice. Check local regulations before trading.
        </div>
      </footer>
    </main>
  );
}
