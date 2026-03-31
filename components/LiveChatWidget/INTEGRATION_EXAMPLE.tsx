/*
  INTEGRATION EXAMPLE
  
  Add LiveChatWidget to your app/layout.tsx like this:
*/

import type { Metadata } from 'next'
import Providers from '@/components/AuthProvider'
import { ThemeProvider } from '@/components/ThemeProvider'
import { LanguageProvider } from '@/contexts/LanguageContext'
import { LiveChatWidget } from '@/components/LiveChatWidget'
import './globals.css'

export const metadata: Metadata = {
  title: 'PrimeVest',
  description: 'Investment Platform',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <Providers>
          <ThemeProvider>
            <LanguageProvider>
              {children}
              {/* Add LiveChatWidget here - it will float at bottom-right */}
              <LiveChatWidget />
            </LanguageProvider>
          </ThemeProvider>
        </Providers>
      </body>
    </html>
  )
}
