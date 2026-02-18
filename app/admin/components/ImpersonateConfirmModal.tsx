"use client";

import React from 'react'

interface ImpersonateConfirmModalProps {
  userName: string
  userEmail: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  loading: boolean
}

export default function ImpersonateConfirmModal({
  userName,
  userEmail,
  onConfirm,
  onCancel,
  loading,
}: ImpersonateConfirmModalProps) {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-yellow-600 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-yellow-400 mb-2">Impersonate User</h2>
        <p className="text-gray-300 text-sm mb-4">
          This action will start an impersonation session. Your actions will be logged for audit purposes.
        </p>

        <div className="bg-gray-900 rounded p-3 mb-4 border border-gray-700">
          <div className="text-sm text-gray-400">
            <p>
              <strong>Name:</strong> {userName || '—'}
            </p>
            <p>
              <strong>Email:</strong> {userEmail}
            </p>
          </div>
        </div>

        <p className="text-yellow-300 text-xs font-semibold mb-3 bg-gray-900 p-2 rounded border border-yellow-700">
          ⚠️ This action is logged and auditable. Use with caution.
        </p>

        <div className="flex gap-2">
          <button
            onClick={onCancel}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-gray-700 text-gray-300 rounded hover:bg-gray-600 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            className="flex-1 px-4 py-2 bg-yellow-700 text-white rounded hover:bg-yellow-600 disabled:opacity-50"
          >
            {loading ? 'Impersonating...' : 'Impersonate'}
          </button>
        </div>
      </div>
    </div>
  )
}
