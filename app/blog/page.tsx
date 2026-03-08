"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function BlogPage() {
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

  const categories = [
    { id: "all", name: "All Posts", count: 47 },
    { id: "trading", name: "Trading", count: 18 },
    { id: "market-analysis", name: "Market Analysis", count: 12 },
    { id: "education", name: "Education", count: 9 },
    { id: "news", name: "News", count: 8 }
  ];

  const blogPosts = [
    {
      id: 1,
      title: "Mastering Technical Analysis: A Complete Beginner's Guide",
      excerpt: "Learn the fundamentals of technical analysis, from basic chart patterns to advanced indicators. This comprehensive guide covers everything you need to start analyzing markets like a pro.",
      category: "education",
      author: "Sarah Johnson",
      date: "2024-02-15",
      readTime: "8 min read",
      image: "/btc-logo.png",
      featured: true
    },
    {
      id: 2,
      title: "Forex Market Outlook: Key Trends to Watch in 2024",
      excerpt: "Expert analysis of the forex markets, including major currency pairs, economic factors, and trading opportunities for the coming year. Stay ahead with our professional insights.",
      category: "market-analysis",
      author: "Michael Chen",
      date: "2024-02-12",
      readTime: "6 min read",
      image: "/eth-logo.png",
      featured: true
    },
    {
      id: 3,
      title: "Cryptocurrency Trading Strategies for Volatile Markets",
      excerpt: "Navigate the volatile crypto markets with proven strategies. Learn risk management techniques, position sizing, and timing methods that professional traders use.",
      category: "trading",
      author: "David Rodriguez",
      date: "2024-02-10",
      readTime: "10 min read",
      image: "/bnb-logo.png"
    },
    {
      id: 4,
      title: "Understanding Market Sentiment and How to Use It",
      excerpt: "Market sentiment can be a powerful trading tool. Discover how to measure sentiment, interpret indicators, and incorporate sentiment analysis into your trading strategy.",
      category: "market-analysis",
      author: "Emma Thompson",
      date: "2024-02-08",
      readTime: "7 min read",
      image: "/sol-logo.png"
    },
    {
      id: 5,
      title: "Risk Management: The Foundation of Successful Trading",
      excerpt: "Learn why risk management is crucial for long-term trading success. Discover position sizing techniques, stop-loss strategies, and how to protect your capital effectively.",
      category: "education",
      author: "James Wilson",
      date: "2024-02-05",
      readTime: "9 min read",
      image: "/xrp-logo.png"
    },
    {
      id: 6,
      title: "Commodity Trading: Opportunities in Gold and Oil Markets",
      excerpt: "Explore trading opportunities in commodity markets. Understand the factors that drive gold and oil prices, and learn strategies for trading these essential assets.",
      category: "trading",
      author: "Lisa Anderson",
      date: "2024-02-03",
      readTime: "11 min read",
      image: "/ada-logo.png"
    }
  ];

  const filteredPosts = selectedCategory === "all" 
    ? blogPosts 
    : blogPosts.filter(post => post.category === selectedCategory);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
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
                className="text-display font-bold text-gray-900 leading-tight bg-gradient-to-r from-gray-900 via-emerald-600 to-emerald-700 bg-clip-text text-transparent transition-professional"
              >
                Trading Blog
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Expert insights, market analysis, and educational content to help you become a better trader. 
                Stay informed with our latest articles and trading strategies.
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
          </motion.div>
        </div>
      </motion.section>

      {/* Blog Content */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          {/* Category Filters */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap gap-3 mb-16 justify-center"
          >
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
          </motion.div>

          {/* Featured Posts */}
          <motion.div 
            variants={fadeInUp}
            className="mb-20"
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">Featured Articles</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {filteredPosts.filter(post => post.featured).map((post, index) => (
                <motion.div
                  key={post.id}
                  variants={fadeInUp}
                  whileHover={{ y: -5 }}
                  transition={{ delay: 0.1 * index }}
                  className="group relative"
                >
                  <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col card-premium">
                    <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                    
                    {/* Image placeholder */}
                    <div className="h-64 bg-gradient-to-br from-gray-100 to-gray-200 relative overflow-hidden">
                      <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                      <div className="absolute top-4 left-4">
                        <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                          {post.category.replace('-', ' ')}
                        </span>
                      </div>
                      <div className="absolute bottom-4 left-4 right-4">
                        <h3 className="text-xl font-bold text-white mb-2 group-hover:text-emerald-300 transition-colors">
                          {post.title}
                        </h3>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div className="flex items-center gap-4">
                          <span>By {post.author}</span>
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* All Posts */}
          <motion.div 
            variants={fadeInUp}
          >
            <h2 className="text-3xl font-bold text-gray-900 mb-8 text-center">
              {selectedCategory === 'all' ? 'All Articles' : `${categories.find(c => c.id === selectedCategory)?.name} Articles`}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
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
                      <div className="absolute top-3 left-3">
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800 capitalize">
                          {post.category.replace('-', ' ')}
                        </span>
                      </div>
                    </div>
                    
                    <div className="p-6 flex-1 flex flex-col">
                      <h3 className="text-lg font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300">
                        {post.title}
                      </h3>
                      <p className="text-gray-600 mb-4 flex-1">{post.excerpt}</p>
                      <div className="flex items-center justify-between text-sm text-gray-500">
                        <div>
                          <span>By {post.author}</span>
                          <span className="mx-2">•</span>
                          <span>{formatDate(post.date)}</span>
                        </div>
                        <span>{post.readTime}</span>
                      </div>
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </motion.div>

          {/* Newsletter Signup */}
          <motion.div 
            variants={fadeInUp}
            className="mt-20 bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-12 text-center border border-emerald-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Stay Updated</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Get the latest trading insights, market analysis, and educational content delivered to your inbox.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
              <input
                type="email"
                placeholder="Enter your email"
                className="flex-1 bg-white border border-gray-300 rounded-lg px-4 py-3 text-gray-900 placeholder-gray-500 focus:outline-none focus:border-emerald-500 focus:ring-2 focus:ring-emerald-200 transition"
              />
              <Button className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-3 rounded-lg font-semibold transition-colors whitespace-nowrap">
                Subscribe
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
            Ready to Apply What You&apos;ve Learned?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Put your knowledge into practice with our professional trading platform. 
            Access real markets, advanced tools, and expert support to enhance your trading journey.
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