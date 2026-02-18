"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function EconomicCalendarPage() {
  const [selectedDate, setSelectedDate] = useState("today");
  const [selectedCurrency, setSelectedCurrency] = useState("all");

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
      desc: "Get instant notifications about important economic events and market-moving news",
      icon: "⏱️"
    },
    {
      title: "Customizable Alerts",
      desc: "Set personalized alerts for specific events, currencies, or impact levels",
      icon: "🔔"
    },
    {
      title: "Historical Data",
      desc: "Access historical economic data and compare actual vs forecasted results",
      icon: "📊"
    },
    {
      title: "Market Impact",
      desc: "See the potential impact level (low, medium, high) of each economic event",
      icon: "📈"
    }
  ];

  // Mock economic events data
  const economicEvents = [
    {
      time: "08:30",
      currency: "USD",
      event: "Non-Farm Payrolls",
      actual: "275K",
      forecast: "185K",
      previous: "175K",
      impact: "high",
      country: "United States"
    },
    {
      time: "10:00",
      currency: "EUR",
      event: "ECB Interest Rate Decision",
      actual: "3.50%",
      forecast: "3.50%",
      previous: "3.50%",
      impact: "high",
      country: "European Union"
    },
    {
      time: "13:30",
      currency: "GBP",
      event: "Manufacturing PMI",
      actual: "47.8",
      forecast: "48.5",
      previous: "48.2",
      impact: "medium",
      country: "United Kingdom"
    },
    {
      time: "15:00",
      currency: "JPY",
      event: "Tankan Large Manufacturers Index",
      actual: "12.0",
      forecast: "10.5",
      previous: "9.8",
      impact: "medium",
      country: "Japan"
    },
    {
      time: "16:30",
      currency: "CAD",
      event: "Employment Change",
      actual: "15.2K",
      forecast: "25.0K",
      previous: "18.7K",
      impact: "medium",
      country: "Canada"
    },
    {
      time: "18:00",
      currency: "AUD",
      event: "RBA Interest Rate Decision",
      actual: "4.35%",
      forecast: "4.35%",
      previous: "4.35%",
      impact: "high",
      country: "Australia"
    }
  ];

  const getImpactColor = (impact: string) => {
    switch (impact) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

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
                alt="Bitpanda Pro"
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
                  Economic Calendar
                </motion.h1>
                <motion.p 
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5 }}
                  className="text-body text-gray-600 max-w-lg transition-professional"
                >
                  Stay ahead of the markets with our comprehensive economic calendar. Track important events, set custom alerts, and never miss a market-moving opportunity.
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
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Real-time Updates</span>
                </div>
                <div className="flex items-center gap-3 bg-white/80 backdrop-blur-sm rounded-xl p-4 border border-gray-200 shadow-sm group hover:shadow-md transition-all duration-300 transition-professional">
                  <div className="w-3 h-3 bg-emerald-500 rounded-full animate-pulse group-hover:animate-ping"></div>
                  <span className="text-sm text-gray-700 font-medium group-hover:text-emerald-600 transition-colors">Custom Alerts</span>
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
                      <h3 className="font-bold text-gray-900">Today&apos;s Events</h3>
                      <p className="text-sm text-gray-600">December 15, 2024</p>
                    </div>
                    
                    <div className="flex-1 space-y-3">
                      <div className="bg-red-50 border-l-4 border-red-500 p-3 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">08:30 AM</span>
                          <span className="bg-red-500 text-white px-2 py-1 rounded text-xs">HIGH</span>
                        </div>
                        <p className="text-gray-800 font-medium mt-1">NFP Release</p>
                        <p className="text-gray-600 text-xs">USD - Non-Farm Payrolls</p>
                      </div>
                      
                      <div className="bg-yellow-50 border-l-4 border-yellow-500 p-3 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">10:00 AM</span>
                          <span className="bg-yellow-500 text-white px-2 py-1 rounded text-xs">MED</span>
                        </div>
                        <p className="text-gray-800 font-medium mt-1">ECB Decision</p>
                        <p className="text-gray-600 text-xs">EUR - Interest Rates</p>
                      </div>
                      
                      <div className="bg-green-50 border-l-4 border-green-500 p-3 rounded">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium">02:00 PM</span>
                          <span className="bg-green-500 text-white px-2 py-1 rounded text-xs">LOW</span>
                        </div>
                        <p className="text-gray-800 font-medium mt-1">Retail Sales</p>
                        <p className="text-gray-600 text-xs">GBP - Monthly Change</p>
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
              Powerful Features
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              Everything you need to stay informed about market-moving events
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

      {/* Economic Events Section */}
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
              Today&apos;s Economic Events
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Important market-moving events happening today
            </p>
          </motion.div>

          {/* Filters */}
          <div className="flex flex-wrap gap-4 mb-8 justify-center">
            <div className="flex gap-2">
              <button 
                onClick={() => setSelectedDate("today")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDate === "today" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                Today
              </button>
              <button 
                onClick={() => setSelectedDate("week")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDate === "week" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                This Week
              </button>
              <button 
                onClick={() => setSelectedDate("month")}
                className={`px-4 py-2 rounded-lg font-medium transition-colors ${
                  selectedDate === "month" 
                    ? "bg-emerald-500 text-white" 
                    : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-300"
                }`}
              >
                This Month
              </button>
            </div>
            
            <select 
              value={selectedCurrency}
              onChange={(e) => setSelectedCurrency(e.target.value)}
              className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-700 font-medium focus:outline-none focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Currencies</option>
              <option value="USD">USD</option>
              <option value="EUR">EUR</option>
              <option value="GBP">GBP</option>
              <option value="JPY">JPY</option>
              <option value="CAD">CAD</option>
              <option value="AUD">AUD</option>
            </select>
          </div>

          {/* Events Table */}
          <div className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Time</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Currency</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Event</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Actual</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Forecast</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Previous</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Impact</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {economicEvents.map((event, index) => (
                    <tr key={index} className="hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4 text-sm text-gray-900 font-medium">{event.time}</td>
                      <td className="px-6 py-4">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          {event.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-900">
                        <div className="font-medium">{event.event}</div>
                        <div className="text-gray-500 text-xs">{event.country}</div>
                      </td>
                      <td className="px-6 py-4 text-sm font-medium text-gray-900">{event.actual}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.forecast}</td>
                      <td className="px-6 py-4 text-sm text-gray-600">{event.previous}</td>
                      <td className="px-6 py-4">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium text-white ${getImpactColor(event.impact)}`}>
                          {event.impact.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center mt-12"
          >
            <Button 
              onClick={handleWebTrader} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Set Custom Alerts
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
            Never Miss Important Events
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Stay informed with our comprehensive economic calendar. Set alerts and trade with confidence knowing you&apos;re always up-to-date with market-moving events.
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