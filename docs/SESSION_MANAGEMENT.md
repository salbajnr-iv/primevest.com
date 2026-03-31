# Session Management Best Practices Implementation

## Overview

This document explains the session management system implemented in PrimeVest to follow security best practices around session lifecycle, inactivity timeouts, and cache prevention.

## Key Features

### 1. **Inactivity Timeout (30 minutes)**

- Sessions are automatically destroyed after 30 minutes of user inactivity
- Inactivity is tracked by monitoring user interactions: mouse, keyboard, touch, scroll, focus events
- When inactivity is detected, user is logged out and redirected to sign-in page
- Matches backend JWT token expiration time for consistency

### 2. **Browser Close Detection**

- Session data is cleared from `sessionStorage` when browser tab closes
- Uses `beforeunload` event to ensure cleanup happens
- Sensitive data is NOT stored in `localStorage` - only `sessionStorage` is used
- Prevents session persistence across browser restarts

### 3. **No Inappropriate Session Caching**

- Auth endpoints (`/api/auth/*`, `/api/auth/session`) return cache-control headers:
  - `no-store` - browser won't cache response
  - `no-cache` - must revalidate before using
  - `must-revalidate` - proxies must revalidate
  - Prevents HTTP caching of session tokens
- All sensitive auth data is stored in `sessionStorage`, not `localStorage`
- Session cache is automatically cleared from browser cache storage

### 4. **Automatic Session Monitoring**

- `SessionManager` class runs in the background when user is logged in
- Tracks all user activity and resets inactivity timer
- Activity events: mousedown, keydown, scroll, touchstart, click, mousemove, focus
- Listeners use passive `true` for better performance

## Architecture

### Session Manager (`lib/auth/session-manager.ts`)

The core session manager handles:

- **Activity Tracking**: Monitors user interactions using passive event listeners
- **Inactivity Detection**: Triggers logout after configurable timeout (default 30min)
- **Cache Prevention**: Clears sensitive data from storage and browser cache
- **Cleanup**: Proper resource cleanup on destroy

**Key Methods:**

```typescript
// Start/stop monitoring
manager.startMonitoring()
manager.stopMonitoring()

// Check session status
manager.isSessionInactive() // boolean
manager.getTimeSinceLastActivity() // milliseconds
manager.getRemainingTimeBeforeInactivity() // milliseconds
```

### Auth Contexts (`contexts/AuthContext.tsx` & `contexts/AdminAuthContext.tsx`)

Both auth contexts now include:

1. **Session manager integration**: SessionManager instance created when session is active
2. **Inactivity callback**: `onSessionExpire` triggers automatic logout
3. **Cache prevention**: Calls `preventSessionCaching()` when applying new session
4. **Cleanup on unmount**: Destroys session manager when component unmounts

### API Routes

#### `/api/auth/session`

- Added cache control headers: `no-store, no-cache, must-revalidate`
- Prevents browser/proxy caching of session tokens
- Always validates with identity provider

#### `/api/auth/signout`

- Added cache control headers to response
- Also adds headers to error responses
- Ensures sign-out response is never cached

## Implementation Details

### Session Storage Strategy

**Use `sessionStorage` for:**

- Session flags (`primevest:had-session`)
- Auth messages (`primevest:auth-message`)
- Admin session flags (`primevest:admin-had-session`)

**Never use `localStorage` for:**

- Auth tokens
- Session ID
- Refresh tokens
- Access tokens

**Why?** `sessionStorage` is automatically cleared when browser tab closes, while `localStorage` persists across browser restarts, creating security risk.

### Inactivity Timeout Behavior

1. **User is active**: Timer resets on each interaction
2. **30 minutes of inactivity**: `SessionManager` triggers `onSessionExpire` callback
3. **Callback execution**:
   - Clears session state: `clearSessionState()`
   - Redirects to sign-in: `redirectToBackendSignIn()`
   - Sets session error message
4. **On protected routes**: User is redirected to login page
5. **On public routes**: Session is silently cleared

### Cache Prevention Workflow

1. **On `signOut()`**:
   - Stop session monitoring
   - Call `clearSessionState()` which removes session storage keys
   - Backend signs out user

2. **On new session applied**:
   - Call `preventSessionCaching()`:
     - Checks for sensitive data in `localStorage`
     - Moves it to `sessionStorage` if found
     - Clears auth endpoints from service worker cache

3. **On API response**:
   - `/api/auth/session`, `/api/auth/signout` return:

```
Cache-Control: no-store, no-cache, must-revalidate, proxy-revalidate, max-age=0
Pragma: no-cache
Expires: 0
Surrogate-Control: no-store
```

## Usage for Developers

### Using Session Manager Directly

