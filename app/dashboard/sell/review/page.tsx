"use client";

import Link from "next/link";

export default function SellReviewPage() {
  return (
    <div className="dashboard-container p-6">
      <h1 className="text-2xl font-bold mb-2">Sell Review</h1>
      <p className="text-gray-600 mb-4">Review screen placeholder.</p>
      <Link href="/dashboard/sell" className="text-green-700 underline">Back</Link>
    </div>
  );
}
