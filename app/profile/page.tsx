"use client";

import Link from "next/link";

export default function ProfilePage() {
  return (
    <div className="p-6 space-y-3">
      <h1 className="text-2xl font-bold">Profile</h1>
      <p className="text-gray-600">Profile page is being repaired.</p>
      <Link href="/support/contact" className="inline-flex rounded-lg bg-emerald-600 px-4 py-2 text-white">Get help</Link>
    </div>
  );
}
