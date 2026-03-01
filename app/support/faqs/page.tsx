"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";
import { Search, ChevronDown, ChevronUp, MessageCircle, Mail, Phone } from "lucide-react";

export default function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<string>("all");
  const [expandedCategories, setExpandedCategories] = useState<string[]>(["getting-started"]);

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    window.location.href = "/support";
  };

  const toggleQuestion = (questionId: number) => {
    setOpenQuestion(openQuestion === questionId ? null : questionId);
  };

  const toggleCategory = (categoryId: string) => {
    setExpandedCategories(prev => 
      prev.includes(categoryId) 
        ? prev.filter(id => id !== categoryId)
        : [...prev, categoryId]
    );
  };

  const filteredCategories = faqCategories.map(category => ({
    ...category,
    questions: category.questions.filter(q => 
      q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
      q.answer.toLowerCase().includes(searchTerm.toLowerCase())
    )
  })).filter(category => 
    (selectedCategory === "all" || category.id === selectedCategory) &&
    category.questions.length > 0
  );

  const allQuestions = faqCategories.flatMap(cat => cat.questions);
  const searchResults = searchTerm 
    ? allQuestions.filter(q => 
        q.question.toLowerCase().includes(searchTerm.toLowerCase()) ||
        q.answer.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : [];

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

  const faqCategories = [
    {
      id: "getting-started",
      title: "Getting Started",
      icon: "🚀",
      questions: [
        {
          id: 1,
          question: "How do I create an account?",
          answer: "Creating an account is simple and takes less than 2 minutes. Click 'Open Account' on our homepage, provide your basic information, verify your email address, and complete the identity verification process. Once approved, you can deposit funds and start trading."
        },
        {
          id: 2,
          question: "What documents do I need for verification?",
          answer: "You'll need a government-issued photo ID (passport, driver's license, or national ID card) and proof of address (utility bill, bank statement, or government document issued within the last 3 months). All documents must be clear, readable, and not expired."
        },
        {
          id: 3,
          question: "Is there a minimum deposit requirement?",
          answer: "Yes, the minimum deposit is $100 or equivalent in your preferred currency. This allows you to start trading with sufficient capital while maintaining responsible trading practices."
        }
      ]
    },
    {
      id: "trading",
      title: "Trading",
      icon: "📈",
      questions: [
        {
          id: 4,
          question: "What trading instruments are available?",
          answer: "We offer over 300 trading instruments including 90+ forex pairs, 150+ cryptocurrencies, 50+ stock indices, 40+ commodities, precious metals, and more. Access global markets from a single platform."
        },
        {
          id: 5,
          question: "What are the trading hours?",
          answer: "Trading hours vary by instrument: Forex markets are open 24/5 (Sunday 22:00 GMT to Friday 22:00 GMT), Stock indices follow their respective exchange hours, Cryptocurrencies trade 24/7, and Commodities have specific trading sessions."
        },
        {
          id: 6,
          question: "What are the spreads and commissions?",
          answer: "We offer competitive spreads starting from 0.0 pips on major forex pairs with no hidden commissions. Precious metals and commodities have low fixed spreads, while cryptocurrency trading includes small transparent fees."
        }
      ]
    },
    {
      id: "platforms",
      title: "Platforms & Tools",
      icon: "💻",
      questions: [
        {
          id: 7,
          question: "Which trading platforms do you offer?",
          answer: "We provide multiple platforms including MetaTrader 4, MetaTrader 5, our web-based PrimeVest Capital platform, and mobile apps for iOS and Android. All platforms offer the same competitive pricing and execution quality."
        },
        {
          id: 8,
          question: "Is there a demo account available?",
          answer: "Yes, we offer a free demo account with $10,000 virtual funds. This allows you to practice trading strategies, test our platforms, and familiarize yourself with our tools without risking real money."
        },
        {
          id: 9,
          question: "What analytical tools are provided?",
          answer: "Our platforms include advanced charting tools with 100+ technical indicators, real-time market news, economic calendar, market analysis, and AI-powered trading signals. We also provide educational resources and market insights."
        }
      ]
    },
    {
      id: "funding",
      title: "Deposits & Withdrawals",
      icon: "💰",
      questions: [
        {
          id: 10,
          question: "What payment methods are accepted?",
          answer: "We accept major credit/debit cards (Visa, Mastercard), bank transfers, e-wallets (PayPal, Skrill, Neteller), and cryptocurrency payments. All methods are secure and processed through encrypted channels."
        },
        {
          id: 11,
          question: "How long do deposits take?",
          answer: "Credit/debit card deposits are instant, e-wallets typically process within minutes, bank transfers may take 1-3 business days, and cryptocurrency deposits are confirmed within minutes depending on network congestion."
        },
        {
          id: 12,
          question: "Are there withdrawal fees?",
          answer: "Most withdrawal methods are free of charge. However, some payment providers may charge their own fees. Bank transfers over $500 are free, while smaller amounts may have nominal processing fees."
        }
      ]
    },
    {
      id: "security",
      title: "Security & Regulation",
      icon: "🔒",
      questions: [
        {
          id: 13,
          question: "Is my money safe with PrimeVest Capital?",
          answer: "Yes, client funds are held in segregated accounts with top-tier European banks. We're regulated by relevant financial authorities and maintain strict compliance with international standards. Additionally, we have comprehensive insurance coverage."
        },
        {
          id: 14,
          question: "What regulatory licenses do you hold?",
          answer: "We are regulated by [Regulatory Authority] with license number [XXX]. We comply with MiFID II regulations and maintain the highest standards of financial conduct and client protection."
        },
        {
          id: 15,
          question: "How is my personal data protected?",
          answer: "We use bank-level encryption (256-bit SSL) to protect all data transmission. Personal information is stored securely with restricted access, and we never share client data with third parties without explicit consent."
        }
      ]
    },
    {
      id: "support",
      title: "Support & Assistance",
      icon: "🎧",
      questions: [
        {
          id: 16,
          question: "What support options are available?",
          answer: "We offer 24/7 multilingual customer support via live chat, email, and phone. Our support team is available in English, German, French, Spanish, and Italian with average response times under 5 minutes."
        },
        {
          id: 17,
          question: "Do you provide educational resources?",
          answer: "Yes, we offer comprehensive educational materials including trading guides, video tutorials, webinars, market analysis, and trading strategies. Our PrimeVest Academy helps both beginners and experienced traders improve their skills."
        },
        {
          id: 18,
          question: "How can I contact customer support?",
          answer: "Visit our Support page to access live chat (available 24/7), send an email to support@bitpandapro.com, or call our toll-free number. You can also check our Help Center for instant answers to common questions."
        }
      ]
    }
  ];

  const toggleQuestion = (id: number) => {
    setOpenQuestion(openQuestion === id ? null : id);
  };

  const toggleCategory = (id: string) => {
    if (expandedCategories.includes(id)) {
      setExpandedCategories(expandedCategories.filter((categoryId) => categoryId !== id));
    } else {
      setExpandedCategories([...expandedCategories, id]);
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
              onClick={handleContactSupport}
              className="hidden sm:block bg-white hover:bg-gray-50 text-gray-900 px-4 py-2 rounded-lg border border-gray-300 font-medium text-sm transition-colors"
            >
              Contact Support
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
                className="text-5xl md:text-6xl font-bold text-gray-900 leading-tight"
              >
                Frequently Asked Questions
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-xl text-gray-600 max-w-2xl mx-auto"
              >
                Find answers to common questions about our platform and services
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center"
            >
              <Button 
                onClick={handleContactSupport} 
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-8 py-4 text-lg rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1"
              >
                Contact Support
              </Button>
              <Button 
                onClick={handleBackToHome} 
                className="border-2 border-emerald-600 text-emerald-600 hover:bg-emerald-600/10 px-8 py-4 text-lg rounded-lg bg-transparent font-semibold transition-all duration-300"
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Search Section */}
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
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">How Can We Help?</h2>
            <p className="text-lg text-gray-600">Search for answers or browse by category</p>
          </motion.div>

          {/* Search Bar */}
          <motion.div 
            variants={fadeInUp}
            className="mb-8"
          >
            <div className="relative max-w-2xl mx-auto">
              <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search for answers..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-12 pr-4 py-4 border border-gray-300 rounded-2xl focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent bg-white shadow-lg"
              />
            </div>
          </motion.div>

          {/* Category Filter */}
          <motion.div 
            variants={fadeInUp}
            className="flex flex-wrap justify-center gap-3 mb-12"
          >
            <Button
              onClick={() => setSelectedCategory("all")}
              className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                selectedCategory === "all"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "bg-gray-100 text-gray-600 hover:bg-gray-200"
              }`}
            >
              All Categories
            </Button>
            {faqCategories.map((category) => (
              <Button
                key={category.id}
                onClick={() => setSelectedCategory(category.id)}
                className={`px-6 py-2 rounded-full font-medium transition-all duration-300 ${
                  selectedCategory === category.id
                    ? "bg-emerald-600 text-white shadow-lg"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <span className="mr-2">{category.icon}</span>
                {category.title}
              </Button>
            ))}
          </motion.div>

          {/* Search Results */}
          {searchTerm && searchResults.length > 0 && (
            <motion.div 
              variants={fadeInUp}
              className="mb-12"
            >
              <h3 className="text-xl font-semibold text-gray-900 mb-6">Search Results ({searchResults.length})</h3>
              <div className="space-y-4">
                {searchResults.map((result) => (
                  <motion.div
                    key={result.id}
                    variants={fadeInUp}
                    className="bg-white rounded-xl border border-gray-200 p-6 shadow-lg hover:shadow-xl transition-all duration-300"
                  >
                    <button
                      onClick={() => toggleQuestion(result.id)}
                      className="w-full text-left"
                    >
                      <div className="flex items-center justify-between">
                        <h4 className="text-lg font-semibold text-gray-900">{result.question}</h4>
                        {openQuestion === result.id ? (
                          <ChevronUp className="w-5 h-5 text-emerald-600" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </button>
                    {openQuestion === result.id && (
                      <motion.div 
                        initial={{ opacity: 0, height: 0 }}
                        animate={{ opacity: 1, height: "auto" }}
                        transition={{ duration: 0.3 }}
                        className="mt-4 pt-4 border-t border-gray-100"
                      >
                        <p className="text-gray-600 leading-relaxed">{result.answer}</p>
                      </motion.div>
                    )}
                  </motion.div>
                ))}
              </div>
            </motion.div>
          )}

          {/* No Results */}
          {searchTerm && searchResults.length === 0 && (
            <motion.div 
              variants={fadeInUp}
              className="text-center py-12"
            >
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-10 h-10 text-gray-400" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 mb-2">No results found</h3>
              <p className="text-gray-600">Try searching with different keywords or browse our categories</p>
            </motion.div>
          )}
        </div>
      </motion.section>

      {/* FAQ Categories */}
      {!searchTerm && (
        <motion.section 
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="py-16 px-4 md:px-8 bg-white"
        >
          <div className="max-w-4xl mx-auto">
            <div className="space-y-8">
              {filteredCategories.map((category, categoryIndex) => (
                <motion.div
                  key={category.id}
                  variants={fadeInUp}
                  transition={{ delay: 0.1 * categoryIndex }}
                  className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
                >
                  {/* Category Header */}
                  <button
                    onClick={() => toggleCategory(category.id)}
                    className="w-full px-8 py-6 bg-gradient-to-r from-gray-50 to-white border-b border-gray-200 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                          <span className="text-2xl">{category.icon}</span>
                        </div>
                        <div className="text-left">
                          <h3 className="text-xl font-bold text-gray-900">{category.title}</h3>
                          <p className="text-sm text-gray-600">{category.questions.length} questions</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {expandedCategories.includes(category.id) ? (
                          <ChevronUp className="w-5 h-5 text-gray-400" />
                        ) : (
                          <ChevronDown className="w-5 h-5 text-gray-400" />
                        )}
                      </div>
                    </div>
                  </button>

                  {/* Questions */}
                  {expandedCategories.includes(category.id) && (
                    <motion.div 
                      initial={{ opacity: 0, height: 0 }}
                      animate={{ opacity: 1, height: "auto" }}
                      transition={{ duration: 0.3 }}
                      className="px-8 py-6"
                    >
                      <div className="space-y-4">
                        {category.questions.map((qa, questionIndex) => (
                          <motion.div
                            key={qa.id}
                            variants={fadeInUp}
                            transition={{ delay: 0.05 * questionIndex }}
                            className="bg-white rounded-xl border border-gray-200 p-6 hover:border-emerald-200 transition-all duration-300"
                          >
                            <button
                              onClick={() => toggleQuestion(qa.id)}
                              className="w-full text-left"
                            >
                              <div className="flex items-center justify-between">
                                <h4 className="text-lg font-semibold text-gray-900">{qa.question}</h4>
                                {openQuestion === qa.id ? (
                                  <ChevronUp className="w-5 h-5 text-emerald-600" />
                                ) : (
                                  <ChevronDown className="w-5 h-5 text-gray-400" />
                                )}
                              </div>
                            </button>
                            {openQuestion === qa.id && (
                              <motion.div 
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                transition={{ duration: 0.3 }}
                                className="mt-4 pt-4 border-t border-gray-100"
                              >
                                <p className="text-gray-600 leading-relaxed">{qa.answer}</p>
                              </motion.div>
                            )}
                          </motion.div>
                        ))}
                      </div>
                    </motion.div>
                  )}
                </motion.div>
              ))}
            </div>
          </div>
        </motion.section>
      )}

      {/* Contact Support Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-20 px-4 md:px-8 bg-gradient-to-r from-emerald-50 to-blue-50"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-12"
          >
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">Still Need Help?</h2>
            <p className="text-lg text-gray-600 max-w-2xl mx-auto">
              Our support team is here to help you with any questions or concerns
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-emerald-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <MessageCircle className="w-8 h-8 text-emerald-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Live Chat</h3>
              <p className="text-gray-600 mb-6">Get instant help from our support team</p>
              <Button 
                onClick={handleContactSupport}
                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Start Chat
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-blue-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Mail className="w-8 h-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Email Support</h3>
              <p className="text-gray-600 mb-6">Send us a message and we&apos;ll respond within 24 hours</p>
              <Button 
                onClick={() => window.location.href = "mailto:support@bitpanda.com"}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Send Email
              </Button>
            </motion.div>

            <motion.div
              variants={fadeInUp}
              whileHover={{ y: -5 }}
              className="bg-white rounded-2xl p-8 text-center shadow-lg border border-gray-200 hover:shadow-2xl transition-all duration-300"
            >
              <div className="w-16 h-16 bg-purple-100 rounded-xl flex items-center justify-center mx-auto mb-6">
                <Phone className="w-8 h-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">Phone Support</h3>
              <p className="text-gray-600 mb-6">Call us for immediate assistance</p>
              <Button 
                onClick={() => window.location.href = "tel:+1234567890"}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors"
              >
                Call Now
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.section>
    </div>
  );
}
