
"use client";

import React from "react";
import { AreaChart, Area, ResponsiveContainer } from "recharts";
import type { HistoricalPoint } from "@/lib/dashboard/market-data";

interface SparklineProps {
  data: HistoricalPoint[];
  color?: string;
  isPositive?: boolean;
}

export default function Sparkline({ data, color, isPositive = true }: SparklineProps) {
  const chartColor = color || (isPositive ? "#10b981" : "#ef4444");
  
  return (
    <div className="h-10 w-24 sm:w-32">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart data={data}>
          <defs>
            <linearGradient id={`gradient-${chartColor}`} x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor={chartColor} stopOpacity={0.3} />
              <stop offset="95%" stopColor={chartColor} stopOpacity={0} />
            </linearGradient>
          </defs>
          <Area
            type="monotone"
            dataKey="price"
            stroke={chartColor}
            strokeWidth={1.5}
            fill={`url(#gradient-${chartColor})`}
            isAnimationActive={false}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}
