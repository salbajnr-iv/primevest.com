"use client";

import React from 'react'
import DashboardHeader from '@/components/DashboardHeader'
import KycUploader from '@/components/KycUploader'
import { createClient } from '@/lib/supabase/client'

export default function VerifyKycPage() {
  const [status, setStatus] = React.useState('none')
  const [requests, setRequests] = React.useState<any[]>([])
  const [loading, setLoading] = React.useState(true)
  const [docsToSubmit, setDocsToSubmit] = React.useState<any[]>([])
  const [submitting, setSubmitting] = React.useState(false)

  const supabase = createClient()

  React.useEffect(() => {
    let mounted = true
    async function load() {
      setLoading(true)
      try {
        const { data: sessionData } = await supabase.auth.getSession()
        const userId = sessionData?.session?.user?.id
        if (!userId) return

        const { data: profile } = await supabase.from('profiles').select('kyc_status').eq('id', userId).maybeSingle()
        if (mounted && profile) setStatus(profile.kyc_status || 'none')

        const { data: reqs } = await supabase.from('kyc_requests').select('*, kyc_documents(*)').eq('user_id', userId).order('submitted_at', { ascending: false })
        if (mounted && reqs) setRequests(reqs)
      } catch (e) {
        console.error('Failed to load KYC', e)
      } finally {
        setLoading(false)
      }
    }
    load()
    return () => { mounted = false }
  }, [supabase])

  function handleUploaded(files: any[]) {
    // append to docs list to submit
    setDocsToSubmit(prev => [...prev, ...files])
  }

  async function submitRequest() {
    if (!docsToSubmit.length) return alert('Please upload documents first')
    setSubmitting(true)
    try {
      const tokenRes = await supabase.auth.getSession()
      const token = tokenRes.data?.session?.access_token || ''
      const res = await fetch('/api/kyc/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ documents: docsToSubmit })
      })
      const data = await res.json()
      if (!res.ok) throw new Error(data.error || 'Failed')
      alert('KYC submitted')
      // refresh
      const { data: reqs } = await supabase.from('kyc_requests').select('*, kyc_documents(*)').order('submitted_at', { ascending: false })
      setRequests(reqs || [])
      setDocsToSubmit([])
    } catch (e) {
      console.error('Submit failed', e)
      alert('Failed to submit KYC')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName={"User"} />

        <main className="page-card">
          <h2>Identity Verification (KYC)</h2>
          <p className="text-gray-400">Status: <strong className="text-white">{status}</strong></p>

          <section className="mt-4">
            <h3 className="text-lg font-semibold text-white">Upload Documents</h3>
            <p className="text-gray-400 text-sm mb-4">Accepted: JPG, PNG, PDF. Max 10MB per file.</p>
            <KycUploader userId={''} onUploaded={handleUploaded} />

            <div className="mt-4">
              <button onClick={submitRequest} disabled={submitting || docsToSubmit.length === 0} className="px-4 py-2 bg-green-800 text-white rounded-lg">{submitting ? 'Submitting...' : 'Submit KYC'}</button>
            </div>
          </section>

          <section className="mt-6">
            <h3 className="text-lg font-semibold text-white">Previous Submissions</h3>
            {loading ? (
              <p className="text-gray-400">Loading...</p>
            ) : requests.length === 0 ? (
              <p className="text-gray-400">No previous submissions</p>
            ) : (
              <div className="space-y-3 mt-3">
                {requests.map(r => (
                  <div key={r.id} className="p-3 bg-gray-800 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div>
                        <div className="text-white font-medium">{r.status}</div>
                        <div className="text-gray-400 text-sm">Submitted: {new Date(r.submitted_at).toLocaleString()}</div>
                      </div>
                      <div>
                        {r.kyc_documents?.map((d: any) => (
                          <div key={d.id} className="text-sm text-gray-300">{d.file_name}</div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>
        </main>
      </div>
    </div>
  )
}
