"use client";

import * as React from "react";

interface PerformanceChartProps {
  portfolioValue: number;
  portfolioChange: number;
  benchmarkValue: number;
  benchmarkChange: number;
  periods?: { label: string; value: string }[];
  onPeriodChange?: (period: string) => void;
}

export default function PerformanceChart({
  portfolioValue,
  portfolioChange,
  benchmarkValue,
  benchmarkChange,
  periods = [
    { label: "1D", value: "1D" },
    { label: "7D", value: "7D" },
    { label: "30D", value: "30D" },
    { label: "1Y", value: "1Y" },
    { label: "ALL", value: "ALL" },
  ],
  onPeriodChange,
}: PerformanceChartProps) {
  const [activePeriod, setActivePeriod] = React.useState("1D");
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  // Generate performance data based on period
  const generateData = React.useCallback((period: string) => {
    const baseValue = portfolioValue;
    const points = 30;
    const volatility = period === "1D" ? 0.002 : period === "7D" ? 0.008 : 0.02;
    
    const data: number[] = [baseValue * 0.98];
    for (let i = 1; i < points; i++) {
      const change = (Math.random() - 0.48) * volatility * baseValue;
      data.push(data[i - 1] + change);
    }
    // End near current value
    data[points - 1] = baseValue;
    
    return data;
  }, [portfolioValue]);

  const portfolioData = generateData(activePeriod);
  const benchmarkData = generateData(activePeriod).map(v => v * 0.995); // Slightly lower

  const maxValue = Math.max(...portfolioData, ...benchmarkData);
  const minValue = Math.min(...portfolioData, ...benchmarkData);
  const range = maxValue - minValue;

  const formatValue = (value: number) => {
    if (value >= 1000) {
      return `€${(value / 1000).toFixed(1)}K`;
    }
    return `€${value.toFixed(0)}`;
  };

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    onPeriodChange?.(period);
  };

  return (
    <div className="performance-chart" style={{ marginTop: 10 }}>
      <div style={{ 
        display: "flex", 
        alignItems: "flex-start", 
        justifyContent: "space-between",
        marginBottom: 16,
      }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Performance vs Market
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
            {portfolioChange >= 0 ? "+" : ""}{portfolioChange.toFixed(2)}%
          </div>
        </div>
        
        <div style={{ 
          display: "flex", 
          gap: 6,
          padding: 4,
          background: "var(--bg-soft)",
          borderRadius: 10,
        }}>
          {periods.map((period) => (
            <button
              key={period.value}
              onClick={() => handlePeriodChange(period.value)}
              style={{
                padding: "6px 12px",
                borderRadius: 8,
                border: "none",
                background: activePeriod === period.value ? "var(--green)" : "transparent",
                color: activePeriod === period.value ? "#fff" : "var(--muted)",
                fontSize: 11,
                fontWeight: 600,
                cursor: "pointer",
                transition: "all 0.2s ease",
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      {/* Chart */}
      <div style={{ position: "relative", height: 180, marginBottom: 16 }}>
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <defs>
            <linearGradient id="portfolioGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(15, 157, 88, 0.3)" />
              <stop offset="100%" stopColor="rgba(15, 157, 88, 0)" />
            </linearGradient>
            <linearGradient id="benchmarkGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(0, 122, 255, 0.2)" />
              <stop offset="100%" stopColor="rgba(0, 122, 255, 0)" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          {[0.25, 0.5, 0.75, 1].map((ratio) => (
            <line
              key={ratio}
              x1="0"
              y1={150 - ratio * 140}
              x2="300"
              y2={150 - ratio * 140}
              stroke="var(--border)"
              strokeWidth="1"
              strokeDasharray="4 4"
            />
          ))}

          {/* Portfolio area */}
          <path
            d={`M0,${150 - ((portfolioData[0] - minValue) / range) * 140} ${portfolioData.map((v, i) => `L${(i / (portfolioData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")} L300,150 L0,150 Z`}
            fill="url(#portfolioGradient)"
          />

          {/* Benchmark area */}
          <path
            d={`M0,${150 - ((benchmarkData[0] - minValue) / range) * 140} ${benchmarkData.map((v, i) => `L${(i / (benchmarkData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")} L300,150 L0,150 Z`}
            fill="url(#benchmarkGradient)"
          />

          {/* Portfolio line */}
          <path
            d={portfolioData.map((v, i) => `L${(i / (portfolioData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")}
            fill="none"
            stroke="#0f9d58"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Benchmark line */}
          <path
            d={benchmarkData.map((v, i) => `L${(i / (benchmarkData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")}
            fill="none"
            stroke="#007aff"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Hover indicator */}
          {hoveredIndex !== null && (
            <g>
              <line
                x1={(hoveredIndex / (portfolioData.length - 1)) * 300}
                y1="0"
                x2={(hoveredIndex / (portfolioData.length - 1)) * 300}
                y2="150"
                stroke="var(--muted)"
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <circle
                cx={(hoveredIndex / (portfolioData.length - 1)) * 300}
                cy={150 - ((portfolioData[hoveredIndex] - minValue) / range) * 140}
                r="6"
                fill="#0f9d58"
                stroke="#fff"
                strokeWidth="2"
              />
            </g>
          )}
        </svg>

        {/* Hover tooltip */}
        {hoveredIndex !== null && (
          <div style={{
            position: "absolute",
            top: 10,
            left: `${(hoveredIndex / (portfolioData.length - 1)) * 100}%`,
            transform: "translateX(-50%)",
            background: "var(--card)",
            padding: "8px 12px",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.15)",
            border: "1px solid var(--border)",
            zIndex: 10,
          }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--text)" }}>
              Portfolio: {formatValue(portfolioData[hoveredIndex])}
            </div>
            <div style={{ fontSize: 11, color: "#007aff" }}>
              Benchmark: {formatValue(benchmarkData[hoveredIndex])}
            </div>
          </div>
        )}
      </div>

      {/* Legend */}
      <div style={{ 
        display: "flex", 
        justifyContent: "center", 
        gap: 24,
        padding: "10px 0",
      }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 3, background: "#0f9d58", borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: "var(--text)" }}>Your Portfolio</span>
          <span style={{ fontSize: 12, color: "var(--green)", fontWeight: 600 }}>
            {portfolioChange >= 0 ? "+" : ""}{portfolioChange.toFixed(2)}%
          </span>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ width: 12, height: 3, background: "#007aff", borderRadius: 2 }} />
          <span style={{ fontSize: 12, color: "var(--text)" }}>Market</span>
          <span style={{ fontSize: 12, color: "#007aff", fontWeight: 600 }}>
            {benchmarkChange >= 0 ? "+" : ""}{benchmarkChange.toFixed(2)}%
          </span>
        </div>
      </div>

      {/* Stats row */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(3, 1fr)", 
        gap: 10,
        marginTop: 16,
        padding: 12,
        background: "var(--bg-soft)",
        borderRadius: 12,
      }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Best Performer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>SOL +12.4%</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Worst Performer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#d64545" }}>DOT -3.2%</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Beat Market</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>65% of time</div>
        </div>
      </div>
    </div>
  );
}

