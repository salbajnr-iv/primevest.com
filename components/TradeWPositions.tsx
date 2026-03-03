"use client";

import * as React from "react";

interface Position {
  id: string;
  symbol: string;
  type: "buy" | "sell";
  volume: string;
  openPrice: string;
  currentPrice: string;
  profit: string;
  profitPercent: string;
}

interface TradeWPositionsProps {
  positions: Position[];
}

const TradeWPositions: React.FC<TradeWPositionsProps> = ({ positions }) => {
  const [activeTab, setActiveTab] = React.useState("tradew");

  const tabs = [
    { id: "tradew", label: "Trade W" },
    { id: "mt4", label: "MT4" },
    { id: "mt5", label: "MT5" },
  ];

  const getPositionsForTab = (tabId: string) => {
    // In a real app, this would filter positions by account type
    return positions;
  };

  const formatProfit = (profit: string, profitPercent: string) => {
    const isPositive = profit.startsWith("+");
    return (
      <span className={`tradew-recommendation-change ${isPositive ? "positive" : "negative"}`}>
        {profit} ({profitPercent})
      </span>
    );
  };

  return (
    <div className="tradew-positions">
      <div className="tradew-positions-header">
        <h2 className="tradew-positions-title">Positions</h2>
        <a href="#" className="tradew-positions-more">
          More
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      <div className="tradew-tabs">
        <div className="tradew-tab-list">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              className={`tradew-tab ${activeTab === tab.id ? "active" : ""}`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {getPositionsForTab(activeTab).length > 0 ? (
        <table className="tradew-table">
          <thead>
            <tr>
              <th>Symbol</th>
              <th>Type</th>
              <th>Volume</th>
              <th>Open Price</th>
              <th>Current Price</th>
              <th>Profit</th>
            </tr>
          </thead>
          <tbody>
            {getPositionsForTab(activeTab).map((position) => (
              <tr key={position.id}>
                <td>
                  <strong>{position.symbol}</strong>
                </td>
                <td>
                  <span
                    className={`tradew-recommendation-change ${
                      position.type === "buy" ? "positive" : "negative"
                    }`}
                  >
                    {position.type.toUpperCase()}
                  </span>
                </td>
                <td>{position.volume}</td>
                <td>{position.openPrice}</td>
                <td>{position.currentPrice}</td>
                <td>{formatProfit(position.profit, position.profitPercent)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <div className="tradew-empty-state">
          <svg className="tradew-empty-icon" viewBox="0 0 64 64" fill="currentColor">
            <path d="M32 8a24 24 0 100 48 24 24 0 000-48zm0 8a4 4 0 110 8 4 4 0 010-8zm0 12a8 8 0 018 8v4a4 4 0 01-4 4h-8a4 4 0 01-4-4v-4a8 8 0 018-8z"/>
          </svg>
          <p>No open positions</p>
          <p style={{ fontSize: "12px", marginTop: "8px" }}>
            Start trading to see your positions here
          </p>
        </div>
      )}
    </div>
  );
};

export default TradeWPositions;
