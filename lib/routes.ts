export const ROUTES = {
  root: {
    home: "/",
  },
  dashboard: {
    home: "/dashboard",
    overview: "/dashboard/overview",
    market: "/dashboard/market",
    gainersLosers: "/dashboard/market/gainers-losers",
    strategies: "/dashboard/strategies",
    assetCenter: "/dashboard/asset-center",
    trade: "/dashboard/trade",
    orders: "/dashboard/orders",
    portfolio: "/dashboard/portfolio",
    positions: "/dashboard/positions",
    buy: "/dashboard/buy",
    sell: "/dashboard/sell",
    deposit: "/dashboard/deposit",
    swap: "/dashboard/swap",
  },
  support: {
    home: "/support",
    faqs: "/support/faqs",
    community: "/support/community",
    tickets: "/support/tickets",
    contact: "/support/contact",
  },
  settings: {
    home: "/settings",
    notifications: "/notifications",
    securityKyc: "/profile/kyc",
  },
  wallets: {
    home: "/wallets",
    withdraw: "/wallets/withdraw",
    transfer: "/wallets/transfer",
  },
  auth: {
    signIn: "/auth/sign-in",
    signUp: "/auth/sign-up",
    forgotPassword: "/auth/forgot-password",
  },
  markets: {
    home: "/markets",
    news: "/tools/market-news",
    tutorials: "/tutorials",
  },
} as const;
