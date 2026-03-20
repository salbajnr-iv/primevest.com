'use client'

import React, { useEffect, useMemo, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import KycReviewModal from '@/app/admin/components/KycReviewModal'
import DeleteUserConfirmModal from '@/app/admin/components/DeleteUserConfirmModal'
import ImpersonateConfirmModal from '@/app/admin/components/ImpersonateConfirmModal'
import BalanceAdjustmentModal from '@/app/admin/components/BalanceAdjustmentModal'

export const dynamic = 'force-dynamic'


interface UserProfileDetail {
  id: string
  email: string
  full_name: string | null
  account_balance: number | null
  is_active: boolean
  created_at: string | null
}

interface KycDocument {
  id: string
}

interface KycRequest {
  id: string
  status: string
  submitted_at: string
  kyc_documents?: KycDocument[]
}

export default function AdminUserDetailPage() {
  const { loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const params = useParams<{ id?: string | string[] }>()
  const userId = useMemo(() => {
    const rawId = params?.id
    if (Array.isArray(rawId)) {
      return rawId[0] ?? ''
    }

    return rawId ?? ''
  }, [params])

  const [user, setUser] = useState<UserProfileDetail | null>(null)
  const [loading, setLoading] = useState(true)
  const [kycRequests, setKycRequests] = useState<KycRequest[]>([])
  const [showKycModal, setShowKycModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)
  const [showDeleteModal, setShowDeleteModal] = useState(false)
  const [showImpersonateModal, setShowImpersonateModal] = useState(false)
  const [showBalanceModal, setShowBalanceModal] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [actionError, setActionError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    if (!userId) {
      setUser(null)
      setKycRequests([])
      setLoading(false)
      return
    }

    fetchData(userId)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchData(targetUserId: string) {
    setLoading(true)

    if (!supabase) {
      setUser(null)
      setKycRequests([])
      setLoading(false)
      return
    }

    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', targetUserId).maybeSingle()
      setUser(profile || null)

      const { data: requests } = await supabase
        .from('kyc_requests')
        .select('*, kyc_documents(*)')
        .eq('user_id', targetUserId)
        .order('submitted_at', { ascending: false })
        .limit(10)
      setKycRequests(requests || [])
    } catch (e) {
      console.error('Failed to load user detail', e)
      setUser(null)
      setKycRequests([])
    } finally {
      setLoading(false)
    }
  }

  async function handleDeleteUser() {
    setActionLoading(true)
    setActionError(null)

    if (!supabase) {
      setActionError('Supabase is not configured')
      setActionLoading(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setActionError('Not authenticated')
        return
      }

      const response = await fetch('/api/admin/users/delete', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setActionError(data.error || 'Failed to delete user')
        return
      }

      router.push('/admin/users')
    } catch (err) {
      setActionError(String(err))
    } finally {
      setActionLoading(false)
      setShowDeleteModal(false)
    }
  }

  async function handleImpersonate() {
    setActionLoading(true)
    setActionError(null)

    if (!supabase) {
      setActionError('Supabase is not configured')
      setActionLoading(false)
      return
    }

    try {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session) {
        setActionError('Not authenticated')
        return
      }

      const response = await fetch('/api/admin/users/impersonate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${session.access_token}`,
        },
        body: JSON.stringify({ user_id: userId }),
      })

      if (!response.ok) {
        const data = await response.json()
        setActionError(data.error || 'Failed to impersonate user')
        return
      }

      const data = await response.json()
      alert(`Impersonation session started for ${data.user.email}. Check audit logs.`)
      router.push('/admin/users')
    } catch (err) {
      setActionError(String(err))
    } finally {
      setActionLoading(false)
      setShowImpersonateModal(false)
    }
  }

  if (authLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
      </div>
    )
  }

  if (!userId) {
    return (
      <div className="space-y-6 p-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-white">User Detail</h1>
            <p className="text-gray-400">Manage user account and review KYC</p>
          </div>
          <button onClick={() => router.push('/admin/users')} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300">Back to users</button>
        </div>

        <div className="p-6 bg-gray-800 rounded border border-gray-700 text-gray-300">
          Missing user id in route. Please open a user from the users list.
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 p-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">User Detail</h1>
          <p className="text-gray-400">Manage user account and review KYC</p>
        </div>
        <div>
          <button onClick={() => router.back()} className="px-3 py-2 bg-gray-800 border border-gray-700 rounded text-gray-300">Back</button>
        </div>
      </div>

      {actionError && (
        <div className="p-4 bg-red-900 border border-red-600 rounded text-red-100">
          {actionError}
        </div>
      )}

      {loading ? (
        <div className="p-6 bg-gray-800 rounded">Loading...</div>
      ) : !user ? (
        <div className="p-6 bg-gray-800 rounded border border-gray-700 text-gray-300">
          User not found. The account may have been removed.
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="text-lg font-semibold text-white">Profile</h3>
              <div className="mt-3 text-sm text-gray-300">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Full name:</strong> {user.full_name || '—'}</p>
                <p><strong>Balance:</strong> {user.account_balance ?? '0'} EUR</p>
                <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
                <p><strong>Member since:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => setShowBalanceModal(true)} className="px-3 py-2 bg-green-700 text-white rounded">Adjust Balance</button>
                <button
                  onClick={async () => {
                    try {
                      const tokenRes = await supabase.auth.getSession()
                      const token = tokenRes.data?.session?.access_token
                      if (!token) throw new Error('Not authenticated')

                      const res = await fetch('/api/admin/users/status', {
                        method: 'POST',
                        headers: {
                          'Content-Type': 'application/json',
                          'Authorization': `Bearer ${token}`
                        },
                        body: JSON.stringify({ userId: user.id, isActive: !user.is_active })
                      })

                      if (!res.ok) {
                        const data = await res.json()
                        throw new Error(data.error || 'Update failed')
                      }

                      setUser((u) => (u ? { ...u, is_active: !u.is_active } : u))
                      alert('Status updated')
                    } catch (e) {
                      console.error(e)
                      alert(e instanceof Error ? e.message : 'Failed to update status')
                    }
                  }}
                  className="px-3 py-2 bg-blue-800 text-white rounded"
                >
                  Toggle Active
                </button>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="text-lg font-semibold text-white">Transactions</h3>
              <p className="text-sm text-gray-400 mt-2">Access the transactions page for this user in the Transactions section.</p>
            </div>

            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="text-lg font-semibold text-white">KYC Requests</h3>
              {kycRequests.length === 0 ? (
                <p className="text-sm text-gray-400">No requests</p>
              ) : (
                <div className="space-y-2 mt-3">
                  {kycRequests.map((req) => (
                    <div key={req.id} className="p-3 bg-gray-900 rounded border border-gray-700 flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{req.status}</div>
                        <div className="text-xs text-gray-400">Submitted: {new Date(req.submitted_at).toLocaleString()}</div>
                      </div>
                      <div className="flex gap-2">
                        <button onClick={() => { setSelectedRequestId(req.id); setShowKycModal(true) }} className="px-3 py-1 bg-blue-800 text-white rounded">Review</button>
                        <a target="_blank" rel="noreferrer" href={`/api/admin/kyc/document?id=${req.kyc_documents?.[0]?.id}`} className="px-3 py-1 bg-gray-700 text-gray-300 rounded">Download</a>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          <aside className="space-y-4">
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-white">Quick Info</h4>
              <div className="text-xs text-gray-400 mt-2">
                <p>Orders: —</p>
                <p>Last login: —</p>
              </div>
            </div>

            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h4 className="text-sm font-semibold text-white">Admin Actions</h4>
              <div className="mt-3 flex flex-col gap-2">
                <button
                  onClick={() => setShowImpersonateModal(true)}
                  className="px-3 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-600"
                >
                  Impersonate
                </button>
                <button
                  onClick={() => setShowDeleteModal(true)}
                  className="px-3 py-2 bg-red-700 text-white rounded hover:bg-red-600"
                >
                  Delete User
                </button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showKycModal && selectedRequestId && (
        <KycReviewModal requestId={selectedRequestId} onClose={() => { setShowKycModal(false); setSelectedRequestId(null) }} onUpdated={() => fetchData(userId)} />
      )}

      {showDeleteModal && user && (
        <DeleteUserConfirmModal
          userName={user.full_name || 'Unknown'}
          userEmail={user.email}
          onConfirm={handleDeleteUser}
          onCancel={() => setShowDeleteModal(false)}
          loading={actionLoading}
        />
      )}

      {showImpersonateModal && user && (
        <ImpersonateConfirmModal
          userName={user.full_name || 'Unknown'}
          userEmail={user.email}
          onConfirm={handleImpersonate}
          onCancel={() => setShowImpersonateModal(false)}
          loading={actionLoading}
        />
      )}

      {showBalanceModal && user && (
        <BalanceAdjustmentModal
          userId={user.id}
          userName={user.full_name || user.email}
          onClose={() => setShowBalanceModal(false)}
          onSuccess={() => fetchData(userId)}
        />
      )}
    </div>
  )
}
