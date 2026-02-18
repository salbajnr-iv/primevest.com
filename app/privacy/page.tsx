"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-gradient-to-b from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="sticky top-0 z-50 bg-slate-900/95 backdrop-blur border-b border-slate-700">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2 text-white hover:text-emerald-400 transition">
            <svg viewBox="0 0 24 24" fill="none" className="w-6 h-6">
              <path d="M12 2L2 7l10 5 10-5-10-5z" fill="currentColor" />
              <path d="M2 17l10 5 10-5M2 12l10 5 10-5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="font-bold text-lg">Bitpanda Pro</span>
          </Link>
          <Button asChild className="bg-emerald-500 hover:bg-emerald-600 text-white px-6 py-2 rounded-lg">
            <Link href="/">Back Home</Link>
          </Button>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 md:px-8 py-16">
        <h1 className="text-5xl font-bold text-white mb-8">Privacy Policy</h1>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-gray-300 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Introduction</h2>
            <p>
              Bitpanda Pro ("we", "us", "our", or "Company") operates the Bitpanda Pro website and app. 
              This page informs you of our policies regarding the collection, use, and disclosure of personal data when you use our service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Information Collection and Use</h2>
            <p>We collect several different types of information for various purposes to provide and improve our service to you.</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li>Personal Data: name, email address, phone number, trading preferences</li>
              <li>Usage Data: IP address, browser type, pages visited, time and date</li>
              <li>Trading Data: transaction history, portfolio information, trading patterns</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Use of Data</h2>
            <p>Bitpanda Pro uses the collected data for various purposes:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li>To provide and maintain our service</li>
              <li>To notify you about changes to our service</li>
              <li>To provide customer support</li>
              <li>To gather analysis or valuable information so that we can improve our service</li>
              <li>To monitor the usage of our service</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Security of Data</h2>
            <p>
              The security of your data is important to us but remember that no method of transmission over the Internet or method of electronic storage is 100% secure. 
              While we strive to use commercially acceptable means to protect your Personal Data, we cannot guarantee its absolute security.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Contact Us</h2>
            <p>
              If you have any questions about this Privacy Policy, please contact us at:
              <br />
              Email: privacy@bitpandapro.com
            </p>
          </section>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-8">
            <p className="text-emerald-400 text-sm">
              Last updated: February 7, 2026. This privacy policy may be updated from time to time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
