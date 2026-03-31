'use client'

import { useEffect, useRef, useState } from 'react'
import { SessionManager } from '@/lib/auth/session-manager'

interface UseSessionManagerOptions {
  inactivityTimeoutMs?: number
  onSessionExpire?: () => Promise<void>
  onActivityDetected?: () => void
  enabled?: boolean
}

/**
 * Custom hook to manage session lifecycle with inactivity detection and browser close handling
 * 
 * Usage:
 * ```tsx
 * const { isInactive, timeRemaining } = useSessionManager({
 *   inactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
 *   onSessionExpire: async () => {
 *     await signOut()
 *     router.push('/auth/signin')
 *   }
 * })
 * ```
 */
export function useSessionManager(options: UseSessionManagerOptions = {}) {
  const {
    inactivityTimeoutMs = 30 * 60 * 1000, // 30 minutes default
    onSessionExpire,
    onActivityDetected,
    enabled = true,
  } = options

  const managerRef = useRef<SessionManager | null>(null)
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null)
  const [updateTrigger, setUpdateTrigger] = useState(0)

  useEffect(() => {
    if (typeof window === 'undefined' || !enabled) return

    // Initialize session manager
    managerRef.current = new SessionManager({
      inactivityTimeoutMs,
      onSessionExpire,
      onActivityDetected,
    })

    managerRef.current.startMonitoring()

    // Setup periodic update to notify components of remaining time
    checkIntervalRef.current = setInterval(() => {
      if (managerRef.current && managerRef.current.isSessionInactive()) {
        // Check happens in manager itself, but we can add extra checks here
      }
      // Trigger re-render to update remaining time display
      setUpdateTrigger((prev) => prev + 1)
    }, 1000) // Update every second

    return () => {
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current)
      }
      if (managerRef.current) {
        managerRef.current.destroy()
        managerRef.current = null
      }
    }
  }, [inactivityTimeoutMs, onSessionExpire, onActivityDetected, enabled])

  return {
    isInactive: managerRef.current?.isSessionInactive() ?? false,
    timeRemaining: managerRef.current?.getRemainingTimeBeforeInactivity() ?? 0,
    timeSinceLastActivity: managerRef.current?.getTimeSinceLastActivity() ?? 0,
    resetActivityTimer: () => managerRef.current?.resetActivityTimer(),
    manager: managerRef.current,
    _updateTrigger: updateTrigger, // Force re-render on updates
  }
}

/**
 * Format milliseconds to human-readable time
 */
export function formatTimeRemaining(ms: number): string {
  if (ms <= 0) return '0s'

  const seconds = Math.floor((ms / 1000) % 60)
  const minutes = Math.floor((ms / 1000 / 60) % 60)
  const hours = Math.floor((ms / 1000 / 60 / 60) % 24)

  if (hours > 0) {
    return `${hours}h ${minutes}m`
  }
  if (minutes > 0) {
    return `${minutes}m ${seconds}s`
  }
  return `${seconds}s`
}
