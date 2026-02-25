"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";
import { useState } from "react";

export default function FAQPage() {
  const [openQuestion, setOpenQuestion] = useState<number | null>(null);

  const handleBackToHome = () => {
    window.location.href = "/";
  };

  const handleContactSupport = () => {
    window.location.href = "/support";
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
                alt="PrimeVest Capital"
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
                Frequently Asked Questions
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Find answers to common questions about trading, accounts, platforms, and more. 
                Can&apos;t find what you&apos;re looking for? Our support team is here to help.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center transition-professional"
            >
              <Button 
                onClick={handleContactSupport} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
              >
                Contact Support
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

      {/* FAQ Categories */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-6xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-16"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-4 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Browse by Category
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Find answers quickly by selecting a category below
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 mb-20">
            {faqCategories.map((category, index) => (
              <motion.div 
                key={category.id}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                transition={{ delay: 0.1 * index }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10 text-center">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center mb-6 mx-auto group-hover:rotate-6 transition-transform duration-300">
                      <span className="text-3xl">{category.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{category.title}</h3>
                    <p className="text-gray-600">{category.questions.length} questions</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Detailed FAQ List */}
          <div className="space-y-6">
            {faqCategories.map((category) => (
              <motion.div 
                key={category.id}
                variants={fadeInUp}
                className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-3">
                    <span>{category.icon}</span>
                    {category.title}
                  </h3>
                </div>
                
                <div className="divide-y divide-gray-200">
                  {category.questions.map((faq) => (
                    <div key={faq.id} className="transition-colors hover:bg-gray-50">
                      <button
                        onClick={() => toggleQuestion(faq.id)}
                        className="w-full px-6 py-5 text-left flex items-center justify-between group focus:outline-none"
                      >
                        <span className="font-semibold text-gray-900 group-hover:text-emerald-600 transition-colors">
                          {faq.question}
                        </span>
                        <svg 
                          className={"w-5 h-5 text-gray-500 group-hover:text-emerald-500 transition-transform duration-300 " + (openQuestion === faq.id ? 'rotate-180' : '')}
                          fill="none" 
                          stroke="currentColor" 
                          viewBox="0 0 24 24"
                        >
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      <div 
                        className={`overflow-hidden transition-all duration-300 ${
                          openQuestion === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                        }`}
                      >
                        <div className="px-6 pb-5 pt-0">
                          <p className="text-gray-600 leading-relaxed">{faq.answer}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          {/* Still Need Help */}
          <motion.div 
            variants={fadeInUp}
            className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-12 border border-emerald-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Still Need Help?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              Our support team is available 24/7 to assist you with any questions or issues you may have. 
              Get instant help through live chat or contact us directly.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={handleContactSupport} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
              >
                Contact Support Team
              </Button>
              <Button 
                onClick={() => window.location.href = "/support"} 
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-3 rounded-lg bg-transparent transition-all duration-300 font-semibold btn-premium"
              >
                Visit Help Center
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
            Ready to Get Started?
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Join thousands of successful traders on our platform. 
            Open an account today and experience professional trading with our comprehensive support and tools.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={() => window.location.href = "/auth/signup"} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Open Account
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
