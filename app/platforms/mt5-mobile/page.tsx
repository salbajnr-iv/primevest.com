"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function MT5MobilePage() {
  const handleAppStore = () => {
    window.open("https://apps.apple.com/app/metatrader-5", "_blank");
  };

  const handleGooglePlay = () => {
    window.open("https://play.google.com/store/apps/details?id=net.metaquotes.metatrader5", "_blank");
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
      title: "Enhanced Mobile Trading",
      desc: "Next-generation mobile trading with advanced features and improved performance",
      icon: "📱"
    },
    {
      title: "50+ Technical Indicators",
      desc: "Access all MT5 indicators and 21 timeframes for comprehensive market analysis",
      icon: "📊"
    },
    {
      title: "Economic Calendar",
      desc: "Built-in economic calendar with real-time updates and customizable alerts",
      icon: "📅"
    },
    {
      title: "Market Depth",
      desc: "View real-time Level II pricing and order book information on mobile",
      icon: "📈"
    },
    {
      title: "Hedge Positions",
      desc: "Full hedging capabilities and multiple positions per instrument on mobile",
      icon: "🔄"
    },
    {
      title: "Faster Execution",
      desc: "Optimized for speed with enhanced order execution performance on mobile",
      icon: "⚡"
    }
  ];

  const instruments = [
    { name: "Forex", count: "90+", type: "Currency pairs" },
    { name: "Cryptocurrencies", count: "20+", type: "Digital assets" },
    { name: "Stock Indices", count: "40+", type: "Global indices" },
    { name: "Commodities", count: "30+", type: "Energy, metals, agriculture" },
    { name: "Precious Metals", count: "10+", type: "Gold, silver, platinum" }
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
              onClick={handleAppStore} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Download MT5 Mobile
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
                  MT5 Mobile
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  The next-generation mobile trading platform with enhanced features, 
                  faster performance, and expanded market access. Trade 300+ instruments on the go.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-4 transition-professional"
              >
                <Button 
                  onClick={handleAppStore} 
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
                >
                  Download for iOS
                </Button>
                <Button 
                  onClick={handleGooglePlay} 
                  className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-4 text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-105 btn-premium"
                >
                  Download for Android
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
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">300+ Instruments</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Enhanced Features</span>
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
                    {/* Mobile phone frame */}
                    <div className="relative mx-auto w-48 h-80 bg-black rounded-3xl p-2">
                      <div className="w-full h-full bg-gray-800 rounded-2xl overflow-hidden relative">
                        {/* Status bar */}
                        <div className="absolute top-0 left-0 right-0 h-6 bg-black flex items-center justify-between px-4 text-white text-xs">
                          <span>9:41</span>
                          <div className="flex gap-1">
                            <span>📶</span>
                            <span>🔋</span>
                          </div>
                        </div>
                        
                        {/* MT5 Mobile Interface */}
                        <div className="pt-6 h-full flex flex-col">
                          {/* Header */}
                          <div className="px-3 py-2 bg-gray-900 flex items-center justify-between">
                            <div className="flex items-center gap-2">
                              <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                              <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            </div>
                            <span className="text-white text-xs">MT5</span>
                          </div>
                          
                          {/* Chart area with more data */}
                          <div className="flex-1 bg-gray-700 relative overflow-hidden">
                            <div className="absolute inset-0">
                              <svg viewBox="0 0 150 200" className="w-full h-full">
                                <path 
                                  d="M 0 130 Q 20 110 40 120 T 80 100 T 120 90 T 150 100" 
                                  stroke="#10b981" 
                                  strokeWidth="2" 
                                  fill="none"
                                />
                                <path 
                                  d="M 0 130 Q 20 110 40 120 T 80 100 T 120 90 T 150 100 L 150 200 L 0 200 Z" 
                                  fill="rgba(16, 185, 129, 0.2)"
                                />
                              </svg>
                            </div>
                            <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                              BTC/USD
                            </div>
                            <div className="absolute top-2 right-2 bg-gray-900 text-white text-xs px-2 py-1 rounded">
                              43,250
                            </div>
                            <div className="absolute bottom-2 left-2 right-2 flex justify-between text-xs text-gray-300">
                              <span>RSI: 62.5</span>
                              <span>MACD: Bullish</span>
                            </div>
                          </div>
                          
                          {/* Enhanced bottom controls */}
                          <div className="bg-gray-900 p-2">
                            <div className="grid grid-cols-3 gap-1">
                              <div className="bg-emerald-500 text-white text-center py-2 rounded text-xs font-semibold">Buy</div>
                              <div className="bg-gray-600 text-white text-center py-2 rounded text-xs font-semibold">Close</div>
                              <div className="bg-red-500 text-white text-center py-2 rounded text-xs font-semibold">Sell</div>
                            </div>
                          </div>
                        </div>
                      </div>
                      
                      {/* Home button indicator */}
                      <div className="absolute bottom-1 left-1/2 transform -translate-x-1/2 w-8 h-8 rounded-full border-2 border-white"></div>
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
              Next-Gen Mobile Features
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Advanced capabilities that make MT5 Mobile the ultimate trading companion
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

      {/* Instruments Section */}
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
              Trade 300+ Instruments
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Access global markets with our comprehensive range of mobile trading instruments
            </p>
          </motion.div>

          <div className="grid-responsive">
            {instruments.map((instrument, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="text-4xl font-bold text-emerald-600 mb-2">{instrument.count}</div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{instrument.name}</h3>
                    <p className="text-gray-600 capitalize">{instrument.type}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-16"
          >
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleAppStore} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
              >
                Download for iOS
              </Button>
              <Button 
                onClick={handleGooglePlay} 
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 btn-premium"
              >
                Download for Android
              </Button>
            </div>
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
            Upgrade Your Mobile Trading
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Experience the future of mobile trading with enhanced features, faster performance, 
            and expanded market access. Download MT5 Mobile today.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={handleAppStore} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Get on App Store
            </Button>
            <Button 
              onClick={handleGooglePlay} 
              className="border-2 border-white text-white hover:bg-white/10 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 btn-premium"
            >
              Get on Google Play
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}