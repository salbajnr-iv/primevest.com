
"use client";

import React, { useState, useMemo } from "react";
import { TrendingUp, TrendingDown, Search } from "lucide-react";
import { cn } from "@/lib/utils";
import { MARKET_CATEGORIES, type MarketAsset, type AssetCategory } from "@/lib/dashboard/market-data";
import Sparkline from "./Sparkline";

interface MarketTableProps {
  assets: MarketAsset[];
  lastTickSymbol?: string | null;
  tickDirection?: "up" | "down" | null;
}

export default function MarketTable({ assets, lastTickSymbol, tickDirection }: MarketTableProps) {
  const [activeCategory, setActiveCategory] = useState<AssetCategory | "All">("All");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredAssets = useMemo(() => {
    return assets.filter((asset) => {
      const matchesCategory = activeCategory === "All" || asset.category === activeCategory;
      const matchesSearch = 
        asset.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
        asset.symbol.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [assets, activeCategory, searchQuery]);

  return (
    <div className="card-premium overflow-hidden">
      {/* Category Tabs and Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            onClick={() => setActiveCategory("All")}
            className={cn(
              "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all",
              activeCategory === "All" 
                ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                : "text-slate-500 hover:bg-slate-200"
            )}
          >
            All
          </button>
          {MARKET_CATEGORIES.map((category) => (
            <button
              key={category}
              onClick={() => setActiveCategory(category)}
              className={cn(
                "px-4 py-2 rounded-lg text-xs font-bold uppercase tracking-wider transition-all whitespace-nowrap",
                activeCategory === category 
                  ? "bg-emerald-600 text-white shadow-md shadow-emerald-600/20" 
                  : "text-slate-500 hover:bg-slate-200"
              )}
            >
              {category}
            </button>
          ))}
        </div>

        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-emerald-500 transition-colors" size={14} />
          <input
            type="text"
            placeholder="Search markets..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full sm:w-64 pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-lg text-sm outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500/20 transition-all shadow-sm"
          />
        </div>
      </div>

      {/* Asset Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50/50 text-slate-400 uppercase text-[10px] font-bold tracking-widest border-b border-slate-100">
              <th className="px-6 py-4 font-bold">Asset Name</th>
              <th className="px-6 py-4 font-bold text-right">Last Price</th>
              <th className="px-6 py-4 font-bold text-right">24h Change</th>
              <th className="px-6 py-4 font-bold text-right hidden md:table-cell">24h Volume</th>
              <th className="px-6 py-4 font-bold text-right hidden lg:table-cell">Market Cap</th>
              <th className="px-6 py-4 font-bold text-center">Trend (7d)</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {filteredAssets.map((asset) => {
              const isTicking = lastTickSymbol === asset.symbol;
              const isPositive = asset.change24h >= 0;

              return (
                <tr 
                  key={asset.id} 
                  className="group hover:bg-emerald-50/30 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center font-bold text-slate-600 border border-slate-200 group-hover:border-emerald-200 group-hover:bg-white transition-all">
                        {asset.symbol.slice(0, 2)}
                      </div>
                      <div>
                        <p className="font-bold text-slate-900 group-hover:text-emerald-700 transition-colors">{asset.name}</p>
                        <p className="text-xs text-slate-500 uppercase tracking-wider">{asset.symbol}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn(
                      "font-bold tabular-nums transition-all px-2 py-1 rounded-md inline-block",
                      isTicking 
                        ? tickDirection === "up" 
                          ? "price-tick-up text-white" 
                          : "price-tick-down text-white"
                        : "text-slate-900"
                    )}>
                      ${asset.price.toLocaleString(undefined, { minimumFractionDigits: asset.category === "Forex" ? 4 : 2 })}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className={cn(
                      "inline-flex items-center gap-1 text-sm font-bold",
                      isPositive ? "text-emerald-600" : "text-red-500"
                    )}>
                      {isPositive ? <TrendingUp size={12} /> : <TrendingDown size={12} />}
                      {asset.change24h}%
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-600 hidden md:table-cell">
                    {asset.volume24h}
                  </td>
                  <td className="px-6 py-4 text-right text-sm font-medium text-slate-600 hidden lg:table-cell">
                    {asset.marketCap}
                  </td>
                  <td className="px-6 py-4 flex justify-center">
                    <Sparkline data={asset.history} isPositive={isPositive} />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredAssets.length === 0 && (
          <div className="p-12 flex flex-col items-center justify-center text-slate-400 bg-slate-50/50">
            <Search size={48} className="mb-4 opacity-20" />
            <p className="font-medium">No assets found matching your criteria</p>
            <button 
              onClick={() => { setSearchQuery(""); setActiveCategory("All"); }}
              className="mt-4 text-emerald-600 font-bold hover:underline"
            >
              Reset all filters
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
