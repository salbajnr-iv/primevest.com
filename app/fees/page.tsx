"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";

const feeSections = [
  {
    title: "Cryptocurrency Trading",
    description: "Trade cryptocurrencies with low fees",
    fees: [
      { volume: "€0 - €10,000", maker: "0.15%", taker: "0.15%" },
      { volume: "€10,000 - €50,000", maker: "0.10%", taker: "0.12%" },
      { volume: "€50,000 - €100,000", maker: "0.08%", taker: "0.10%" },
      { volume: "€100,000+", maker: "0.05%", taker: "0.08%" },
    ]
  },
  {
    title: "Stock & ETF Trading",
    description: "Trade stocks and ETFs with zero commission",
    fees: [
      { volume: "All volumes", maker: "€0", taker: "€0", note: "CFD spread applies" },
    ]
  },
  {
    title: "Metals Trading",
    description: "Trade precious metals",
    fees: [
      { volume: "All volumes", maker: "0.20%", taker: "0.25%" },
    ]
  },
  {
    title: "Leverage Trading",
    description: "Trade with leverage",
    fees: [
      { volume: "Funding rate", maker: "0.01% / 4h", taker: "0.01% / 4h" },
    ]
  },
];

const depositMethods = [
  { method: "SEPA Bank Transfer", fee: "Free", time: "1-2 business days" },
  { method: "Credit/Debit Card", fee: "2.5%", time: "Instant" },
  { method: "Skrill", fee: "1%", time: "Instant" },
  { method: "Neteller", fee: "1%", time: "Instant" },
  { method: "Apple Pay", fee: "1.5%", time: "Instant" },
  { method: "Google Pay", fee: "1.5%", time: "Instant" },
];

const withdrawalMethods = [
  { method: "SEPA Bank Transfer", fee: "€1", time: "1-2 business days" },
  { method: "Crypto Withdrawal", fee: "Network fee", time: "15-30 minutes" },
];

