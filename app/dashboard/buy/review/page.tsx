"use client";

import Link from "next/link";

export default function BuyReviewPage() {
  return (
    <div className="dashboard-container p-6">
      <h1 className="text-2xl font-bold mb-2">Buy Review</h1>
      <p className="text-gray-600 mb-4">Review screen placeholder.</p>
      <Link href="/dashboard/buy" className="text-green-700 underline">Back</Link>
    </div>
  );
}
