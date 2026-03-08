"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function MarketNewsPage() {
  const [selectedCategory, setSelectedCategory] = useState("all");

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
      title: "Real-Time Updates",
      desc: "Get breaking news and market updates as they happen with our live feed",
      icon: "⏱️"
    },
    {
      title: "Expert Analysis",
      desc: "Insights from industry experts and professional market analysts",
      icon: "👨‍💼"
    },
    {
      title: "Multi-Market Coverage",
      desc: "Comprehensive coverage of forex, stocks, crypto, and commodities markets",
      icon: "🌍"
    },
    {
      title: "Customizable Feeds",
      desc: "Personalize your news feed based on your preferred assets and markets",
      icon: "⚙️"
    }
  ];

  // Mock news articles
  const newsArticles = [
    {
      id: 1,
      title: "Federal Reserve Holds Rates Steady Amid Inflation Concerns",
      excerpt: "The Federal Reserve maintained its benchmark interest rate at current levels as policymakers weigh ongoing inflation pressures against economic growth signals.",
      category: "forex",
      time: "2 hours ago",
      image: "/btc-logo.png",
      source: "Financial Times",
      impact: "high"
    },
    {
      id: 2,
      title: "Bitcoin Surges Past $43,000 as Institutional Adoption Grows",
      excerpt: "Cryptocurrency markets rally as major financial institutions announce new Bitcoin investment products and custody services.",
      category: "crypto",
      time: "4 hours ago",
      image: "/eth-logo.png",
      source: "Bloomberg",
      impact: "high"
    },
    {
      id: 3,
      title: "Oil Prices Jump on Middle East Supply Concerns",
      excerpt: "Crude oil futures climb 3.2% following reports of potential supply disruptions in key Middle Eastern producing regions.",
      category: "commodities",
      time: "6 hours ago",
      image: "/bnb-logo.png",
      source: "Reuters",
      impact: "medium"
    },
    {
      id: 4,
      title: "Tech Stocks Rally on Strong Earnings Season Outlook",
      excerpt: "Nasdaq futures surge as major technology companies report better-than-expected quarterly results and optimistic guidance.",
      category: "stocks",
      time: "8 hours ago",
      image: "/sol-logo.png",
      source: "MarketWatch",
      impact: "medium"
    },
    {
      id: 5,
      title: "EUR/USD Consolidates Near 1.0850 Ahead of ECB Decision",
      excerpt: "The euro-dollar pair holds steady as traders await the European Central Bank's monetary policy announcement and economic projections.",
      category: "forex",
      time: "10 hours ago",
      image: "/xrp-logo.png",
      source: "CNBC",
      impact: "low"
    },
    {
      id: 6,
      title: "Gold Prices Edge Higher on Safe-Haven Demand",
      excerpt: "Precious metals gain ground as geopolitical tensions and market volatility drive investors toward traditional safe-haven assets.",
      category: "commodities",
      time: "12 hours ago",
      image: "/ada-logo.png",
      source: "Wall Street Journal",
      impact: "low"
    }
  ];

  const categories = [
    { id: "all", name: "All News", count: 234 },
    { id: "forex", name: "Forex", count: 89 },
    { id: "crypto", name: "Cryptocurrency", count: 67 },
    { id: "stocks", name: "Stocks", count: 45 },
    { id: "commodities", name: "Commodities", count: 33 }
  ];

  const filteredArticles = selectedCategory === "all" 
    ? newsArticles 
    : newsArticles.filter(article => article.category === selectedCategory);

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
                src="/bitpanda-logo.svg"
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
                  Market News
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  Stay informed with breaking financial news, market analysis, and expert insights. Never miss important developments that could impact your trading decisions.
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
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Live Updates</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Expert Analysis</span>
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
                      <h3 className="font-bold text-gray-900">Latest Headlines</h3>
                      <p className="text-sm text-gray-600">Breaking Market News</p>
                    </div>
                    
                    <div className="flex-1 space-y-4">
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <p className="text-xs text-red-700 font-medium">BREAKING</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">Fed Holds Rates Steady</p>
                        <p className="text-xs text-gray-600">Federal Reserve maintains current interest rate levels...</p>
                      </div>
                      
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <p className="text-xs text-green-700 font-medium">MARKET MOVER</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">Bitcoin Surges Past $43K</p>
                        <p className="text-xs text-gray-600">Cryptocurrency rallies on institutional adoption...</p>
                      </div>
                      
                      <div className="bg-blue-50 border-l-4 border-blue-500 p-3 rounded">
                        <p className="text-xs text-blue-700 font-medium">ANALYSIS</p>
                        <p className="text-sm font-medium text-gray-900 mt-1">Tech Earnings Outlook</p>
                        <p className="text-xs text-gray-600">Strong quarterly results drive Nasdaq higher...</p>
                      </div>
                    </div>
                    
                    <div className="pt-4 border-t border-gray-200">
                      <p className="text-xs text-gray-500 text-center">24/7 Market Coverage</p>
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
              Comprehensive Market Coverage
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Everything you need to stay informed about global markets and make better trading decisions
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

      {/* News Section */}
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
              Latest Market News
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Breaking news and analysis from global financial markets
            </p>
          </motion.div>

          {/* Category Filters */}
          <div className="flex flex-wrap gap-3 mb-12 justify-center">
            {categories.map((category) => (
              <button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-5 py-2.5 rounded-full text-sm font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-emerald-500 text-white shadow-lg"
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300 hover:shadow-md"
                }`}
              >
                {category.name} <span className="text-xs opacity-75">({category.count})</span>
              </button>
            ))}
          </div>

          {/* News Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {filteredArticles.map((article, index) => (
              <motion.div
                key={article.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * index }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  {/* Image placeholder */}
                  <div className="h-48 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                    <div className="absolute bottom-4 left-4">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                        {article.category}
                      </span>
                    </div>
                    <div className="absolute top-4 right-4">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${
                        article.impact === "high" ? "bg-red-100 text-red-800" :
                        article.impact === "medium" ? "bg-yellow-100 text-yellow-800" :
                        "bg-green-100 text-green-800"
                      }`}>
                        {article.impact}
                      </span>
                    </div>
                  </div>
                  
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                      {article.title}
                    </h3>
                    <p className="text-gray-600 mb-4 flex-1">{article.excerpt}</p>
                    <div className="flex items-center justify-between text-sm text-gray-500">
                      <span>{article.source}</span>
                      <span>{article.time}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              View More News
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
            Stay Ahead of the Market
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Get real-time market news, expert analysis, and breaking financial updates delivered directly to your dashboard. Make informed trading decisions with our comprehensive news coverage.
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