export default function FeesPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeTab, setActiveTab] = React.useState("trading");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

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

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

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
              <span className="text-sm font-medium text-gray-500 mr-3">INFO</span>
              <h1 className="text-xl font-bold text-gray-900">Fees & Pricing</h1>
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
              Start Trading
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-20 px-4 md:px-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-b border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10 text-center">
          <motion.div 
            variants={fadeInUp}
            className="space-y-8"
          >
            <div className="space-y-6">
              <motion.h1 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 via-emerald-600 to-blue-600 bg-clip-text text-transparent"
              >
                Transparent Pricing
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Simple, competitive fees with no hidden costs. Clear pricing that helps you trade with confidence.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
            >
              <Button 
                onClick={() => window.location.href = "/dashboard/trade"}
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Start Trading Now
              </Button>
              <Button 
                onClick={() => setActiveTab("trading")}
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-4 text-lg rounded-lg bg-transparent transition-all duration-300 font-semibold"
              >
                View Fee Structure
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Fee Navigation Tabs */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-8 px-4 md:px-8 bg-white border-b border-gray-200"
      >
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-wrap justify-center gap-2">
            {["trading", "deposit", "withdrawal", "discounts"].map((tab) => (
              <Button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 ${
                  activeTab === tab
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                {tab === "trading" && "Trading Fees"}
                {tab === "deposit" && "Deposit Fees"}
                {tab === "withdrawal" && "Withdrawal Fees"}
                {tab === "discounts" && "Fee Discounts"}
              </Button>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Trading Fees Section */}
      {activeTab === "trading" && (
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Trading Fee Structure</h2>
              <p className="text-lg text-gray-600 max-w-2xl mx-auto">
                Competitive tiered pricing that rewards active traders with lower fees
              </p>
            </motion.div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {feeSections.map((section, index) => (
                <motion.div
                  key={index}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ delay: 0.1 * index }}
                  className="bg-white rounded-2xl border border-gray-200 shadow-lg hover:shadow-2xl transition-all duration-300 overflow-hidden"
                >
                  <div className="bg-gradient-to-r from-emerald-50 to-blue-50 p-6 border-b border-gray-200">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{section.title}</h3>
                    <p className="text-gray-600">{section.description}</p>
                  </div>
                  
                  <div className="p-6">
                    <div className="space-y-4">
                      {section.fees.map((fee, feeIndex) => (
                        <div key={feeIndex} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-emerald-50 transition-colors">
                          <div className="flex-1">
                            <div className="font-semibold text-gray-900">{fee.volume}</div>
                            {"note" in fee && (
                              <div className="text-sm text-gray-500 mt-1">{fee.note}</div>
                            )}
                          </div>
                          <div className="flex gap-4">
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Maker</div>
                              <div className="font-bold text-emerald-600">{fee.maker}</div>
                            </div>
                            <div className="text-center">
                              <div className="text-xs text-gray-500 uppercase tracking-wide">Taker</div>
                              <div className="font-bold text-blue-600">
                                {"note" in fee && fee.note ? fee.note : fee.taker}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Deposit Fees Section */}
      {activeTab === "deposit" && (
        <motion.section 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Deposit Methods</h2>
              <p className="text-lg text-gray-600">Choose from multiple convenient deposit options</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Payment Method</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Fee</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {depositMethods.map((method, index) => (
                      <motion.tr 
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{method.method}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            method.fee === "Free" 
                              ? "bg-emerald-100 text-emerald-800" 
                              : "bg-yellow-100 text-yellow-800"
                          }`}>
                            {method.fee}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-600">{method.time}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Withdrawal Fees Section */}
      {activeTab === "withdrawal" && (
        <motion.section 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="py-16 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white"
        >
          <div className="max-w-4xl mx-auto">
            <motion.div 
              variants={fadeInUp}
              className="text-center mb-12"
            >
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Withdrawal Methods</h2>
              <p className="text-lg text-gray-600">Fast and secure withdrawal options</p>
            </motion.div>

            <motion.div 
              variants={fadeInUp}
              className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
            >
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Withdrawal Method</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Fee</th>
                      <th className="px-6 py-4 text-center text-sm font-semibold text-gray-900">Processing Time</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-200">
                    {withdrawalMethods.map((method, index) => (
                      <motion.tr 
                        key={index}
                        variants={fadeInUp}
                        whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                        className="transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">{method.method}</div>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className={`inline-flex px-3 py-1 rounded-full text-sm font-medium ${
                            method.fee.includes("€") 
                              ? "bg-yellow-100 text-yellow-800" 
                              : "bg-blue-100 text-blue-800"
                          }`}>
                            {method.fee}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-center">
                          <span className="text-gray-600">{method.time}</span>
                        </td>
                      </motion.tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}

      {/* Fee Discounts Section */}
      {activeTab === "discounts" && (
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
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Save on Trading Fees</h2>
              <p className="text-lg text-gray-600">Get discounts and trade more for less</p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-12">
              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-emerald-50 to-emerald-100 rounded-2xl p-8 border border-emerald-200 shadow-lg"
              >
                <div className="w-16 h-16 bg-emerald-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">💎</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">BEST Token Discount</h3>
                <p className="text-gray-700 mb-6">
                  Hold BEST tokens to unlock up to 50% discount on trading fees. The more you hold, the more you save.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hold 1,000+ BEST</span>
                    <span className="font-bold text-emerald-600">25% discount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hold 5,000+ BEST</span>
                    <span className="font-bold text-emerald-600">35% discount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">Hold 10,000+ BEST</span>
                    <span className="font-bold text-emerald-600">50% discount</span>
                  </div>
                </div>
              </motion.div>

              <motion.div
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-8 border border-blue-200 shadow-lg"
              >
                <div className="w-16 h-16 bg-blue-600 rounded-2xl flex items-center justify-center mb-6">
                  <span className="text-3xl">📈</span>
                </div>
                <h3 className="text-2xl font-bold text-gray-900 mb-4">Volume-Based Discounts</h3>
                <p className="text-gray-700 mb-6">
                  Trade more to unlock lower fees. Our tiered pricing rewards active traders with better rates.
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">€50K+ Monthly Volume</span>
                    <span className="font-bold text-blue-600">10% discount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">€250K+ Monthly Volume</span>
                    <span className="font-bold text-blue-600">20% discount</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-gray-600">€1M+ Monthly Volume</span>
                    <span className="font-bold text-blue-600">30% discount</span>
                  </div>
                </div>
              </motion.div>
            </div>

            <motion.div 
              variants={fadeInUp}
              className="bg-gradient-to-r from-yellow-50 to-orange-50 rounded-2xl p-8 border border-yellow-200"
            >
              <div className="flex items-start gap-4">
                <div className="w-12 h-12 bg-yellow-500 rounded-xl flex items-center justify-center flex-shrink-0">
                  <span className="text-2xl">⚠️</span>
                </div>
                <div>
                  <h4 className="text-xl font-bold text-gray-900 mb-3">Important Information</h4>
                  <div className="space-y-2 text-gray-700">
                    <p>• Fees may vary based on market conditions and payment method</p>
                    <p>• Always check the final fee before confirming any transaction</p>
                    <p>• CFD trading involves significant risk and may not be suitable for all investors</p>
                    <p>• Fee discounts are applied automatically and reflected in your trading interface</p>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </motion.section>
      )}
      
      <BottomNav />
    </div>
  );
}
