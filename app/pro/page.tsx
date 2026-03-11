"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, getCoinColor } from "@/hooks/usePriceSimulation";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { TrendingUp, TrendingDown, Star, Zap, Shield, BarChart3, ArrowUpRight, ArrowDownRight } from "lucide-react";

const tradingPairs: MarketData[] = [
  { id: "btc-eur", name: "Bitcoin", symbol: "BTC/EUR", price: 43250.00, change24h: 2.45, marketCap: 0, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth-eur", name: "Ethereum", symbol: "ETH/EUR", price: 2280.50, change24h: 1.82, marketCap: 0, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb-eur", name: "Binance Coin", symbol: "BNB/EUR", price: 312.40, change24h: -0.54, marketCap: 0, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol-eur", name: "Solana", symbol: "SOL/EUR", price: 98.75, change24h: 4.21, marketCap: 0, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp-eur", name: "Ripple", symbol: "XRP/EUR", price: 0.62, change24h: 0.89, marketCap: 0, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
];

const orderTypes = [
  { id: "limit", name: "Limit", description: "Set your desired price" },
  { id: "market", name: "Market", description: "Instant execution at best price" },
  { id: "stop-loss", name: "Stop Loss", description: "Auto-exit when price drops" },
  { id: "take-profit", name: "Take Profit", description: "Auto-exit when target reached" },
];

const features = [
  { icon: "📊", title: "Advanced Charts", description: "Professional tradingview charts with indicators" },
  { icon: "⚡", title: "Fast Execution", description: "Sub-millisecond order execution" },
  { icon: "📉", title: "Short Selling", description: "Profit from falling prices" },
  { icon: "🔒", title: "Stop Loss & Take Profit", description: "Automated risk management" },
];

export default function ProTradingPage() {
  const { data: marketData } = usePriceSimulation(tradingPairs, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedPair, setSelectedPair] = React.useState<MarketData | null>(null);
  const [orderType, setOrderType] = React.useState("limit");
  const [orderSide, setOrderSide] = React.useState<"buy" | "sell">("buy");
  const [price, setPrice] = React.useState("");
  const [amount, setAmount] = React.useState("");
  const [watchlist, setWatchlist] = React.useState<string[]>([]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (selectedPair) {
      setPrice(selectedPair.price.toString());
    }
  }, [selectedPair]);

  const fadeInUp = {
    initial: { opacity: 0, y: 30 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const staggerContainer = {
    animate: {
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const toggleWatchlist = (pairId: string) => {
    setWatchlist(prev => 
      prev.includes(pairId) 
        ? prev.filter(id => id !== pairId)
        : [...prev, pairId]
    );
  };

  if (!isClient) return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 flex items-center justify-center">
      <div className="text-center">
        <div className="w-12 h-12 border-4 border-emerald-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
        <p className="text-gray-600">Loading Pro Trading...</p>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 text-gray-900 overflow-hidden">
      {/* Header */}
      <motion.header 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6 }}
        className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-200 shadow-sm"
      >
        <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.2 }}
            className="flex items-center"
          >
            <Link href="/" className="flex items-center group">
              <svg className="w-6 h-6 mr-3 text-gray-600 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-500 mr-3">NEW</span>
              <h1 className="text-xl font-bold text-gray-900">Pro Trading</h1>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <Button 
              onClick={() => window.location.href = "/dashboard/trade"}
              className="hidden sm:block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Launch Trading Desk
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-600 via-blue-600 to-purple-600 border-b border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-white/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-white/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-6xl mx-auto relative z-10">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <div className="inline-flex items-center bg-white/20 backdrop-blur-sm rounded-full px-4 py-2 mb-6">
              <span className="bg-white text-emerald-600 text-xs font-bold px-2 py-1 rounded-full mr-2">NEW</span>
              <span className="text-white font-medium">Advanced Trading Platform</span>
            </div>
            
            <h1 className="text-5xl md:text-6xl font-bold text-white leading-tight mb-6">
              Pro Trading
            </h1>
            <p className="text-xl text-emerald-100 max-w-3xl mx-auto mb-8">
              Professional-grade trading with advanced features, lightning-fast execution, and institutional liquidity
            </p>
            
            <div className="flex flex-col sm:flex-row gap-6 justify-center mb-12">
              <Button 
                onClick={() => window.location.href = "/dashboard/trade"}
                className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Trading Pro
              </Button>
              <Button 
                onClick={() => setSelectedPair(marketData[0])}
                className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold"
              >
                View Markets
              </Button>
            </div>
            
            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-8 max-w-2xl mx-auto">
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0.02%</div>
                <div className="text-emerald-200">Maker Fee</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">0.05%</div>
                <div className="text-emerald-200">Taker Fee</div>
              </motion.div>
              <motion.div variants={fadeInUp} className="text-center">
                <div className="text-3xl font-bold text-white mb-2">300+</div>
                <div className="text-emerald-200">Trading Pairs</div>
              </motion.div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-16 px-4 md:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Professional Trading Features</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Everything you need for sophisticated trading strategies
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {features.map((feature, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * index }}
                className="bg-gradient-to-br from-gray-50 to-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-14 h-14 bg-emerald-100 rounded-xl flex items-center justify-center mb-4">
                  <span className="text-2xl">{feature.icon}</span>
                </div>
                <h3 className="text-lg font-bold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600 text-sm">{feature.description}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trading Pairs Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Live Markets</h2>
            <p className="text-lg text-gray-600">Real-time prices and market data</p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {marketData.map((pair) => (
              <motion.div
                key={pair.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * marketData.indexOf(pair) }}
                onClick={() => setSelectedPair(pair)}
                className="bg-white rounded-2xl p-6 border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-4">
                    <div 
                      className="w-12 h-12 rounded-xl flex items-center justify-center"
                      style={{ background: getCoinColor(pair.symbol.split("/")[0]) }}
                    >
                      <span className="text-white font-bold text-sm">
                        {pair.symbol.split("/")[0].slice(0, 2)}
                      </span>
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900">{pair.name}</h3>
                      <p className="text-sm text-gray-500">{pair.symbol}</p>
                    </div>
                  </div>
                  
                  <Button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleWatchlist(pair.id);
                    }}
                    variant="ghost"
                    size="sm"
                    className="p-2"
                  >
                    <Star 
                      className={`w-5 h-5 ${
                        watchlist.includes(pair.id) 
                          ? 'fill-emerald-600 text-emerald-600' 
                          : 'text-gray-400'
                      }`} 
                    />
                  </Button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-2xl font-bold text-gray-900">
                      €{formatPrice(pair.price, pair.symbol)}
                    </div>
                    <div className={`flex items-center gap-1 text-sm font-medium ${
                      pair.change24h >= 0 ? 'text-emerald-600' : 'text-red-600'
                    }`}>
                      {pair.change24h >= 0 ? (
                        <ArrowUpRight className="w-4 h-4" />
                      ) : (
                        <ArrowDownRight className="w-4 h-4" />
                      )}
                      {pair.change24h >= 0 ? '+' : ''}{pair.change24h.toFixed(2)}%
                    </div>
                  </div>
                  
                  <div className="text-right">
                    <div className="text-xs text-gray-500 mb-1">24h Volume</div>
                    <div className="text-sm font-semibold text-gray-900">
                      €{(pair.volume24h / 1000000).toFixed(1)}M
                    </div>
                  </div>
                </div>
                
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>High: €{formatPrice(pair.high24h, pair.symbol)}</span>
                    <span>Low: €{formatPrice(pair.low24h, pair.symbol)}</span>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Order Types Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-16 px-4 md:px-8 bg-white"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Advanced Order Types</h2>
            <p className="text-lg text-gray-600">Execute sophisticated trading strategies</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {orderTypes.map((type) => (
              <motion.div
                key={type.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * orderTypes.indexOf(type) }}
                onClick={() => setOrderType(type.id)}
                className={`bg-gradient-to-br rounded-2xl p-6 border-2 shadow-lg hover:shadow-2xl transition-all duration-300 cursor-pointer ${
                  orderType === type.id
                    ? 'from-emerald-50 to-emerald-100 border-emerald-300'
                    : 'from-gray-50 to-white border-gray-200 hover:border-emerald-200'
                }`}
              >
                <div className="text-center">
                  <h3 className="text-lg font-bold text-gray-900 mb-2">{type.name}</h3>
                  <p className="text-sm text-gray-600">{type.description}</p>
                  {orderType === type.id && (
                    <div className="mt-4">
                      <div className="w-8 h-1 bg-emerald-600 rounded-full mx-auto"></div>
                    </div>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-20 px-4 md:px-8 bg-gradient-to-r from-emerald-600 to-blue-600"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            variants={fadeInUp}
            className="text-4xl md:text-5xl font-bold text-white mb-6"
          >
            Ready to Trade Like a Pro?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Experience institutional-grade trading with advanced features, lightning-fast execution, and competitive fees.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={() => window.location.href = "/dashboard/trade"}
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
            >
              Launch Pro Trading
            </Button>
            <Button 
              onClick={() => window.location.href = "/fees"}
              className="border-2 border-white text-white hover:bg-white/10 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300"
            >
              View Trading Fees
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {selectedPair && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setSelectedPair(null)}>
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.2 }}
            className="bg-white rounded-2xl shadow-2xl max-w-md w-full" 
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div 
                    className="w-12 h-12 rounded-xl flex items-center justify-center"
                    style={{ background: getCoinColor(selectedPair.symbol.split("/")[0]) }}
                  >
                    <span className="text-white font-bold">
                      {selectedPair.symbol.split("/")[0].slice(0, 2)}
                    </span>
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900">{selectedPair.name}</h3>
                    <p className="text-sm text-gray-500">{selectedPair.symbol}</p>
                  </div>
                </div>
                <Button
                  onClick={() => setSelectedPair(null)}
                  variant="ghost"
                  size="sm"
                  className="p-2"
                >
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </Button>
              </div>
            </div>
            
            <div className="p-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-gray-900 mb-2">
                  €{formatPrice(selectedPair.price, selectedPair.symbol)}
                </div>
                <div className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium ${
                  selectedPair.change24h >= 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                }`}>
                  {selectedPair.change24h >= 0 ? (
                    <ArrowUpRight className="w-4 h-4" />
                  ) : (
                    <ArrowDownRight className="w-4 h-4" />
                  )}
                  {selectedPair.change24h >= 0 ? '+' : ''}{selectedPair.change24h.toFixed(2)}% (24h)
                </div>
              </div>
              
              <div className="flex gap-2 mb-6">
                <Button 
                  onClick={() => setOrderSide("buy")}
                  className={`flex-1 py-3 font-semibold transition-colors ${
                    orderSide === "buy" 
                      ? "bg-emerald-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Buy
                </Button>
                <Button 
                  onClick={() => setOrderSide("sell")}
                  className={`flex-1 py-3 font-semibold transition-colors ${
                    orderSide === "sell" 
                      ? "bg-red-600 text-white" 
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                  }`}
                >
                  Sell
                </Button>
              </div>
              
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Price (EUR)</label>
                  <input 
                    type="number" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">Amount</label>
                  <input 
                    type="number" 
                    value={amount} 
                    onChange={(e) => setAmount(e.target.value)} 
                    placeholder="0.00" 
                    className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              </div>
              
              <Link 
                href="/dashboard/trade" 
                className={`block w-full mt-6 py-3 text-center rounded-lg font-semibold transition-colors ${
                  orderSide === "buy" 
                    ? "bg-emerald-600 hover:bg-emerald-700 text-white" 
                    : "bg-red-600 hover:bg-red-700 text-white"
                }`}
              >
                {orderSide === "buy" ? "Buy" : "Sell"} {selectedPair.symbol.split("/")[0]}
              </Link>
            </div>
          </motion.div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
