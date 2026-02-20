"use client";

import React from "react";
import { Line, LineChart, ResponsiveContainer, XAxis, YAxis, Tooltip, Area, AreaChart } from "recharts";

interface DataPoint {
  time: string;
  value: number;
  timestamp?: number;
}

interface ChartData {
  data: DataPoint[];
  change: number;
  changePercent: number;
  high: number;
  low: number;
  volume?: number;
}

interface AdvancedChartProps {
  data: ChartData;
  type?: "line" | "area";
  height?: number;
  showGrid?: boolean;
  showTooltip?: boolean;
  color?: string;
  backgroundColor?: string;
}

interface CustomTooltipProps {
  active?: boolean;
  payload?: Array<{
    value: number;
    payload: {
      time: string;
      formattedTime: string;
    };
  }>;
}

// Move CustomTooltip outside render to avoid recreation on each render
const CustomTooltip: React.FC<CustomTooltipProps> = ({ active, payload }) => {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString("de-DE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  if (active && payload && payload.length) {
    return (
      <div className="chart-tooltip" style={{
        background: "var(--bg-primary)",
        border: "1px solid var(--border)",
        borderRadius: "8px",
        padding: "12px",
        fontSize: "12px",
        color: "var(--text)",
        boxShadow: "0 4px 6px rgba(0, 0, 0, 0.1)"
      }}>
        <div style={{ fontWeight: "600", marginBottom: "4px" }}>
          {formatValue(payload[0].value)}
        </div>
        <div style={{ color: "var(--muted)" }}>
          {formatTime(payload[0].payload.time)}
        </div>
      </div>
    );
  }
  return null;
};

export default function AdvancedChart({
  data,
  type = "line",
  height = 200,
  showGrid = true,
  showTooltip = true,
  color = "#3b82f6",
  backgroundColor = "rgba(59, 130, 246, 0.1)"
}: AdvancedChartProps) {
  const formatValue = (value: number) => {
    return new Intl.NumberFormat("de-DE", {
      style: "currency",
      currency: "EUR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  const formatTime = (time: string) => {
    const date = new Date(time);
    return date.toLocaleTimeString("de-DE", { 
      hour: "2-digit", 
      minute: "2-digit" 
    });
  };

  const chartData = data.data.map(point => ({
    ...point,
    formattedTime: formatTime(point.time)
  }));

  return (
    <div className="advanced-chart" style={{ width: "100%", height }}>
      <div className="chart-header" style={{ 
        display: "flex", 
        justifyContent: "space-between", 
        alignItems: "center", 
        marginBottom: "12px" 
      }}>
        <div className="chart-info">
          <div className="current-value" style={{ 
            fontSize: "18px", 
            fontWeight: "600", 
            color: "var(--text)" 
          }}>
            {formatValue(data.data[data.data.length - 1]?.value || 0)}
          </div>
          <div className="change-info" style={{ display: "flex", gap: "12px", fontSize: "12px" }}>
            <span className={`change ${data.change >= 0 ? "positive" : "negative"}`} style={{
              color: data.change >= 0 ? "var(--success)" : "var(--danger)"
            }}>
              {data.change >= 0 ? "+" : ""}{data.changePercent.toFixed(2)}%
            </span>
            <span className="range" style={{ color: "var(--muted)" }}>
              H: {formatValue(data.high)} L: {formatValue(data.low)}
            </span>
          </div>
        </div>
        {data.volume && (
          <div className="volume-info" style={{ textAlign: "right", fontSize: "12px" }}>
            <div style={{ color: "var(--muted)" }}>Volume</div>
            <div style={{ fontWeight: "600" }}>
              {(data.volume / 1000000).toFixed(1)}M €
            </div>
          </div>
        )}
      </div>

      <ResponsiveContainer width="100%" height={height - 40}>
        {type === "area" ? (
          <AreaChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey="formattedTime" 
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
              </>
            )}
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              fill={backgroundColor}
            />
          </AreaChart>
        ) : (
          <LineChart data={chartData} margin={{ top: 0, right: 0, left: 0, bottom: 0 }}>
            {showGrid && (
              <>
                <XAxis 
                  dataKey="formattedTime" 
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis 
                  stroke="var(--border)"
                  strokeWidth={0.5}
                  tick={{ fill: "var(--muted)", fontSize: 10 }}
                  domain={['dataMin - 100', 'dataMax + 100']}
                />
              </>
            )}
            {showTooltip && <Tooltip content={<CustomTooltip />} />}
            <Line
              type="monotone"
              dataKey="value"
              stroke={color}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 4, fill: color }}
            />
          </LineChart>
        )}
      </ResponsiveContainer>
    </div>
  );
}

// Helper function to generate mock chart data
export function generateMockChartData(basePrice: number, volatility: number = 0.02): ChartData {
  const now = new Date();
  const data: DataPoint[] = [];
  let currentPrice = basePrice;
  
  // Generate 24 hours of data points
  for (let i = 24; i >= 0; i--) {
    const time = new Date(now.getTime() - i * 60 * 60 * 1000);
    const change = (Math.random() - 0.5) * basePrice * volatility;
    currentPrice = Math.max(currentPrice + change, basePrice * 0.8);
    
    data.push({
      time: time.toISOString(),
      value: Number(currentPrice.toFixed(2)),
      timestamp: time.getTime()
    });
  }
  
  const values = data.map(d => d.value);
  const high = Math.max(...values);
  const low = Math.min(...values);
  const change = values[values.length - 1] - values[0];
  const changePercent = (change / values[0]) * 100;
  
  return {
    data,
    change,
    changePercent,
    high,
    low,
    volume: Math.random() * 50000000 + 10000000 // Random volume
  };
}
