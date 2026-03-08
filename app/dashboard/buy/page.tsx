"use client";

import Link from "next/link";

export default function DashboardBuyPage() {
  return (
    <div className="dashboard-container p-6">
      <h1 className="text-2xl font-bold mb-2">Buy</h1>
      <p className="text-gray-600 mb-4">Buy flow is temporarily simplified while deployment issues are being resolved.</p>
      <Link href="/dashboard" className="text-green-700 underline">Back to dashboard</Link>
    </div>
  );
}
