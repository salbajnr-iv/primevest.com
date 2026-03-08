"use client";

import * as React from "react";

interface MarketOverviewProps {
  marketCap: string;
  marketCapChange: string;
  volume24h: string;
  volumeChange: string;
  topGainer: {
    name: string;
    symbol: string;
    change: string;
  };
  topLoser: {
    name: string;
    symbol: string;
    change: string;
  };
  btcDominance: string;
  fearGreedIndex: number;
  fearGreedLabel: string;
}

export default function MarketOverview({
  marketCap,
  marketCapChange,
  volume24h,
  volumeChange,
  topGainer,
  topLoser,
  btcDominance,
  fearGreedIndex,
  fearGreedLabel,
}: MarketOverviewProps) {
  const getFearGreedColor = (index: number) => {
    if (index < 25) return "#d64545";
    if (index < 45) return "#ff9800";
    if (index < 55) return "#ffeb3b";
    if (index < 75) return "#2cec9a";
    return "#0f9d58";
  };

  return (
    <section className="market-overview grid gap-4 md:grid-cols-2 xl:grid-cols-4">
      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">Market Cap</p>
        <p className="text-xl font-semibold">{marketCap}</p>
        <p className="text-sm text-green-600">{marketCapChange}</p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">24h Volume</p>
        <p className="text-xl font-semibold">{volume24h}</p>
        <p className="text-sm text-green-600">{volumeChange}</p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">Top Movers</p>
        <p className="text-sm">
          <span className="font-medium">Gainer:</span> {topGainer.name} ({topGainer.symbol}) {topGainer.change}
        </p>
        <p className="text-sm">
          <span className="font-medium">Loser:</span> {topLoser.name} ({topLoser.symbol}) {topLoser.change}
        </p>
      </div>

      <div className="rounded-lg border p-4">
        <p className="text-xs text-muted-foreground">Sentiment</p>
        <p className="text-sm">BTC Dominance: {btcDominance}</p>
        <p className="text-sm">
          Fear &amp; Greed: <span style={{ color: getFearGreedColor(fearGreedIndex) }}>{fearGreedIndex}</span> ({fearGreedLabel})
        </p>
      </div>
    </section>
  );
}
