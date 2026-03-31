'use client'

import { useCallback, useEffect, useState } from 'react'
import { useSessionManager, formatTimeRemaining } from '@/hooks/useSessionManager'
import { useAuth } from '@/contexts/AuthContext'
import {}
/**
 * Session Timeout Warning Component
 * 
 * Displays remaining session time and allows user to extend their session
 * Shows warning when approaching inactivity timeout (e.g., last 5 minutes)
 */
export function SessionTimeoutWarning() {
  const { timeRemaining, resetActivityTimer } = useSessionManager({
    inactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
  })

  const fiveMinutesMs = 5 * 60 * 1000
  const shouldShowWarning = timeRemaining > 0 && timeRemaining < fiveMinutesMs

  const handleExtendSession = useCallback(() => {
    resetActivityTimer?.()
  }, [resetActivityTimer])

  if (!shouldShowWarning) {
    return null
  }

  return (
    <div className="fixed bottom-4 right-4 bg-yellow-500 text-white p-4 rounded-lg shadow-lg max-w-sm z-50">
      <div className="flex items-start justify-between gap-3">
        <div>
          <p className="font-semibold mb-1">Session Expiring Soon</p>
          <p className="text-sm opacity-90">
            Your session will expire in {formatTimeRemaining(timeRemaining)}
          </p>
          <p className="text-xs opacity-75 mt-2">
            Click &quot;Extend&quot; to stay logged in, or your session will end automatically.
          </p>
        </div>
        <button
          onClick={handleExtendSession}
          className="ml-2 px-3 py-1 bg-yellow-600 hover:bg-yellow-700 rounded text-sm font-medium whitespace-nowrap"
        >
          Extend
        </button>
      </div>
    </div>
  )
}

/**
 * Session Debug Panel
 * 
 * Shows session information for debugging (development only)
 * Remove this component in production
 */
export function SessionDebugPanel() {
  const { user, session } = useAuth()
  const { timeRemaining, timeSinceLastActivity, isInactive } = useSessionManager()

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed bottom-4 left-4 bg-gray-900 text-gray-100 p-3 rounded text-xs font-mono max-w-xs z-40 opacity-75">
      <div className="font-bold mb-2 text-blue-400">Session Debug</div>
      <div>
        <span className="text-gray-400">User:</span> {user?.email || 'Not logged in'}
      </div>
      <div>
        <span className="text-gray-400">Inactive:</span>{' '}
        <span className={isInactive ? 'text-red-400' : 'text-green-400'}>
          {isInactive ? 'YES' : 'NO'}
        </span>
      </div>
      <div>
        <span className="text-gray-400">Time Remaining:</span> {formatTimeRemaining(timeRemaining)}
      </div>
      <div>
        <span className="text-gray-400">Last Activity:</span> {formatTimeRemaining(timeSinceLastActivity)} ago
      </div>
      <div className="mt-2 pt-2 border-t border-gray-700">
        <span className="text-gray-400">Session:</span>{' '}
        <span className={session ? 'text-green-400' : 'text-red-400'}>
          {session ? 'Active' : 'None'}
        </span>
      </div>
    </div>
  )
}

/**
 * Idle Activity Indicator
 * 
 * Shows visual indicator when user activity is detected
 * Tracks the timestamp of the last detected activity
 * Helps debug session monitoring
 */
export function IdleActivityIndicator() {
  const [lastActivityTime, setLastActivityTime] = useState<number>(() => Date.now())

  const handleActivityDetected = useCallback(() => {
    setLastActivityTime(Date.now())
  }, [])

  useSessionManager({
    onActivityDetected: handleActivityDetected,
  })

  if (process.env.NODE_ENV !== 'development') {
    return null
  }

  return (
    <div className="fixed top-4 right-4 text-xs text-gray-500">
      Last activity: {new Date(lastActivityTime).toLocaleTimeString()}
    </div>
  )
}
