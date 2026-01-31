import type { Metadata } from "next";
<<<<<<< HEAD
=======
import { Inter } from "next/font/google";
>>>>>>> 02bdcb7 (Initial commit)
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
<<<<<<< HEAD
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
=======

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Bitpanda Pro - Professional Trading Platform",
  description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with Bitpanda Pro. European regulated crypto & securities broker platform.",
  keywords: "Bitpanda Pro, cryptocurrency, crypto, trading, invest, stocks, ETFs, precious metals, bitcoin, ethereum, professional trading",
  authors: [{ name: "Bitpanda" }],
  creator: "Bitpanda",
  publisher: "Bitpanda",
  robots: "index, follow",
  referrer: "origin",
  alternates: {
    canonical: "https://www.bitpandapro.com"
  },
  openGraph: {
    type: "website",
    title: "Bitpanda Pro - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with Bitpanda Pro. European regulated crypto & securities broker platform.",
    url: "https://www.bitpandapro.com",
    siteName: "Bitpanda Pro",
    images: [
      {
        url: "https://cdn.bitpanda.com/media/og-images-open-graph/bitpanda-og.png",
        width: 1200,
        height: 630,
        alt: "Bitpanda Pro - Professional Trading Platform"
>>>>>>> 02bdcb7 (Initial commit)
      }
    ]
  },
  twitter: {
    card: "summary",
<<<<<<< HEAD
    site: "@PrimeVestFinancialSolutions",
    title: "PrimeVest Financial Solutions, Inc. - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Financial Solutions, Inc. European regulated crypto & securities broker platform."
=======
    site: "@Bitpanda_global",
    title: "Bitpanda Pro - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with Bitpanda Pro. European regulated crypto & securities broker platform."
>>>>>>> 02bdcb7 (Initial commit)
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
<<<<<<< HEAD
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
=======
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
      <body className="antialiased" suppressHydrationWarning>
        <AuthProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="light"
            enableSystem
            disableTransitionOnChange
          >
            {children}
          </ThemeProvider>
>>>>>>> 02bdcb7 (Initial commit)
        </AuthProvider>
        <Analytics />
      </body>
    </html>
  );
}
