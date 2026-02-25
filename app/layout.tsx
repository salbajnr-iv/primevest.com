import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

export const metadata: Metadata = {
  title: "PrimeVest Capital - Professional Trading Platform",
  description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Capital. European regulated crypto & securities broker platform.",
  keywords: "PrimeVest Capital, cryptocurrency, crypto, trading, invest, stocks, ETFs, precious metals, bitcoin, ethereum, professional trading",
  authors: [{ name: "PrimeVest Capital" }],
  creator: "PrimeVest Capital",
  publisher: "PrimeVest Capital",
  robots: "index, follow",
  referrer: "origin",
  alternates: {
    canonical: "https://www.primevestcapital.com"
  },
  openGraph: {
    type: "website",
    title: "PrimeVest Capital - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Capital. European regulated crypto & securities broker platform.",
    url: "https://www.primevestcapital.com",
    siteName: "PrimeVest Capital",
    images: [
      {
        url: "https://cdn.bitpanda.com/media/og-images-open-graph/bitpanda-og.png",
        width: 1200,
        height: 630,
        alt: "PrimeVest Capital - Professional Trading Platform"
      }
    ]
  },
  twitter: {
    card: "summary",
    site: "@PrimeVestCapital",
    title: "PrimeVest Capital - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest Capital. European regulated crypto & securities broker platform."
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
