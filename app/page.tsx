<<<<<<< HEAD
"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function Home() {
  const router = useRouter();

  const handleStartTrading = () => {
    router.push("/auth/signin");
  };

  const handleTryDemo = () => {
    router.push("/demo");
  };

  const handleExploreAssets = () => {
    router.push("/markets");
  };

  const handleOpenAccount = () => {
    router.push("/auth/signup");
  };

  const handleContactUs = () => {
    router.push("/contact-us");
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

  const slideInFromLeft = {
    initial: { opacity: 0, x: -100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  const slideInFromRight = {
    initial: { opacity: 0, x: 100 },
    animate: { opacity: 1, x: 0 },
    transition: { duration: 0.6, ease: "easeOut" }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-50 to-gray-100 text-gray-900 overflow-hidden">
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
                alt="PrimeVest Financial Solutions, Inc."
                width={140}
                height={35}
                className="h-8 w-auto transition-transform duration-300 group-hover:scale-105"
              />
            </Link>
          </motion.div>

          <nav className="hidden md:flex items-center gap-6">
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.3 }}
              className="relative group"
            >
              <button className="text-gray-700 hover:text-emerald-600 transition duration-300 font-medium flex items-center gap-1">
                <span className="relative">
                  Trading
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 py-2">
                <Link href="/dashboard/trade" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-t-lg transition-colors duration-200 text-sm">Web Trader</Link>
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Forex CFD</Link>
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Stock CFD</Link>
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Cryptocurrency</Link>
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Futures CFD</Link>
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-b-lg transition-colors duration-200 text-sm">Precious Metals</Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
              className="relative group"
            >
              <button className="text-gray-700 hover:text-emerald-600 transition duration-300 font-medium flex items-center gap-1">
                <span className="relative">
                  Market
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-44 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 py-2">
                <Link href="/markets" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors duration-200 text-sm">Market Overview</Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.5 }}
              className="relative group"
            >
              <button className="text-gray-700 hover:text-emerald-600 transition duration-300 font-medium flex items-center gap-1">
                <span className="relative">
                  Platforms
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 py-2">
                <Link href="/demo" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-t-lg transition-colors duration-200 text-sm">PrimeVest Financial Solutions, Inc. App</Link>
                <Link href="/dashboard/trade" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Web Trader</Link>
                <Link href="#" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">MetaTrader 4</Link>
                <Link href="/platforms/mt4-mobile" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">MT4 Mobile</Link>
                <Link href="#" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">MetaTrader 5</Link>
                <Link href="/platforms/mt5-mobile" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-b-lg transition-colors duration-200 text-sm">MT5 Mobile</Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
              className="relative group"
            >
              <button className="text-gray-700 hover:text-emerald-600 transition duration-300 font-medium flex items-center gap-1">
                <span className="relative">
                  Account
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-48 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 py-2">
                <Link href="/auth/signup" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-t-lg transition-colors duration-200 text-sm">Open Account</Link>
                <Link href="/auth/signin" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-b-lg transition-colors duration-200 text-sm">Login</Link>
              </div>
            </motion.div>
            
            <motion.div 
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.7 }}
              className="relative group"
            >
              <button className="text-gray-700 hover:text-emerald-600 transition duration-300 font-medium flex items-center gap-1">
                <span className="relative">
                  Tools
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-emerald-600 transition-all duration-300 group-hover:w-full"></span>
                </span>
                <svg className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>
              <div className="absolute top-full left-0 mt-2 w-52 bg-white rounded-xl shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 border border-gray-100 py-2">
                <Link href="/tools" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-t-lg transition-colors duration-200 text-sm">Economic Calendar</Link>
                <Link href="/tools" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Market News</Link>
                <Link href="/tools" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Analysis</Link>
                <Link href="/support" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">Help Center</Link>
                <Link href="/support/faqs" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 transition-colors duration-200 text-sm">FAQs</Link>
                <Link href="/tools/trading-view" className="block px-4 py-2.5 text-gray-700 hover:text-emerald-600 hover:bg-emerald-50 rounded-b-lg transition-colors duration-200 text-sm">Trading View</Link>
              </div>
            </motion.div>
          </nav>

          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <Button 
              onClick={handleStartTrading} 
              className="hidden sm:block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Sign In
            </Button>
            <Button 
              onClick={handleOpenAccount} 
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Open Account
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-20 px-4 md:px-8 bg-linear-to-br from-gray-50 to-gray-100 border-b border-gray-200 overflow-hidden section-padding"
      >
        {/* Animated background elements */}
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Left Content */}
            <motion.div 
              variants={slideInFromLeft}
              className="space-y-8"
            >
              <div className="space-y-6">
                <motion.h1 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="text-display font-bold leading-tight bg-linear-to-r from-gray-900 via-emerald-600 to-emerald-700 bg-clip-text text-transparent transition-professional"
                >
                  Trade Forex, Stocks, Crypto & More
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  Join millions of traders on the world&apos;s leading trading platform. Access 300+ financial instruments with ultra-low spreads and fast execution.
                </motion.p>
              </div>
              
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6 }}
                className="flex flex-col sm:flex-row gap-4 pt-4 transition-professional"
              >
                <Button 
                  onClick={handleStartTrading} 
                  className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
                >
                  Start Trading
                </Button>
                <Button 
                  onClick={handleTryDemo} 
                  className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-4 text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-105 btn-premium"
                >
                  Try Free Demo
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
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Spreads from 0.0 pips</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">60-second deposits</span>
                </div>
              </motion.div>
            </motion.div>

            {/* Right Image - Trading Dashboard Preview */}
            <motion.div 
              variants={slideInFromRight}
              className="hidden lg:flex justify-center w-full max-w-2xl"
            >
              <div className="relative">
                {/* Glowing effect around the dashboard */}
                <div className="absolute -inset-4 bg-linear-to-r from-emerald-500/10 to-blue-500/10 rounded-3xl blur-xl opacity-75 animate-pulse"></div>
                
                {/* Main dashboard container */}
                <div className="relative h-96 w-full bg-linear-to-br from-white to-gray-50 rounded-2xl border border-gray-200 p-4 sm:p-6 flex flex-col shadow-xl overflow-hidden group card-elevated">
                  {/* Micro-interaction: subtle glow on hover */}
                  <div className="absolute inset-0 bg-linear-to-br from-emerald-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-2xl pointer-events-none"></div>
                  
                  {/* Simulated chart area */}
                  <div className="flex-1 relative">
                    <div className="absolute inset-0 bg-linear-to-br from-emerald-50/10 to-transparent rounded-xl"></div>
                    
                    {/* Simulated price chart */}
                    <div className="absolute bottom-0 left-0 right-0 h-3/4">
                      <svg viewBox="0 0 400 200" className="w-full h-full">
                        <defs>
                          <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
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
                          fill="url(#chartGradient)"
                        />
                      </svg>
                    </div>
                    
                    {/* Trading info overlay */}
                    <div className="absolute top-4 left-4 right-4 flex justify-between">
                      <div className="bg-white/80 backdrop-blur-sm rounded-lg px-3 py-2 group-hover:bg-white/90 transition-colors duration-300 border border-gray-200">
                        <div className="text-xs text-gray-500">EUR/USD</div>
                        <div className="text-sm font-semibold text-gray-900">1.0845</div>
                      </div>
                      <div className="bg-emerald-50/80 backdrop-blur-sm rounded-lg px-3 py-2 border border-emerald-200 group-hover:bg-emerald-100/90 transition-colors duration-300">
                        <div className="text-xs text-emerald-600">24h Change</div>
                        <div className="text-sm font-semibold text-emerald-700">+0.32%</div>
                      </div>
                    </div>
                  </div>
                  
                  {/* Stats bar */}
                  <div className="flex justify-between pt-4 border-t border-gray-200">
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-xs text-gray-500">Traders</div>
                      <div className="text-sm font-bold text-gray-900">2.5M+</div>
                    </div>
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-xs text-gray-500">Volume</div>
                      <div className="text-sm font-bold text-gray-900">$4.2B</div>
                    </div>
                    <div className="text-center group-hover:scale-105 transition-transform duration-300">
                      <div className="text-xs text-gray-500">Assets</div>
                      <div className="text-sm font-bold text-gray-900">300+</div>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      {/* Multiple Assets Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold mb-6 bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Multiple Assets, One Platform
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Access leading assets with spreads from 0.0 pips, low and transparent commissions. Trade smarter with advanced tools and superior execution.
            </p>
          </motion.div>

          <div className="grid-responsive">
            {[
              { title: "Forex CFD", icon: "💱", count: "90+", color: "from-blue-500 to-blue-600" },
              { title: "Cryptocurrencies", icon: "₿", count: "150+", color: "from-amber-500 to-orange-500" },
              { title: "Commodities", icon: "🛢️", count: "20+", color: "from-yellow-500 to-amber-500" },
              { title: "Precious Metals", icon: "🏆", count: "10+", color: "from-yellow-500 to-yellow-600" },
              { title: "Indices", icon: "📈", count: "40+", color: "from-emerald-500 to-emerald-600" },
              { title: "Stocks", icon: "📊", count: "5000+", color: "from-purple-500 to-purple-600" },
            ].map((asset, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.1 * i }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-linear-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  <div className="absolute bottom-0 left-0 w-24 h-24 bg-blue-500/5 rounded-full translate-y-12 -translate-x-12 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-linear-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                      <span className="text-3xl">{asset.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{asset.title}</h3>
                  </div>
                  <div className="flex items-baseline justify-between pt-6 border-t border-gray-100">
                    <p className="text-3xl font-bold text-emerald-600">{asset.count}</p>
                    <p className="text-gray-500 text-sm">Instruments</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-16"
          >
            <Button 
              onClick={handleExploreAssets} 
              className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Explore All Assets
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Built for Traders Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold mb-6 bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Built for Traders
            </h2>
            <p className="text-body text-gray-600 transition-professional">Everything you need to trade successfully</p>
          </motion.div>

          <div className="grid-responsive">
            {[
              {
                title: "Multi-Platform Trading Experience",
                desc: "Seamless access via MT4, MT5, Web, and mobile apps for uninterrupted trading across all devices.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17h14a2 2 0 002-2V5a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                  </svg>
                )
              },
              {
                title: "Ultra-Low Latency Execution",
                desc: "Millisecond-level order execution powered by our advanced matching engine.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                )
              },
              {
                title: "Global Regulatory Compliance",
                desc: "Licensed and regulated, compliant with international standards ensuring safety and trust.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                  </svg>
                )
              },
              {
                title: "Dedicated Expert Support",
                desc: "24/7 multilingual support team ready to assist you whenever you need help.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                )
              },
              {
                title: "Fast Fund Transfers",
                desc: "60-second instant deposits and efficient 20-minute withdrawals.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                )
              },
              {
                title: "Advanced Trading Tools",
                desc: "Access cutting-edge charting tools, economic calendars, and market analysis.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  </svg>
                )
              },
            ].map((feature, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                transition={{ delay: 0.1 * i }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-linear-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 right-4 w-20 h-20 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-14 h-14 rounded-xl bg-emerald-100 flex items-center justify-center mb-6 group-hover:bg-emerald-200 transition-colors duration-300">
                      <div className="text-emerald-600">
                        {feature.icon}
                      </div>
                    </div>
                    <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{feature.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{feature.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Stats Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold mb-6 bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Reliable. Trusted. Awarded.
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Backed by millions of traders worldwide
            </p>
          </motion.div>

          <div className="grid-responsive">
            {[
              { number: "5M+", label: "Active Users", icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                </svg>
              )},
              { number: "10M+", label: "Downloads", icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )},
              { number: "$60B", label: "Monthly Volume", icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
              { number: "50+", label: "Countries", icon: (
                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              )},
            ].map((stat, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ scale: 1.05 }}
                className="text-center group"
              >
                <div className="bg-white rounded-2xl p-6 shadow-lg border border-gray-100 mb-6 group-hover:shadow-xl transition-all duration-300 card-premium">
                  <div className="flex justify-center mb-2 text-emerald-500">
                    {stat.icon}
                  </div>
                </div>
                <motion.p 
                  initial={{ scale: 0.8, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.3 + i * 0.1 }}
                  className="text-5xl md:text-6xl font-bold text-emerald-600 mb-2"
                >
                  {stat.number}
                </motion.p>
                <p className="text-gray-600 font-medium">{stat.label}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* 3 Steps Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-5xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Trade in 3 Simple Steps
            </h2>
            <p className="text-xl text-gray-600 transition-professional">
              Smarter trading starts here! Join millions of traders who choose our platform.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 relative grid-responsive">
            {/* Connecting lines for desktop */}
            <div className="hidden md:flex absolute top-1/2 left-0 right-0 h-0.5 bg-linear-to-r from-emerald-200 via-emerald-400 to-emerald-200 -z-10 transform -translate-y-1/2"></div>
            
            {[
              {
                step: 1,
                title: "Sign Up",
                desc: "Create your account in just 2 minutes with our simple registration process.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                  </svg>
                )
              },
              {
                step: 2,
                title: "Deposit",
                desc: "Fund your account using your preferred payment method.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                  </svg>
                )
              },
              {
                step: 3,
                title: "Start Trading",
                desc: "Access 300+ financial instruments and begin trading immediately.",
                icon: (
                  <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                )
              },
            ].map((item, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="relative group"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  {/* Animated background */}
                  <div className="absolute inset-0 bg-linear-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="mb-6 flex justify-center">
                      <div className="relative w-20 h-20 bg-linear-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center border-2 border-emerald-200 group-hover:border-emerald-500 group-hover:from-emerald-200 group-hover:to-emerald-300 transition-all duration-300">
                        <span className="text-3xl font-bold text-emerald-700">{item.step}</span>
                      </div>
                      <div className="absolute top-6 right-0 text-emerald-500 transform -translate-x-8 group-hover:animate-bounce">
                        {item.icon}
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{item.title}</h3>
                    <p className="text-gray-600 leading-relaxed">{item.desc}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4 mt-16"
          >
            <Button 
              onClick={handleStartTrading} 
              className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Start Trading
            </Button>
            <Button 
              onClick={handleTryDemo} 
              className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 btn-premium"
            >
              Try Free Demo
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Download App Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-5xl md:text-6xl font-bold mb-6 bg-linear-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Download Our App
            </h2>
            <p className="text-xl text-gray-600 transition-professional">
              Trade on the go with our mobile apps for iOS and Android
            </p>
          </motion.div>

          <div className="grid-responsive">
            {[
              {
                title: "iOS App",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                desc: "Optimized for iPhone and iPad",
                buttonText: "App Store",
                url: "https://apps.apple.com/app/bitpanda-pro",
                color: "from-blue-500 to-blue-600"
              },
              {
                title: "Android App",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                  </svg>
                ),
                desc: "Download on Google Play",
                buttonText: "Google Play",
                url: "https://play.google.com/store/apps/details?id=com.bitpanda.pro",
                color: "from-green-500 to-green-600"
              },
              {
                title: "Web Platform",
                icon: (
                  <svg className="w-16 h-16" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                  </svg>
                ),
                desc: "Trade directly in browser",
                buttonText: "Open Web App",
                isInternalLink: true,
                color: "from-emerald-500 to-emerald-600"
              },
            ].map((app, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl flex flex-col h-full overflow-hidden card-premium">
                  {/* Animated background elements */}
                  <div className="absolute inset-0 bg-linear-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  <div className="absolute top-4 right-4 w-24 h-24 bg-emerald-500/10 rounded-full blur-xl group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 flex flex-col h-full">
                    <div className="flex justify-center mb-6">
                      <div className="w-24 h-24 rounded-2xl bg-gray-100 flex items-center justify-center group-hover:bg-emerald-100 transition-colors duration-300">
                        <div className="text-emerald-600 group-hover:scale-110 transition-transform duration-300">
                          {app.icon}
                        </div>
                      </div>
                    </div>
                    <h3 className="text-2xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{app.title}</h3>
                    <p className="text-gray-600 mb-8 grow">{app.desc}</p>
                    {app.isInternalLink ? (
                      <Button 
                        onClick={handleStartTrading} 
                        className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg w-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl btn-premium"
                      >
                        {app.buttonText}
                      </Button>
                    ) : (
                      <Button 
                        asChild 
                        className="bg-linear-to-r from-gray-700 to-gray-800 hover:from-gray-600 hover:to-gray-700 text-white px-6 py-3 rounded-lg w-full font-semibold transition-all duration-300 shadow-lg hover:shadow-xl border border-gray-600 btn-premium"
                      >
                        <a href={app.url} target="_blank" rel="noopener noreferrer">
                          {app.buttonText}
                        </a>
                      </Button>
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* CTA Footer */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-linear-to-r from-emerald-500 to-emerald-600 section-padding"
      >
        <div className="max-w-4xl mx-auto text-center">
          <motion.h2 
            variants={fadeInUp}
            className="text-5xl md:text-6xl font-bold text-white mb-6"
          >
            Ready to Trade?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Join millions of traders and start your trading journey today. Sign up in seconds and access professional trading tools.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={handleOpenAccount} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Open Account
            </Button>
            <Button 
              onClick={handleContactUs} 
              className="border-2 border-white text-white hover:bg-white/10 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 btn-premium"
            >
              Contact Us
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 py-16 px-4 md:px-8 section-padding">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-10 mb-12 grid-responsive">
            {/* Company Info */}
            <div className="md:col-span-1">
              <Link href="/" className="flex items-center gap-2 text-gray-900 hover:text-emerald-600 transition mb-4">
                <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
                  <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
                  <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              <span className="font-bold">PrimeVest Capital</span>
              </Link>
              <p className="text-gray-600 text-sm leading-relaxed">Professional trading platform for everyone. Trade Forex, Crypto, Commodities & more.</p>
            </div>

            {/* Trading */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-lg">Trading</h3>
              <ul className="space-y-3">
                <li><Link href="/markets" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Markets</Link></li>
                <li><Link href="/demo" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Demo Account</Link></li>
                <li><Link href="/platforms" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Platform</Link></li>
                <li><Link href="/tools" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Tools</Link></li>
              </ul>
            </div>

            {/* Company */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-lg">Company</h3>
              <ul className="space-y-3">
                <li><Link href="/contact-us" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Contact</Link></li>
                <li><Link href="/support" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Support</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Blog</a></li>
                <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Careers</a></li>
              </ul>
            </div>

            {/* Legal */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-lg">Legal</h3>
              <ul className="space-y-3">
                <li><Link href="/privacy" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Privacy Policy</Link></li>
                <li><Link href="/terms" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Terms & Conditions</Link></li>
                <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Disclaimer</a></li>
                <li><a href="#" className="text-gray-600 hover:text-emerald-600 transition text-sm font-medium">Cookies</a></li>
              </ul>
            </div>

            {/* Newsletter */}
            <div>
              <h3 className="text-gray-900 font-semibold mb-4 text-lg">Newsletter</h3>
              <p className="text-gray-600 text-sm mb-4">Get trading tips and market insights delivered to your inbox.</p>
              <div className="flex gap-2">
                <input
                  type="email"
                  placeholder="Email"
                  className="flex-1 bg-gray-100 border border-gray-300 rounded-lg px-4 py-2 text-sm text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 transition"
                  suppressHydrationWarning
                />
                <button className="bg-linear-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 py-2 rounded-lg text-sm font-semibold transition">
                  →
                </button>
              </div>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-gray-200 pt-8">
            <div className="flex flex-col md:flex-row justify-between items-center text-gray-600 text-sm gap-6">
  <p>&copy; 2026 PrimeVest Capital. All rights reserved.</p>
              <div className="flex gap-6 transition-professional">
                <a href="#" className="hover:text-emerald-600 transition font-medium">Twitter</a>
                <a href="#" className="hover:text-emerald-600 transition font-medium">LinkedIn</a>
                <a href="#" className="hover:text-emerald-600 transition font-medium">Facebook</a>
              </div>
            </div>
=======

"use client";

import Link from "next/link";
import Image from "next/image";
import BitpandaNavbar from "@/components/BitpandaNavbar";
import CryptoTicker from "@/components/CryptoTicker";

// Crypto data
const topCryptos = [
  { symbol: "BTC", name: "Bitcoin", price: "€45,234.56", change: "+2.34%", volume: "€28.5B", logo: "/btc-logo.png" },
  { symbol: "ETH", name: "Ethereum", price: "€2,876.43", change: "-1.23%", volume: "€12.8B", logo: "/eth-logo.png" },
  { symbol: "BNB", name: "BNB", price: "€298.76", change: "+3.45%", volume: "€2.1B", logo: "/bnb-logo.png" },
  { symbol: "ADA", name: "Cardano", price: "€0.4521", change: "+1.87%", volume: "€890M", logo: "/ada-logo.png" },
  { symbol: "SOL", name: "Solana", price: "€98.32", change: "+4.12%", volume: "€1.2B", logo: "/sol-logo.png" },
  { symbol: "XRP", name: "XRP", price: "€0.6234", change: "-0.45%", volume: "€1.8B", logo: "/xrp-logo.png" }
];

// Investment options
const investmentOptions = [
  {
    title: "Cryptocurrencies",
    description: "Buy, sell, and swap the cryptocurrencies you want anytime, anywhere.",
    image: "https://a.storyblok.com/f/176646/960x600/6795a4c32d/website_homepage_cryptocurrencies.png",
    link: "/crypto"
  },
  {
    title: "Stocks*",
    description: "Invest in fractions of your favourite companies without buying a full share.",
    image: "https://a.storyblok.com/f/176646/960x600/cc80628f6b/website_homepage_stocks.png",
    link: "/stocks"
  },
  {
    title: "ETFs*",
    description: "Invest in fractions of your favourite ETFs* without buying a full share.",
    image: "https://a.storyblok.com/f/176646/960x600/bc62fd7985/website_homepage_etfs.png",
    link: "/etfs"
  },
  {
    title: "Commodities*",
    description: "Fortify your portfolio with commodities* and shield it against inflation.",
    image: "https://a.storyblok.com/f/176646/960x600/ff72d39829/website_homepage_commodities.png",
    link: "/commodities"
  },
  {
    title: "Crypto Indices",
    description: "Auto-invest in the whole crypto market with a single click.",
    image: "https://a.storyblok.com/f/176646/960x600/b971c0ccf7/website_homepage_crypto-indices.png",
    link: "/indices"
  },
  {
    title: "Precious Metals",
    description: "Diversify your portfolio by investing in physically-backed precious metals.",
    image: "https://a.storyblok.com/f/176646/960x600/5c79402c90/website_homepage_metals.png",
    link: "/metals"
  }
];

// Steps data
const steps = [
  {
    number: "01",
    title: "Register",
    description: "Sign up to create your free Bitpanda account.",
    image: "https://a.storyblok.com/f/176646/840x1080/4e498da1d7/website_homepage_register_en.png"
  },
  {
    number: "02",
    title: "Verify",
    description: "Verify your identity with one of our trusted verification partners.",
    image: "https://a.storyblok.com/f/176646/840x1080/20149b912b/website_homepage_verify_en.png"
  },
  {
    number: "03",
    title: "Deposit",
    description: "Deposit your funds securely through popular options.",
    image: "https://a.storyblok.com/f/176646/840x1080/af2f5ef73e/website_homepage_deposit_en.png"
  },
  {
    number: "04",
    title: "Trade",
    description: "Buy, sell and swap digital assets 24/7.",
    image: "https://a.storyblok.com/f/176646/840x1080/ffa905c022/website_homepage_trade_en.png"
  }
];

// Assets data for asset cards
const assets = [
  { symbol: "XAU", name: "Gold", price: "€2,045.32", change: "+0.85%", type: "commodity", chart: "up" },
  { symbol: "NVDA", name: "NVIDIA Corp", price: "€875.45", change: "+3.24%", type: "stock", chart: "up" },
  { symbol: "GOOGL", name: "Alphabet Inc", price: "€172.89", change: "-0.56%", type: "stock", chart: "down" },
  { symbol: "AAPL", name: "Apple Inc", price: "€185.67", change: "+1.12%", type: "stock", chart: "up" },
  { symbol: "MSFT", name: "Microsoft Corp", price: "€415.23", change: "+2.45%", type: "stock", chart: "up" },
  { symbol: "AMZN", name: "Amazon.com", price: "€178.34", change: "+1.89%", type: "stock", chart: "up" },
  { symbol: "BTC", name: "Bitcoin", price: "€52,340.00", change: "+4.56%", type: "crypto", chart: "up" },
  { symbol: "TSM", name: "Taiwan Semi", price: "€142.78", change: "-1.23%", type: "stock", chart: "down" },
  { symbol: "FB", name: "Meta Platforms", price: "€485.67", change: "+2.78%", type: "stock", chart: "up" },
  { symbol: "AVGO", name: "Broadcom Inc", price: "€1,245.89", change: "+5.12%", type: "stock", chart: "up" },
  { symbol: "TSLA", name: "Tesla Inc", price: "€189.45", change: "-2.34%", type: "stock", chart: "down" },
  { symbol: "BRK", name: "Berkshire B", price: "€415.67", change: "+0.89%", type: "stock", chart: "up" },
  { symbol: "LLY", name: "Eli Lilly", price: "€782.34", change: "+1.56%", type: "stock", chart: "up" },
  { symbol: "JPM", name: "JPMorgan", price: "€198.56", change: "+0.78%", type: "stock", chart: "up" },
  { symbol: "WMT", name: "Walmart Inc", price: "€165.23", change: "-0.34%", type: "stock", chart: "down" },
  { symbol: "TCTZF", name: "Tata Consumer", price: "€12.45", change: "+0.67%", type: "stock", chart: "up" },
  { symbol: "V", name: "Visa Inc", price: "€278.90", change: "+1.23%", type: "stock", chart: "up" },
  { symbol: "SMSN", name: "Samsung Elec", price: "€1,234.56", change: "+2.45%", type: "stock", chart: "up" },
  { symbol: "XOM", name: "Exxon Mobil", price: "€108.78", change: "-0.89%", type: "stock", chart: "down" },
  { symbol: "ORCL", name: "Oracle Corp", price: "€127.89", change: "+1.45%", type: "stock", chart: "up" },
  { symbol: "MA", name: "Mastercard", price: "€445.67", change: "+1.78%", type: "stock", chart: "up" },
  { symbol: "JNJ", name: "Johnson&John", price: "€156.78", change: "-0.45%", type: "stock", chart: "down" },
  { symbol: "ASML", name: "ASML Holding", price: "€867.89", change: "+3.67%", type: "stock", chart: "up" },
  { symbol: "BAC", name: "Bank of Amer", price: "€34.56", change: "+0.89%", type: "stock", chart: "up" },
  { symbol: "PLTR", name: "Palantir", price: "€24.78", change: "-1.56%", type: "stock", chart: "down" }
];

// FAQ Questions data
const faqQuestions = [
  {
    question: "How do I verify my account?",
    answer: "Verify your identity with one of our trusted verification partners in just a few minutes.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    question: "What payment methods are accepted?",
    answer: "We accept bank transfers, credit/debit cards, PayPal, and various local payment methods.",
    icon: "M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"
  },
  {
    question: "Are my funds secure?",
    answer: "Funds are secured in offline wallets with full compliance to European standards.",
    icon: "M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
  },
  {
    question: "How do I withdraw my crypto?",
    answer: "Withdraw your digital assets anytime with low fees and fast processing times.",
    icon: "M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z"
  },
  {
    question: "What are the trading fees?",
    answer: "Competitive fees starting from 0.1% per trade with no hidden costs.",
    icon: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    question: "Is there a mobile app?",
    answer: "Yes! Download our app on iOS and Android for trading on the go.",
    icon: "M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z"
  },
  {
    question: "How do I enable 2FA?",
    answer: "Enable two-factor authentication in your account settings for enhanced security.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    question: "What cryptocurrencies can I trade?",
    answer: "Trade 650+ cryptocurrencies including Bitcoin, Ethereum, Solana, and many more.",
    icon: "M13 10V3L4 14h7v7l9-11h-7z"
  },
  {
    question: "Can I invest in stocks and ETFs?",
    answer: "Yes! Invest in fractions of your favourite companies and ETFs with zero commissions.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
  },
  {
    question: "What are Bitpanda Pro Crypto Indices?",
    answer: "Auto-invest in the whole crypto market with a single click using our diversified indices.",
    icon: "M4 5a1 1 0 011-1h14a1 1 0 011 1v2a1 1 0 01-1 1H5a1 1 0 01-1-1V5zM4 13a1 1 0 011-1h6a1 1 0 011 1v6a1 1 0 01-1 1H5a1 1 0 01-1-1v-6zM16 13a1 1 0 011-1h2a1 1 0 011 1v6a1 1 0 01-1 1h-2a1 1 0 01-1-1v-6z"
  },
  {
    question: "How fast are deposits and withdrawals?",
    answer: "Bank transfers typically process within 1-2 business days, crypto withdrawals within minutes.",
    icon: "M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
  },
  {
    question: "Is Bitpanda Pro regulated?",
    answer: "Yes, we're Austria-based and European regulated crypto & securities broker platform.",
    icon: "M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
  },
  {
    question: "What is Bitpanda Pro Leverage?",
    answer: "Go Long or Short on top cryptocurrencies with up to 10x leverage for amplified positions.",
    icon: "M13 7h8m0 0v8m0-8l-8 8-4-4-6 6"
  },
  {
    question: "How do I contact support?",
    answer: "Reach our support team through the Helpdesk or contact form available 24/7.",
    icon: "M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z"
  }
];

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <BitpandaNavbar />
      
      {/* Crypto Ticker */}
      <CryptoTicker />
      
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-green-800 to-green-900 pt-20 pb-16 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[#103e36]"></div>
        <div className="bp-container relative">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div className="text-center lg:text-left">
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold mb-6 leading-tight">
                Fast-track your financial freedom.
              </h1>
              <p className="text-lg md:text-xl text-white/90 mb-8 max-w-2xl">
                Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with Bitpanda Pro.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center lg:justify-start">
                <Link href="/auth/signup" className="bp-button bp-button-primary bp-button-lg">
                  Start investing
                </Link>
              </div>
            </div>
            <div className="flex justify-center lg:justify-end">
              <div className="relative w-full max-w-md">
                <Image 
                  src="/website_homepage_header (1).webp" 
                  alt="Man in a gray suit with a striped shirt, sitting and holding a phone, looking to the side, with a green background." 
                  width={500}
                  height={630}
                  className="w-full h-auto"
                  priority
                />
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Indicators */}
      <section className="py-16 bg-green-800 text-white">
        <div className="bp-container">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Regulated</h3>
              <p className="text-white/90 mb-4">Austria based and European regulated crypto & securities broker platform</p>
              <Link href="/security" className="text-white underline font-medium">Read more</Link>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Safe and secure</h3>
              <p className="text-white/90 mb-4">Funds secured in offline wallets. Fully compliant with European data, IT and money laundering standards.</p>
              <Link href="/security" className="text-white underline font-medium">Read more</Link>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
              </div>
              <h3 className="text-xl font-semibold mb-2">Trusted</h3>
              <p className="text-white/90 mb-4">7+ million happy users. Excellent Trustpilot rating.</p>
              <Link href="#" className="text-white underline font-medium">Read reviews</Link>
            </div>
          </div>
        </div>
      </section>

      {/* All Your Investments Section */}
      <section className="py-20 bg-white">
        <div className="bp-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
              All your investments.
              <br className="hidden sm:block" />
              <span className="sm:hidden"> </span>All on Bitpanda Pro.
            </h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {investmentOptions.map((option, index) => (
              <div key={index} className="bp-card">
                <div className="aspect-video bg-gray-100">
                  <Image 
                    src={option.image} 
                    alt={option.title} 
                    width={400}
                    height={300}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-6">
                  <h3 className="text-xl font-bold text-green-800 mb-2">{option.title}</h3>
                  <p className="text-gray-600 mb-4">{option.description}</p>
                  <Link href={option.link} className="text-green-800 font-medium flex items-center">
                    Learn more
                    <svg className="ml-1 w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                    </svg>
                  </Link>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <p className="text-sm text-gray-500">
              Investing in stocks, ETFs and commodities carries risks. Conduct your own research before concluding a transaction.
            </p>
            <p className="text-xs text-gray-500 mt-2">
              *Stocks and ETFs are the underlying assets of the contracts offered as Bitpanda Pro Stocks and are brought to you by Bitpanda Pro Financial Services GmbH. 
              More information about the product is available at bitpandapro.com. For more details, consult the prospectus available at bitpandapro.com.
            </p>
          </div>
        </div>
      </section>

      {/* More Money in Portfolio */}
      <section className="py-20 bg-gray-100">
        <div className="bp-container">
          <div className="bp-card bg-green-800 text-white">
            <div className="grid lg:grid-cols-2 gap-0">
              <div className="p-8 lg:p-12 flex flex-col justify-center">
                <div className="bp-badge bp-badge-green mb-4 w-fit">
                  Invest with zero deposit fees
                </div>
                <h3 className="text-2xl md:text-3xl font-bold mb-4">
                  More money in your portfolio
                </h3>
                <p className="text-white/90 mb-6">
                  No deposit or withdrawal fees on any payment method for all fiat currencies with Bitpanda Pro. 
                  More opportunities to grow your investments and make impactful decisions.
                </p>
                <Link href="/fees" className="bp-button bp-button-secondary w-fit">
                  Read more
                </Link>
              </div>
              <div className="bg-white flex items-center justify-center p-8">
                <div className="relative w-full max-w-xs">
                  <Image 
                    src="https://a.storyblok.com/f/176646/2063x2126/81da40be44/website_homepage_more-money-in-you-portfolio_en.png" 
                    alt="Payment options: Apple Pay, PayPal, Mastercard, and Visa, all listed as free."
                    width={500}
                    height={500}
                    className="w-full h-auto"
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-20 bg-green-800 text-white">
        <div className="bp-container">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Get started in minutes
            </h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {steps.map((step, index) => (
              <div key={index} className="text-center">
                <div className="bg-white rounded-lg p-6 mb-6">
                  <div className="relative w-full aspect-[3/4]">
                    <Image 
                      src={step.image} 
                      alt={step.title} 
                      fill
                      sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                      className="object-contain"
                    />
                  </div>
                </div>
                <div className="bp-badge bp-badge-green mb-4">
                  {step.number}
                </div>
                <h3 className="text-xl font-bold mb-2">{step.title}</h3>
                <p className="text-white/90">{step.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Keep Tabs Section */}
      <section className="py-20 bg-gray-100">
        <div className="bp-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
              Keep tabs on your favourite assets
            </h2>
          </div>
          <div className="bp-card">
            <div className="divide-y divide-gray-200">
              {topCryptos.map((crypto, index) => (
                <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4">
                      <Image 
                        src={crypto.logo} 
                        alt={`${crypto.name} logo`}
                        width={40}
                        height={40}
                        className="rounded-xl"
                      />
                      <div>
                        <h3 className="font-bold text-base sm:text-lg">{crypto.name}</h3>
                        <p className="text-sm text-gray-500">{crypto.symbol}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <h3 className="font-bold text-base sm:text-lg">{crypto.price}</h3>
                      <p className={`text-sm ${crypto.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                        {crypto.change}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
          <p className="text-center mt-8 text-sm text-gray-500">
            Past performance is not an indication of future performance.
          </p>
        </div>
      </section>

      {/* Call to Action */}
      <section className="py-20 bg-green-800 text-white">
        <div className="bp-container">
          <div className="max-w-4xl mx-auto text-center">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-6">
              Ready to Start Your Investment Journey?
            </h2>
            <p className="text-xl mb-8 text-white/75">
              Join millions of investors who trust BITPANDA PRO for their financial future
            </p>
            <p className="text-xl mb-8 text-white/75">
              Get started in under 5 minutes • No hidden fees • European regulated • Professional Trading Platform
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/auth/signup" className="bp-button bp-button-primary bp-button-lg">
                Start Trading Now
              </Link>
              <Link href="/tutorials" className="bp-button bp-button-secondary bp-button-lg">
                <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                View Tutorials
              </Link>
            </div>
            <p className="text-sm mt-6 text-white/75">
              Get started in under 5 minutes • No hidden fees • European regulated
            </p>
          </div>
        </div>
      </section>

      {/* Questions Section with Moving Animation */}
      <section className="py-20 bg-green-800 text-white overflow-hidden">
        <div className="bp-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4">
              Questions? We&apos;re here for you
            </h2>
          </div>
        </div>
        
        {/* Moving FAQ Cards Container */}
        <div className="faq-marquee-container">
          <div className="faq-marquee-content">
            {/* First set of cards */}
            {faqQuestions.map((faq, index) => (
              <div key={`first-${index}`} className="faq-card">
                <div className="faq-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.icon} />
                  </svg>
                </div>
                <h3 className="faq-card-question">{faq.question}</h3>
                <p className="faq-card-answer">{faq.answer}</p>
              </div>
            ))}
            {/* Duplicate set for seamless loop */}
            {faqQuestions.map((faq, index) => (
              <div key={`second-${index}`} className="faq-card">
                <div className="faq-card-icon">
                  <svg fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d={faq.icon} />
                  </svg>
                </div>
                <h3 className="faq-card-question">{faq.question}</h3>
                <p className="faq-card-answer">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Additional Contact Cards */}
     { /*<div className="bp-container mt-16">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <div className="bp-card bg-green-900 text-white">
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Community</h3>
                <p className="mb-4">
                  Join our online community so you can be the first to hear about company news, new products and more.
                </p>
                <Link href="#" className="text-white underline font-medium">Join us</Link>
              </div>
            </div>
            <div className="bp-card bg-green-900 text-white">
              <div className="p-8 text-center">
                <div className="w-12 h-12 mx-auto mb-4 bg-white/10 rounded-full flex items-center justify-center">
                  <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold mb-4">Contact us</h3>
                <p className="mb-4">
                  Our Bitpanda Pro Helpdesk is filled with in-depth articles, and if you need more help, we are always available to lend a helping hand through our contact form.
                </p>
                <Link href="#" className="text-white underline font-medium">Go to Helpdesk</Link>
              </div>
            </div>
          </div>
        </div> */}
      </section>

      {/* Assets Section */}
      <section className="py-20 bg-white">
        <div className="bp-container">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold text-green-800 mb-4">
              Explore Popular Assets
            </h2>
            <p className="text-gray-600 max-w-2xl mx-auto">
              Trade a wide variety of assets including cryptocurrencies, stocks, commodities and more
            </p>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
            {assets.map((asset, index) => (
              <div key={index} className="bp-card p-4 hover:shadow-lg transition-shadow cursor-pointer group">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${
                      asset.type === 'crypto' ? 'bg-orange-100 text-orange-600' :
                      asset.type === 'commodity' ? 'bg-yellow-100 text-yellow-600' :
                      'bg-blue-100 text-blue-600'
                    }`}>
                      {asset.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <h4 className="font-bold text-sm">{asset.symbol}</h4>
                      <p className="text-xs text-gray-500">{asset.name}</p>
                    </div>
                  </div>
                </div>
                <div className="h-16 mb-3">
                  <svg viewBox="0 0 100 40" className={`w-full h-full ${asset.chart === 'up' ? 'text-green-500' : 'text-red-500'}`}>
                    <path
                      d={asset.chart === 'up' 
                        ? "M0,35 L10,32 L20,33 L30,28 L40,30 L50,25 L60,27 L70,20 L80,22 L90,15 L100,18"
                        : "M0,10 L10,15 L20,12 L30,18 L40,15 L50,22 L60,18 L70,25 L80,20 L90,28 L100,30"
                      }
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.5"
                    />
                  </svg>
                </div>
                <div className="flex items-center justify-between">
                  <div>
                    <p className="font-bold text-sm">{asset.price}</p>
                    <p className={`text-xs ${asset.change.startsWith('+') ? 'text-green-600' : 'text-red-500'}`}>
                      {asset.change}
                    </p>
                  </div>
                  <button className="bp-button bp-button-primary bp-button-sm opacity-0 group-hover:opacity-100 transition-opacity">
                    Buy
                  </button>
                </div>
              </div>
            ))}
          </div>
          <div className="text-center mt-8">
            <Link href="/markets" className="bp-button bp-button-outline">
              View All Markets
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-black text-white py-16">
        <div className="bp-container">
          <div className="grid grid-cols-1 md:grid-cols-5 gap-8">
            <div className="col-span-2">
              <div className="flex items-center space-x-3 mb-6">
                <Image 
                  src="/bitpanda-logo.svg"
                  alt="Bitpanda Pro"
                  width={32}
                  height={32}
                  className="w-8 h-8"
                />
                <span className="text-2xl font-bold text-white uppercase">BITPANDA PRO</span>
              </div>
              <p className="text-gray-300 mb-6 text-sm leading-relaxed">
                Europe&apos;s leading cryptocurrency trading platform. Bitpanda Pro is regulated, secure, and trusted by millions of users across the continent. Start your investment journey with confidence.
              </p>
              <div className="flex space-x-4">
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M12 2C6.477 2 2 6.477 2 12c0 4.42 2.865 8.166 6.839 9.489.5.09.682-.218.682-.485 0-.236-.008-.866-.013-1.7-2.782.603-3.369-1.34-3.369-1.34-.454-1.157-1.11-1.465-1.11-1.465-.908-.62.069-.608.069-.608 1.003.07 1.531 1.03 1.531 1.03.892 1.529 2.341 1.089 2.91.833.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.11-4.555-4.943 0-1.091.39-1.984 1.029-2.683-.103-.253-.446-1.27.098-2.647 0 0 .84-.268 2.75 1.026A9.578 9.578 0 0112 6.836c.85.004 1.705.114 2.504.336 1.909-1.294 2.747-1.026 2.747-1.026.546 1.377.203 2.394.1 2.647.64.699 1.028 1.592 1.028 2.683 0 3.842-2.339 4.687-4.566 4.935.359.309.678.919.678 1.852 0 1.336-.012 2.415-.012 2.743 0 .267.18.578.688.48C19.138 20.16 22 16.416 22 12c0-5.523-4.477-10-10-10z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128V8.413c0-3.1 1.893-4.788 4.659-4.788 1.325 0 2.463.099 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z"/>
                  </svg>
                </Link>
                <Link href="#" className="text-gray-400 hover:text-white transition-colors">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M23.953 4.57a10 10 0 01-2.825.775 4.958 4.958 0 002.163-2.723 10.054 10.054 0 01-3.127 1.195 4.92 4.92 0 00-8.384 4.482C7.69 8.095 4.067 6.13 1.64 3.162a4.822 4.822 0 00-.666 2.475c0 1.71.87 3.213 2.188 4.096a4.904 4.904 0 01-2.228-.616v.06a4.923 4.923 0 003.946 4.827 4.996 4.996 0 01-2.212.085 4.937 4.937 0 004.604 3.417 9.868 9.868 0 01-6.102 2.105c-.39 0-.779-.023-1.17-.067a13.995 13.995 0 007.557 2.209c9.053 0 13.998-7.496 13.998-13.985 0-.21 0-.42-.015-.63A9.935 9.935 0 0024 4.59z"/>
                  </svg>
                </Link>
              </div>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Invest</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/crypto" className="text-gray-300 hover:text-white">Cryptocurrencies</Link></li>
                <li><Link href="/stocks" className="text-gray-300 hover:text-white">Stocks</Link></li>
                <li><Link href="/etfs" className="text-gray-300 hover:text-white">ETFs</Link></li>
                <li><Link href="/metals" className="text-gray-300 hover:text-white">Precious Metals</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Company</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/about" className="text-gray-300 hover:text-white">About</Link></li>
                <li><Link href="/careers" className="text-gray-300 hover:text-white">Careers</Link></li>
                <li><Link href="/press" className="text-gray-300 hover:text-white">Press</Link></li>
                <li><Link href="/contact" className="text-gray-300 hover:text-white">Contact</Link></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold text-white mb-4">Legal</h4>
              <ul className="space-y-2 text-sm">
                <li><Link href="/terms" className="text-gray-300 hover:text-white">Terms</Link></li>
                <li><Link href="/privacy" className="text-gray-300 hover:text-white">Privacy</Link></li>
                <li><Link href="/security" className="text-gray-300 hover:text-white">Security</Link></li>
                <li><Link href="/imprint" className="text-gray-300 hover:text-white">Imprint</Link></li>
              </ul>
            </div>
          </div>

          <div className="border-t border-gray-800 mt-12 pt-8 text-center">
            <p className="text-sm text-gray-400">
              © 2024 BITPANDA PRO. All rights reserved. Bitpanda Pro GmbH ve grup şirketleri (Bitpanda Pro) Türkiye&apos;de bankacılık ve finansal hizmetler kanunlarının düzenlediği hiçbir faaliyet için yetkilendirilmemiştir.
            </p>
>>>>>>> 02bdcb7 (Initial commit)
          </div>
        </div>
      </footer>
    </div>
  );
<<<<<<< HEAD
}
=======
}

>>>>>>> 02bdcb7 (Initial commit)
