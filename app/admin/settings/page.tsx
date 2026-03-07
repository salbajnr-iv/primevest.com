'use client'

import { useState } from 'react'

export const dynamic = 'force-dynamic'
interface AdminSettings {
  requireEmailConfirmation: boolean
  allowUserRegistration: boolean
  maxWithdrawalLimit: number
}

export default function AdminSettingsPage() {
  const [saving, setSaving] = useState(false)
  const [settings, setSettings] = useState<AdminSettings>({
    requireEmailConfirmation: true,
    allowUserRegistration: true,
    maxWithdrawalLimit: 10000,
  })

  const handleSave = async () => {
    setSaving(true)
    setTimeout(() => setSaving(false), 500)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-white">Admin Settings</h1>
          <p className="text-gray-400 mt-1">Configure platform settings and security options</p>
        </div>
        <button
          onClick={handleSave}
          disabled={saving}
          className="px-4 py-2 bg-green-800 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save Changes'}
        </button>
      </div>

      <div className="rounded-xl border border-gray-700 bg-gray-800 p-5 space-y-4">
        <label className="flex items-center justify-between text-gray-200">
          <span>Require email confirmation</span>
          <input
            type="checkbox"
            checked={settings.requireEmailConfirmation}
            onChange={(e) => setSettings((prev) => ({ ...prev, requireEmailConfirmation: e.target.checked }))}
          />
        </label>

        <label className="flex items-center justify-between text-gray-200">
          <span>Allow user registration</span>
          <input
            type="checkbox"
            checked={settings.allowUserRegistration}
            onChange={(e) => setSettings((prev) => ({ ...prev, allowUserRegistration: e.target.checked }))}
          />
        </label>

        <label className="block text-gray-200">
          <span className="mb-1 block">Max withdrawal limit (€)</span>
          <input
            type="number"
            value={settings.maxWithdrawalLimit}
            onChange={(e) => setSettings((prev) => ({ ...prev, maxWithdrawalLimit: Number(e.target.value) || 0 }))}
            className="w-full rounded border border-gray-600 bg-gray-900 px-3 py-2 text-white"
          />
        </label>
      </div>
    </div>
  )
}
