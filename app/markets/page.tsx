"use client";

import { useMarketData } from "@/docs/hooks/use-market-data";
import MarketOverview from "@/components/MarketOverview";
import MarketTable from "@/components/MarketTable";
import type { MarketStats } from "@/lib/dashboard/market-data";
import { LineChart } from "lucide-react";



export default function MarketsPage() {
  const { assets, stats, lastTickSymbol, tickDirection } = useMarketData();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-emerald-50/30 to-slate-100 py-8 px-4 sm:px-6 lg:px-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight bg-gradient-to-r from-slate-900 via-emerald-900 to-slate-900 bg-clip-text text-transparent mb-2">
              Markets
            </h1>
            <p className="text-xl text-slate-600 font-medium max-w-md">
              Live prices across Crypto, Forex, Stocks & Commodities
            </p>
          </div>
          <div className="flex items-center gap-3 text-emerald-600 font-bold">
            <div className="live-pulse inline-block" />
            <span className="flex items-center gap-1 text-sm uppercase tracking-wider">
              <LineChart size={16} />
              Live Data
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid gap-8 lg:grid-cols-1 xl:grid-cols-2 xl:gap-12">
        {/* Market Overview Bento Grid */}
        <div className="space-y-6 xl:col-span-1">
          <MarketOverview stats={stats as MarketStats} />
        </div>

        {/* Interactive Market Table */}
        <div className="space-y-6 xl:col-span-1">
          <MarketTable 
            assets={assets} 
            lastTickSymbol={lastTickSymbol} 
            tickDirection={tickDirection} 
          />
        </div>
      </div>
    </div>
  );
}

