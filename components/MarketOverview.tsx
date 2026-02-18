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
  return (
    <section className="market-overview">
      <div className="market-header">
        <h3 className="section-title">Marktüberblick</h3>
        <span className="market-live">
          <span className="live-dot"></span>
          Live
        </span>
      </div>
      
      <div className="market-stats-grid">
        <div className="market-stat-card">
          <div className="stat-icon market-cap-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <path d="M12 6v12M8 10h8M8 14h4" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Market Cap</div>
            <div className="stat-value">{marketCap}</div>
            <div className={`stat-change ${parseFloat(marketCapChange) >= 0 ? "positive" : "negative"}`}>
              {parseFloat(marketCapChange) >= 0 ? "▲" : "▼"} {marketCapChange}
            </div>
          </div>
        </div>

        <div className="market-stat-card">
          <div className="stat-icon volume-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">Volumen (24h)</div>
            <div className="stat-value">{volume24h}</div>
            <div className={`stat-change ${parseFloat(volumeChange) >= 0 ? "positive" : "negative"}`}>
              {parseFloat(volumeChange) >= 0 ? "▲" : "▼"} {volumeChange}
            </div>
          </div>
        </div>

        <div className="market-stat-card">
          <div className="stat-icon btc-icon">
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2h-3a5.5 5.5 0 0 0-5.5 5.5v9A5.5 5.5 0 0 0 10.5 22h3a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 13.5 2zm.3 4.2c1.5.2 2.4 1.2 2.4 2.5 0 1-.5 1.8-1.5 2.1.9.4 1.4 1.1 1.4 2.2 0 1.8-1.3 2.9-3.5 2.9H10v-1.6h.9V8.3H10V6.7h2.1c.7 0 1.2 0 1.7.1zM12 9.2v2.2h.9c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1H12zm0 3.7v2.5h1c.9 0 1.5-.5 1.5-1.2 0-.8-.6-1.3-1.6-1.3H12z" />
            </svg>
          </div>
          <div className="stat-content">
            <div className="stat-label">BTC Dominanz</div>
            <div className="stat-value">{btcDominance}</div>
          </div>
        </div>

        <div className="market-stat-card fear-greed">
          <div className="stat-content">
            <div className="stat-label">Fear & Greed Index</div>
            <div className="fear-greed-value">{fearGreedIndex}</div>
            <div className="fear-greed-label">{fearGreedLabel}</div>
          </div>
          <div className="fear-greed-bar">
            <div 
              className="fear-greed-fill" 
              style={{ width: `${fearGreedIndex}%` }}
            ></div>
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

