'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface BalanceHistoryEntry {
  id: string
  user_id: string
  admin_id: string
  action_type: string
  currency: string
  amount: number
  previous_balance: number
  new_balance: number
  reason: string | null
  created_at: string
  profiles: {
    email: string
    full_name: string | null
  }
}

interface PaginationState {
  page: number
  limit: number
  total: number
}

export default function AdminBalancesPage() {
  const { loading: authLoading } = useAdminAuth()
  const [balanceHistory, setBalanceHistory] = useState<BalanceHistoryEntry[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 20,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [actionFilter, setActionFilter] = useState<string>('all')

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchBalanceHistory()
  }, [pagination.page, actionFilter])

  const fetchBalanceHistory = async () => {
    setLoading(true)
    try {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('balance_history')
        .select(`
          *,
          profiles:user_id (email, full_name)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching balance history:', error)
        return
      }

      setBalanceHistory(data as unknown as BalanceHistoryEntry[])
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (error) {
      console.error('Error fetching balance history:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'add':
        return 'text-green-500 bg-green-500/10'
      case 'subtract':
        return 'text-red-500 bg-red-500/10'
      case 'set':
        return 'text-blue-500 bg-blue-500/10'
      case 'reset':
        return 'text-orange-500 bg-orange-500/10'
      default:
        return 'text-gray-500 bg-gray-500/10'
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Balance History</h1>
          <p className="text-gray-400 mt-1">Track all balance adjustments</p>
        </div>
        <div className="text-sm text-gray-400">
          Total Records: <span className="text-white font-medium">{pagination.total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex gap-4">
        <select
          value={actionFilter}
          onChange={(e) => {
            setActionFilter(e.target.value)
            setPagination(prev => ({ ...prev, page: 1 }))
          }}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800"
        >
          <option value="all">All Actions</option>
          <option value="add">Add Funds</option>
          <option value="subtract">Subtract Funds</option>
          <option value="set">Set Balance</option>
          <option value="reset">Reset Balance</option>
        </select>
      </div>

      {/* Balance History Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Date</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Amount</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Previous</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">New Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : balanceHistory.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-400">
                    No balance history found
                  </td>
                </tr>
              ) : (
                balanceHistory.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-white font-medium">
                          {entry.profiles?.full_name || 'Unknown'}
                        </p>
                        <p className="text-gray-400 text-sm">{entry.profiles?.email || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getActionColor(entry.action_type)}`}>
                        {entry.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <span className={entry.action_type === 'add' ? 'text-green-500' : entry.action_type === 'subtract' ? 'text-red-500' : 'text-white'}>
                        {entry.action_type === 'add' ? '+' : entry.action_type === 'subtract' ? '-' : ''}
                        €{parseFloat(String(entry.amount)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right text-gray-300">
                      €{parseFloat(String(entry.previous_balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-right text-white font-medium">
                      €{parseFloat(String(entry.new_balance || 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm max-w-xs truncate">
                      {entry.reason || '-'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} records
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page - 1 }))}
                disabled={pagination.page === 1}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Previous
              </button>
              <span className="text-gray-400 text-sm">
                Page {pagination.page} of {totalPages}
              </span>
              <button
                onClick={() => setPagination(prev => ({ ...prev, page: prev.page + 1 }))}
                disabled={pagination.page === totalPages}
                className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Next
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