```typescript
import { SessionManager } from '@/lib/auth/session-manager'

// Create manager
const manager = new SessionManager({
  inactivityTimeoutMs: 30 * 60 * 1000, // 30 minutes
  onSessionExpire: async () => {
    console.log('Session expired!')
    await signOut()
  }
})

// Start monitoring
manager.startMonitoring()

// Check status
if (manager.isSessionInactive()) {
  // Handle inactivity
}

// Cleanup
manager.destroy()
```

### Using Session Manager Hook

```typescript
'use client'
import { useSessionManager, formatTimeRemaining } from '@/hooks/useSessionManager'

export function SessionWarning() {
  const { isInactive, timeRemaining } = useSessionManager({
    inactivityTimeoutMs: 30 * 60 * 1000,
    onSessionExpire: async () => {
      await signOut()
      router.push('/auth/signin')
    }
  })

  if (isInactive) {
    return <div>Your session has expired</div>
  }

  return <div>Time remaining: {formatTimeRemaining(timeRemaining)}</div>
}
```

### Automatic Integration (Already Done)

User authentication is automatically managed by:

- `AuthProvider` - handles user sessions
- `AdminAuthProvider` - handles admin sessions

No additional setup needed! Just use `useAuth()` or `useAdminAuth()` as usual.

## Security Considerations

### ✅ What This Implementation Does

1. **Prevents session fixation**: Sessions are tied to browser tab life
2. **Enforces inactivity limits**: 30-minute timeout matches JWT expiration
3. **Prevents caching attacks**: Auth endpoints can't be cached
4. **Automatic cleanup**: Sensitive data cleared on logout/expiry
5. **Browser close cleanup**: sessionStorage emptied automatically

### ⚠️ Additional Recommendations

1. **HTTPS Only**: Always use HTTPS for auth endpoints
   - Set `Secure` flag on all cookies
   - Set `SameSite=Strict` or `SameSite=Lax`

2. **CSRF Protection**: Implement CSRF tokens for state-changing endpoints
   - Current implementation uses Supabase auth which handles this

3. **XSS Prevention**:
   - Sanitize all user inputs
   - Use CSP headers to prevent script injection
   - Never store sensitive tokens in `localStorage`

4. **Rate Limiting**: Implement rate limiting on auth endpoints
   - Prevent brute force attacks
   - Limit login attempts

5. **Audit Logging**: Log all auth events
   - Track login/logout
   - Monitor failed attempts
   - Track session expirations

## Configuration

### Change Inactivity Timeout

To change the timeout from 30 minutes to another value:

1. **In `AuthContext.tsx`:**

```typescript
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000 // 20 minutes
```

1. **In `AdminAuthContext.tsx`:**

```typescript
const INACTIVITY_TIMEOUT_MS = 20 * 60 * 1000 // 20 minutes
```

1. **In session manager creation**, both contexts use `INACTIVITY_TIMEOUT_MS` automatically

### Customize Activity Events

To add or remove tracked activity events:

**In `lib/auth/session-manager.ts`:**

```typescript
const ACTIVITY_EVENTS = [
  'mousedown',
  'keydown',
  'scroll',
  'touchstart',
  'click',
  'mousemove',
  'focus',
  // 'wheel', // Add more events as needed
]
```

## Testing

### Test Inactivity Timeout

```typescript
// Set short timeout for testing
const manager = new SessionManager({
  inactivityTimeoutMs: 5 * 1000 // 5 seconds
})
manager.startMonitoring()

// Wait 5 seconds without moving mouse/keyboard
// Manager should call onSessionExpire()
```

### Test Browser Close

1. Open login page
2. Sign in
3. Check `window.sessionStorage` for session flag
4. Close browser tab
5. Reopen browser at same URL
6. Session should be cleared, user redirected to sign-in

### Test Cache Prevention

1. Open DevTools Network tab
2. Sign in
3. Check `/api/auth/session` response headers
4. Should see: `Cache-Control: no-store, no-cache, must-revalidate`
5. Sign out
6. Check `/api/auth/signout` response headers
7. Should have same cache control headers

## Files Modified

- `contexts/AuthContext.tsx` - Added SessionManager integration
- `contexts/AdminAuthContext.tsx` - Added SessionManager integration  
- `app/api/auth/session/route.ts` - Added cache control headers
- `app/api/auth/signout/route.ts` - Added cache control headers
- `lib/auth/session-manager.ts` - New file, core session management
- `hooks/useSessionManager.ts` - New file, React hook for session management

## References

- [OWASP Session Management Cheat Sheet](https://cheatsheetseries.owasp.org/cheatsheets/Session_Management_Cheat_Sheet.html)
- [MDN: Storage Security](https://developer.mozilla.org/en-US/docs/Web/Security/Storage_security)
- [HTTP Cache Control Headers](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Supabase Auth Best Practices](https://supabase.com/docs/guides/auth/best-practices)
