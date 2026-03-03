"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Download, Calendar, TrendingUp, TrendingDown, DollarSign, ArrowUpRight, ArrowDownRight } from "lucide-react";
  const supabase = createClient();

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

            description: row.description || row.type || 'Transaction',
            amount: row.amount || '',
            balance: row.balance || '',
            type: row.type === 'credit' ? 'credit' : 'debit',
          }));
          setStatementDataState(mapped);
        } else {
          setStatementDataState(statementData);
        }
      } catch (err) {
        console.error('Failed to fetch transactions', err);
        setStatementDataState(statementData);
      }
    })();
  }, [authLoading, authUser, supabase]);

  if (!isClient || authLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const totalCredits = statementDataState
    .filter(item => item.amount.startsWith("+"))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/[€,+]/g, "")), 0);

  const totalDebits = statementDataState
    .filter(item => item.amount.startsWith("-"))
    .reduce((sum, item) => sum + parseFloat(item.amount.replace(/[€-]/g, "")), 0);

  const netChange = totalCredits - totalDebits;
  const openingBalance = 5000.00;
  const closingBalance = openingBalance + netChange;

  const handleExport = () => {
    // Simulate export functionality
    const filename = `statement-${selectedMonth.toLowerCase().replace(' ', '-')}.${exportFormat}`;
    console.log(`Exporting statement as ${filename}`);
    // In a real implementation, this would generate and download the file
    alert(`Statement exported as ${filename}`);
  };

  const months = ["January 2024", "February 2024", "March 2024", "December 2023"];
  
  const navigateMonth = (direction: 'prev' | 'next') => {
    const currentIndex = months.indexOf(selectedMonth);
    if (direction === 'prev' && currentIndex > 0) {
      setSelectedMonth(months[currentIndex - 1]);
    } else if (direction === 'next' && currentIndex < months.length - 1) {
      setSelectedMonth(months[currentIndex + 1]);
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
            <Link href="/dashboard" className="flex items-center group">
              <svg className="w-6 h-6 mr-3 text-gray-600 group-hover:text-emerald-600 transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
              </svg>
              <span className="text-sm font-medium text-gray-500 mr-3">ACCOUNT</span>
              <h1 className="text-xl font-bold text-gray-900">Account Statement</h1>
            </Link>
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.8 }}
            className="flex items-center gap-3"
          >
            <Button 
              onClick={() => setIsSidebarOpen(true)}
              className="bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </Button>
          </motion.div>
        </div>
      </motion.header>

      {/* Hero Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="relative py-16 px-4 md:px-8 bg-gradient-to-br from-emerald-50 via-blue-50 to-purple-50 border-b border-gray-200 overflow-hidden"
      >
        <div className="absolute inset-0">
          <div className="absolute top-1/4 left-1/4 w-64 h-64 bg-emerald-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse"></div>
          <div className="absolute bottom-1/3 right-1/4 w-72 h-72 bg-blue-500/10 rounded-full mix-blend-soft-light filter blur-3xl animate-pulse delay-1000"></div>
        </div>
        
        <div className="max-w-4xl mx-auto relative z-10">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-8"
          >
            <h1 className="text-4xl md:text-5xl font-bold text-gray-900 leading-tight mb-4">
              Account Statement
            </h1>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Track your trading activity and account balance over time
            </p>
          </motion.div>

          {/* Month Selector */}
          <motion.div 
            variants={fadeInUp}
            className="flex justify-center"
          >
            <div className="bg-white rounded-2xl shadow-lg border border-gray-200 p-2 flex items-center gap-2">
              <Button
                onClick={() => navigateMonth('prev')}
                disabled={months.indexOf(selectedMonth) === 0}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="ghost"
                size="sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                </svg>
              </Button>
              
              <div className="px-6 py-3 min-w-[150px] text-center">
                <div className="flex items-center justify-center gap-2">
                  <Calendar className="w-5 h-5 text-emerald-600" />
                  <span className="font-semibold text-gray-900">{selectedMonth}</span>
                </div>
              </div>
              
              <Button
                onClick={() => navigateMonth('next')}
                disabled={months.indexOf(selectedMonth) === months.length - 1}
                className="p-2 rounded-lg hover:bg-gray-100 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                variant="ghost"
                size="sm"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </Button>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Summary Cards */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-12 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8"
          >
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <DollarSign className="w-6 h-6 text-blue-600" />
                </div>
                <span className="text-sm text-gray-500">Opening</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">€{openingBalance.toFixed(2)}</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <ArrowUpRight className="w-6 h-6 text-emerald-600" />
                </div>
                <span className="text-sm text-gray-500">Credits</span>
              </div>
              <div className="text-2xl font-bold text-emerald-600">+€{totalCredits.toFixed(2)}</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-6 shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 bg-red-100 rounded-xl flex items-center justify-center">
                  <ArrowDownRight className="w-6 h-6 text-red-600" />
                </div>
                <span className="text-sm text-gray-500">Debits</span>
              </div>
              <div className="text-2xl font-bold text-red-600">-€{totalDebits.toFixed(2)}</div>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-gradient-to-br from-emerald-50 to-blue-50 rounded-2xl p-6 shadow-lg border border-emerald-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={`w-12 h-12 ${netChange >= 0 ? 'bg-emerald-100' : 'bg-red-100'} rounded-xl flex items-center justify-center`}>
                  {netChange >= 0 ? 
                    <TrendingUp className="w-6 h-6 text-emerald-600" /> : 
                    <TrendingDown className="w-6 h-6 text-red-600" />
                  }
                </div>
                <span className="text-sm text-gray-500">Closing</span>
              </div>
              <div className={`text-2xl font-bold ${netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                €{closingBalance.toFixed(2)}
              </div>
              <div className={`text-sm mt-1 ${netChange >= 0 ? 'text-emerald-600' : 'text-red-600'}`}>
                {netChange >= 0 ? '+' : ''}€{netChange.toFixed(2)} net change
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Transaction Table */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-8 px-4 md:px-8"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-2xl shadow-lg border border-gray-200 overflow-hidden"
          >
            <div className="bg-gradient-to-r from-gray-50 to-gray-100 px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-bold text-gray-900">Transaction Details</h2>
            </div>
            
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Date</th>
                    <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Description</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Amount</th>
                    <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {statementDataState.map((item, index) => (
                    <motion.tr 
                      key={item.id}
                      variants={fadeInUp}
                      whileHover={{ backgroundColor: "rgba(16, 185, 129, 0.05)" }}
                      className="transition-colors"
                    >
                      <td className="px-6 py-4">
                        <div className="text-sm font-medium text-gray-900">{item.date}</div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="text-sm text-gray-900">{item.description}</div>
                      </td>
                      <td className="px-6 py-4 text-right">
                        {item.amount && (
                          <span className={`inline-flex items-center px-2 py-1 rounded-full text-sm font-medium ${
                            item.type === 'credit' 
                              ? 'bg-emerald-100 text-emerald-800' 
                              : 'bg-red-100 text-red-800'
                          }`}>
                            {item.type === 'credit' ? '+' : '-'}€{Math.abs(parseFloat(item.amount.replace(/[€,+]/g, ''))).toFixed(2)}
                          </span>
                        )}
                      </td>
                      <td className="px-6 py-4 text-right">
                        <div className="text-sm font-semibold text-gray-900">
                          {item.balance || '—'}
                        </div>
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      </motion.section>

      {/* Export Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-12 px-4 md:px-8"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-8 border border-emerald-200"
          >
            <div className="flex flex-col lg:flex-row items-center justify-between gap-6">
              <div className="text-center lg:text-left">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">Export Your Statement</h3>
                <p className="text-gray-600">Download your account statement in your preferred format for record-keeping</p>
              </div>
              
              <div className="flex flex-col sm:flex-row items-center gap-4">
                <select
                  value={exportFormat}
                  onChange={(e) => setExportFormat(e.target.value)}
                  className="px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                >
                  <option value="pdf">PDF Document</option>
                  <option value="csv">CSV Spreadsheet</option>
                  <option value="excel">Excel File</option>
                </select>
                
                <Button 
                  onClick={handleExport}
                  className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 flex items-center gap-2"
                >
                  <Download className="w-5 h-5" />
                  Download Statement
                </Button>
              </div>
            </div>
          </motion.div>
        </div>
      </motion.section>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />
    </div>
  );
}

