'use client'

import { useState, useEffect, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminSettings {
  requireEmailConfirmation: boolean
  allowUserRegistration: boolean
  maxWithdrawalLimit: number
  notifyOnLargeTransactions: boolean
  largeTransactionThreshold: number
  sessionTimeout: number
}

interface ToastMessage {
  type: 'success' | 'error'
  message: string
}

export default function AdminSettingsPage() {
  const { user, loading: authLoading } = useAdminAuth()
  const [saving, setSaving] = useState(false)
  const [loading, setLoading] = useState(true)
  const [toast, setToast] = useState<ToastMessage | null>(null)

  const [settings, setSettings] = useState<AdminSettings>({
import { useAdminAuth } from '@/contexts/AdminAuthContext'

interface AdminSettings {
  requireEmailConfirmation: boolean
  allowUserRegistration: boolean
  maxWithdrawalLimit: number
  notifyOnLargeTransactions: boolean
  largeTransactionThreshold: number
  sessionTimeout: number
}

  const [settings, setSettings] = useState({
    requireEmailConfirmation: true,
    allowUserRegistration: true,
    maxWithdrawalLimit: 10000,
    notifyOnLargeTransactions: true,
    largeTransactionThreshold: 5000,
    sessionTimeout: 60,
  })

  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Configure platform settings and security options</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {saving && (
            <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
          )}
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      {/* Success Message */}
      {toast && toast.type === 'success' && (
        <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
            </button>
          </div>
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Deactivate All Users</p>
              <p className="text-gray-400 text-sm">Temporarily disable all non-admin user accounts</p>
            </div>
            <button
              onClick={handleDeactivateUsers}
              className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg transition-colors"
            >
              Deactivate All
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

