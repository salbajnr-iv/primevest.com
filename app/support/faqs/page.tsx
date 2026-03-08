"use client";

import Link from "next/link";

const faqs = [
  { q: "How do I create an account?", a: "Use Open Account and complete verification." },
  { q: "What can I trade?", a: "Crypto, FX, indices and more depending on availability." },
  { q: "How do I contact support?", a: "Use the support page for chat, phone or email." },
];

export default function FAQPage() {
  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="mx-auto max-w-3xl">
        <h1 className="text-3xl font-bold mb-4">Frequently Asked Questions</h1>
        <div className="space-y-4">
          {faqs.map((item) => (
            <div key={item.q} className="rounded-xl border bg-white p-4">
              <h2 className="font-semibold">{item.q}</h2>
              <p className="text-gray-600 mt-1">{item.a}</p>
            </div>
          ))}
        </div>
        <Link href="/support" className="inline-block mt-6 text-green-700 underline">Go to support</Link>
      </div>
    </div>
  );
}
