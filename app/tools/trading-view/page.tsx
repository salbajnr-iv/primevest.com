"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function TradingViewPage() {
  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleWebTrader = () => {
    window.location.href = "/dashboard/trade";
  };

  // Animation variants
  const fadeInUp = {
    initial: { opacity: 0, y: 60 },
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

  const features = [
    {
      title: "Advanced Charting",
      desc: "Professional-grade charting tools with 100+ technical indicators and drawing tools",
      icon: "📊"
    },
    {
      title: "Real-Time Data",
      desc: "Access live market data with millisecond-level updates and zero latency",
      icon: "⏱️"
    },
    {
      title: "Multi-Asset Support",
      desc: "Trade forex, stocks, crypto, commodities, and indices all in one interface",
      icon: "💱"
    },
    {
      title: "Customizable Layouts",
      desc: "Create personalized workspace layouts with multiple chart arrangements",
      icon: "🎨"
    },
    {
      title: "Trading Signals",
      desc: "AI-powered trading signals and pattern recognition for better decision making",
      icon: "🤖"
    },
    {
      title: "Social Trading",
      desc: "Connect with other traders, share strategies, and follow expert traders",
      icon: "👥"
    }
  ];

  const chartTypes = [
    { name: "Candlesticks", description: "Traditional Japanese candlestick charts for price action analysis" },
    { name: "Line Charts", description: "Simple line charts showing price trends over time" },
    { name: "Bar Charts", description: "OHLC bar charts displaying open, high, low, and close prices" },
    { name: "Area Charts", description: "Filled area charts for visualizing price movements" },
    { name: "Renko Charts", description: "Brick-based charts focusing on price movements rather than time" },
    { name: "Kagi Charts", description: "Trend-based charts that ignore time and focus on price reversals" }
  ];

  const timeframes = [
    { name: "1 Minute", abbreviation: "1m" },
    { name: "5 Minutes", abbreviation: "5m" },
    { name: "15 Minutes", abbreviation: "15m" },
    { name: "30 Minutes", abbreviation: "30m" },
    { name: "1 Hour", abbreviation: "1h" },
    { name: "4 Hours", abbreviation: "4h" },
    { name: "1 Day", abbreviation: "1D" },
    { name: "1 Week", abbreviation: "1W" },
    { name: "1 Month", abbreviation: "1M" }
  ];

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
              <Image
                src="/primevest-logo.svg"
                alt="PrimeVest"
                width={140}
                height={35}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <Button 
              onClick={handleWebTrader}
              className="hidden sm:block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Web Trader
            </Button>
            <Button 
              onClick={handleBackToHome} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 overflow-hidden section-padding"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <motion.div 
              variants={fadeInUp}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-display font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 via-emerald-600 to-emerald-700 bg-clip-text text-transparent transition-professional"
                >
                  Trading View
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  Professional trading platform with advanced charting tools, real-time data, and powerful analytical capabilities. 
                  Everything you need for successful trading in one comprehensive interface.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-4 transition-professional"
              >
                <Button 
                  onClick={handleWebTrader} 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
                >
                  Launch Trading View
                </Button>
                <Button 
                  onClick={handleBackToHome} 
                  className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-4 text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-105 btn-premium"
                >
                  Back to Home
                </Button>
              </motion.div>

              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.7 }}
                className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-6"
              >
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Real-time Data</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">100+ Indicators</span>
                </div>
              </motion.div>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="hidden lg:flex justify-center"
            >
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                <div className="relative h-96 w-full bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-6 shadow-xl overflow-hidden group card-elevated">
                  <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl"></div>
                  
                  <div className="h-full flex flex-col">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="font-bold text-gray-900">BTC/USD - 1H Chart</h3>
                      <div className="flex gap-2">
                        <button className="px-2 py-1 bg-gray-200 rounded text-xs">1H</button>
                        <button className="px-2 py-1 bg-emerald-500 text-white rounded text-xs">4H</button>
                        <button className="px-2 py-1 bg-gray-200 rounded text-xs">1D</button>
                      </div>
                    </div>
                    
                    <div className="flex-1 relative">
                      {/* Simulated chart area */}
                      <div className="absolute inset-0 bg-gradient-to-br from-emerald-50/10 to-transparent rounded-xl"></div>
                      
                      {/* Simulated price chart */}
                      <div className="absolute bottom-0 left-0 right-0 h-3/4">
                        <svg viewBox="0 0 400 200" className="w-full h-full">
                          <defs>
                            <linearGradient id="tradingViewChart" x1="0%" y1="0%" x2="0%" y2="100%">
                              <stop offset="0%" stopColor="#10b981" stopOpacity="0.8" />
                              <stop offset="100%" stopColor="#10b981" stopOpacity="0.1" />
                            </linearGradient>
                          </defs>
                          <path 
                            d="M 0 150 Q 50 120 100 130 T 200 110 T 300 90 T 400 100" 
                            stroke="#10b981" 
                            strokeWidth="3" 
                            fill="none"
                          />
                          <path 
                            d="M 0 150 Q 50 120 100 130 T 200 110 T 300 90 T 400 100 L 400 200 L 0 200 Z" 
                            fill="url(#tradingViewChart)"
                          />
                          
                          {/* Technical indicators overlay */}
                          <line x1="100" y1="50" x2="100" y2="180" stroke="#f59e0b" strokeWidth="1" strokeDasharray="5,5" />
                          <line x1="250" y1="30" x2="250" y2="180" stroke="#ef4444" strokeWidth="1" strokeDasharray="5,5" />
                        </svg>
                      </div>
                      
                      {/* Chart controls */}
                      <div className="absolute top-4 left-4 right-4 flex justify-between">
                        <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 group-hover:bg-white/90 transition-colors duration-300 border border-gray-200">
                          <div className="text-xs text-gray-500">BTC/USD</div>
                          <div className="text-sm font-semibold text-gray-900">43,250.00</div>
                        </div>
                        <div className="bg-emerald-50/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-200 group-hover:bg-emerald-100/90 transition-colors duration-300">
                          <div className="text-xs text-emerald-600">24h Change</div>
                          <div className="text-sm font-semibold text-emerald-700">+2.45%</div>
                        </div>
                      </div>
                    </div>
                    
                    {/* Indicators panel */}
                    <div className="pt-4 border-t border-gray-200">
                      <div className="flex gap-3 overflow-x-auto pb-2">
                        <div className="flex-shrink-0 bg-blue-100 text-blue-800 px-3 py-1 rounded-full text-xs font-medium">
                          RSI: 62.5
                        </div>
                        <div className="flex-shrink-0 bg-green-100 text-green-800 px-3 py-1 rounded-full text-xs font-medium">
                          MACD: Bullish
                        </div>
                        <div className="flex-shrink-0 bg-yellow-100 text-yellow-800 px-3 py-1 rounded-full text-xs font-medium">
                          Vol: 2.4B
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Features Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Powerful Trading Features
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Professional-grade tools and features for serious traders
            </p>
          </motion.div>

          <div className="grid-responsive">
            {features.map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.1 * i }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                      <span className="text-3xl">{feature.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{feature.title}</h3>
                    <p className="text-gray-600">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Chart Types Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Multiple Chart Types
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Choose the chart type that best suits your trading style and analysis needs
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {chartTypes.map((chart, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-100 transition-colors duration-300">
                      <div className="text-3xl">📊</div>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{chart.name}</h3>
                    <p className="text-gray-600">{chart.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Timeframes */}
          <motion.div 
            variants={fadeInUp}
            className="mt-16 text-center"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-8">Available Timeframes</h3>
            <div className="flex flex-wrap justify-center gap-3">
              {timeframes.map((timeframe, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.05 }}
                  className="bg-white border border-gray-200 rounded-lg px-4 py-2 font-medium text-gray-700 hover:border-emerald-300 hover:text-emerald-600 transition-all duration-300 shadow-sm hover:shadow-md"
                >
                  {timeframe.abbreviation}
                </motion.div>
              ))}
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-16"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Launch Trading View
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-r from-emerald-500 to-emerald-600 section-padding"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Start Professional Trading
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Access our advanced Trading View platform with real-time data, powerful indicators, 
            and professional tools. Everything you need to make informed trading decisions.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Launch Platform
            </Button>
            <Button 
              onClick={handleBackToHome} 
              className="border-2 border-white text-white hover:bg-white/10 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 btn-premium"
            >
              Back to Home
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}