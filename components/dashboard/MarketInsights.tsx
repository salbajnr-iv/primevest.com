"use client"

import { ChevronDown, TrendingUp, Newspaper } from "lucide-react";
import { useState } from "react";
import MetricsBarChart from "@/components/dashboard/analytics/MetricsBarChart";
import DataTable from "@/components/dashboard/analytics/DataTable";
import { Button } from "@/components/ui/button";
import { DashboardWidgetContract, type DashboardData, DashboardDateRange } from "@/lib/dashboard/types";

interface MarketInsightsProps {
  range: DashboardDateRange;
  dashboardData: DashboardData;
  widgetContract: DashboardWidgetContract;
  freshness: any;
  activeDateInterval: { label: string };
  tableState: any;
  onRetryTable: () => void;
}

function formatLastUpdated(isoTimestamp: string): string {
  return `Last updated ${new Date(isoTimestamp).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}`;
}

function parsePercentLabel(value: string): number {
  const normalized = value.replace("%", "").replace(",", "").trim();
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function MarketInsights({ 
  range, 
  dashboardData, 
  widgetContract, 
  freshness, 
  activeDateInterval, 
  tableState, 
  onRetryTable 
}: MarketInsightsProps) {
  const [isOpen, setIsOpen] = useState(true);

  return (
    <div className="xl:col-span-3">
      <div className={`dashboard-panel p-6 transition-all duration-200 overflow-hidden ${isOpen ? 'max-h-none' : 'max-h-0'} `}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-emerald-600" />
              <h2 className="text-xl font-bold text-slate-900">Market Insights</h2>
            </div>
            <span className="text-xs text-slate-500">({range})</span>
          </div>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 w-8 p-0"
            onClick={() => setIsOpen(!isOpen)}
          >
            <ChevronDown className={`h-4 w-4 transition-transform ${isOpen ? "rotate-180" : ""}`} />
          </Button>
        </div>

        <div className={`space-y-6 ${isOpen ? '' : 'hidden'}`}>
          {/* Top Movers */}
          <div>
            <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              Top Movers
            </h3>
            {dashboardData.topPairs.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
                {[...dashboardData.topPairs]
                  .sort((a, b) => parsePercentLabel(b.pnl) - parsePercentLabel(a.pnl))
                  .slice(0, 4)
                  .map((pair, i) => (
                    <div key={pair.pair || i} className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border hover:bg-slate-100 transition-colors">
                      <span className="text-sm font-medium text-slate-900 truncate">{pair.pair}</span>
                      <span className={`text-sm font-semibold px-2 py-1 rounded-full ${
                        parsePercentLabel(pair.pnl) >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        {pair.pnl}
                      </span>
                    </div>
                  ))}
              </div>
            ) : (
              <div className="h-20 bg-gradient-to-r from-slate-50 to-slate-100 rounded-xl flex items-center justify-center text-sm text-slate-500 border-dashed border-slate-200">
                Add watchlist assets to see top movers
              </div>
            )}
          </div>

          {/* Trends Chart */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <TrendingUp className="h-4 w-4 text-emerald-600" />
              <h4 className="font-semibold text-slate-900">{widgetContract.metricsBarChart.title}</h4>
            </div>
            <MetricsBarChart {...widgetContract.metricsBarChart} />
          </div>

          {/* Top Markets Table */}
          <div>
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-blue-600" />
                <h4 className="font-semibold text-slate-900">{widgetContract.topMarketsTable.title}</h4>
              </div>
              <span className="text-xs text-slate-500">{activeDateInterval.label}</span>
            </div>
            <DataTable {...widgetContract.topMarketsTable} />
          </div>

          <div className="pt-4 border-t border-slate-200">
            <p className="text-sm font-bold text-slate-900 bg-emerald-50 border border-emerald-200 px-3 py-2 rounded-lg inline-flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
              {formatLastUpdated(freshness.aggregatesUpdatedAt)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
