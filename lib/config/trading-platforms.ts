export interface TradingPlatform {
  id: string;
  name: string;
  description: string;
  downloadLinks: {
    google?: string;
    direct?: string;
  };
}

export const tradingPlatforms: TradingPlatform[] = [
  {
    id: "mt4",
    name: "Meta Trader 4",
    description: "Already have an account? Download MT4 Terminal Directly.",
    downloadLinks: {
      google: process.env.NEXT_PUBLIC_MT4_GOOGLE_PLAY_URL || "#",
      direct: process.env.NEXT_PUBLIC_MT4_DIRECT_DOWNLOAD_URL || "#",
    },
  },
  {
    id: "mt5",
    name: "Meta Trader 5",
    description: "Already have an account? Download MT5 Terminal Directly.",
    downloadLinks: {
      google: process.env.NEXT_PUBLIC_MT5_GOOGLE_PLAY_URL || "#",
      direct: process.env.NEXT_PUBLIC_MT5_DIRECT_DOWNLOAD_URL || "#",
    },
  },
];
