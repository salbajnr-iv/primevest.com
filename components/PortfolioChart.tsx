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
<<<<<<< HEAD
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
=======
              <stop offset="0%" stopColor="rgba(15, 157, 88, 0.3)" />
              <stop offset="100%" stopColor="rgba(15, 157, 88, 0)" />
            </linearGradient>
>>>>>>> 02bdcb7 (Initial commit)
          </defs>
          <path
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
            fill="url(#chartGradient)"
            stroke="none"
<<<<<<< HEAD
            className="chart-area"
=======
>>>>>>> 02bdcb7 (Initial commit)
          />
          <path
            className="chart-line"
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
<<<<<<< HEAD
            stroke="url(#lineGlow)"
            strokeWidth="3"
            fill="none"
            filter="url(#glow)"
          />
          {/* Glow effect */}
          <path
            className="chart-line-glow"
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
            stroke="rgba(15, 157, 88, 0.3)"
            strokeWidth="8"
            fill="none"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              strokeDasharray: 600,
              strokeDashoffset: 600,
              animation: 'lineIn 1.5s ease-out 0.3s forwards',
            }}
          />
        </svg>
        
        {/* Animated dots on key points */}
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', pointerEvents: 'none' }}>
          <circle cx="300" cy="32" r="4" fill="#2cec9a" style={{ animation: 'pulse 2s ease-in-out infinite' }}>
            <animate attributeName="r" values="4;6;4" dur="2s" repeatCount="indefinite" />
            <animate attributeName="opacity" values="1;0.5;1" dur="2s" repeatCount="indefinite" />
          </circle>
        </svg>
      </div>
      <div className="times">
        {ranges.map((range, index) => (
          <span
            key={range.value}
            data-range={range.value}
            className={`${activeRange === range.value ? "active" : ""} animate-item`}
            style={{ animationDelay: `${0.4 + index * 0.05}s` }}
=======
          />
        </svg>
      </div>
      <div className="times">
        {ranges.map((range) => (
          <span
            key={range.value}
            data-range={range.value}
            className={activeRange === range.value ? "active" : ""}
>>>>>>> 02bdcb7 (Initial commit)
            onClick={() => onRangeChange?.(range.value)}
          >
            {range.label}
          </span>
        ))}
      </div>
<<<<<<< HEAD
      
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
=======
    </>
  );
}

>>>>>>> 02bdcb7 (Initial commit)
