"use client";

import Link from "next/link";

export const dynamic = "force-dynamic";

export default function DashboardPage() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-2">Dashboard</h1>
      <p className="text-gray-600 mb-4">Dashboard content is temporarily simplified while deployment issues are fixed.</p>
      <div className="flex gap-4">
        <Link href="/wallets" className="text-green-700 underline">Wallets</Link>
        <Link href="/transactions" className="text-green-700 underline">Transactions</Link>
      </div>
    </div>
  );
}
