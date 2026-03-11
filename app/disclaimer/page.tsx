"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function DisclaimerPage() {
  const handleBackToHome = () => {
    window.location.href = "/";
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
                Disclaimer
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Important legal information regarding the use of our services and website content
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center transition-professional"
            >
              <Button 
                onClick={handleBackToHome} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
              >
                Back to Home
              </Button>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Disclaimer Content */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12"
          >
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">General Information</h2>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                The information provided on this website is for general informational purposes only. 
                All information on the Site is provided in good faith, however we make no representation 
                or warranty of any kind, express or implied, regarding the accuracy, adequacy, validity, 
                reliability, availability or completeness of any information on the Site.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Risk Warning</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Trading financial instruments involves significant risk and can result in the loss of your invested capital. 
                Past performance is not indicative of future results. The value of investments and the income from them 
                can go down as well as up. You may not get back the amount you invested.
              </p>

              <p className="text-gray-700 mb-6 leading-relaxed">
                Before trading, you should carefully consider your investment objectives, level of experience, 
                and risk appetite. The possibility exists that you could sustain a loss of some or all of your 
                initial investment and therefore you should not invest money that you cannot afford to lose.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">No Investment Advice</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                The content on this website is not intended to be, and does not constitute, 
                investment advice, recommendation, or an offer to buy or sell any financial instruments. 
                Any reliance you place on such information is therefore strictly at your own risk.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Professional Guidance</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                We strongly recommend seeking independent professional advice before making any investment decisions. 
                If you have any specific questions about your situation, you should consult with a qualified professional.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Third-Party Content</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                This website may contain links to third-party websites or content which are not investigated, 
                monitored, or checked for accuracy, adequacy, validity, reliability, availability or completeness 
                by us. We do not warrant, endorse, recommend, or assume any responsibility for the content of 
                third-party websites.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Limitation of Liability</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                In no event shall we be liable for any direct, indirect, incidental, special, consequential 
                or punitive damages, including without limitation, loss of profits, data, use, goodwill, 
                or other intangible losses, resulting from (i) your access to or use of or inability to 
                access or use the service; (ii) any conduct or content of any third party on the service; 
                (iii) any content obtained from the service; and (iv) unauthorized access, use or alteration 
                of your transmissions or content.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Changes to Disclaimer</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                We reserve the right, at our sole discretion, to modify or replace this disclaimer at any time. 
                If a revision is material, we will try to provide at least 30 days notice prior to any new 
                terms taking effect. What constitutes a material change will be determined at our sole discretion.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Contact Information</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                If you have any questions about this Disclaimer, please contact us at:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 font-medium">PrimeVest</p>
                <p className="text-gray-600">Email: legal@primevest.com</p>
                <p className="text-gray-600">Phone: +1 (555) 123-4567</p>
              </div>

              <div className="mt-12 pt-8 border-t border-gray-200">
                <p className="text-sm text-gray-500 text-center">
                  Last Updated: February 17, 2026
                </p>
              </div>
            </div>
          </motion.div>

          <motion.div 
            variants={fadeInUp}
            className="mt-12 text-center"
          >
            <Button 
              onClick={handleBackToHome} 
              className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-10 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              Return to Homepage
            </Button>
          </motion.div>
        </div>
      </motion.section>
    </div>
  );
}