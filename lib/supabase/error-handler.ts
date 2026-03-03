export class SupabaseErrorHandler {
  static async handleSupabaseError(error: Error | unknown, fallback: () => unknown) {
    if (error instanceof Error && (
        error.message.includes('Failed to fetch') || 
        error.message.includes('NetworkError') ||
        error.message.includes('ECONNREFUSED'))) {
      console.warn('Supabase network error, using fallback')
      return fallback()
    }
    throw error
  }

  static async withRetry<T>(
    operation: () => Promise<T>,
    maxRetries: number = 3,
    delay: number = 1000
  ): Promise<T> {
    let lastError: Error | unknown
    
    for (let i = 0; i < maxRetries; i++) {
      try {
        return await operation()
      } catch (error: unknown) {
        lastError = error
        
        if (error instanceof Error && 
            error.message.includes('Failed to fetch') && 
            i < maxRetries - 1) {
          console.warn(`Supabase fetch failed, retrying in ${delay}ms (attempt ${i + 1}/${maxRetries})`)
          await new Promise(resolve => setTimeout(resolve, delay))
          delay *= 2 // Exponential backoff
        } else {
          throw error
        }
      }
    }
    
    throw lastError
  }
}
