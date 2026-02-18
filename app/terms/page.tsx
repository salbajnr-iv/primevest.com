"use client";

import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function TermsPage() {
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
        <h1 className="text-5xl font-bold text-white mb-8">Terms & Conditions</h1>
        
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-8 text-gray-300 space-y-6">
          <section>
            <h2 className="text-2xl font-bold text-white mb-4">1. Agreement to Terms</h2>
            <p>
              By accessing and using this website, you accept and agree to be bound by the terms and provision of this agreement. 
              If you do not agree to abide by the above, please do not use this service.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">2. Use License</h2>
            <p>Permission is granted to temporarily download one copy of the materials (information or software) on Bitpanda Pro for personal, non-commercial transitory viewing only. 
            This is the grant of a license, not a transfer of title, and under this license you may not:</p>
            <ul className="list-disc list-inside ml-4 space-y-2 mt-4">
              <li>Modify or copy the materials</li>
              <li>Use the materials for any commercial purpose or for any public display</li>
              <li>Attempt to decompile or reverse engineer any software contained on the website</li>
              <li>Remove any copyright or other proprietary notations from the materials</li>
              <li>Transfer the materials to another person or "mirror" the materials on any other server</li>
            </ul>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">3. Disclaimer</h2>
            <p>
              The materials on Bitpanda Pro are provided on an 'as is' basis. Bitpanda Pro makes no warranties, expressed or implied, 
              and hereby disclaims and negates all other warranties including, without limitation, implied warranties or conditions of merchantability, 
              fitness for a particular purpose, or non-infringement of intellectual property or other violation of rights.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">4. Limitations</h2>
            <p>
              In no event shall Bitpanda Pro or its suppliers be liable for any damages (including, without limitation, 
              damages for loss of data or profit, or due to business interruption) arising out of the use or inability to use the materials on Bitpanda Pro.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">5. Accuracy of Materials</h2>
            <p>
              The materials appearing on Bitpanda Pro could include technical, typographical, or photographic errors. 
              Bitpanda Pro does not warrant that any of the materials on our website are accurate, complete, or current. 
              Bitpanda Pro may make changes to the materials contained on its website at any time without notice.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">6. Links</h2>
            <p>
              Bitpanda Pro has not reviewed all of the sites linked to our website and is not responsible for the contents of any such linked site. 
              The inclusion of any link does not imply endorsement by Bitpanda Pro of the site. Use of any such linked website is at the user's own risk.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">7. Modifications</h2>
            <p>
              Bitpanda Pro may revise these terms and conditions for its website at any time without notice. 
              By using this website, you are agreeing to be bound by the then current version of these terms and conditions.
            </p>
          </section>

          <section>
            <h2 className="text-2xl font-bold text-white mb-4">8. Governing Law</h2>
            <p>
              These terms and conditions are governed by and construed in accordance with the laws of Austria, 
              and you irrevocably submit to the exclusive jurisdiction of the courts in that location.
            </p>
          </section>

          <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-lg p-4 mt-8">
            <p className="text-emerald-400 text-sm">
              Last updated: February 7, 2026. These terms and conditions may be updated from time to time.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
