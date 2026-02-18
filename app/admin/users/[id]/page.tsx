"use client";

import React, { useEffect, useState } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'
import KycReviewModal from '@/app/admin/components/KycReviewModal'

export default function AdminUserDetailPage() {
  const { loading: authLoading } = useAdminAuth()
  const router = useRouter()
  const params = useSearchParams()
  const userId = params.get('id') || ''

  const [user, setUser] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [kycRequests, setKycRequests] = useState<any[]>([])
  const [showKycModal, setShowKycModal] = useState(false)
  const [selectedRequestId, setSelectedRequestId] = useState<string | null>(null)

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  useEffect(() => {
    if (!userId) return
    fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId])

  async function fetchData() {
    setLoading(true)
    try {
      const { data: profile } = await supabase.from('profiles').select('*').eq('id', userId).maybeSingle()
      setUser(profile || null)

      const { data: requests } = await supabase.from('kyc_requests').select('*, kyc_documents(*)').eq('user_id', userId).order('submitted_at', { ascending: false }).limit(10)
      setKycRequests(requests || [])
    } catch (e) {
      console.error('Failed to load user detail', e)
    } finally {
      setLoading(false)
    }
  }

  if (authLoading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-12 h-12 border-4 border-green-800 border-t-transparent rounded-full animate-spin"></div>
    </div>
  )

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

      {loading ? (
        <div className="p-6 bg-gray-800 rounded">Loading...</div>
      ) : !user ? (
        <div className="p-6 bg-gray-800 rounded">User not found</div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="md:col-span-2 space-y-4">
            <div className="p-4 bg-gray-800 rounded border border-gray-700">
              <h3 className="text-lg font-semibold text-white">Profile</h3>
              <div className="mt-3 text-sm text-gray-300">
                <p><strong>Email:</strong> {user.email}</p>
                <p><strong>Full name:</strong> {user.full_name || '—'}</p>
                <p><strong>Balance:</strong> {user.balance ?? '0'} EUR</p>
                <p><strong>Status:</strong> {user.is_active ? 'Active' : 'Inactive'}</p>
                <p><strong>Member since:</strong> {user.created_at ? new Date(user.created_at).toLocaleString() : '—'}</p>
              </div>

              <div className="mt-4 flex gap-3">
                <button onClick={() => router.push(`/admin/users?action=adjust&id=${user.id}`)} className="px-3 py-2 bg-green-700 text-white rounded">Adjust Balance</button>
                <button onClick={async () => {
                  try {
                    const { error } = await supabase.from('profiles').update({ is_active: !user.is_active }).eq('id', user.id)
                    if (error) throw error
                    setUser((u: any) => ({ ...u, is_active: !u.is_active }))
                    alert('Status updated')
                  } catch (e) { console.error(e); alert('Failed to update status') }
                }} className="px-3 py-2 bg-blue-800 text-white rounded">Toggle Active</button>
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
                  {kycRequests.map(req => (
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
                <button onClick={() => router.push(`/admin/users/${user.id}/impersonate`)} className="px-3 py-2 bg-yellow-700 text-white rounded">Impersonate</button>
                <button onClick={() => router.push(`/admin/users?action=delete&id=${user.id}`)} className="px-3 py-2 bg-red-700 text-white rounded">Delete User</button>
              </div>
            </div>
          </aside>
        </div>
      )}

      {showKycModal && selectedRequestId && (
        <KycReviewModal requestId={selectedRequestId} onClose={() => { setShowKycModal(false); setSelectedRequestId(null); }} onUpdated={() => fetchData()} />
      )}
    </div>
  )
}
