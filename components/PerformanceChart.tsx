"use client";

import * as React from "react";
import { ChartSeriesPoint, PerformanceStats } from "@/lib/dashboard/types";

interface PerformanceChartProps {
  periods?: { label: string; value: string }[];
  seriesByPeriod: Record<string, ChartSeriesPoint[]>;
  changeByPeriod: Record<string, { portfolio: number; benchmark: number }>;
  statsByPeriod: Record<string, PerformanceStats>;
  onPeriodChange?: (period: string) => void;
}

export default function PerformanceChart({
  periods = [
    { label: "1D", value: "1D" },
    { label: "7D", value: "7D" },
    { label: "30D", value: "30D" },
    { label: "1Y", value: "1Y" },
    { label: "ALL", value: "ALL" },
  ],
  seriesByPeriod,
  changeByPeriod,
  statsByPeriod,
  onPeriodChange,
}: PerformanceChartProps) {
  const [activePeriod, setActivePeriod] = React.useState("1D");
  const [hoveredIndex, setHoveredIndex] = React.useState<number | null>(null);

  const chartData = seriesByPeriod[activePeriod] ?? [];
  const portfolioData = chartData.map((point) => point.portfolioValue);
  const benchmarkData = chartData.map((point) => point.benchmarkValue);
  const changes = changeByPeriod[activePeriod] ?? { portfolio: 0, benchmark: 0 };
  const stats = statsByPeriod[activePeriod] ?? { bestPerformer: "-", worstPerformer: "-", beatMarketLabel: "-" };

  const maxValue = Math.max(...portfolioData, ...benchmarkData);
  const minValue = Math.min(...portfolioData, ...benchmarkData);
  const range = Math.max(maxValue - minValue, 1);

  const formatValue = (value: number) => {
    if (value >= 1000) return `€${(value / 1000).toFixed(1)}K`;
    return `€${value.toFixed(0)}`;
  };

  const handlePeriodChange = (period: string) => {
    setActivePeriod(period);
    setHoveredIndex(null);
    onPeriodChange?.(period);
  };

  if (chartData.length === 0) {
    return <div className="performance-chart" style={{ marginTop: 10 }}>No chart data available.</div>;
  }

  return (
    <div className="performance-chart" style={{ marginTop: 10 }}>
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "var(--muted)", fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            Your Performance vs Market
          </div>
          <div style={{ fontSize: 24, fontWeight: 800, color: "var(--text)", marginTop: 4 }}>
            {changes.portfolio >= 0 ? "+" : ""}{changes.portfolio.toFixed(2)}%
          </div>
        </div>

        <div style={{ display: "flex", gap: 6, padding: 4, background: "var(--bg-soft)", borderRadius: 10 }}>
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
              }}
            >
              {period.label}
            </button>
          ))}
        </div>
      </div>

      <div
        style={{ position: "relative", height: 180, marginBottom: 16 }}
        onMouseLeave={() => setHoveredIndex(null)}
        onMouseMove={(event) => {
          const rect = event.currentTarget.getBoundingClientRect();
          const ratio = (event.clientX - rect.left) / rect.width;
          const nextIndex = Math.min(chartData.length - 1, Math.max(0, Math.round(ratio * (chartData.length - 1))));
          setHoveredIndex(nextIndex);
        }}
      >
        <svg viewBox="0 0 300 150" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
          <path
            d={portfolioData.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (portfolioData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")}
            fill="none"
            stroke="#0f9d58"
            strokeWidth="2.5"
          />
          <path
            d={benchmarkData.map((v, i) => `${i === 0 ? "M" : "L"}${(i / (benchmarkData.length - 1)) * 300},${150 - ((v - minValue) / range) * 140}`).join(" ")}
            fill="none"
            stroke="#007aff"
            strokeWidth="2.5"
          />

          {hoveredIndex !== null && (
            <circle
              cx={(hoveredIndex / (portfolioData.length - 1)) * 300}
              cy={150 - ((portfolioData[hoveredIndex] - minValue) / range) * 140}
              r="5"
              fill="#0f9d58"
              stroke="#fff"
              strokeWidth="2"
            />
          )}
        </svg>

        {hoveredIndex !== null && (
          <div style={{ position: "absolute", top: 10, left: `${(hoveredIndex / (portfolioData.length - 1)) * 100}%`, transform: "translateX(-50%)", background: "var(--card)", padding: "8px 12px", borderRadius: 8, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 12, fontWeight: 600 }}>Portfolio: {formatValue(portfolioData[hoveredIndex])}</div>
            <div style={{ fontSize: 11, color: "#007aff" }}>Market: {formatValue(benchmarkData[hoveredIndex])}</div>
          </div>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 10, marginTop: 16, padding: 12, background: "var(--bg-soft)", borderRadius: 12 }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Best Performer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{stats.bestPerformer}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Worst Performer</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "#d64545" }}>{stats.worstPerformer}</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 10, color: "var(--muted)", marginBottom: 4 }}>Beat Market</div>
          <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{stats.beatMarketLabel}</div>
        </div>
      </div>

      <div style={{ marginTop: 8, textAlign: "center", color: "var(--muted)", fontSize: 12 }}>
        Market: {changes.benchmark >= 0 ? "+" : ""}{changes.benchmark.toFixed(2)}%
      </div>
    </div>
  );
}
