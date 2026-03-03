"use client";

import * as React from "react";

interface TradeWMobileBannerProps {
  onDownloadClick: () => void;
}

const TradeWMobileBanner: React.FC<TradeWMobileBannerProps> = ({
  onDownloadClick,
}) => {
  return (
    <div className="tradew-mobile-banner">
      <div className="tradew-mobile-banner-content">
        <div className="tradew-mobile-banner-icon">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor">
            <path d="M17 2H7c-1.1 0-2 .9-2 2v16c0 1.1.9 2 2 2h10c1.1 0 2-.9 2-2V4c0-1.1-.9-2-2-2zm-5 2c1.1 0 2 .9 2 2s-.9 2-2 2-2-.9-2-2 .9-2 2-2zm0 16c-2.8 0-5-2.2-5-5s2.2-5 5-5 5 2.2 5 5-2.2 5-5 5z"/>
          </svg>
        </div>
        <div className="tradew-mobile-banner-text">
          <h4 className="tradew-mobile-banner-title">Trade W Mobile App</h4>
          <p className="tradew-mobile-banner-description">
            Trade on the go with our mobile app
          </p>
        </div>
        <button 
          className="tradew-btn tradew-btn-primary"
          onClick={onDownloadClick}
          style={{ fontSize: "12px", padding: "8px 12px" }}
          aria-label="Download Trade W mobile app"
        >
          Download
        </button>
      </div>
    </div>
  );
};

export default TradeWMobileBanner;
