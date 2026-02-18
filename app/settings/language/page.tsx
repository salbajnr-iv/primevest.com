'use client'

import * as React from 'react'
import Link from 'next/link'
import { useLanguage, SUPPORTED_LANGUAGES } from '@/contexts/LanguageContext'

interface LanguageItemProps {
  language: typeof SUPPORTED_LANGUAGES[0]
  isSelected: boolean
  onSelect: () => void
}

function LanguageItem({ language, isSelected, onSelect }: LanguageItemProps) {
  return (
    <button
      className={`language-item ${isSelected ? 'selected' : ''}`}
      onClick={onSelect}
    >
      <div className="language-item-left">
        <span className="language-flag">{language.flag}</span>
        <div className="language-info">
          <span className="language-name">{language.name}</span>
          <span className="language-native">{language.nativeName}</span>
        </div>
      </div>
      <div className="language-item-right">
        {isSelected && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" className="check-icon">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        )}
      </div>
    </button>
  )
}

export default function LanguageSettingsPage() {
  const { language: currentLanguage, setLanguage, isLoading } = useLanguage()
  const [isClient, setIsClient] = React.useState(false)

  React.useEffect(() => {
    setIsClient(true)
  }, [])

  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <Link href="/settings" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">SETTINGS</span>
            <div className="header-title">Language</div>
          </div>
        </header>

        {/* LANGUAGE SELECTION */}
        <section className="settings-section">
          <h3 className="section-title">Select your preferred language</h3>
          <div className="language-list">
            {SUPPORTED_LANGUAGES.map((lang) => (
              <LanguageItem
                key={lang.code}
                language={lang}
                isSelected={currentLanguage === lang.code}
                onSelect={() => setLanguage(lang.code)}
              />
            ))}
          </div>
        </section>

        {/* INFO */}
        <div className="language-info-box">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="10" />
            <line x1="12" y1="16" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12.01" y2="8" />
          </svg>
          <p>Your language preference will be saved and applied across the entire application.</p>
        </div>

        {/* LOADING OVERLAY */}
        {isLoading && (
          <div className="loading-overlay">
            <div className="loading-spinner"></div>
          </div>
        )}
      </div>

      {/* BOTTOM NAV */}
      <div className="bottom-nav-placeholder"></div>
    </div>
  )
}

