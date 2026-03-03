"use client";

import * as React from "react";

interface TradeWSecurityCardProps {
  securityLevel: "low" | "medium" | "high";
  onUpgrade: () => void;
}

const TradeWSecurityCard: React.FC<TradeWSecurityCardProps> = ({
  securityLevel,
  onUpgrade,
}) => {
  const getSecurityInfo = (level: string) => {
    switch (level) {
      case "low":
        return {
          badge: "Level 1",
          badgeColor: "#dc3545",
          title: "Security Level",
          description: "Complete identity verification to increase your security level and unlock higher withdrawal limits.",
          buttonText: "Upgrade Now",
        };
      case "medium":
        return {
          badge: "Level 2",
          badgeColor: "#ffc107",
          title: "Security Level",
          description: "Add two-factor authentication to enhance your account security.",
          buttonText: "Enhance Security",
        };
      case "high":
        return {
          badge: "Level 3",
          badgeColor: "#12c65b",
          title: "Security Level",
          description: "Your account is fully secured with all verification steps completed.",
          buttonText: "Manage Settings",
        };
      default:
        return {
          badge: "Level 1",
          badgeColor: "#dc3545",
          title: "Security Level",
          description: "Complete identity verification to increase your security level.",
          buttonText: "Upgrade Now",
        };
    }
  };

  const securityInfo = getSecurityInfo(securityLevel);

  return (
    <div className="tradew-security-card">
      <div className="tradew-security-header">
        <h3 className="tradew-security-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 1l2.5 5h5.5l-4.5 3.5L16 15l-6-4.5L4 15l2.5-5.5L2 6h5.5L10 1z"/>
          </svg>
          {securityInfo.title}
        </h3>
        <span 
          className="tradew-security-badge"
          style={{ backgroundColor: `${securityInfo.badgeColor}20`, color: securityInfo.badgeColor }}
        >
          {securityInfo.badge}
        </span>
      </div>

      <p className="tradew-security-description">
        {securityInfo.description}
      </p>

      <button className="tradew-security-link" onClick={onUpgrade}>
        {securityInfo.buttonText}
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
          <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </button>

      <div className="tradew-security-image">
        <svg width="60" height="60" viewBox="0 0 60 60" fill="currentColor" opacity="0.3">
          <path d="M30 5l6 12h13l-10.5 8 4 12L30 27 17.5 37l4-12L11 17h13L30 5z"/>
        </svg>
      </div>
    </div>
  );
};

export default TradeWSecurityCard;
