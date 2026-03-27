"use client";

import { useState } from "react";
import { useLiveMarket } from "@/lib/market/use-live-market";
import { formatPrice } from "@/lib/market/listings";

export default function CryptoTicker() {
  const [isPaused, setIsPaused] = useState(false);
  const { assets, loading, error, hasStaleData, hasUnavailableData, lastSyncedAt } = useLiveMarket(20_000);

  const liveRows = assets.filter((asset) => asset.price !== null);

  return (
    <>
      <div
        className="bg-black text-white overflow-hidden"
        onMouseEnter={() => setIsPaused(true)}
        onMouseLeave={() => setIsPaused(false)}
      >
        <div className="px-4 py-1 text-[11px] text-gray-400 border-b border-gray-800">
          {loading && "Loading market ticker…"}
          {!loading && error && `Market data unavailable: ${error}`}
          {!loading && !error && hasStaleData && "Ticker delayed: some prices are stale."}
          {!loading && !error && hasUnavailableData && "Ticker partial: some assets unavailable."}
          {!loading && !error && !hasStaleData && !hasUnavailableData && "Live market ticker"}
          {lastSyncedAt ? ` • Synced ${new Date(lastSyncedAt).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit", second: "2-digit" })}` : ""}
        </div>

        <div className="flex whitespace-nowrap py-2" style={{ animation: "marquee 30s linear infinite", animationPlayState: isPaused ? "paused" : "running" }}>
          {[...liveRows, ...liveRows].map((crypto, index) => (
            <div
              key={`${crypto.symbol}-${index}`}
              className="flex items-center space-x-2 px-6 mx-2 border-r border-gray-700 last:border-r-0"
            >
              <span className="font-semibold text-sm">{crypto.symbol}</span>
              <span className="text-sm">{crypto.price ? `€${formatPrice(crypto.price, crypto.symbol)}` : "N/A"}</span>
              <span
                className={`text-xs ${(crypto.change24h ?? 0) >= 0 ? "text-green-400" : "text-red-400"}`}
              >
                {typeof crypto.change24h === "number" ? `${crypto.change24h >= 0 ? "+" : ""}${crypto.change24h.toFixed(2)}%` : "N/A"}
              </span>
            </div>
          ))}
          {!loading && liveRows.length === 0 && (
            <div className="px-6 text-sm text-gray-300">No live rows available right now.</div>
          )}
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
