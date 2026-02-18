'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface Stats {
  totalUsers: number
  activeUsers: number
  inactiveUsers: number
  totalBalance: number
  avgBalance: number
}

interface RecentActivity {
  id: string
  type: string
  description: string
  created_at: string
}

interface UserProfile {
  id: string
  is_active: boolean
  balance: number
}

export default function AdminDashboardPage() {
  const { user, loading: authLoading } = useAdminAuth()
  const [stats, setStats] = useState<Stats>({
    totalUsers: 0,
    activeUsers: 0,
    inactiveUsers: 0,
    totalBalance: 0,
    avgBalance: 0,
  })
  const [recentActivities, setRecentActivities] = useState<RecentActivity[]>([])
  const [loading, setLoading] = useState(true)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        // Try to fetch user stats from the database function
        const { data: statsData, error: statsError } = await supabase
          .rpc('get_user_stats')
          .single()

        if (!statsError && statsData) {
          const typedStats = statsData as Record<string, unknown>
          setStats({
            totalUsers: Number(typedStats.total_users) || 0,
            activeUsers: Number(typedStats.active_users) || 0,
            inactiveUsers: Number(typedStats.inactive_users) || 0,
            totalBalance: Number(typedStats.total_balance) || 0,
            avgBalance: Number(typedStats.avg_balance) || 0,
          })
        } else {
          // Fallback: fetch directly from profiles table
          const { data: usersData } = await supabase
            .from('profiles')
            .select('id, is_active, balance')
          
          if (usersData && usersData.length > 0) {
            const typedUsers = usersData as unknown as UserProfile[]
            setStats({
              totalUsers: typedUsers.length,
              activeUsers: typedUsers.filter((u: UserProfile) => u.is_active).length,
              inactiveUsers: typedUsers.filter((u: UserProfile) => !u.is_active).length,
              totalBalance: typedUsers.reduce((sum: number, u: UserProfile) => sum + (parseFloat(String(u.balance)) || 0), 0),
              avgBalance: typedUsers.length > 0 
                ? typedUsers.reduce((sum: number, u: UserProfile) => sum + (parseFloat(String(u.balance)) || 0), 0) / typedUsers.length 
                : 0,
            })
          }
        }

        // Fetch recent admin actions
        const { data: actionsData, error: actionsError } = await supabase
          .from('admin_actions')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(10)

        if (!actionsError && actionsData) {
          setRecentActivities(actionsData.map((action: any) => ({
            id: action.id,
            type: action.action_type,
            description: formatActionDescription(action),
            created_at: action.created_at,
          })))
        }
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
      } finally {
        setLoading(false)
      }
    }

    fetchDashboardData()
  }, [supabase])

  const formatActionDescription = (action: any): string => {
    switch (action.action_type) {
      case 'balance_adjustment':
        const balanceDetails = action.new_value
        return `Adjusted balance (${balanceDetails?.action || 'unknown'}) €${balanceDetails?.amount || 0}`
      case 'user_status_change':
        return `Changed user status to ${action.new_value?.is_active ? 'active' : 'inactive'}`
      case 'settings_update':
        return 'Updated admin settings'
      case 'mass_reset_balances':
        return 'Reset all user balances to zero'
      case 'mass_deactivate_users':
        return 'Deactivated all non-admin users'
      default:
        return `Performed ${action.action_type.replace(/_/g, ' ')} operation`
    }
  }

  if (authLoading || loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-bold text-white">Admin Dashboard</h1>
        <p className="text-gray-400 mt-1">Welcome back, {user?.email?.split('@')[0]}</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard
          title="Total Users"
          value={stats.totalUsers.toLocaleString()}
          subtext={`${stats.activeUsers} active, ${stats.inactiveUsers} inactive`}
          color="blue"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
            </svg>
          }
        />
        <StatCard
          title="Active Users"
          value={stats.activeUsers.toLocaleString()}
          subtext={`${stats.totalUsers > 0 ? Math.round((stats.activeUsers / stats.totalUsers) * 100) : 0}% of total`}
          color="green"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Total Balance"
          value={`€${stats.totalBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext={`Avg: €${stats.avgBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          color="purple"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          }
        />
        <StatCard
          title="Avg Balance"
          value={`€${stats.avgBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`}
          subtext="Per user"
          color="orange"
          icon={
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
            </svg>
          }
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <QuickActionCard
          title="Add Balance"
          description="Credit user account"
          href="/admin/users?action=add-balance"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          }
        />
        <QuickActionCard
          title="Reduce Balance"
          description="Debit user account"
          href="/admin/users?action=reduce-balance"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20 12H4" />
            </svg>
          }
        />
        <QuickActionCard
          title="View Users"
          description="Manage user accounts"
          href="/admin/users"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
            </svg>
          }
        />
        <QuickActionCard
          title="Audit Log"
          description="View all admin actions"
          href="/admin/audit"
          icon={
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
            </svg>
          }
        />
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white">Recent Admin Activity</h2>
          <a href="/admin/audit" className="text-green-500 hover:text-green-400 text-sm font-medium no-underline">View All</a>
        </div>
        <div className="divide-y divide-gray-700">
          {recentActivities.length > 0 ? (
            recentActivities.map((activity) => (
              <div key={activity.id} className="p-4 hover:bg-gray-700/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <div className="w-10 h-10 bg-green-800/30 rounded-lg flex items-center justify-center">
                      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <div>
                      <p className="text-white font-medium capitalize">{activity.type.replace(/_/g, ' ')}</p>
                      <p className="text-gray-400 text-sm">{activity.description}</p>
                    </div>
                  </div>
                  <span className="text-gray-500 text-sm">
                    {new Date(activity.created_at).toLocaleString()}
                  </span>
                </div>
              </div>
            ))
          ) : (
            <div className="p-8 text-center text-gray-400">
              <svg className="w-12 h-12 mx-auto mb-4 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
              <p>No recent admin activity</p>
              <p className="text-sm mt-1">Actions you take will appear here</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

function StatCard({ 
  title, 
  value, 
  icon, 
  subtext,
  color 
}: { 
  title: string
  value: string
  icon: React.ReactNode
  subtext?: string
  color: 'blue' | 'green' | 'purple' | 'orange'
}) {
  const colorClasses = {
    blue: 'bg-blue-500/10 text-blue-500',
    green: 'bg-green-500/10 text-green-500',
    purple: 'bg-purple-500/10 text-purple-500',
    orange: 'bg-orange-500/10 text-orange-500',
  }

  return (
    <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
      <div className="flex items-center justify-between">
        <div className={`p-3 rounded-lg ${colorClasses[color]}`}>
          {icon}
        </div>
      </div>
      <div className="mt-4">
        <p className="text-gray-400 text-sm">{title}</p>
        <p className="text-2xl font-bold text-white mt-1">{value}</p>
        {subtext && (
          <p className="text-gray-500 text-xs mt-1">{subtext}</p>
        )}
      </div>
    </div>
  )
}

function QuickActionCard({ 
  title, 
  description, 
  href, 
  icon 
}: { 
  title: string
  description: string
  href: string
  icon: React.ReactNode
}) {
  return (
    <a
      href={href}
      className="flex items-center gap-4 p-4 bg-gray-800 rounded-xl border border-gray-700 hover:border-green-800 hover:bg-gray-700/50 transition-all group"
    >
      <div className="p-3 bg-green-800/30 rounded-lg text-green-500 group-hover:bg-green-800 group-hover:text-white transition-colors">
        {icon}
      </div>
      <div>
        <p className="text-white font-medium">{title}</p>
        <p className="text-gray-400 text-sm">{description}</p>
      </div>
      <svg className="w-5 h-5 text-gray-500 ml-auto group-hover:text-white transition-colors" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
      </svg>
    </a>
  )
}

