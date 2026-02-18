'use client'

import { useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import KycReviewModal from '@/app/admin/components/KycReviewModal'

interface UserProfile {
  id: string
  email: string
  full_name: string | null
  balance: number
  is_active: boolean
  is_admin: boolean
  created_at: string
}

interface PaginationState {
  page: number
  limit: number
  total: number
}

interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

export default function AdminUsersPage() {
  const { loading: authLoading, session } = useAdminAuth()
  const [users, setUsers] = useState<UserProfile[]>([])
  const [pagination, setPagination] = useState<PaginationState>({
    page: 1,
    limit: 10,
    total: 0,
  })
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [debouncedSearch, setDebouncedSearch] = useState('')
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [selectedUser, setSelectedUser] = useState<UserProfile | null>(null)
  const [balanceAction, setBalanceAction] = useState<'add' | 'subtract'>('add')
  const [balanceAmount, setBalanceAmount] = useState('')
  const [balanceReason, setBalanceReason] = useState('')
  const [actionLoading, setActionLoading] = useState(false)
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all')
  const [toast, setToast] = useState<ToastMessage | null>(null)

  // Simulation modal
  const [showSimModal, setShowSimModal] = useState(false)
  const [simLoading, setSimLoading] = useState(false)
  const [simDepositAmount, setSimDepositAmount] = useState('')
  const [simTradeAsset, setSimTradeAsset] = useState('BTC')
  const [simTradeSide, setSimTradeSide] = useState<'buy' | 'sell'>('buy')
  const [simTradeAmount, setSimTradeAmount] = useState('')
  const [simNotificationTitle, setSimNotificationTitle] = useState('')
  const [simNotificationBody, setSimNotificationBody] = useState('')
  const [simResults, setSimResults] = useState<any[] | null>(null)

  // KYC modal
  const [showKycModal, setShowKycModal] = useState(false)
  const [kycRequestId, setKycRequestId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Debounce search term to avoid too many queries
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm)
      setPagination(prev => ({ ...prev, page: 1 }))
    }, 300)
    return () => clearTimeout(timer)
  }, [searchTerm])

  // Fetch users with search and filters
  const fetchUsers = useCallback(async () => {
    setLoading(true)
    try {
      // Try using the search_users function first, fall back to direct query
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      // Apply status filter
      if (statusFilter === 'active') {
        query = query.eq('is_active', true)
      } else if (statusFilter === 'inactive') {
        query = query.eq('is_active', false)
      }

      // Apply search filter on client side for better performance
          const { data, error, count } = await query

      if (error) {
        console.error('Error fetching users:', error)
        setToast({ type: 'error', message: 'Failed to fetch users' })
        return
      }

      // Enrich data with latest kyc request id (if available)
      const mapped = (data as any[] || []).map(u => ({
        ...u,
        latest_kyc_request_id: u.latest_kyc_request_id || null
      }))

      // Apply search filter on client side
      let filteredData = mapped as unknown as UserProfile[]
      if (debouncedSearch) {
        const search = debouncedSearch.toLowerCase()
        filteredData = filteredData.filter(
          user =>
            user.email?.toLowerCase().includes(search) ||
            user.full_name?.toLowerCase().includes(search)
        )
      }

      setUsers(filteredData)
      setPagination(prev => ({ ...prev, total: count || 0 }))
    } catch (error) {
      console.error('Error fetching users:', error)
      setToast({ type: 'error', message: 'An unexpected error occurred' })
    } finally {
      setLoading(false)
    }
  }, [supabase, pagination.page, statusFilter, debouncedSearch])

  useEffect(() => {
    fetchUsers()
  }, [fetchUsers])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const handleAdjustBalance = async () => {
    if (!selectedUser || !balanceAmount) return

    setActionLoading(true)
    try {
      const amount = parseFloat(balanceAmount)
      
      if (isNaN(amount) || amount <= 0) {
        showToast('error', 'Please enter a valid positive amount')
        return
      }

      // Call the database function to adjust balance
      // Using positional parameters as defined in the SQL function
      const { error } = await supabase.rpc('adjust_balance', {
        p_user_id: selectedUser.id,
        p_action_type: balanceAction,
        p_amount: amount,
        p_reason: balanceReason || null,
      })

      if (error) {
        console.error('Error adjusting balance:', error)
        showToast('error', `Failed to adjust balance: ${error.message}`)
        return
      }

      showToast('success', `Successfully ${balanceAction === 'add' ? 'added' : 'subtracted'} €${amount.toLocaleString()} ${balanceAction === 'add' ? 'to' : 'from'} user ${selectedUser.email}`)
      setShowBalanceModal(false)
      setBalanceAmount('')
      setBalanceReason('')
      fetchUsers()
    } catch (error) {
      console.error('Error adjusting balance:', error)
      showToast('error', 'An unexpected error occurred')
    } finally {
      setActionLoading(false)
    }
  }

  const handleToggleUserStatus = async (user: UserProfile) => {
    if (!confirm(`Are you sure you want to ${user.is_active ? 'deactivate' : 'activate'} user ${user.email}?`)) {
      return
    }

    try {
      const { error } = await supabase.rpc('toggle_user_status', {
        user_id: user.id,
        is_active: !user.is_active,
      })

      if (error) {
        console.error('Error toggling user status:', error)
        showToast('error', `Failed to update user status: ${error.message}`)
        return
      }

      showToast('success', `User ${user.email} has been ${!user.is_active ? 'activated' : 'deactivated'}`)
      fetchUsers()
    } catch (error) {
      console.error('Error toggling user status:', error)
      showToast('error', 'An unexpected error occurred')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

  // Map additional fields
  const extendedUsers = filteredUsers.map(u => ({
    ...u,
    latest_kyc_request_id: (u as any).latest_kyc_request_id || null
  }))

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
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Management</h1>
          <p className="text-gray-400 mt-1">Manage user accounts and balances</p>
        </div>
        <div className="text-sm text-gray-400">
          Total Users: <span className="text-white font-medium">{pagination.total}</span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <div className="relative">
            <input
              type="text"
              placeholder="Search users by email or name..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-800 focus:border-transparent"
            />
            <svg 
              className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value as any)}
          className="px-4 py-2.5 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800"
        >
          <option value="all">All Users</option>
          <option value="active">Active Only</option>
          <option value="inactive">Inactive Only</option>
        </select>
      </div>

      {/* Users Table */}
      <div className="bg-gray-800 rounded-xl border border-gray-700 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-gray-700/50">
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">User</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Balance</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">KYC</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Status</th>
                <th className="px-6 py-4 text-left text-xs font-semibold text-gray-300 uppercase tracking-wider">Joined</th>
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
              ) : filteredUsers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-400">
                    No users found
                  </td>
                </tr>
              ) : (
                extendedUsers.map((user) => (
                  <tr key={user.id} className="hover:bg-gray-700/30 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-green-800/30 rounded-full flex items-center justify-center">
                          <span className="text-green-500 font-medium">
                            {user.email?.charAt(0).toUpperCase() || 'U'}
                          </span>
                        </div>
                        <div>
                          <p className="text-white font-medium">{user.full_name || 'N/A'}</p>
                          <p className="text-gray-400 text-sm">{user.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-white font-medium">
                        €{parseFloat(String(user.balance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        user.is_active 
                          ? 'bg-green-500/10 text-green-500' 
                          : 'bg-red-500/10 text-red-500'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
                          user.is_active ? 'bg-green-500' : 'bg-red-500'
                        }`}></span>
                        {user.is_active ? 'Active' : 'Inactive'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        (user as any).kyc_status === 'verified' ? 'bg-green-500/10 text-green-500' : (user as any).kyc_status === 'rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'
                      }`}>
                        {(user as any).kyc_status || 'none'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-400 text-sm">
                      {new Date(user.created_at).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowBalanceModal(true)
                          }}
                          className="px-3 py-1.5 bg-green-800 hover:bg-green-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Adjust Balance
                        </button>

                        <button
                          onClick={() => {
                            setSelectedUser(user)
                            setShowSimModal(true)
                          }}
                          className="px-3 py-1.5 bg-blue-800 hover:bg-blue-700 text-white text-sm rounded-lg transition-colors"
                        >
                          Simulate
                        </button>

                        <button
                          onClick={() => {
                            // open KYC review modal for latest request
                            setSelectedUser(user)
                            setKycRequestId(user.latest_kyc_request_id || '')
                            setShowKycModal(true)
                          }}
                          className="px-3 py-1.5 bg-yellow-700 hover:bg-yellow-600 text-white text-sm rounded-lg transition-colors"
                        >
                          View KYC
                        </button>

                        <button
                          onClick={() => handleToggleUserStatus(user)}
                          className={`px-3 py-1.5 text-sm rounded-lg transition-colors ${
                            user.is_active
                              ? 'bg-red-500/10 hover:bg-red-500/20 text-red-500'
                              : 'bg-green-500/10 hover:bg-green-500/20 text-green-500'
                          }`}
                        >
                          {user.is_active ? 'Deactivate' : 'Activate'}
                        </button>
                      </div>
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
              Showing {((pagination.page - 1) * pagination.limit) + 1} to {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} users
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

      {/* Balance Adjustment Modal */}
      {showBalanceModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-md">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Adjust User Balance</h2>
              <p className="text-gray-400 text-sm mt-1">User: {selectedUser.email}</p>
              <p className="text-gray-400 text-sm">Current Balance: €{parseFloat(String(selectedUser.balance)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</p>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Action</label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setBalanceAction('add')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      balanceAction === 'add'
                        ? 'bg-green-800 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Add Funds
                  </button>
                  <button
                    onClick={() => setBalanceAction('subtract')}
                    className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                      balanceAction === 'subtract'
                        ? 'bg-red-800 text-white'
                        : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                    }`}
                  >
                    Subtract Funds
                  </button>
                </div>
              </div>

              <div>
                <label htmlFor="amount" className="block text-sm font-medium text-gray-300 mb-2">
                  Amount (€)
                </label>
                <input
                  id="amount"
                  type="number"
                  value={balanceAmount}
                  onChange={(e) => setBalanceAmount(e.target.value)}
                  placeholder="0.00"
                  min="0"
                  step="0.01"
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-800"
                />
              </div>

              <div>
                <label htmlFor="reason" className="block text-sm font-medium text-gray-300 mb-2">
                  Reason (Optional)
                </label>
                <textarea
                  id="reason"
                  value={balanceReason}
                  onChange={(e) => setBalanceReason(e.target.value)}
                  placeholder="Enter reason for this adjustment..."
                  rows={3}
                  className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-800 resize-none"
                />
              </div>

              {/* Preview */}
              {balanceAmount && (
                <div className="p-4 bg-gray-700/50 rounded-lg">
                  <p className="text-gray-400 text-sm">New Balance Preview:</p>
                  <p className="text-2xl font-bold text-white">
                    €{(
                      parseFloat(String(selectedUser.balance)) +
                      (balanceAction === 'add' ? 1 : -1) * parseFloat(balanceAmount || '0')
                    ).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
              )}
            </div>
            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button
                onClick={() => {
                  setShowBalanceModal(false)
                  setSelectedUser(null)
                  setBalanceAmount('')
                  setBalanceReason('')
                }}
                className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleAdjustBalance}
                disabled={actionLoading || !balanceAmount}
                className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {actionLoading ? 'Processing...' : 'Confirm Adjustment'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Simulation Modal */}
      {showSimModal && selectedUser && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl">
            <div className="p-6 border-b border-gray-700">
              <h2 className="text-xl font-semibold text-white">Run Simulations</h2>
              <p className="text-gray-400 text-sm mt-1">Run simulated actions for user: {selectedUser.email}</p>
            </div>

            <div className="p-6 space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Simulated Deposit (€)</label>
                  <input type="number" value={simDepositAmount} onChange={(e) => setSimDepositAmount(e.target.value)} placeholder="e.g. 50.00" className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none" />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Simulated Trade</label>
                  <div className="flex gap-2 mb-2">
                    <select value={simTradeAsset} onChange={(e) => setSimTradeAsset(e.target.value)} className="flex-1 px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      <option>BTC</option>
                      <option>ETH</option>
                      <option>SOL</option>
                      <option>BNB</option>
                    </select>
                    <select value={simTradeSide} onChange={(e) => setSimTradeSide(e.target.value as any)} className="w-28 px-3 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white">
                      <option value="buy">Buy</option>
                      <option value="sell">Sell</option>
                    </select>
                  </div>
                  <input type="number" value={simTradeAmount} onChange={(e) => setSimTradeAmount(e.target.value)} placeholder="Amount (e.g. 0.01)" className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none" />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Simulated Notification</label>
                <input type="text" value={simNotificationTitle} onChange={(e) => setSimNotificationTitle(e.target.value)} placeholder="Title" className="mb-2 w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400" />
                <textarea value={simNotificationBody} onChange={(e) => setSimNotificationBody(e.target.value)} placeholder="Body" rows={3} className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400"></textarea>
              </div>

              {simResults && (
                <div className="p-4 bg-gray-700/40 rounded-lg">
                  <h3 className="text-sm font-semibold text-white mb-2">Results</h3>
                  <pre className="text-xs text-gray-200 overflow-auto max-h-40">{JSON.stringify(simResults, null, 2)}</pre>
                </div>
              )}
            </div>

            <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
              <button onClick={() => { setShowSimModal(false); setSelectedUser(null); setSimResults(null) }} className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg">Cancel</button>
              <button onClick={async () => {
                if (!selectedUser) return
                setSimLoading(true)
                setSimResults(null)

                const ops: any[] = []
                if (simDepositAmount && parseFloat(simDepositAmount) > 0) {
                  ops.push({ type: 'deposit', amount: parseFloat(simDepositAmount), reason: 'Admin simulation' })
                }
                if (simTradeAmount && parseFloat(simTradeAmount) > 0) {
                  ops.push({ type: 'transaction', txType: 'trade', amount: parseFloat(simTradeAmount), currency: simTradeAsset, description: `Simulated ${simTradeSide} ${simTradeAsset}`, metadata: { side: simTradeSide, asset: simTradeAsset } })
                }
                if (simNotificationTitle || simNotificationBody) {
                  ops.push({ type: 'notify', title: simNotificationTitle || 'Admin Simulation', body: simNotificationBody || 'This is a simulated notification.' })
                }

                try {
                  const token = session?.access_token || ''

                  const res = await fetch('/api/admin/simulate', {
                    method: 'POST',
                    headers: {
                      'Content-Type': 'application/json',
                      'Authorization': `Bearer ${token}`
                    },
                    body: JSON.stringify({ target_user_id: selectedUser.id, operations: ops })
                  })

                  const data = await res.json()

                  if (!res.ok) {
                    setSimResults([{ success: false, error: data.error || 'Request failed' }])
                    setToast({ type: 'error', message: data.error || 'Simulation failed' })
                  } else {
                    setSimResults(data.results || [{ success: true }])
                    // Refresh user list to reflect any balance changes
                    fetchUsers()
                    setToast({ type: 'success', message: 'Simulations completed' })
                  }
                } catch (e) {
                  setSimResults([{ success: false, error: String(e) }])
                  setToast({ type: 'error', message: 'Simulation request failed' })
                } finally {
                  setSimLoading(false)
                }

              }} disabled={simLoading} className="px-4 py-2 bg-blue-800 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed">{simLoading ? 'Running...' : 'Run Simulations'}</button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 animate-fade-in ${
          toast.type === 'success' 
            ? 'bg-green-900/90 text-green-100 border border-green-700' 
            : 'bg-red-900/90 text-red-100 border border-red-700'
        }`}>
          {toast.type === 'success' ? (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          ) : (
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          )}
          <span>{toast.message}</span>
          <button 
            onClick={() => setToast(null)}
            className="ml-2 hover:opacity-70 transition-opacity"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* KYC Review Modal */}
      {showKycModal && kycRequestId && (
        <KycReviewModal requestId={kycRequestId} onClose={() => { setShowKycModal(false); setKycRequestId(null) }} onUpdated={() => fetchUsers()} />
      )}
    </div>
  )
}

