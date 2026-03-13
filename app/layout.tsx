import type { Metadata } from "next";
import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";


export const metadata: Metadata = {
  title: "PrimeVest - Professional Trading Platform",
  description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest. European regulated crypto & securities broker platform.",
  keywords: "PrimeVest, cryptocurrency, crypto, trading, invest, stocks, ETFs, precious metals, bitcoin, ethereum, professional trading",
  authors: [{ name: "PrimeVest" }],
  creator: "PrimeVest",
  publisher: "PrimeVest",
  robots: "index, follow",
  referrer: "origin",
  alternates: {
    canonical: "https://www.primevest.com"
  },
  openGraph: {
    type: "website",
    title: "PrimeVest - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest. European regulated crypto & securities broker platform.",
    url: "https://www.primevest.com",
    siteName: "PrimeVest",
    images: [
      {
        url: "https://www.primevest.com/primevest-og.svg",
        width: 1200,
        height: 630,
        alt: "PrimeVest - Professional Trading Platform"
      }
    ]
  },
  icons: {
    icon: [
      { url: "/primevest-icon.svg", type: "image/svg+xml" }
    ],
    shortcut: "/primevest-icon.svg",
    apple: "/primevest-icon.svg"
  },
  twitter: {
    card: "summary",
    site: "@PrimeVest_global",
    title: "PrimeVest - Professional Trading Platform",
    description: "Join over 7 million people investing in 650+ cryptos and 3,000+ digital assets with PrimeVest. European regulated crypto & securities broker platform."
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
