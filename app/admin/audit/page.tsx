'use client'

import { useEffect, useState } from 'react'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

export const dynamic = 'force-dynamic'

interface AuditEntry {
  id: string
  admin_id: string
  action_type: string
  target_user_id: string | null
  old_value: any
  new_value: any
  ip_address: string | null
  created_at: string
  admin?: { email: string; full_name: string | null }
  target?: { email: string; full_name: string | null }
}

export default function AdminAuditPage() {
  const { loading: authLoading } = useAdminAuth()
  const [actions, setActions] = useState<AuditEntry[]>([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [total, setTotal] = useState(0)
  const [typeFilter, setTypeFilter] = useState('all')
  const limit = 20

  const supabase = createClient()

  useEffect(() => {
    fetchAuditLogs()
  }, [page, typeFilter])

  const fetchAuditLogs = async () => {
    setLoading(true)
    try {
      const tokenRes = await supabase.auth.getSession()
      const token = tokenRes.data?.session?.access_token || ''
      const res = await fetch(`/api/admin/actions?page=${page}&limit=${limit}&type=${typeFilter}`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      const data = await res.json()
      if (res.ok) {
        setActions(data.actions || [])
        setTotal(data.total || 0)
      }
    } catch (e) {
      console.error('Audit load error', e)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(total / limit)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-emerald-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">System Audit Log</h1>
          <p className="text-gray-400 mt-1">Track all administrative and system-critical changes</p>
        </div>
      </div>

      <div className="flex gap-4">
        <select
          value={typeFilter}
          onChange={(e) => { setTypeFilter(e.target.value); setPage(1) }}
          className="px-4 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white"
        >
          <option value="all">All Action Types</option>
          <option value="kyc_review">KYC Review</option>
          <option value="user_status_toggle">User Status Toggle</option>
          <option value="ledger_transfer">Ledger Transfer</option>
          <option value="user_delete">User Deletion</option>
          <option value="impersonation">Impersonation</option>
        </select>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm text-left">
            <thead className="bg-gray-900/50 text-gray-300">
              <tr>
                <th className="px-6 py-4 font-semibold uppercase">Timestamp</th>
                <th className="px-6 py-4 font-semibold uppercase">Admin</th>
                <th className="px-6 py-4 font-semibold uppercase">Action</th>
                <th className="px-6 py-4 font-semibold uppercase">Target User</th>
                <th className="px-6 py-4 font-semibold uppercase">Changes</th>
                <th className="px-6 py-4 font-semibold uppercase">IP Address</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-700">
              {loading ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">Loading entries...</td></tr>
              ) : actions.length === 0 ? (
                <tr><td colSpan={6} className="px-6 py-12 text-center text-gray-400">No audit logs found.</td></tr>
              ) : (
                actions.map((entry) => (
                  <tr key={entry.id} className="hover:bg-gray-700/30">
                    <td className="px-6 py-4 whitespace-nowrap text-gray-400">
                      {new Date(entry.created_at).toLocaleString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{entry.admin?.full_name || 'Admin'}</div>
                      <div className="text-gray-500 text-xs">{entry.admin?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2 py-1 bg-emerald-900/30 text-emerald-400 rounded text-xs font-mono">
                        {entry.action_type}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {entry.target ? (
                        <>
                          <div className="text-white">{entry.target.full_name || 'User'}</div>
                          <div className="text-gray-500 text-xs">{entry.target.email}</div>
                        </>
                      ) : (
                        <span className="text-gray-600">—</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <div className="max-w-xs overflow-hidden">
                        <details className="text-xs text-gray-400 cursor-pointer hover:text-white">
                          <summary>View Change Log</summary>
                          <div className="mt-2 p-2 bg-black/40 rounded space-y-2">
                            <div><span className="text-red-400">Old:</span> {JSON.stringify(entry.old_value)}</div>
                            <div><span className="text-green-400">New:</span> {JSON.stringify(entry.new_value)}</div>
                          </div>
                        </details>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-gray-500 font-mono text-xs">
                      {entry.ip_address || 'Internal'}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between text-gray-400">
            <div>Page {page} of {totalPages}</div>
            <div className="flex gap-2">
              <button
                disabled={page === 1}
                onClick={() => setPage(p => p - 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
              >
                Prev
              </button>
              <button
                disabled={page === totalPages}
                onClick={() => setPage(p => p + 1)}
                className="px-3 py-1 bg-gray-700 rounded disabled:opacity-50"
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
