"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";
import { motion } from "framer-motion";
import Image from "next/image";

export default function CareersPage() {
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

  const departments = [
    {
      name: "Technology",
      icon: "💻",
      positions: 12,
      description: "Software development, engineering, and technical innovation"
    },
    {
      name: "Trading",
      icon: "📈",
      positions: 8,
      description: "Market analysis, trading operations, and client advisory"
    },
    {
      name: "Marketing",
      icon: "📢",
      positions: 5,
      description: "Digital marketing, brand management, and customer acquisition"
    },
    {
      name: "Compliance",
      icon: "⚖️",
      positions: 3,
      description: "Regulatory affairs, legal compliance, and risk management"
    },
    {
      name: "Customer Support",
      icon: "🎧",
      positions: 15,
      description: "Client service, technical support, and user experience"
    },
    {
      name: "Finance",
      icon: "💰",
      positions: 4,
      description: "Financial planning, accounting, and business operations"
    }
  ];

  const featuredJobs = [
    {
      id: 1,
      title: "Senior Frontend Developer",
      department: "Technology",
      location: "Remote",
      type: "Full-time",
      experience: "3+ years",
      salary: "$90,000 - $130,000",
      description: "Join our engineering team to build cutting-edge trading platforms and financial applications."
    },
    {
      id: 2,
      title: "Market Analyst",
      department: "Trading",
      location: "London, UK",
      type: "Full-time",
      experience: "2+ years",
      salary: "$70,000 - $100,000",
      description: "Provide market insights and analysis to support our trading operations and client services."
    },
    {
      id: 3,
      title: "Customer Success Manager",
      department: "Customer Support",
      location: "Remote",
      type: "Full-time",
      experience: "2+ years",
      salary: "$60,000 - $85,000",
      description: "Help our clients succeed by providing exceptional support and guidance on our trading platform."
    },
    {
      id: 4,
      title: "Compliance Officer",
      department: "Compliance",
      location: "Frankfurt, Germany",
      type: "Full-time",
      experience: "3+ years",
      salary: "$75,000 - $110,000",
      description: "Ensure regulatory compliance and maintain the highest standards of financial conduct."
    }
  ];

  const benefits = [
    {
      title: "Competitive Compensation",
      description: "Market-leading salaries with performance bonuses and equity options",
      icon: "💰"
    },
    {
      title: "Flexible Work",
      description: "Remote work options and flexible schedules to support work-life balance",
      icon: "🏠"
    },
    {
      title: "Professional Development",
      description: "Continuous learning opportunities, conferences, and skill development programs",
      icon: "📚"
    },
    {
      title: "Health & Wellness",
      description: "Comprehensive health insurance, mental health support, and wellness programs",
      icon: "🏥"
    },
    {
      title: "Trading Perks",
      description: "Free trading access, educational resources, and market insights",
      icon: "📊"
    },
    {
      title: "Team Culture",
      description: "Collaborative environment with regular team events and social activities",
      icon: "👥"
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
                Join Our Team
              </motion.h1>
              <motion.p 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                className="text-body text-gray-600 max-w-2xl mx-auto transition-professional"
              >
                Be part of a dynamic team revolutionizing financial trading. 
                We&apos;re looking for passionate professionals to help shape the future of investing.
              </motion.p>
            </div>
            
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="flex flex-col sm:flex-row gap-4 pt-4 justify-center transition-professional"
            >
              <Button 
                onClick={() => window.location.href = "#openings"} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-4 text-lg rounded-lg transition-all duration-300 font-semibold shadow-lg hover:shadow-xl transform hover:-translate-y-1 hover:scale-105 btn-premium"
              >
                View Open Positions
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
              className="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-8 max-w-3xl mx-auto"
            >
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm text-center group hover:shadow-md transition-all duration-300 transition-professional">
                <div className="text-3xl mb-3">🌍</div>
                <div className="text-2xl font-bold text-emerald-600 mb-1">20+</div>
                <div className="text-sm text-gray-600">Countries</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm text-center group hover:shadow-md transition-all duration-300 transition-professional">
                <div className="text-3xl mb-3">👥</div>
                <div className="text-2xl font-bold text-emerald-600 mb-1">500+</div>
                <div className="text-sm text-gray-600">Team Members</div>
              </div>
              <div className="bg-white/80 backdrop-blur-sm rounded-xl p-6 border border-gray-200 shadow-sm text-center group hover:shadow-md transition-all duration-300 transition-professional">
                <div className="text-3xl mb-3">🚀</div>
                <div className="text-2xl font-bold text-emerald-600 mb-1">100+</div>
                <div className="text-sm text-gray-600">Open Positions</div>
              </div>
            </motion.div>
          </motion.div>
        </div>
      </motion.section>

      {/* Departments Section */}
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
              Our Departments
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              We&apos;re organized into specialized teams, each contributing to our mission of making professional trading accessible to everyone.
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {departments.map((dept, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ y: -10 }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 cursor-pointer h-full flex flex-col justify-between shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full -translate-y-16 translate-x-16 group-hover:scale-150 transition-transform duration-700"></div>
                  
                  <div className="relative z-10">
                    <div className="w-16 h-16 rounded-xl bg-gradient-to-br from-gray-100 to-gray-200 border border-gray-300 flex items-center justify-center mb-6 group-hover:rotate-6 transition-transform duration-300">
                      <span className="text-3xl">{dept.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{dept.name}</h3>
                    <p className="text-gray-600 mb-4">{dept.description}</p>
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-emerald-600 font-medium">{dept.positions} positions</span>
                      <span className="text-emerald-500 group-hover:translate-x-2 transition-transform duration-300">→</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </motion.section>

      {/* Featured Jobs Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        id="openings"
        className="py-24 px-4 md:px-8 bg-gradient-to-br from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Featured Openings
            </h2>
            <p className="text-body text-gray-600 transition-professional">
              Join our team and help shape the future of financial trading
            </p>
          </motion.div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            {featuredJobs.map((job, index) => (
              <motion.div
                key={job.id}
                variants={fadeInUp}
                whileHover={{ y: -5 }}
                transition={{ delay: 0.1 * index }}
                className="group relative"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-300 h-full flex flex-col card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-gray-50 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                  
                  <div className="p-8 flex-1 flex flex-col">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <h3 className="text-xl font-bold text-gray-900 mb-2 group-hover:text-emerald-600 transition-colors duration-300">
                          {job.title}
                        </h3>
                        <div className="flex flex-wrap gap-2">
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
                            {job.department}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                            {job.location}
                          </span>
                          <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            {job.type}
                          </span>
                        </div>
                      </div>
                      <div className="text-right">
                        <div className="text-lg font-bold text-emerald-600">{job.salary}</div>
                        <div className="text-sm text-gray-600">{job.experience}</div>
                      </div>
                    </div>
                    
                    <p className="text-gray-600 mb-6 flex-1">{job.description}</p>
                    
                    <Button className="w-full bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl">
                      Apply Now
                    </Button>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="text-center"
          >
            <Button 
              onClick={() => window.location.href = "#benefits"} 
              className="bg-white text-emerald-600 hover:bg-gray-100 border-2 border-emerald-500 px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl"
            >
              View All Positions
            </Button>
          </motion.div>
        </div>
      </motion.section>

      {/* Benefits Section */}
      <motion.section 
        initial="initial"
        animate="animate"
        variants={staggerContainer}
        id="benefits"
        className="py-24 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-gray-100 section-padding"
      >
        <div className="max-w-7xl mx-auto">
          <motion.div 
            variants={fadeInUp}
            className="text-center mb-20"
          >
            <h2 className="text-heading font-bold text-gray-900 mb-6 bg-gradient-to-r from-gray-800 to-gray-600 bg-clip-text text-transparent transition-professional">
              Why Join Us?
            </h2>
            <p className="text-body text-gray-600 max-w-3xl mx-auto transition-professional">
              We offer competitive benefits and a supportive work environment to help you thrive
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {benefits.map((benefit, index) => (
              <motion.div 
                key={index}
                variants={fadeInUp}
                whileHover={{ scale: 1.03 }}
                className="group relative text-center"
              >
                <div className="relative bg-white border border-gray-200 rounded-2xl p-8 hover:border-emerald-300 transition-all duration-300 shadow-lg hover:shadow-2xl overflow-hidden card-premium">
                  <div className="absolute inset-0 bg-gradient-to-br from-white to-emerald-50 opacity-0 group-hover:opacity-100 transition-opacity duration-500"></div>
                  
                  <div className="relative z-10">
                    <div className="w-20 h-20 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-6 group-hover:bg-emerald-100 transition-colors duration-300">
                      <span className="text-4xl">{benefit.icon}</span>
                    </div>
                    <h3 className="text-xl font-bold text-gray-900 mb-3 group-hover:text-emerald-600 transition-colors duration-300 transition-professional">{benefit.title}</h3>
                    <p className="text-gray-600">{benefit.description}</p>
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          <motion.div 
            variants={fadeInUp}
            className="mt-16 text-center bg-gradient-to-r from-emerald-50 to-blue-50 rounded-2xl p-12 border border-emerald-200"
          >
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Ready to Join Our Team?</h3>
            <p className="text-gray-600 mb-8 max-w-2xl mx-auto">
              We&apos;re always looking for talented individuals to join our growing team. 
              Send us your resume and let&apos;s discuss how you can contribute to our mission.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button 
                onClick={() => window.location.href = "mailto:careers@primevest.com"} 
                className="bg-gradient-to-r from-emerald-500 to-emerald-600 hover:from-emerald-600 hover:to-emerald-700 text-white px-8 py-3 rounded-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
              >
                Contact Recruiting Team
              </Button>
              <Button 
                onClick={handleBackToHome} 
                className="border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500/10 hover:border-emerald-600 px-8 py-3 rounded-lg bg-transparent transition-all duration-300 font-semibold btn-premium"
              >
                Back to Home
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
            Let&apos;s Build the Future Together
          </motion.h2>
          <motion.p 
            variants={fadeInUp}
            className="text-xl text-emerald-100 mb-10 max-w-2xl mx-auto"
          >
            Join a team that&apos;s revolutionizing financial trading and making investing accessible to everyone. 
            Your skills and passion can help shape the future of finance.
          </motion.p>
          <motion.div 
            variants={fadeInUp}
            className="flex flex-col sm:flex-row justify-center gap-4"
          >
            <Button 
              onClick={() => window.location.href = "#openings"} 
              className="bg-white text-emerald-600 hover:bg-gray-100 px-12 py-4 rounded-xl text-lg font-semibold transition-all duration-300 shadow-lg hover:shadow-xl transform hover:-translate-y-1 btn-premium"
            >
              View Open Positions
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