"use client";

import React from "react";

interface CryptoIconProps {
  symbol: string;
  size?: number | string;
  className?: string;
  style?: React.CSSProperties;
}

// Official cryptocurrency colors and SVG paths
const CRYPTO_DATA: Record<string, { color: string; svg: string; name: string }> = {
  BTC: {
    color: "#F7931A",
    name: "Bitcoin",
    svg: "M13.062 2.812L8.625 7.25L8.625 12.625L13.062 17.062L17.5 12.625L13.062 8.187V2.812ZM12.625 8.187L8.625 12.625L12.625 8.187ZM8.625 12.625L8.625 17.062L12.625 12.625L8.625 12.625ZM12.625 12.625L17.5 12.625L12.625 17.062L12.625 12.625Z"
  },
  ETH: {
    color: "#627EEA",
    name: "Ethereum",
    svg: "M12 2L2 7L12 12L22 7L12 2ZM12 12L2 17L12 22L22 17L12 12Z"
  },
  SOL: {
    color: "#9945FF",
    name: "Solana",
    svg: "M12 2L2 22L12 18L22 8L12 2ZM12 18L2 22L12 22L22 22L12 18Z"
  },
  BNB: {
    color: "#F3BA2F",
    name: "Binance Coin",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  XRP: {
    color: "#23292F",
    name: "Ripple",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  ADA: {
    color: "#0033AD",
    name: "Cardano",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  DOGE: {
    color: "#C2A633",
    name: "Dogecoin",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  DOT: {
    color: "#E6007A",
    name: "Polkadot",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  AVAX: {
    color: "#E84142",
    name: "Avalanche",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  MATIC: {
    color: "#8247E5",
    name: "Polygon",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  USDT: {
    color: "#26A17B",
    name: "Tether",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  USDC: {
    color: "#2775CA",
    name: "USD Coin",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  BUSD: {
    color: "#F0B90B",
    name: "Binance USD",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  LINK: {
    color: "#2A5ADA",
    name: "Chainlink",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  UNI: {
    color: "#FF007A",
    name: "Uniswap",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  },
  ATOM: {
    color: "#3E3E3E",
    name: "Cosmos",
    svg: "M12 2L2 12L12 22L22 12L12 2ZM12 12L2 12L12 22L22 12L12 12Z"
  }
};

export default function CryptoIcon({ symbol, size = 24, className = "", style }: CryptoIconProps) {
  const cryptoData = CRYPTO_DATA[symbol.toUpperCase()];
  
  if (!cryptoData) {
    // Fallback to generic icon if crypto not found
    return (
      <div 
        className={`crypto-icon-fallback ${className}`}
        style={{
          width: size,
          height: size,
          borderRadius: "50%",
          background: "linear-gradient(135deg, #667eea 0%, #764ba2 100%)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "white",
          fontWeight: "bold",
          fontSize: typeof size === "number" ? size * 0.4 : "12px",
          ...style
        }}
      >
        {symbol.slice(0, 2)}
      </div>
    );
  }

  return (
    <div 
      className={`crypto-icon ${className}`}
      style={{
        width: size,
        height: size,
        borderRadius: "50%",
        background: cryptoData.color,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
        overflow: "hidden",
        ...style
      }}
      title={cryptoData.name}
    >
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="white"
        style={{
          position: "absolute",
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          maxWidth: "80%",
          maxHeight: "80%"
        }}
      >
        <path d={cryptoData.svg} fill="white" />
      </svg>
    </div>
  );
}

// Helper function to get crypto color
export function getCryptoColor(symbol: string): string {
  const cryptoData = CRYPTO_DATA[symbol.toUpperCase()];
  return cryptoData?.color || "#667eea";
}

// Helper function to get all supported cryptos
export function getSupportedCryptos(): string[] {
  return Object.keys(CRYPTO_DATA);
}
