'use client'

import { useEffect, useState } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import KycReviewModal from '@/app/admin/components/KycReviewModal'

interface KycRequestEntry {
  id: string
  user_id: string
  status: string
  submitted_at: string
  reviewed_at?: string
  review_reason?: string
  profiles?: { email?: string; full_name?: string | null }
  kyc_documents?: any[]
}

interface PaginationState {
  page: number
  limit: number
  total: number
}

export default function AdminKycPage() {
  const { loading: authLoading } = useAdminAuth()
  const [requests, setRequests] = useState<KycRequestEntry[]>([])
  const [pagination, setPagination] = useState<PaginationState>({ page: 1, limit: 20, total: 0 })
  const [loading, setLoading] = useState(true)
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [search, setSearch] = useState<string>('')
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    fetchRequests()
  }, [pagination.page, statusFilter])

  const fetchRequests = async () => {
    setLoading(true)
    try {
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('kyc_requests')
        .select('*, kyc_documents(*), profiles:user_id (email, full_name)', { count: 'exact' })
        .range(from, to)
        .order('submitted_at', { ascending: false })

      if (statusFilter !== 'all') {
        query = query.eq('status', statusFilter)
      }

      const { data, error, count } = await query
      if (error) {
        console.error('Error fetching KYC requests:', error)
        return
      }

      let list = (data as KycRequestEntry[]) || []
      if (search) {
        const s = search.toLowerCase()
        list = list.filter(r => (r.profiles?.email || '').toLowerCase().includes(s) || (r.profiles?.full_name || '').toLowerCase().includes(s))
      }

      setRequests(list)
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (err) {
      console.error('Error fetching KYC requests:', err)
    } finally {
      setLoading(false)
    }
  }

  const totalPages = Math.ceil(pagination.total / pagination.limit)

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">KYC Requests</h1>
          <p className="text-gray-400 mt-1">Review identity verification requests</p>
        </div>
        <div className="text-sm text-gray-400">
          Total Requests: <span className="text-white font-medium">{pagination.total}</span>
        </div>
      </div>

      <div className="flex gap-4">
        <select value={statusFilter} onChange={(e) => { setStatusFilter(e.target.value); setPagination(prev => ({ ...prev, page: 1 })) }} className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800">
          <option value="all">All</option>
          <option value="submitted">Submitted</option>
          <option value="under_review">Under Review</option>
          <option value="verified">Verified</option>
          <option value="rejected">Rejected</option>
        </select>

        <div className="flex-1">
          <div className="relative">
            <input value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Search by email or name..." className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-800" />
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
      </div>

      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Submitted</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Docs</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-right text-xs font-semibold text-gray-300 uppercase tracking-wider">Actions</th>
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
              ) : requests.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">No KYC requests found</td>
                </tr>
              ) : (
                requests.map((r) => (
                  <tr key={r.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4 text-gray-400 text-sm whitespace-nowrap">{new Date(r.submitted_at).toLocaleString()}</td>
                    <td className="px-6 py-4">
                      <div className="text-white font-medium">{r.profiles?.full_name || 'N/A'}</div>
                      <div className="text-gray-400 text-sm">{r.profiles?.email}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-300">{r.kyc_documents?.length || 0}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${r.status === 'verified' ? 'bg-green-500/10 text-green-500' : r.status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button onClick={() => { setSelectedRequestId(r.id) }} className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 text-white rounded-lg">View</button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="px-6 py-4 border-t border-gray-700 flex items-center justify-between">
            <div className="text-sm text-gray-400">Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} requests</div>
            <div className="flex items-center gap-2">
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.max(1, prev.page - 1) }))} disabled={pagination.page === 1} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Previous</button>
              <span className="text-gray-400 text-sm">Page {pagination.page} of {totalPages}</span>
              <button onClick={() => setPagination(prev => ({ ...prev, page: Math.min(totalPages, prev.page + 1) }))} disabled={pagination.page === totalPages} className="px-3 py-1.5 bg-gray-700 hover:bg-gray-600 text-white text-sm rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">Next</button>
            </div>
          </div>
        )}
      </div>

      {selectedRequestId && (
        <KycReviewModal requestId={selectedRequestId} onClose={() => setSelectedRequestId(null)} onUpdated={() => fetchRequests()} />
      )}
    </div>
  )
}
