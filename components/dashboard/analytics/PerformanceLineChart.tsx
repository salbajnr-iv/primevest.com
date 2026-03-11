"use client";

import { useState } from "react";
import { CartesianGrid, DotProps, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardTokens } from "./types";

interface Point { label: string; value: number; }

function FocusDot(props: DotProps & { onActivate: (point: Point | null) => void; label?: string; value?: number }) {
  const { cx, cy, onActivate, label, value } = props;
  if (typeof cx !== "number" || typeof cy !== "number") return null;

  return (
    <circle
      cx={cx}
      cy={cy}
      r={4}
      fill="#16a34a"
      stroke="#fff"
      strokeWidth={2}
      tabIndex={0}
      onFocus={() => onActivate(label ? { label, value: Number(value ?? 0) } : null)}
      onBlur={() => onActivate(null)}
      aria-label={`${label} performance ${value}`}
      role="img"
    >
      <title>{label ? `${label}: ${value}` : "Performance datapoint"}</title>
    </circle>
  );
}

export default function PerformanceLineChart({ title, data }: { title: string; data: Point[] }) {
  const [active, setActive] = useState<Point | null>(null);

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={dashboardTokens.border} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip formatter={(v) => [`${v}`, "Performance"]} />
            <Line
              type="monotone"
              dataKey="value"
              stroke={dashboardTokens.brand}
              strokeWidth={2}
              dot={<FocusDot onActivate={setActive} />}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
      {active ? <p className="mt-2 text-xs" style={{ color: dashboardTokens.textMuted }}>{active.label}: {active.value}</p> : null}
    </section>
  );
}
