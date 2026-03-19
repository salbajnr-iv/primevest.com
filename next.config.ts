import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_SUPABASE_URL:
      process.env.NEXT_PUBLIC_SUPABASE_URL ?? "https://placeholder.supabase.co",
    NEXT_PUBLIC_SUPABASE_ANON_KEY:
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? "placeholder-anon-key",
  },
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "a.storyblok.com",
        pathname: "/f/**",
      },
      {
        protocol: "https",
        hostname: "sbcdn.bitpanda.com",
        pathname: "/**",
      },
    ],
  },
  
  // For subdomain handling (admin.bitpandaproapp.com)
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
  
  // Redirect admin subdomain to /admin route
  async redirects() {
    return [
      {
        source: '/admin',
        has: [
          {
            type: 'host',
            value: 'admin.bitpandaproapp.com',
          },
        ],
        permanent: false,
        destination: '/admin/dashboard',
      },
      {
        source: '/admin/:path*',
        has: [
          {
            type: 'host',
            value: 'admin.bitpandaproapp.com',
          },
        ],
        permanent: false,
        destination: '/admin/:path*',
      },
      // Alias singular /watchlist to plural /watchlists
      {
        source: '/watchlist',
        destination: '/watchlists',
        permanent: true,
      },
      {
        source: '/watchlist/:path*',
        destination: '/watchlists/:path*',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
