"use client";

import * as React from "react";

interface Recommendation {
  id: string;
  name: string;
  price: string;
  change: string;
  changePercent: string;
  trend: "up" | "down";
}

interface TradeWRecommendationsProps {
  recommendations: Recommendation[];
}

const TradeWRecommendations: React.FC<TradeWRecommendationsProps> = ({
  recommendations,
}) => {
  const formatChange = (change: string, changePercent: string, trend: "up" | "down") => {
    const isPositive = trend === "up";
    return (
      <span className={`tradew-recommendation-change ${isPositive ? "positive" : "negative"}`}>
        {isPositive ? "+" : ""}{change} ({isPositive ? "+" : ""}{changePercent}%)
      </span>
    );
  };

  return (
    <div className="tradew-recommendations">
      <div className="tradew-recommendations-header">
        <h3 className="tradew-recommendations-title">Market Signals</h3>
        <a href="#" className="tradew-positions-more">
          View All
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
        </a>
      </div>

      <div className="tradew-recommendations-grid">
        {recommendations.map((item) => (
          <div key={item.id} className="tradew-recommendation-item">
            <div className="tradew-recommendation-name">{item.name}</div>
            <div className="tradew-recommendation-price">${item.price}</div>
            <div>
              {formatChange(item.change, item.changePercent, item.trend)}
            </div>
            <button className="tradew-btn tradew-btn-outline" style={{ padding: "6px 12px", fontSize: "12px" }}>
              Trade
            </button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeWRecommendations;
