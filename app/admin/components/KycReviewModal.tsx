"use client";

import React from 'react'
import { createClient } from '@/lib/supabase/client'

export default function KycReviewModal({ requestId, onClose, onUpdated }: { requestId: string, onClose: () => void, onUpdated?: () => void }) {
  const [request, setRequest] = React.useState<any | null>(null)
  const [loading, setLoading] = React.useState(true)
  const [actionLoading, setActionLoading] = React.useState(false)
  const [reason, setReason] = React.useState('')

  const supabase = createClient()

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const tokenRes = await supabase.auth.getSession()
        const token = tokenRes.data?.session?.access_token || ''
        const res = await fetch(`/api/admin/kyc/requests?id=${requestId}`, { headers: { 'Authorization': `Bearer ${token}` } })
        const data = await res.json()
        if (res.ok) setRequest(data.request)
      } catch (e) {
        console.error('Failed to load request', e)
      } finally {
        if (mounted) setLoading(false)
      }
    }
    if (requestId) load()
    return () => { mounted = false }
  }, [requestId, supabase])

  async function downloadDoc(docId: string) {
    try {
      const tokenRes = await supabase.auth.getSession()
      const token = tokenRes.data?.session?.access_token || ''
      const res = await fetch(`/api/admin/kyc/document?id=${docId}`, { headers: { 'Authorization': `Bearer ${token}` } })
      const data = await res.json()
      if (res.ok && data.url) window.open(data.url, '_blank')
      else alert('Could not get document')
    } catch (e) { console.error(e); alert('Failed') }
  }

  async function review(status: 'verified' | 'rejected') {
    setActionLoading(true)
    try {
      const tokenRes = await supabase.auth.getSession()
      const token = tokenRes.data?.session?.access_token || ''
      const res = await fetch('/api/admin/kyc/review', { method: 'POST', headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` }, body: JSON.stringify({ request_id: requestId, status, reason }) })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      alert('Review saved')
      onUpdated && onUpdated()
      onClose()
    } catch (e) {
      console.error(e)
      alert('Failed to save review')
    } finally {
      setActionLoading(false)
    }
  }

  if (!requestId) return null

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl">
        <div className="p-6 border-b border-gray-700 flex items-center justify-between">
          <div>
            <h2 className="text-xl font-semibold text-white">KYC Request Review</h2>
            <p className="text-gray-400 text-sm">User: {request?.profiles?.email || request?.user_id}</p>
          </div>
          <div>
            <button onClick={onClose} className="text-gray-400 hover:opacity-80">Close</button>
          </div>
        </div>

        <div className="p-6 space-y-4">
          {loading ? (
            <p className="text-gray-400">Loading...</p>
          ) : (
            <div>
              <div className="mb-4">
                <div className="text-gray-300">Status: <strong className="text-white">{request?.status}</strong></div>
                <div className="text-gray-400 text-sm">Submitted: {new Date(request?.submitted_at).toLocaleString()}</div>
              </div>

              <div className="space-y-2">
                {request?.kyc_documents?.map((d: any) => (
                  <div key={d.id} className="p-3 bg-gray-700 rounded-lg flex items-center justify-between">
                    <div>
                      <div className="text-white font-medium">{d.file_name}</div>
                      <div className="text-gray-400 text-sm">{d.doc_type} • {d.mime_type}</div>
                    </div>
                    <div>
                      <button onClick={() => downloadDoc(d.id)} className="px-3 py-1.5 bg-blue-800 text-white rounded-lg">Download</button>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mt-4">
                <label className="block text-sm text-gray-300 mb-2">Review note / reason</label>
                <textarea value={reason} onChange={(e) => setReason(e.target.value)} rows={3} className="w-full px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400" />
              </div>
            </div>
          )}
        </div>

        <div className="p-6 border-t border-gray-700 flex justify-end gap-3">
          <button onClick={() => review('rejected')} disabled={actionLoading} className="px-4 py-2 bg-red-700 text-white rounded-lg">{actionLoading ? 'Saving...' : 'Reject'}</button>
          <button onClick={() => review('verified')} disabled={actionLoading} className="px-4 py-2 bg-green-800 text-white rounded-lg">{actionLoading ? 'Saving...' : 'Verify'}</button>
        </div>
      </div>
    </div>
  )
}
