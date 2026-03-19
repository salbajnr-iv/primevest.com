import type { Metadata } from "next";
// import { Analytics } from "@vercel/analytics/next";
import "./globals.css";
import { ThemeProvider } from "@/components/ThemeProvider";
import AuthProvider from "@/components/AuthProvider";
import { LanguageProvider } from "@/contexts/LanguageContext";
import { BRAND, BRAND_COPY } from "@/lib/brand";


export const metadata: Metadata = {
  title: BRAND_COPY.platformTagline,
  description: BRAND_COPY.platformDescription,
  keywords: BRAND_COPY.keywords,
  authors: [{ name: BRAND.productName }],
  creator: BRAND.productName,
  publisher: BRAND.productName,
  robots: "index, follow",
  referrer: "origin",
  alternates: {
    canonical: "https://www.primevest.com"
  },
  openGraph: {
    type: "website",
    title: BRAND_COPY.platformTagline,
    description: BRAND_COPY.platformDescription,
    url: "https://www.primevest.com",
    siteName: BRAND.productName,
    images: [
      {
        url: "https://www.primevest.com/primevest-og.svg",
        width: 1200,
        height: 630,
        alt: BRAND_COPY.platformTagline
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
    title: BRAND_COPY.platformTagline,
    description: BRAND_COPY.platformDescription
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
{/* <Analytics /> */}
      </body>
    </html>
  );
}
