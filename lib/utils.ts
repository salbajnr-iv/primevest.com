import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"
import type { User } from '@supabase/supabase-js'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Get user display name from Supabase User object
 * Priority: profileName (from API) → user_metadata.full_name → email prefix → "User"
 */
export function getUserDisplayName(
  user: User | null, 
  profileName?: string | null
): string {
  // Use profile name if provided (from dashboard summary API)
  if (profileName?.trim()) {
    return profileName.trim()
  }
  
  if (!user) return "User"
  
  // Try user_metadata.full_name first
  const metadataName = user.user_metadata?.full_name
  if (metadataName?.trim()) {
    return metadataName.trim()
  }
  
  // Fallback to email prefix
  if (user.email) {
    return user.email.split("@")[0]
  }
  
  return "User"
}

