import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "PrimeVest Financial Solutions, Inc. - Professional Trading Platform",
  description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Financial Solutions, Inc. European regulated crypto & securities broker platform.",
  keywords: "PrimeVest Financial Solutions, Inc., cryptocurrency, crypto, trading, invest, stocks, ETFs, precious metals, bitcoin, ethereum, professional trading",
  authors: [{ name: "PrimeVest Financial Solutions, Inc." }],
  creator: "PrimeVest Financial Solutions, Inc.",
  publisher: "PrimeVest Financial Solutions, Inc.",
  robots: "index, follow",
  referrer: "origin",
  alternates: {
    canonical: "https://www.primevestfinancialsolutions.com"
  },
  openGraph: {
    type: "website",
    title: "PrimeVest Financial Solutions, Inc. - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Financial Solutions, Inc. European regulated crypto & securities broker platform.",
    url: "https://www.primevestfinancialsolutions.com",
    siteName: "PrimeVest Financial Solutions, Inc.",
    images: [
      {
        url: "https://www.primevestfinancialsolutions.com/primevest-og.png",
        width: 1200,
        height: 630,
        alt: "PrimeVest Financial Solutions, Inc. - Professional Trading Platform"
      }
    ]
  },
  twitter: {
    card: "summary",
    site: "@PrimeVestFinancialSolutions",
    title: "PrimeVest Financial Solutions, Inc. - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Financial Solutions, Inc. European regulated crypto & securities broker platform."
  }
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider
              attribute="class"
              defaultTheme="light"
              enableSystem
              disableTransitionOnChange
            >
              {children}
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
