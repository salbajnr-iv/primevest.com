"use client";

import React, { useState, FormEvent } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import BottomNav from "@/components/BottomNav";

interface ContactFormData {
  name: string;
  email: string;
  subject: string;
  category: string;
  message: string;
}

export default function ContactUsPage() {
  const [formData, setFormData] = useState<ContactFormData>({
    name: "",
    email: "",
    subject: "",
    category: "support",
    message: "",
  });

  const [submitted, setSubmitted] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500));

      if (formData.name && formData.email && formData.message) {
        setSubmitted(true);
        setFormData({
          name: "",
          email: "",
          subject: "",
          category: "support",
          message: "",
        });

        // Reset submitted state after 5 seconds
        setTimeout(() => setSubmitted(false), 5000);
      } else {
        setError("Please fill in all required fields");
      }
    } catch (err) {
      setError("Failed to send message. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const contactCategories = [
    { value: "support", label: "General Support" },
    { value: "account", label: "Account Issues" },
    { value: "trading", label: "Trading Help" },
    { value: "verification", label: "Verification" },
    { value: "withdrawal", label: "Withdrawal" },
    { value: "complaint", label: "Complaint" },
    { value: "other", label: "Other" },
  ];

  const contactMethods = [
    {
      icon: "📧",
      title: "Email",
      description: "support@bitpandapro.com",
      subtitle: "Response within 24 hours",
    },
    {
      icon: "💬",
      title: "Live Chat",
      description: "24/7 Available",
      subtitle: "Instant support from our team",
    },
    {
      icon: "📞",
      title: "Phone",
      description: "+43 1 234 56789",
      subtitle: "Business hours only",
    },
    {
      icon: "🌐",
      title: "Social Media",
      description: "@BitpandaPro",
      subtitle: "Follow us for updates",
    },
  ];

  const faqs = [
    {
      question: "How long does account verification take?",
      answer: "Account verification typically takes 1-24 hours depending on document quality. Premium verification can take 2-5 business days.",
    },
    {
      question: "What are your trading hours?",
      answer: "We offer 24/7 trading on cryptocurrencies. Forex and other assets follow specific market hours.",
    },
    {
      question: "How do I reset my password?",
      answer: "Go to the sign-in page and click 'Forgot Password'. Follow the instructions sent to your registered email.",
    },
    {
      question: "What payment methods are accepted?",
      answer: "We accept bank transfers (SEPA), credit/debit cards, and various digital payment methods.",
    },
    {
      question: "Is there a minimum deposit amount?",
      answer: "Minimum deposit varies by payment method. Typically from €1 for card payments and €10 for bank transfers.",
    },
    {
      question: "How can I close my account?",
      answer: "Contact our support team with your account closure request. A representative will guide you through the process.",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900 pb-20">
      {/* Header */}
      <div className="bg-slate-800 border-b border-slate-700 sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 py-6">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-400 transition w-fit">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-xl">Bitpanda Pro</span>
          </Link>
        </div>
      </div>

      {/* Hero Section */}
      <div className="max-w-6xl mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <h1 className="text-5xl md:text-6xl font-bold text-white mb-4">Contact Us</h1>
          <p className="text-xl text-gray-300">We're here to help. Reach out to our team anytime.</p>
        </div>

        {/* Contact Methods */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-16">
          {contactMethods.map((method) => (
            <div key={method.title} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500 transition">
              <p className="text-4xl mb-4">{method.icon}</p>
              <h3 className="text-lg font-bold text-white mb-2">{method.title}</h3>
              <p className="font-semibold text-emerald-400 mb-1">{method.description}</p>
              <p className="text-sm text-gray-400">{method.subtitle}</p>
            </div>
          ))}
        </div>

        {/* Contact Form and FAQ Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Contact Form */}
          <div className="lg:col-span-2">
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-8">
              <h2 className="text-2xl font-bold text-white mb-6">Send us a Message</h2>

              {submitted && (
                <div className="mb-6 p-4 bg-emerald-500/20 border border-emerald-500/50 rounded-lg">
                  <p className="text-emerald-400 font-semibold">✓ Message sent successfully!</p>
                  <p className="text-sm text-emerald-300">We'll get back to you within 24 hours.</p>
                </div>
              )}

              {error && (
                <div className="mb-6 p-4 bg-red-500/20 border border-red-500/50 rounded-lg">
                  <p className="text-red-400 font-semibold">✕ {error}</p>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">
                      Full Name <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="text"
                      name="name"
                      value={formData.name}
                      onChange={handleChange}
                      placeholder="Your name"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">
                      Email <span className="text-red-400">*</span>
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="your@email.com"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition"
                      required
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Subject</label>
                    <input
                      type="text"
                      name="subject"
                      value={formData.subject}
                      onChange={handleChange}
                      placeholder="Message subject"
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition"
                    />
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-300 block mb-2">Category</label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition"
                    >
                      {contactCategories.map((cat) => (
                        <option key={cat.value} value={cat.value}>
                          {cat.label}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                <div>
                  <label className="text-sm font-medium text-gray-300 block mb-2">
                    Message <span className="text-red-400">*</span>
                  </label>
                  <textarea
                    name="message"
                    value={formData.message}
                    onChange={handleChange}
                    placeholder="Describe your issue or question..."
                    rows={5}
                    className="w-full bg-slate-700 border border-slate-600 text-white rounded-lg px-4 py-2 focus:outline-none focus:border-emerald-500 transition resize-none"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={loading}
                  className="w-full bg-emerald-500 hover:bg-emerald-600 disabled:bg-gray-600 text-white py-3 rounded-lg font-semibold transition"
                >
                  {loading ? "Sending..." : "Send Message"}
                </Button>
              </form>
            </div>
          </div>

          {/* FAQ Sidebar */}
          <div>
            <div className="bg-slate-800 border border-slate-700 rounded-lg p-6">
              <h2 className="text-xl font-bold text-white mb-4">Quick Help</h2>
              <p className="text-gray-400 text-sm mb-4">
                Find answers to common questions, or contact us directly if you need more help.
              </p>
              <div className="space-y-3">
                <a
                  href="/support"
                  className="block p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-emerald-400 font-semibold transition"
                >
                  View all FAQs
                </a>
                <a
                  href="/auth/signin"
                  className="block p-3 bg-slate-700/50 hover:bg-slate-700 border border-slate-600 rounded-lg text-white font-semibold transition"
                >
                  Sign in to account
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* FAQ Section */}
        <div className="mt-16">
          <h2 className="text-3xl font-bold text-white mb-8">Frequently Asked Questions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {faqs.map((faq, index) => (
              <div key={index} className="bg-slate-800 border border-slate-700 rounded-lg p-6 hover:border-emerald-500/50 transition">
                <h3 className="font-bold text-white mb-2">{faq.question}</h3>
                <p className="text-gray-400 text-sm">{faq.answer}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Office Hours */}
        <div className="mt-16 bg-gradient-to-r from-emerald-600/10 to-blue-600/10 border border-slate-600 rounded-lg p-8 text-center">
          <h3 className="text-2xl font-bold text-white mb-4">Support Hours</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-gray-300">
            <div>
              <p className="font-semibold text-emerald-400 mb-1">Emergency Support (24/7)</p>
              <p className="text-sm">Account security & urgent issues</p>
            </div>
            <div>
              <p className="font-semibold text-emerald-400 mb-1">General Support</p>
              <p className="text-sm">Monday - Friday, 8 AM - 8 PM CET</p>
            </div>
            <div>
              <p className="font-semibold text-emerald-400 mb-1">Response Time</p>
              <p className="text-sm">Typically within 24 hours</p>
            </div>
          </div>
        </div>

        {/* Back to Home */}
        <div className="mt-12 text-center">
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-8 py-3 rounded-lg font-semibold">
            <Link href="/">Back to Home</Link>
          </Button>
        </div>
      </div>

      <BottomNav />
    </div>
  );
}
