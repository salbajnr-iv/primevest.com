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
    requireEmailConfirmation: true,
    allowUserRegistration: true,
    maxWithdrawalLimit: 10000,
    notifyOnLargeTransactions: true,
    largeTransactionThreshold: 5000,
    sessionTimeout: 60,
  })

  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  const fetchSettings = useCallback(async () => {
    try {
      const { data, error } = await supabase.rpc('get_admin_settings')
      
      if (error) {
        console.error('Error fetching settings:', error)
        // Use default settings if function doesn't exist yet
        return
      }

      if (data) {
        setSettings(prev => ({
          ...prev,
          ...(data as AdminSettings)
        }))
      }
    } catch (error) {
      console.error('Error fetching settings:', error)
    } finally {
      setLoading(false)
    }
  }, [supabase])

  useEffect(() => {
    fetchSettings()
  }, [fetchSettings])

  const showToast = (type: 'success' | 'error', message: string) => {
    setToast({ type, message })
    setTimeout(() => setToast(null), 5000)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      const { error } = await supabase.rpc('update_admin_settings', {
        p_settings: settings as unknown as Record<string, unknown>
      })

      if (error) {
        console.error('Error saving settings:', error)
        showToast('error', `Failed to save settings: ${error.message}`)
        return
      }

      showToast('success', 'Settings saved successfully')
    } catch (error) {
      console.error('Error saving settings:', error)
      showToast('error', 'An unexpected error occurred')
    } finally {
      setSaving(false)
    }
  }

  const handleResetBalances = async () => {
    if (!confirm('Are you sure you want to reset ALL user balances to zero? This cannot be undone!')) {
      return
    }

    try {
      const { error } = await supabase.rpc('reset_all_balances')
      
      if (error) {
        console.error('Error resetting balances:', error)
        showToast('error', `Failed to reset balances: ${error.message}`)
        return
      }

      showToast('success', 'All user balances have been reset to zero')
    } catch (error) {
      console.error('Error resetting balances:', error)
      showToast('error', 'An unexpected error occurred')
    }
  }

  const handleDeactivateUsers = async () => {
    if (!confirm('Are you sure you want to deactivate ALL non-admin users? This cannot be undone!')) {
      return
    }

    try {
      const { error } = await supabase.rpc('deactivate_all_users')
      
      if (error) {
        console.error('Error deactivating users:', error)
        showToast('error', `Failed to deactivate users: ${error.message}`)
        return
      }

      showToast('success', 'All non-admin users have been deactivated')
    } catch (error) {
      console.error('Error deactivating users:', error)
      showToast('error', 'An unexpected error occurred')
    }
  }

  if (authLoading || loading) {
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
          <span className="text-green-500">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-green-500 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Error Message */}
      {toast && toast.type === 'error' && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-3">
          <svg className="w-5 h-5 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
          <span className="text-red-500">{toast.message}</span>
          <button onClick={() => setToast(null)} className="ml-auto text-red-500 hover:opacity-70">
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Platform Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Platform Settings</h2>
          <p className="text-gray-400 text-sm mt-1">General platform configuration</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">User Registration</p>
              <p className="text-gray-400 text-sm">Allow new users to register</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, allowUserRegistration: !prev.allowUserRegistration }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.allowUserRegistration ? 'bg-green-800' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.allowUserRegistration ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Email Confirmation Required</p>
              <p className="text-gray-400 text-sm">Users must confirm email before trading</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, requireEmailConfirmation: !prev.requireEmailConfirmation }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.requireEmailConfirmation ? 'bg-green-800' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.requireEmailConfirmation ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Maximum Withdrawal Limit (EUR)</label>
            <input
              type="number"
              value={settings.maxWithdrawalLimit}
              onChange={(e) => setSettings(prev => ({ ...prev, maxWithdrawalLimit: parseFloat(e.target.value) || 0 }))}
              className="w-full max-w-xs px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800"
            />
            <p className="text-gray-400 text-sm mt-1">Maximum amount a user can withdraw in one transaction</p>
          </div>
        </div>
      </div>

      {/* Security Settings */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Security Settings</h2>
          <p className="text-gray-400 text-sm mt-1">Admin account security configuration</p>
        </div>
        <div className="p-6 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Large Transaction Alerts</p>
              <p className="text-gray-400 text-sm">Get notified for transactions above threshold</p>
            </div>
            <button
              onClick={() => setSettings(prev => ({ ...prev, notifyOnLargeTransactions: !prev.notifyOnLargeTransactions }))}
              className={`w-12 h-6 rounded-full transition-colors ${
                settings.notifyOnLargeTransactions ? 'bg-green-800' : 'bg-gray-600'
              }`}
            >
              <div className={`w-5 h-5 bg-white rounded-full shadow transition-transform ${
                settings.notifyOnLargeTransactions ? 'translate-x-6' : 'translate-x-0.5'
              }`}></div>
            </button>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Large Transaction Threshold (EUR)</label>
            <input
              type="number"
              value={settings.largeTransactionThreshold}
              onChange={(e) => setSettings(prev => ({ ...prev, largeTransactionThreshold: parseFloat(e.target.value) || 0 }))}
              className="w-full max-w-xs px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800"
            />
            <p className="text-gray-400 text-sm mt-1">Transactions above this amount will trigger alerts</p>
          </div>

          <div>
            <label className="block text-white font-medium mb-2">Admin Session Timeout (minutes)</label>
            <input
              type="number"
              value={settings.sessionTimeout}
              onChange={(e) => setSettings(prev => ({ ...prev, sessionTimeout: parseInt(e.target.value) || 30 }))}
              className="w-full max-w-xs px-4 py-2.5 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-800"
            />
            <p className="text-gray-400 text-sm mt-1">Auto logout after inactivity</p>
          </div>
        </div>
      </div>

      {/* Admin Account Info */}
      <div className="bg-gray-800 rounded-xl border border-gray-700">
        <div className="p-6 border-b border-gray-700">
          <h2 className="text-lg font-semibold text-white">Admin Account</h2>
          <p className="text-gray-400 text-sm mt-1">Your admin account information</p>
        </div>
        <div className="p-6">
          <div className="flex items-center gap-4">
            <div className="w-16 h-16 bg-green-800/30 rounded-full flex items-center justify-center">
              <span className="text-green-500 text-2xl font-bold">
                {user?.email?.charAt(0).toUpperCase() || 'A'}
              </span>
            </div>
            <div>
              <p className="text-white font-medium text-lg">{user?.email}</p>
              <p className="text-gray-400 text-sm">Administrator</p>
              <p className="text-gray-500 text-xs mt-1">ID: {user?.id}</p>
            </div>
          </div>
          <div className="mt-6 pt-6 border-t border-gray-700">
            <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors">
              Change Password
            </button>
          </div>
        </div>
      </div>

      {/* Danger Zone */}
      <div className="bg-gray-800 rounded-xl border border-red-900/50">
        <div className="p-6 border-b border-red-900/50">
          <h2 className="text-lg font-semibold text-red-500">Danger Zone</h2>
          <p className="text-gray-400 text-sm mt-1">Irreversible and destructive actions</p>
        </div>
        <div className="p-6 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-white font-medium">Reset All User Balances</p>
              <p className="text-gray-400 text-sm">Set all user balances to zero</p>
            </div>
            <button
              onClick={handleResetBalances}
              className="px-4 py-2 bg-red-900 hover:bg-red-800 text-red-200 rounded-lg transition-colors"
            >
              Reset All
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

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 px-6 py-3 rounded-lg shadow-lg flex items-center gap-3 z-50 ${
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
    </div>
  )
}

