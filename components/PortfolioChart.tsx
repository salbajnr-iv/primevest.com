"use client";

import * as React from "react";

interface PortfolioChartProps {
  activeRange?: string;
  onRangeChange?: (range: string) => void;
}

export default function PortfolioChart({
  activeRange = "1D",
  onRangeChange,
}: PortfolioChartProps) {
  const ranges = [
    { label: "1T", value: "1D" },
    { label: "7T", value: "7D" },
    { label: "30T", value: "30D" },
    { label: "1J", value: "1Y" },
  ];

  return (
    <section className="rounded-lg border p-4">
      <div className="mb-4 flex gap-2">
        {ranges.map((range) => (
          <button
            key={range.value}
            type="button"
            onClick={() => onRangeChange?.(range.value)}
            className={`rounded px-3 py-1 text-sm ${
              activeRange === range.value ? "bg-green-600 text-white" : "bg-muted"
            }`}
          >
            {range.label}
          </button>
        ))}
      </div>

      <div className="chart h-40 w-full">
        <svg viewBox="0 0 300 100" preserveAspectRatio="none" className="h-full w-full">
          <defs>
            <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
              <stop offset="0%" stopColor="rgba(15, 157, 88, 0.35)" />
              <stop offset="100%" stopColor="rgba(15, 157, 88, 0)" />
            </linearGradient>
          </defs>
          <path
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
            fill="url(#chartGradient)"
          />
          <path
            d="M0,70 L20,60 L40,65 L60,55 L80,58 L100,50 L120,48 L140,44 L160,40 L180,42 L200,38 L220,36 L240,30 L260,35 L280,28 L300,32"
            fill="none"
            stroke="#0f9d58"
            strokeWidth="2"
          />
        </svg>
      </div>
    </section>
  );
}
