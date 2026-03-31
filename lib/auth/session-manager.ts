/**
 * Session Management Utilities
 * Handles inactivity timeouts, browser close detection, and prevents inappropriate session caching
 */

const INACTIVITY_TIMEOUT_MS = 30 * 60 * 1000 // 30 minutes
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'mousemove',
  'focus',
]

interface SessionManagerConfig {
  inactivityTimeoutMs?: number
  onSessionExpire?: () => Promise<void>
  onActivityDetected?: () => void
}

export class SessionManager {
  private inactivityTimeoutId: NodeJS.Timeout | null = null
  private activityListenersAttached = false
  private config: Required<SessionManagerConfig>
  private lastActivityTime: number = Date.now()

  constructor(config: SessionManagerConfig = {}) {
    this.config = {
      inactivityTimeoutMs: config.inactivityTimeoutMs ?? INACTIVITY_TIMEOUT_MS,
      onSessionExpire: config.onSessionExpire ?? (() => Promise.resolve()),
      onActivityDetected: config.onActivityDetected ?? (() => {}),
    }
  }

  /**
   * Start monitoring for inactivity and browser close
   */
  public startMonitoring(): void {
    if (typeof window === 'undefined') return

    this.attachActivityListeners()
    this.attachBeforeUnloadListener()
    this.attachVisibilityChangeListener()
    this.resetInactivityTimer()
  }

  /**
   * Stop monitoring
   */
  public stopMonitoring(): void {
    this.removeActivityListeners()
    this.clearInactivityTimer()
  }

  /**
   * Manually reset the inactivity timer (call on user activity)
   */
  public resetActivityTimer(): void {
    this.lastActivityTime = Date.now()
    this.resetInactivityTimer()
    this.config.onActivityDetected()
  }

  /**
   * Get time since last activity in milliseconds
   */
  public getTimeSinceLastActivity(): number {
    return Date.now() - this.lastActivityTime
  }

  /**
   * Check if session is considered inactive
   */
  public isSessionInactive(): boolean {
    return this.getTimeSinceLastActivity() > this.config.inactivityTimeoutMs
  }

  /**
   * Get remaining time before inactivity (in milliseconds)
   */
  public getRemainingTimeBeforeInactivity(): number {
    const remaining = this.config.inactivityTimeoutMs - this.getTimeSinceLastActivity()
    return Math.max(0, remaining)
  }

  /**
   * Cleanup
   */
  public destroy(): void {
    this.stopMonitoring()
  }

  // ============ Private Methods ============

  private resetInactivityTimer(): void {
    this.clearInactivityTimer()

    this.inactivityTimeoutId = setTimeout(() => {
      void this.handleInactivityTimeout()
    }, this.config.inactivityTimeoutMs)
  }

  private clearInactivityTimer(): void {
    if (this.inactivityTimeoutId) {
      clearTimeout(this.inactivityTimeoutId)
      this.inactivityTimeoutId = null
    }
  }

  private attachActivityListeners(): void {
    if (this.activityListenersAttached) return

    const handleActivity = () => {
      this.resetActivityTimer()
    }

    // Attach listeners with passive option for better performance
    ACTIVITY_EVENTS.forEach((eventName) => {
      window.addEventListener(eventName, handleActivity, { passive: true })
    })

    this.activityListenersAttached = true
  }

  private removeActivityListeners(): void {
    if (!this.activityListenersAttached) return

    const handleActivity = () => {
      this.resetActivityTimer()
    }

    ACTIVITY_EVENTS.forEach((eventName) => {
      window.removeEventListener(eventName, handleActivity)
    })

    this.activityListenersAttached = false
  }

  private attachBeforeUnloadListener(): void {
    window.addEventListener('beforeunload', () => {
      this.clearAllSessionData()
    })
  }

  private attachVisibilityChangeListener(): void {
    document.addEventListener('visibilitychange', () => {
      if (document.hidden) {
        // Browser tab is hidden - clear sensitive data from memory
        // Note: We intentionally don't clear sessionStorage here as user may switch tabs
      } else {
        // Browser tab became visible - validate session is still fresh
        if (this.isSessionInactive()) {
          void this.handleInactivityTimeout()
        }
      }
    })
  }

  private async handleInactivityTimeout(): Promise<void> {
    this.clearAllSessionData()
    await this.config.onSessionExpire()
  }

  private clearAllSessionData(): void {
    if (typeof window === 'undefined') return

    // Clear all session-related storage (use sessionStorage, not localStorage)
    if (window.sessionStorage) {
      const keys = Object.keys(window.sessionStorage)
      keys.forEach((key) => {
        if (key.startsWith('primevest:') || key.includes('session') || key.includes('auth')) {
          window.sessionStorage.removeItem(key)
        }
      })
    }

    // IMPORTANT: Never remove sensitive data from localStorage here.
    // Only sessionStorage (which is cleared on browser close) should be used for sessions.
    // If sensitive data exists in localStorage, it's incorrect usage.
  }
}

/**
 * Clear all authentication-related cache headers
 * Call this on the backend when setting sign-out response
 */
export function getCacheControlHeaders() {
  return {
    'Cache-Control': 'no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0',
    'Pragma': 'no-cache',
    'Expires': '0',
    'Surrogate-Control': 'no-store',
  }
}

/**
 * Prevent session from being stored in browser cache
 */
export function preventSessionCaching() {
  if (typeof window === 'undefined') return

  // Ensure no sensitive data in localStorage
  const storageKeys = Object.keys(window.localStorage)
  const sensitivePatterns = ['session', 'auth', 'token', 'refresh_token', 'access_token']

  storageKeys.forEach((key) => {
    if (sensitivePatterns.some((pattern) => key.toLowerCase().includes(pattern))) {
      console.warn(`⚠️ Sensitive data found in localStorage: ${key}. Moving to sessionStorage.`)
      const value = window.localStorage.getItem(key)
      if (value) {
        window.sessionStorage.setItem(key, value)
        window.localStorage.removeItem(key)
      }
    }
  })

  // Set proper cache headers if we can (this would be done on the server response)
  if ('caches' in window) {
    caches
      .keys()
      .then((cacheNames) => {
        cacheNames.forEach((cacheName) => {
          caches.open(cacheName).then((cache) => {
            cache.keys().then((requests) => {
              requests.forEach((request) => {
                // Don't cache auth-related endpoints
                if (
                  request.url.includes('/api/auth/') ||
                  request.url.includes('/api/session')
                ) {
                  cache.delete(request)
                }
              })
            })
          })
        })
      })
      .catch(() => {
        // Service workers not available
      })
  }
}

/**
 * Initialize session security on app startup
 */
export function initializeSessionSecurity() {
  if (typeof window === 'undefined') return

  // Prevent sensitive data in localStorage
  preventSessionCaching()

  // Set SameSite cookie policy (should be done server-side, this is extra validation)
  // Ensure cookies are only sent over HTTPS and not accessible to JavaScript
}
