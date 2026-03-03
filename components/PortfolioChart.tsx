"use client";

import * as React from "react";

interface PortfolioChartProps {
  activeRange?: string;
  onRangeChange?: (range: string) => void;
}

export default function PortfolioChart({ activeRange = "1D", onRangeChange }: PortfolioChartProps) {
  const ranges = [
    { label: "1T", value: "1D" },
    { label: "7T", value: "7D" },
    { label: "30T", value: "30D" },
    { label: "1J", value: "1Y" },
  ];

  return (
    <>
      <div className="chart">
        <div className="chart-grid"></div>
        <svg viewBox="0 0 300 100" preserveAspectRatio="none">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(15, 157, 88, 0.4)" />
              <stop offset="50%" stopColor="rgba(15, 157, 88, 0.15)" />
              <stop offset="100%" stopColor="rgba(15, 157, 88, 0)" />
            </linearGradient>
            <linearGradient id="lineGlow" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#0f9d58" />
              <stop offset="50%" stopColor="#2cec9a" />
              <stop offset="100%" stopColor="#0f9d58" />
            </linearGradient>
            <filter id="glow">
              <feGaussianBlur stdDeviation="2" result="coloredBlur"/>
              <feMerge>
                <feMergeNode in="coloredBlur"/>
                <feMergeNode in="SourceGraphic"/>
              </feMerge>
            </filter>
          </defs>
          <path
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
            fill="url(#chartGradient)"
            stroke="none"
            className="chart-area"
            onClick={() => onRangeChange?.(range.value)}
          >
            {range.label}
          </span>
        ))}
      </div>
      
      <style jsx>{`
        @keyframes lineIn {
          to {
            stroke-dashoffset: 0;
          }
        }
        
        @keyframes pulse {
          0%, 100% {
            transform: scale(1);
            opacity: 1;
          }
          50% {
            transform: scale(1.5);
            opacity: 0.5;
          }
        }
        
        .chart-area {
          animation: fadeIn 0.8s ease-out forwards;
          opacity: 0;
        }
        
        @keyframes fadeIn {
          to {
            opacity: 1;
          }
        }
      `}</style>
    </>
  );
}
