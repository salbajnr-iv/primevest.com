'use client'

import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { createBrowserClient } from '@supabase/ssr'
import { useAuth } from './AuthContext'

export type Language = 'en' | 'es' | 'de' | 'fr' | 'it'

export interface LanguageOption {
  code: Language
  name: string
  nativeName: string
  flag: string
}

export const SUPPORTED_LANGUAGES: LanguageOption[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇺🇸' },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸' },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪' },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷' },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹' },
]

interface LanguageContextType {
  language: Language
  setLanguage: (language: Language) => Promise<void>
  isLoading: boolean
  getLanguageName: (code: Language) => string
  getLanguageOption: (code: Language) => LanguageOption | undefined
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined)

export function LanguageProvider({ children }: { children: React.ReactNode }) {
  const [language, setLanguageState] = useState<Language>('en')
  const [isLoading, setIsLoading] = useState(true)
  const { user, session } = useAuth()
  
  const supabase = createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )

  // Get language name by code
  const getLanguageName = useCallback((code: Language): string => {
    const option = SUPPORTED_LANGUAGES.find(l => l.code === code)
    return option?.name || 'English'
  }, [])

  // Get language option by code
  const getLanguageOption = useCallback((code: Language): LanguageOption | undefined => {
    return SUPPORTED_LANGUAGES.find(l => l.code === code)
  }, [])

  // Load language preference on mount
  useEffect(() => {
    const loadLanguage = async () => {
      setIsLoading(true)
      
      try {
        // Priority: 1. User metadata (logged in), 2. LocalStorage (guest)
        if (session?.user) {
          const { data } = await supabase.auth.getUser()
          const userLanguage = data.user?.user_metadata?.language as Language | undefined
          
          if (userLanguage && SUPPORTED_LANGUAGES.some(l => l.code === userLanguage)) {
            setLanguageState(userLanguage)
            return
          }
        }
        
        // Fallback to localStorage for guests
        if (typeof window !== 'undefined') {
          const storedLanguage = localStorage.getItem('app_language') as Language | null
          if (storedLanguage && SUPPORTED_LANGUAGES.some(l => l.code === storedLanguage)) {
            setLanguageState(storedLanguage)
            return
          }
          
          // Try to detect browser language
          const browserLang = navigator.language.split('-')[0]
          if (SUPPORTED_LANGUAGES.some(l => l.code === browserLang)) {
            setLanguageState(browserLang as Language)
          }
        }
      } catch (error) {
        console.error('Error loading language preference:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadLanguage()
  }, [session, supabase])

  // Update language preference
  const setLanguage = async (newLanguage: Language) => {
    setIsLoading(true)
    
    try {
      // Update state immediately
      setLanguageState(newLanguage)
      
      // Save to localStorage for guests
      if (typeof window !== 'undefined') {
        localStorage.setItem('app_language', newLanguage)
      }
      
      // Save to Supabase user metadata if logged in
      if (session?.user) {
        await supabase.auth.updateUser({
          data: { language: newLanguage }
        })
      }
      
      // Update document language attribute
      document.documentElement.lang = newLanguage
    } catch (error) {
      console.error('Error saving language preference:', error)
    } finally {
      setIsLoading(false)
    }
  }

  // Update document language when language changes
  useEffect(() => {
    document.documentElement.lang = language
  }, [language])

  return (
    <LanguageContext.Provider
      value={{
        language,
        setLanguage,
        isLoading,
        getLanguageName,
        getLanguageOption,
      }}
    >
      {children}
    </LanguageContext.Provider>
  )
}

export function useLanguage() {
  const context = useContext(LanguageContext)
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider')
  }
  return context
}

