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
      const from = (pagination.page - 1) * pagination.limit
      const to = from + pagination.limit - 1

      let query = supabase
        .from('profiles')
        .select('*', { count: 'exact' })
        .range(from, to)
        .order('created_at', { ascending: false })

      // Apply status filter815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
      // Using positional parameters as defined in the SQL function815276c (`Updated various files across the application to enhance UI/UX, add new features, and improve functionality.`)
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
        return
      }

      showToast('success', `User ${user.email} has been ${!user.is_active ? 'activated' : 'deactivated'}`)
      fetchUsers()
    } catch (error) {
      console.error('Error toggling user status:', error)
      alert('An unexpected error occurred')
    }
  }

  const filteredUsers = users.filter(user =>
    user.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    user.full_name?.toLowerCase().includes(searchTerm.toLowerCase())
  )

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
    </div>
  )
}

