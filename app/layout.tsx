import type { Metadata } from "next";
import { Inter } from "next/font/google";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";

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
      }
    ]
  },
  twitter: {
    card: "summary",
    site: "@Bitpanda_global",
    title: "Bitpanda Pro - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with Bitpanda Pro. European regulated crypto & securities broker platform."
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
    <html lang="en" className={`${inter.className}`} suppressHydrationWarning>
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
