"use client";

import * as React from "react";

// Price update callback type
type PriceUpdateCallback = (price: number) => void;

// Market data type
export interface MarketData {
  id: string;
  name: string;
  symbol: string;
  price: number;
  change24h: number;
  marketCap: number;
  volume24h: number;
  high24h: number;
  low24h: number;
  iconSrc?: string;
}

// Volatility configuration for each coin
const volatilityConfig: Record<string, number> = {
  btc: 0.002,      // Bitcoin - lower volatility
  eth: 0.003,      // Ethereum
  bnb: 0.004,      // BNB
  sol: 0.006,      // Solana - higher volatility
  xrp: 0.005,      // Ripple
  ada: 0.007,      // Cardano
  doge: 0.015,     // Dogecoin - highest volatility
  dot: 0.005,      // Polkadot
};

// Base prices for simulation
const basePrices: Record<string, number> = {
  btc: 43250.00,
  eth: 2280.50,
  bnb: 312.40,
  sol: 98.75,
  xrp: 0.62,
  ada: 0.52,
  doge: 0.082,
  dot: 7.85,
};

export function usePriceSimulation(
  initialData: MarketData[],
  updateInterval: number = 2000
) {
  const [data, setData] = React.useState<MarketData[]>(initialData);
  const [lastUpdate, setLastUpdate] = React.useState<Date>(new Date());
  
  // Subscribe to price updates for a specific coin
  const subscribeToCoin = React.useCallback((coinId: string, callback: PriceUpdateCallback) => {
    const interval = setInterval(() => {
      const coin = data.find(c => c.id === coinId);
      if (coin) {
        callback(coin.price);
      }
    }, updateInterval);
    
    return () => clearInterval(interval);
  }, [data, updateInterval]);

  // Simulate price movement
  const simulatePriceChange = React.useCallback((currentPrice: number, coinId: string): number => {
    const volatility = volatilityConfig[coinId] || 0.004;
    const change = (Math.random() - 0.5) * 2 * volatility * currentPrice;
    const newPrice = currentPrice + change;
    return Math.max(0.0001, Number(newPrice.toFixed(2)));
  }, []);

  // Update all prices
  React.useEffect(() => {
    const interval = setInterval(() => {
      setData(prevData => {
        const newData = prevData.map(coin => ({
          ...coin,
          price: simulatePriceChange(coin.price, coin.id),
        }));
        return newData;
      });
      setLastUpdate(new Date());
    }, updateInterval);

    return () => clearInterval(interval);
  }, [simulatePriceChange, updateInterval]);

  return {
    data,
    lastUpdate,
    subscribeToCoin,
    refresh: () => {
      setData(prevData => 
        prevData.map(coin => ({
          ...coin,
          price: basePrices[coin.id] || coin.price,
        }))
      );
    },
  };
}

// Format price with appropriate decimal places
export function formatPrice(price: number, symbol: string): string {
  if (price >= 1000) {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 1) {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  } else if (price >= 0.01) {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 4,
      maximumFractionDigits: 4,
    });
  } else {
    return price.toLocaleString("de-DE", {
      minimumFractionDigits: 6,
      maximumFractionDigits: 8,
    });
  }
}

// Format large numbers
export function formatCompact(value: number): string {
  if (value >= 1e12) return `${(value / 1e12).toFixed(2)}B`;
  if (value >= 1e9) return `${(value / 1e9).toFixed(2)}B`;
  if (value >= 1e6) return `${(value / 1e6).toFixed(2)}M`;
  if (value >= 1e3) return `${(value / 1e3).toFixed(2)}K`;
  return value.toFixed(2);
}

// Generate sparkline data points
export function generateSparkline(basePrice: number, points: number = 20): number[] {
  const data: number[] = [basePrice];
  for (let i = 1; i < points; i++) {
    const volatility = 0.02;
    const change = (Math.random() - 0.5) * 2 * volatility * data[i - 1];
    data.push(Math.max(0.0001, data[i - 1] + change));
  }
  return data;
}

// Get coin icon color
export function getCoinColor(symbol: string): string {
  const colors: Record<string, string> = {
    BTC: "#F7931A",
    ETH: "#627EEA",
    BNB: "#F3BA2F",
    SOL: "#9945FF",
    XRP: "#23292F",
    ADA: "#0033AD",
    DOGE: "#C2A633",
    DOT: "#E6007A",
  };
  return colors[symbol] || "#0f9d58";
}

// Get coin logo path
export function getCoinLogo(symbol: string): string {
  const logos: Record<string, string> = {
    BTC: "/btc-logo.png",
    ETH: "/eth-logo.png",
    BNB: "/bnb-logo.png",
    SOL: "/sol-logo.png",
    XRP: "/xrp-logo.png",
    ADA: "/ada-logo.png",
    DOGE: "/doge-logo.png",
    DOT: "/dot-logo.png",
  };
  return logos[symbol] || "";
}

