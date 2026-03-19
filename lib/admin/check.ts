export interface AdminCheckResult {
  isAdmin: boolean
  userId: string | null
}

export async function verifyAdminAccess(): Promise<AdminCheckResult> {
  try {
    const response = await fetch('/api/admin/check', {
      method: 'GET',
      credentials: 'include',
      cache: 'no-store',
      headers: {
        Accept: 'application/json',
      },
    })

    if (!response.ok) {
      return { isAdmin: false, userId: null }
    }

    const data = (await response.json()) as Partial<AdminCheckResult>

    return {
      isAdmin: data.isAdmin === true,
      userId: typeof data.userId === 'string' ? data.userId : null,
    }
  } catch (error) {
    console.warn('Unable to verify admin access', error)
    return { isAdmin: false, userId: null }
  }
}
