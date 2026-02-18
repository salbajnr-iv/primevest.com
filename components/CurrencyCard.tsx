"use client";

import * as React from "react";
import Image from "next/image";

interface CurrencyCardProps {
  name: string;
  symbol: string;
  price: string;
  change: string;
  changeValue: string;
  marketCap: string;
  iconSrc?: string;
  iconColor?: string;
  isPositive?: boolean;
}

export default function CurrencyCard({
  name,
  symbol,
  price,
  change,
  changeValue,
  marketCap,
  iconSrc,
  iconColor,
  isPositive = true,
}: CurrencyCardProps) {
  // Determine background color: use iconColor if provided, otherwise use a default
  const bgColor = iconColor || "#0f9d58";

  return (
    <div className="currency-card">
      <div className="currency-left">
        <div className="currency-icon" style={{ background: bgColor }}>
          {iconSrc ? (
            <Image src={iconSrc} alt={name} width={24} height={24} unoptimized />
          ) : (
            <span className="currency-symbol">{symbol.slice(0, 2)}</span>
          )}
        </div>
        <div className="currency-info">
          <div className="currency-name">{name}</div>
          <div className="currency-symbol">{symbol}</div>
        </div>
      </div>
      <div className="currency-right">
        <div className="currency-price">{price}</div>
        <div className={`currency-change ${isPositive ? "positive" : "negative"}`}>
          <span className="change-arrow">{isPositive ? "▲" : "▼"}</span>
          {change}
        </div>
        <div className="currency-market">{marketCap}</div>
      </div>
      <div className="currency-sparkline">
        <svg viewBox="0 0 60 20" preserveAspectRatio="none">
          <defs>
            <linearGradient id={`sparkline-${symbol}`} x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor={isPositive ? "rgba(15, 157, 88, 0.3)" : "rgba(214, 69, 69, 0.3)"} />
              <stop offset="100%" stopColor={isPositive ? "rgba(15, 157, 88, 0)" : "rgba(214, 69, 69, 0)"} />
            </linearGradient>
          </defs>
          <path
            d={isPositive 
              ? "M0,18 L10,14 L20,16 L30,12 L40,15 L50,10 L60,12"
              : "M0,8 L10,12 L20,10 L30,15 L40,12 L50,16 L60,18"
            }
            fill={`url(#sparkline-${symbol})`}
            stroke="none"
          />
          <path
            d={isPositive 
              ? "M0,18 L10,14 L20,16 L30,12 L40,15 L50,10 L60,12"
              : "M0,8 L10,12 L20,10 L30,15 L40,12 L50,16 L60,18"
            }
            fill="none"
            stroke={isPositive ? "#2cec9a" : "#d64545"}
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
      </div>
    </div>
  );
}

