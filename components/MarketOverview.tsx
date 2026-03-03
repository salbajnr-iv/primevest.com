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
  // Calculate gradient position based on index
  const getFearGreedColor = (index: number) => {
    if (index < 25) return "#d64545"; // Extreme Fear - Red
    if (index < 45) return "#ff9800"; // Fear - Orange
    if (index < 55) return "#ffeb3b"; // Neutral - Yellow
    if (index < 75) return "#2cec9a"; // Greed - Light Green
    return "#0f9d58"; // Extreme Greed - Green
  };

  const fearGreedColor = getFearGreedColor(fearGreedIndex);

          </div>
        </div>
      </div>

      <div className="market-movers">
        <div className="mover-card gainer">
          <div className="mover-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 6l-9.5 9.5-5-5L1 18" />
              <path d="M17 6h6v6" />
            </svg>
            <span>Top Gainer</span>
          </div>
          <div className="mover-content">
            <span className="mover-name">{topGainer.name}</span>
            <span className="mover-symbol">{topGainer.symbol}</span>
            <span className="mover-change positive">▲ {topGainer.change}</span>
          </div>
        </div>

        <div className="mover-card loser">
          <div className="mover-header">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 18l-9.5-9.5-5 5L1 6" />
              <path d="M17 18h6v-6" />
            </svg>
            <span>Top Loser</span>
          </div>
          <div className="mover-content">
            <span className="mover-name">{topLoser.name}</span>
            <span className="mover-symbol">{topLoser.symbol}</span>
            <span className="mover-change negative">▼ {topLoser.change}</span>
          </div>
        </div>
      </div>
    </section>
  );
}

