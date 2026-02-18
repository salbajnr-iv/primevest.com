"use client";

import React from 'react'

interface DeleteUserConfirmModalProps {
  userName: string
  userEmail: string
  onConfirm: () => Promise<void>
  onCancel: () => void
  loading: boolean
}

export default function DeleteUserConfirmModal({
  userName,
  userEmail,
  onConfirm,
  onCancel,
  loading,
}: DeleteUserConfirmModalProps) {
  const [confirmInput, setConfirmInput] = React.useState('')

  const isConfirmed = confirmInput === 'DELETE'

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-800 border border-red-600 rounded-lg shadow-lg max-w-md w-full p-6">
        <h2 className="text-xl font-bold text-red-400 mb-2">Delete User Account</h2>
        <p className="text-gray-300 text-sm mb-4">
          This action cannot be undone. All data associated with this account will be permanently deleted.
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

        <p className="text-yellow-400 text-sm font-semibold mb-3">
          Type DELETE to confirm:
        </p>

        <input
          type="text"
          value={confirmInput}
          onChange={(e) => setConfirmInput(e.target.value)}
          placeholder="Type DELETE to confirm"
          className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-white placeholder-gray-500 mb-4"
          disabled={loading}
        />

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
            disabled={!isConfirmed || loading}
            className="flex-1 px-4 py-2 bg-red-700 text-white rounded hover:bg-red-600 disabled:opacity-50"
          >
            {loading ? 'Deleting...' : 'Delete User'}
          </button>
        </div>
      </div>
    </div>
  )
}
