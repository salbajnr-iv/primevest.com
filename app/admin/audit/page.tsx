'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AuditLogEntry {
  id: string
  admin_id: string
  action_type: string
  target_user_id: string | null
  target_table: string | null
  old_value: any
  new_value: any
  ip_address: string | null
  user_agent: string | null
  created_at: string
  admin_profile?: {
    email: string
    full_name: string | null
  }
}

interface PaginationState {
  page: number
  limit: number
  total: number
}

export default function AdminAuditPage() {
  const { loading: authLoading } = useAdminAuth()
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([])
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
    fetchAuditLogs()
  }, [pagination.page, actionFilter])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('admin_actions')
        .select(`
          *,
          admin_profile:profiles!admin_id (email, full_name)
        `, { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      if (actionFilter !== 'all') {
        query = query.eq('action_type', actionFilter)
      }

      const { data, error, count } = await query

      if (error) {
        console.error('Error fetching audit logs:', error)
        return
      }

      setAuditLogs(data as unknown as AuditLogEntry[])
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (error) {
      console.error('Error fetching audit logs:', error)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  const getActionColor = (actionType: string) => {
    switch (actionType) {
      case 'balance_adjustment':
        return 'text-blue-500 bg-blue-500/10'
      case 'user_status_change':
        return 'text-orange-500 bg-orange-500/10'
      default:
        return 'text-purple-500 bg-purple-500/10'
    }
  }

  const formatActionDetails = (entry: AuditLogEntry) => {
    if (entry.action_type === 'balance_adjustment') {
      const details = entry.new_value
      return (
        <div className="text-sm text-gray-400">
          Action: <span className="capitalize">{details?.action}</span>
          {details?.amount && (
            <> | Amount: €{parseFloat(String(details.amount)).toLocaleString(undefined, { minimumFractionDigits: 2 })}</>
          )}
        </div>
      )
    }
    if (entry.action_type === 'user_status_change') {
      const details = entry.new_value
      return (
        <div className="text-sm text-gray-400">
          Status: <span className={details?.is_active ? 'text-green-500' : 'text-red-500'}>
            {details?.is_active ? 'Active' : 'Inactive'}
          </span>
        </div>
      )
    }
    return null
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
          <h1 className="text-2xl font-bold text-white">Audit Log</h1>
          <p className="text-gray-400 mt-1">Track all administrative actions</p>
        </div>
        <div className="text-sm text-gray-400">
          Total Actions: <span className="text-white font-medium">{pagination.total}</span>
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
          <option value="balance_adjustment">Balance Adjustments</option>
          <option value="user_status_change">User Status Changes</option>
        </select>
      </div>

      {/* Audit Log Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Timestamp</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Admin</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Action</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Details</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center">
                    <div className="flex items-center justify-center">
                      <div className="w-8 h-8 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
                    </div>
                  </td>
                </tr>
              ) : auditLogs.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No audit logs found
                  </td>
                </tr>
              ) : (
                auditLogs.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 bg-green-800/30 rounded-full flex items-center justify-center">
                          <span className="text-green-500 text-sm font-medium">
                            {entry.admin_profile?.email?.charAt(0).toUpperCase() || 'A'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">
                            {entry.admin_profile?.full_name || 'Unknown'}
                          </p>
                          <p className="text-gray-400 text-sm">{entry.admin_profile?.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize ${getActionColor(entry.action_type)}`}>
                        {entry.action_type.replace(/_/g, ' ')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {formatActionDetails(entry)}
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm font-mono">
                      {entry.ip_address || 'N/A'}
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

