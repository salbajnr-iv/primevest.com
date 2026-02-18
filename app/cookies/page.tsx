"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CookiesPage() {
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

  const cookieCategories = [
    {
      name: "Essential Cookies",
      description: "These cookies are necessary for the website to function properly and cannot be switched off.",
      cookies: [
        {
          name: "session_id",
          purpose: "Maintains user session and authentication",
          duration: "Until session ends"
        },
        {
          name: "csrf_token",
          purpose: "Security protection against CSRF attacks",
          duration: "Until session ends"
        }
      ]
    },
    {
      name: "Analytics Cookies",
      description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously.",
      cookies: [
        {
          name: "_ga",
          purpose: "Google Analytics to track visitor usage and behavior",
          duration: "2 years"
        },
        {
          name: "_gid",
          purpose: "Google Analytics to track visitor sessions",
          duration: "24 hours"
        }
      ]
    },
    {
      name: "Performance Cookies",
      description: "These cookies help improve our website performance and load times by caching information.",
      cookies: [
        {
          name: "performance_cache",
          purpose: "Store performance-related data and website metrics",
          duration: "30 days"
        }
      ]
    },
    {
      name: "Functionality Cookies",
      description: "These cookies enable enhanced functionality and personalization features.",
      cookies: [
        {
          name: "preferences",
          purpose: "Remember user preferences and settings",
          duration: "1 year"
        },
        {
          name: "language",
          purpose: "Store user language selection",
          duration: "1 year"
        }
      ]
    }
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
                Cookie Policy
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Learn how we use cookies to improve your experience and provide our services
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

      {/* Cookie Policy Content */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-4xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12 mb-12"
          >
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">What Are Cookies?</h2>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                Cookies are small text files that are placed on your device when you visit our website. 
                They are widely used to make websites work more efficiently, as well as to provide 
                information to the owners of the site.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">How We Use Cookies</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                We use cookies to enhance your browsing experience, analyze site traffic, 
                understand user behavior, and provide personalized content. The cookies we use 
                are categorized as follows:
              </p>
            </div>
          </motion.div>

          {/* Cookie Categories */}
          <div className="space-y-8">
            {cookieCategories.map((category, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                className="bg-white rounded-2xl border border-gray-200 shadow-lg overflow-hidden"
              >
                <div className="bg-gray-50 px-6 py-4 border-b border-gray-200">
                  <h3 className="text-xl font-bold text-gray-900">{category.name}</h3>
                  <p className="text-gray-600 mt-2">{category.description}</p>
                </div>
                
                <div className="p-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Cookie Name</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Purpose</th>
                          <th className="px-4 py-3 text-left text-sm font-semibold text-gray-900">Duration</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-200">
                        {category.cookies.map((cookie, cookieIndex) => (
                          <tr key={cookieIndex} className="hover:bg-gray-50 transition-colors">
                            <td className="px-4 py-3 font-medium text-gray-900">{cookie.name}</td>
                            <td className="px-4 py-3 text-gray-600">{cookie.purpose}</td>
                            <td className="px-4 py-3 text-gray-600">{cookie.duration}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Additional Information */}
          <motion.div 
            variants={fadeInUp}
            className="bg-white rounded-2xl border border-gray-200 shadow-lg p-8 md:p-12 mt-12"
          >
            <div className="prose prose-lg max-w-none">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Managing Your Cookie Preferences</h2>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                You can control and/or delete cookies as you wish. You can delete all cookies 
                that are already on your computer and you can set most browsers to prevent them 
                from being placed. If you do this, however, you may have to manually adjust 
                some preferences every time you visit a site and some services and functionalities 
                may not work.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">How to Manage Cookies</h3>
              
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="font-bold text-blue-900 mb-3">Browser Settings</h4>
                <p className="text-blue-800 mb-3">
                  Most web browsers allow you to control cookies through their settings preferences. 
                  However, if you limit the ability of websites to set cookies, you may worsen your 
                  overall user experience, since it will no longer be personalized to you.
                </p>
                <ul className="text-blue-800 space-y-2">
                  <li>• <strong>Google Chrome:</strong> Settings → Privacy and security → Cookies and other site data</li>
                  <li>• <strong>Mozilla Firefox:</strong> Options → Privacy & Security → Cookies and Site Data</li>
                  <li>• <strong>Safari:</strong> Preferences → Privacy → Cookies and website data</li>
                  <li>• <strong>Microsoft Edge:</strong> Settings → Cookies and site permissions</li>
                </ul>
              </div>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Third-Party Cookies</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                In addition to our own cookies, we may also use various third-party cookies 
                to report usage statistics of the service, deliver advertisements on and through 
                the service, and so on. These third parties may use cookies, web beacons, and 
                other technologies to collect information about your use of our website and 
                other websites, including your IP address, browser type, internet service provider, 
                referring/exit pages, and date/time stamps.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Changes to This Cookie Policy</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                We may update our Cookie Policy from time to time. We will notify you of any 
                changes by posting the new Cookie Policy on this page and updating the &quot;Last Updated&quot; 
                date. You are advised to review this Cookie Policy periodically for any changes.
              </p>

              <h3 className="text-xl font-bold text-gray-900 mb-4 mt-8">Contact Us</h3>
              
              <p className="text-gray-700 mb-6 leading-relaxed">
                If you have any questions about our Cookie Policy, please contact us:
              </p>
              
              <div className="bg-gray-50 rounded-lg p-6 border border-gray-200">
                <p className="text-gray-700 font-medium">Bitpanda Pro</p>
                <p className="text-gray-600">Email: privacy@bitpandapro.com</p>
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