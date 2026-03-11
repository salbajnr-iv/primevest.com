"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function AnalysisPage() {
  const [activeTab, setActiveTab] = useState("technical");

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
      title: "Technical Analysis",
      desc: "Advanced charting tools with 100+ indicators and drawing tools for precise market analysis",
      icon: "📊"
    },
    {
      title: "Fundamental Analysis",
      desc: "Comprehensive financial data, earnings reports, and economic indicators",
      icon: "📈"
    },
    {
      title: "Sentiment Analysis",
      desc: "Market sentiment indicators and social trading insights from our community",
      icon: "👥"
    },
    {
      title: "AI-Powered Insights",
      desc: "Machine learning algorithms providing predictive market analysis and signals",
      icon: "🤖"
    }
  ];

  const technicalIndicators = [
    { name: "Moving Averages", description: "Simple and exponential moving averages for trend identification" },
    { name: "RSI", description: "Relative Strength Index for momentum and overbought/oversold conditions" },
    { name: "MACD", description: "Moving Average Convergence Divergence for trend changes" },
    { name: "Bollinger Bands", description: "Volatility bands for price range analysis" },
    { name: "Fibonacci Retracement", description: "Support and resistance levels based on Fibonacci ratios" },
    { name: "Ichimoku Cloud", description: "Comprehensive indicator showing support, resistance, and momentum" }
  ];

  const marketAnalysis = [
    {
      asset: "BTC/USD",
      price: "$43,250.00",
      change: "+2.45%",
      trend: "bullish",
      support: "$42,100",
      resistance: "$44,500",
      rsi: "62.5",
      macd: "Bullish crossover"
    },
    {
      asset: "EUR/USD",
      price: "1.0845",
      change: "-0.15%",
      trend: "neutral",
      support: "1.0780",
      resistance: "1.0920",
      rsi: "48.2",
      macd: "Neutral"
    },
    {
      asset: "Gold",
      price: "$2,345.67",
      change: "+1.23%",
      trend: "bullish",
      support: "$2,310",
      resistance: "$2,380",
      rsi: "58.7",
      macd: "Bullish"
    }
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
                  Market Analysis
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  Professional-grade analysis tools to help you make informed trading decisions. Access technical indicators, fundamental data, and AI-powered insights all in one place.
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
                  Start Trading
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
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">100+ Indicators</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">AI-Powered</span>
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
                    <div className="text-center mb-4">
                      <h3 className="font-bold text-gray-900">BTC/USD Analysis</h3>
                      <p className="text-sm text-gray-600">Technical Overview</p>
                    </div>
                    
                    <div className="flex-1">
                      {/* Simulated chart area */}
                      <div className="h-40 bg-gradient-to-br from-emerald-50 to-transparent rounded-lg mb-4 relative overflow-hidden">
                        <div className="absolute inset-0">
                          <svg viewBox="0 0 200 100" className="w-full h-full">
                            <path 
                              d="M 0 70 Q 25 60 50 65 T 100 55 T 150 45 T 200 50" 
                              stroke="#10b981" 
                              strokeWidth="2" 
                              fill="none"
                            />
                            <path 
                              d="M 0 70 Q 25 60 50 65 T 100 55 T 150 45 T 200 50 L 200 100 L 0 100 Z" 
                              fill="rgba(16, 185, 129, 0.1)"
                            />
                          </svg>
                        </div>
                        <div className="absolute top-2 left-2 bg-emerald-500 text-white text-xs px-2 py-1 rounded">
                          $43,250
                        </div>
                      </div>
                      
                      {/* Analysis indicators */}
                      <div className="space-y-3">
                        <div className="flex justify-between items-center p-2 bg-green-50 rounded">
                          <span className="text-sm font-medium text-green-800">RSI (14)</span>
                          <span className="text-sm font-bold text-green-700">62.5</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-yellow-50 rounded">
                          <span className="text-sm font-medium text-yellow-800">MACD</span>
                          <span className="text-sm font-bold text-yellow-700">Bullish</span>
                        </div>
                        <div className="flex justify-between items-center p-2 bg-blue-50 rounded">
                          <span className="text-sm font-medium text-blue-800">Support</span>
                          <span className="text-sm font-bold text-blue-700">$42,100</span>
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
              Comprehensive Analysis Tools
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Professional-grade analysis capabilities for all types of traders
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

      {/* Analysis Tabs Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Detailed Market Analysis
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              In-depth analysis tools and market insights
            </p>
          </motion.div>

          {/* Tabs */}
          <div className="flex flex-wrap gap-2 mb-12 justify-center">
            {["technical", "fundamental", "sentiment"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 capitalize ${
                  activeTab === tab
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:shadow-md"
                }`}
              >
                {tab} Analysis
              </button>
            ))}
          </div>

          {/* Tab Content */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8">
            {activeTab === "technical" && (
              <div className="space-y-8">
                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Technical Indicators</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {technicalIndicators.map((indicator, index) => (
                      <motion.div
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ scale: 1.02 }}
                        className="bg-gray-50 rounded-xl p-6 border border-gray-200 hover:border-emerald-300 transition-all duration-300"
                      >
                        <h4 className="font-bold text-gray-900 mb-2">{indicator.name}</h4>
                        <p className="text-gray-600 text-sm">{indicator.description}</p>
                      </motion.div>
                    ))}
                  </div>
                </div>

                <div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-6">Current Market Analysis</h3>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Asset</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Price</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Change</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Trend</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Support</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Resistance</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">RSI</th>
                          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">MACD</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {marketAnalysis.map((analysis, index) => (
                          <tr key={index} className="hover:bg-gray-50 transition-colors">
                            <td className="px-6 py-4 font-medium text-gray-900">{analysis.asset}</td>
                            <td className="px-6 py-4 text-gray-900">{analysis.price}</td>
                            <td className={`px-6 py-4 font-medium ${
                              analysis.change.startsWith('+') ? 'text-green-600' : 'text-red-600'
                            }`}>
                              {analysis.change}
                            </td>
                            <td className="px-6 py-4">
                              <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                                analysis.trend === 'bullish' ? 'bg-green-100 text-green-800' :
                                analysis.trend === 'bearish' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {analysis.trend}
                              </span>
                            </td>
                            <td className="px-6 py-4 text-gray-600">{analysis.support}</td>
                            <td className="px-6 py-4 text-gray-600">{analysis.resistance}</td>
                            <td className="px-6 py-4 font-medium text-gray-900">{analysis.rsi}</td>
                            <td className="px-6 py-4">
                              <span className={`font-medium ${
                                analysis.macd.includes('Bullish') ? 'text-green-600' : 
                                analysis.macd.includes('Bearish') ? 'text-red-600' : 'text-yellow-600'
                              }`}>
                                {analysis.macd}
                              </span>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            )}

            {activeTab === "fundamental" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">📈</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Fundamental Analysis</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Access comprehensive financial data, earnings reports, economic indicators, 
                  and company fundamentals to make informed investment decisions. 
                  Our fundamental analysis tools provide deep insights into market drivers.
                </p>
              </div>
            )}

            {activeTab === "sentiment" && (
              <div className="text-center py-12">
                <div className="text-6xl mb-4">👥</div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Sentiment Analysis</h3>
                <p className="text-gray-600 max-w-2xl mx-auto">
                  Understand market sentiment through social trading insights, 
                  community opinions, and behavioral analysis. 
                  See what other traders are thinking and positioning.
                </p>
              </div>
            )}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Access Full Analysis Tools
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
            Make Smarter Trading Decisions
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Access professional-grade analysis tools and market insights to enhance your trading strategy. 
            From technical indicators to AI-powered predictions, we provide everything you need to succeed.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Start Trading
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