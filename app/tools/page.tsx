"use client";

import * as React from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { Star, ArrowRight, Clock, Shield, Zap, BarChart3 } from "lucide-react";
import { LoadingSpinner, CardSkeleton, LoadingButton, HoverLift, StaggerContainer } from "@/components/ui/LoadingStates";

export default function ToolsPage() {
  const [hoveredTool, setHoveredTool] = React.useState<string | null>(null);
  const [favoriteTools, setFavoriteTools] = React.useState<string[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

  const handleWebTrader = async () => {
    setLoadingAction("trader");
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    window.location.href = "/dashboard/trade";
  };

  const handleBackToHome = async () => {
    setLoadingAction("home");
    setIsLoading(true);
    // Simulate loading delay
    await new Promise(resolve => setTimeout(resolve, 500));
    window.location.href = "/";
  };

  const toggleFavorite = async (toolName: string) => {
    setFavoriteTools(prev => 
      prev.includes(toolName) 
        ? prev.filter(name => name !== toolName)
        : [...prev, toolName]
    );
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

  const tools = [
    {
      name: "Economic Calendar",
      description: "Stay ahead of market-moving events with our comprehensive economic calendar",
      features: ["Real-time updates", "Custom alerts", "Impact levels", "Historical data"],
      icon: "",
      path: "/tools/economic-calendar",
      color: "from-blue-500 to-blue-600",
      category: "Analysis",
      popularity: 4.8,
      isNew: false
    },
    {
      name: "Market News",
      description: "Get breaking financial news and expert analysis from global markets",
      features: ["Live updates", "Expert insights", "Multi-market coverage", "Custom feeds"],
      icon: "",
      path: "/tools/market-news",
      color: "from-purple-500 to-purple-600",
      category: "News",
      popularity: 4.9,
      isNew: true
    },
    {
      name: "Market Analysis",
      description: "Professional-grade analysis tools for technical and fundamental research",
      features: ["100+ indicators", "Charting tools", "AI insights", "Pattern recognition"],
      icon: "",
      path: "/tools/analysis",
      color: "from-emerald-500 to-emerald-600",
      category: "Analysis",
      popularity: 4.7,
      isNew: false
    },
    {
      name: "Trading View",
      description: "Advanced charting platform with real-time data and professional tools",
      features: ["Real-time data", "100+ indicators", "Multiple chart types", "Social trading"],
      icon: "",
      path: "/tools/trading-view",
      color: "from-teal-500 to-teal-600",
      category: "Charts",
      popularity: 4.9,
      isNew: false
    },
    {
      name: "FAQs",
      description: "Find answers to common questions about trading, accounts, and platforms",
      features: ["Comprehensive guides", "Quick answers", "Category filters", "Search functionality"],
      icon: "",
      path: "/support",
      color: "from-orange-500 to-orange-600",
      category: "Support",
      popularity: 4.6,
      isNew: false
    }
  ];

  const benefits = [
    {
      title: "Professional-Grade Tools",
      desc: "Access the same advanced tools used by professional traders and institutions",
      icon: ""
    },
    {
      title: "Real-Time Data",
      desc: "Get live market data, news, and analysis with millisecond-level updates",
      icon: ""
    },
    {
      title: "Comprehensive Coverage",
      desc: "From technical analysis to market news, we provide everything you need",
      icon: ""
    },
    {
      title: "User-Friendly Interface",
      desc: "Intuitive design that makes professional tools accessible to all traders",
      icon: ""
    }
  ];

  const stats = [
    { label: "Active Tools", value: "50+", icon: <Zap className="w-6 h-6" /> },
    { label: "Daily Users", value: "10K+", icon: <BarChart3 className="w-6 h-6" /> },
    { label: "Uptime", value: "99.9%", icon: <Shield className="w-6 h-6" /> },
    { label: "Response Time", value: "<50ms", icon: <Clock className="w-6 h-6" /> }
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
            <LoadingButton 
              onClick={handleWebTrader}
              loading={loadingAction === "trader"}
              loadingText="Loading..."
              className="hidden sm:block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Web Trader
            </LoadingButton>
            <LoadingButton 
              onClick={handleBackToHome} 
              loading={loadingAction === "home"}
              loadingText="Loading..."
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-lg font-medium text-sm transition-colors"
            >
              Back to Home
            </LoadingButton>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative hero-responsive bg-gradient-to-br from-gray-50 to-gray-100 border-b border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/5 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="absolute inset-0 bg-grid-pattern opacity-5"></div>
        <div className="container-responsive relative z-10 text-center">
          <motion.div 
            variants={fadeInUp}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-display font-bold leading-tight bg-gradient-to-r from-gray-900 via-emerald-600 to-emerald-700 bg-clip-text text-transparent transition-professional"
              >
                Trading Tools
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Professional trading tools and resources to help you make informed decisions. 
                From market analysis to economic calendars, we provide everything you need to succeed.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center transition-professional"
            >
              <Button 
                onClick={handleWebTrader} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium btn-responsive"
              >
                Start Trading
              </Button>
              <Button 
                onClick={handleBackToHome} 
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-6 sm:px-8 py-3 sm:py-4 text-base sm:text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold shadow-sm hover:shadow-md hover:scale-105 btn-premium btn-responsive"
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Tools Grid */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="section-responsive bg-gradient-to-b from-gray-50 to-gray-100"
      >
        <div className="container-responsive">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12 sm:mb-20"
          >
            <h2 className="text-heading font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Professional Trading Tools
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Access powerful tools and resources designed for serious traders
            </p>
          </motion.div>

          <div className="card-grid-responsive">
            {tools.map((tool, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -8, scale: 1.02 }}
                transition={{ delay: 0.1 * index, type: "spring", stiffness: 300 }}
                className="group relative"
                onMouseEnter={() => setHoveredTool(tool.name)}
                onMouseLeave={() => setHoveredTool(null)}
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-6 sm:p-8 hover:border-emerald-300 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-lg hover:shadow-2xl overflow-hidden">
                  {/* New Badge */}
                  {tool.isNew && (
                    <div className="absolute top-4 left-4 z-20">
                      <span className="bg-emerald-500 text-white text-xs font-bold px-2 py-1 rounded-full">NEW</span>
                    </div>
                  )}
                  
                  {/* Favorite Button */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleFavorite(tool.name);
                    }}
                    className="absolute top-4 right-4 z-20 p-2 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <Star 
                      className={`w-5 h-5 transition-colors ${
                        favoriteTools.includes(tool.name) 
                          ? 'fill-emerald-600 text-emerald-600' 
                          : 'text-gray-400 hover:text-emerald-600'
                      }`} 
                    />
                  </button>
                  
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className={`w-12 h-12 sm:w-16 sm:h-16 rounded-xl bg-gradient-to-br ${tool.color} flex items-center justify-center mb-4 sm:mb-6 group-hover:rotate-6 transition-transform duration-300`}>
                      <span className="text-2xl sm:text-3xl">{tool.icon}</span>
                    </div>
                    
                    <div className="mb-3 sm:mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <h3 className="text-lg sm:text-xl font-bold text-gray-900 group-hover:text-emerald-600 transition-colors duration-300">
                          {tool.name}
                        </h3>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 sm:w-4 sm:h-4 fill-yellow-400 text-yellow-400" />
                          <span className="text-xs sm:text-sm text-gray-600">{tool.popularity}</span>
                        </div>
                      </div>
                      <span className="inline-block px-2 py-1 bg-gray-100 text-gray-600 text-xs rounded-full mb-2 sm:mb-3">
                        {tool.category}
                      </span>
                    </div>
                    
                    <p className="text-gray-600 mb-4 sm:mb-6 text-sm sm:text-base">{tool.description}</p>
                    
                    <ul className="space-y-1 sm:space-y-2 mb-4 sm:mb-6">
                      {tool.features.map((feature, featIndex) => (
                        <li key={featIndex} className="flex items-center gap-2 text-xs sm:text-sm text-gray-600">
                          <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                          {feature}
                        </li>
                      ))}
                    </ul>
                    
                    <Link 
                      href={tool.path}
                      className="inline-flex items-center justify-center w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-4 sm:px-6 py-2 sm:py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl group-hover:scale-105 text-sm sm:text-base"
                    >
                      Access Tool
                      <ArrowRight className="w-3 h-3 sm:w-4 sm:h-4 ml-2 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                  
                  {/* Hover Overlay */}
                  {hoveredTool === tool.name && (
                    <motion.div 
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="absolute inset-0 bg-gradient-to-t from-emerald-600/10 to-transparent pointer-events-none"
                    />
                  )}
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
        className="py-16 px-4 md:px-8 bg-gray-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
            <p className="text-lg text-gray-600">Numbers that speak for themselves</p>
          </motion.div>

          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {stats.map((stat, index) => (
              <motion.div
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * index }}
                className="bg-white rounded-2xl p-6 text-center shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
              >
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-4 text-emerald-600">
                  {stat.icon}
                </div>
                <div className="text-2xl font-bold text-gray-900 mb-2">{stat.value}</div>
                <div className="text-sm text-gray-600">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Benefits Section */}
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
            <h2 className="text-heading font-bold mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Why Our Tools?
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Professional-grade features that give you the edge in today&apos;s markets
            </p>
          </motion.div>

          <div className="grid-responsive">
            {benefits.map((benefit, i) => (
              <motion.div 
                key={i} 
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 text-center hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-100 transition-colors duration-300">
                      <span className="text-4xl">{benefit.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.desc}</p>
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
              onClick={handleWebTrader} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Start Using Our Tools
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
            Access professional-grade tools and resources to enhance your trading strategy. 
            From technical analysis to market news, we provide everything you need to succeed.
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