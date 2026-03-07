'use client'

import { useMemo } from 'react'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export const dynamic = 'force-dynamic'
function StatCard({ title, value, subtext }: { title: string; value: string; subtext?: string }) {
  return (
    <div className="rounded-xl border border-gray-700 bg-gray-800 p-4">
      <p className="text-sm text-gray-400">{title}</p>
      <p className="mt-1 text-2xl font-semibold text-white">{value}</p>
      {subtext ? <p className="mt-1 text-xs text-gray-500">{subtext}</p> : null}
    </div>
  )
}

export default function AdminDashboardPage() {
  const { user, loading } = useAdminAuth()

  const displayName = useMemo(() => user?.email?.split('@')[0] || 'Admin', [user?.email])

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="mt-1 text-gray-400">Welcome back, {displayName}</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
        <StatCard title="Total Users" value="—" subtext="Live metrics temporarily unavailable" />
        <StatCard title="Active Users" value="—" />
        <StatCard title="Total Balance" value="—" />
        <StatCard title="Avg Balance" value="—" />
      </div>
    </div>
  )
}
