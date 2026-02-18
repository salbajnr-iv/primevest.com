'use client'

import { useLanguage } from '@/contexts/LanguageContext'
import { translations } from './translations'

export function useTranslation() {
  const { language } = useLanguage()
  
  const t = (key: string): string => {
    const langTranslations = translations[language]
    const translation = langTranslations[key]
    
    // If translation exists, return it
    if (translation !== undefined) {
      return translation
    }
    
    // If translation doesn't exist, fall back to English
    const englishTranslation = translations.en[key]
    if (englishTranslation !== undefined) {
      return englishTranslation
    }
    
    // If even English doesn't have it, return the key (showing developers what needs translation)
    console.warn(`Translation missing for key: "${key}" in language: "${language}"`)
    return key
  }
  
  return { t, language }
}

