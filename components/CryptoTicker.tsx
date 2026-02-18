"use client";

import { useState } from "react";

// Crypto data
const cryptoData = [
  { symbol: "BTC", name: "Bitcoin", price: "€45,234.56", change: "+2.34%" },
  { symbol: "ETH", name: "Ethereum", price: "€2,876.43", change: "-1.23%" },
  { symbol: "BNB", name: "BNB", price: "€298.76", change: "+3.45%" },
  { symbol: "ADA", name: "Cardano", price: "€0.4521", change: "+1.87%" },
  { symbol: "SOL", name: "Solana", price: "€98.32", change: "+4.12%" },
  { symbol: "XRP", name: "XRP", price: "€0.6234", change: "-0.45%" },
  { symbol: "DOT", name: "Polkadot", price: "€7.89", change: "+0.89%" },
  { symbol: "DOGE", name: "Dogecoin", price: "€0.0823", change: "-2.34%" },
];

export default function CryptoTicker() {
  const [isPaused, setIsPaused] = useState(false);

  return (
    <>
      <div 
        className="bg-black text-white overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="flex whitespace-nowrap py-2" style={{ animation: 'marquee 30s linear infinite', animationPlayState: isPaused ? 'paused' : 'running' }}>
          {/* Render twice for seamless loop */}
          {[...cryptoData, ...cryptoData].map((crypto, index) => (
            <div 
              key={`${crypto.symbol}-${index}`}
              className="flex items-center space-x-2 px-6 mx-2 border-r border-gray-700 last:border-r-0"
            >
              <span className="font-semibold text-sm">{crypto.symbol}</span>
              <span className="text-sm">{crypto.price}</span>
              <span 
                className={`text-xs ${
                  crypto.change.startsWith('+') ? 'text-green-400' : 'text-red-400'
                }`}
              >
                {crypto.change}
              </span>
            </div>
          ))}
        </div>
      </div>
      <style jsx global>{`
        @keyframes marquee {
          0% {
            transform: translateX(0);
          }
          100% {
            transform: translateX(-50%);
          }
        }
      `}</style>
    </>
  );
}

