"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface MockTrade {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  amount: number;
  price: number;
  status: "open" | "closed";
  time: string;
}

const mockPortfolio = [
  { symbol: "BTC", name: "Bitcoin", holdings: 0.5, value: 21625.0, change: 2.45 },
  { symbol: "ETH", name: "Ethereum", holdings: 5.0, value: 11402.5, change: 1.82 },
  { symbol: "SOL", name: "Solana", holdings: 50.0, value: 4937.5, change: 4.21 },
];

const mockTrades: MockTrade[] = [
  {
    id: "1",
    symbol: "BTC",
    type: "buy",
    amount: 0.5,
    price: 43250,
    status: "closed",
    time: "Today 14:32",
  },
  {
    id: "2",
    symbol: "ETH",
    type: "buy",
    amount: 5.0,
    price: 2280.5,
    status: "open",
    time: "Today 11:15",
  },
  {
    id: "3",
    symbol: "SOL",
    type: "sell",
    amount: 25.0,
    price: 98.75,
    status: "closed",
    time: "Yesterday 09:42",
  },
];

type TabType = "portfolio" | "trade" | "analysis";

export default function DemoPage() {
  const [activeTab, setActiveTab] = React.useState<TabType>("portfolio");
  const [selectedCoin, setSelectedCoin] = React.useState<string | null>(null);
  const totalPortfolioValue = mockPortfolio.reduce((sum, asset) => sum + asset.value, 0);
  const totalChange = mockPortfolio.reduce(
    (sum, asset) => sum + (asset.value * asset.change) / 100,
    0
  );

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <div className="flex items-center justify-between mb-4">
            <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-400 transition">
              <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
                <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
              <span className="font-bold text-xl">PrimeVest</span>
            </Link>
            <div className="flex items-center gap-4">
              <div className="text-right hidden sm:block">
                <p className="text-emerald-400 font-bold text-lg">Demo Account</p>
                <p className="text-gray-400 text-sm">Practice Trading</p>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="flex gap-4 border-b border-slate-600">
            {["portfolio", "trade", "analysis"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab as TabType)}
                className={`pb-4 px-4 font-semibold transition-colors ${
                  activeTab === tab
                    ? "text-emerald-400 border-b-2 border-emerald-400"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Portfolio Tab */}
        {activeTab === "portfolio" && (
          <div className="space-y-6">
            {/* Portfolio Summary */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <p className="text-gray-400 text-sm mb-2">Portfolio Value</p>
              <h2 className="text-4xl font-bold text-white mb-2">${totalPortfolioValue.toFixed(2)}</h2>
              <p className={`text-lg font-semibold ${totalChange >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                {totalChange >= 0 ? "+" : ""}{totalChange.toFixed(2)} USD
                {" "}
                <span className="text-sm font-normal text-gray-400">
                  ({((totalChange / (totalPortfolioValue - totalChange)) * 100).toFixed(2)}%)
                </span>
              </p>
            </div>

            {/* Assets */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="grid grid-cols-1 gap-4 p-6">
                {mockPortfolio.map((asset) => (
                  <div
                    key={asset.symbol}
                    onClick={() => setSelectedCoin(asset.symbol)}
                    className={`bg-slate-700/50 border border-slate-600 rounded-lg p-4 cursor-pointer hover:border-emerald-500 transition ${
                      selectedCoin === asset.symbol ? "border-emerald-500 bg-emerald-500/10" : ""
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-bold text-white">{asset.name}</p>
                        <p className="text-sm text-gray-400">{asset.holdings} {asset.symbol}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-white">${asset.value.toFixed(2)}</p>
                        <p className={`text-sm font-semibold ${asset.change >= 0 ? "text-emerald-400" : "text-red-400"}`}>
                          {asset.change >= 0 ? "+" : ""}{asset.change}%
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Trade Tab */}
        {activeTab === "trade" && (
          <div className="space-y-6">
            {/* Trade Form */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <h3 className="text-xl font-bold text-white mb-4">Demo Trade</h3>
                <form className="space-y-4">
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Asset</label>
                    <select className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500">
                      <option>Bitcoin (BTC)</option>
                      <option>Ethereum (ETH)</option>
                      <option>Solana (SOL)</option>
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Type</label>
                    <div className="flex gap-4">
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" value="buy" defaultChecked className="w-4 h-4" />
                        <span className="text-white">Buy</span>
                      </label>
                      <label className="flex items-center gap-2 cursor-pointer">
                        <input type="radio" name="type" value="sell" className="w-4 h-4" />
                        <span className="text-white">Sell</span>
                      </label>
                    </div>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-400 block mb-2">Amount</label>
                    <input
                      type="number"
                      placeholder="0.00"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                  <Button className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-2 rounded-lg font-semibold">
                    Execute Demo Trade
                  </Button>
                </form>
              </div>

              {/* Info Box */}
              <div className="bg-cyan-600/20 border border-cyan-500/30 rounded-lg p-6">
                <h4 className="text-lg font-bold text-cyan-400 mb-3">💡 Demo Trading Info</h4>
                <ul className="space-y-2 text-sm text-gray-300">
                  <li>• This is a practice account with imaginary funds</li>
                  <li>• All trades are simulated with real market data</li>
                  <li>• No real money is involved</li>
                  <li>• Perfect for learning and strategy testing</li>
                  <li>• Ready to start real trading? Open a live account</li>
                </ul>
              </div>
            </div>

            {/* Trade History */}
            <div className="bg-slate-800 border border-slate-700 rounded-lg overflow-hidden">
              <div className="bg-slate-700/50 px-6 py-4 border-b border-slate-600">
                <h4 className="font-bold text-white">Recent Demo Trades</h4>
              </div>
              <div className="divide-y divide-slate-600">
                {mockTrades.map((trade) => (
                  <div key={trade.id} className="px-6 py-4 hover:bg-slate-700/30 transition">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                          trade.type === "buy" ? "bg-emerald-500/20 text-emerald-400" : "bg-red-500/20 text-red-400"
                        }`}>
                          {trade.type === "buy" ? "📈" : "📉"}
                        </div>
                        <div>
                          <p className="font-semibold text-white">{trade.symbol} {trade.type === "buy" ? "Buy" : "Sell"}</p>
                          <p className="text-sm text-gray-400">{trade.time}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold text-white">{trade.amount} {trade.symbol}</p>
                        <p className="text-sm text-gray-400">${(trade.amount * trade.price).toFixed(2)}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* Analysis Tab */}
        {activeTab === "analysis" && (
          <div className="space-y-6">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h3 className="text-xl font-bold text-white mb-4">Market Analysis</h3>
              <div className="bg-slate-700/50 rounded-lg p-8 text-center">
                <p className="text-gray-400 mb-4">Interactive charts and detailed market analysis</p>
                <div className="h-80 bg-slate-600/50 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">📊 Chart visualization area</p>
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">24h High</p>
                <p className="text-2xl font-bold text-white">$43,800</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">24h Low</p>
                <p className="text-2xl font-bold text-white">$42,100</p>
              </div>
              <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
                <p className="text-gray-400 text-sm mb-2">24h Volume</p>
                <p className="text-2xl font-bold text-white">$28.4B</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 py-12">
        <div className="bg-gradient-to-r from-emerald-600/20 to-blue-600/20 border border-emerald-500/30 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Ready to Start Real Trading?</h3>
          <p className="text-gray-300 mb-6">
            Open a live account and start trading with real capital. Join thousands of successful traders on PrimeVest.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg text-lg font-semibold">
              <Link href="/auth/signup">Open Live Account</Link>
            </Button>
            <Button asChild className="border-2 border-emerald-500 text-emerald-500 hover:bg-emerald-500 hover:text-white px-8 py-3 rounded-lg bg-transparent">
              <Link href="/">Back to Home</Link>
            </Button>
          </div>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
