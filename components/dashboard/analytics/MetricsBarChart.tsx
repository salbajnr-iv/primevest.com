"use client";

import { useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { dashboardTokens } from "./types";

export interface BarDatum { label: string; value: number; }

export default function MetricsBarChart({ title, data }: { title: string; data: BarDatum[] }) {
  const [active, setActive] = useState<string | null>(null);

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={data}>
            <CartesianGrid strokeDasharray="3 3" stroke={dashboardTokens.border} />
            <XAxis dataKey="label" tick={{ fontSize: 12 }} />
            <YAxis tick={{ fontSize: 12 }} />
            <Tooltip cursor={{ fill: "rgba(14, 192, 43, 0.08)" }} formatter={(v) => [`${v}`, "Value"]} />
            <Bar dataKey="value" radius={[8, 8, 0, 0]}>
              {data.map((entry) => (
                <Cell
                  key={entry.label}
                  fill={active === entry.label ? "#16a34a" : "#22c55e"}
                  tabIndex={0}
                  role="button"
                  aria-label={`${entry.label} metric ${entry.value}`}
                  onFocus={() => setActive(entry.label)}
                  onMouseEnter={() => setActive(entry.label)}
                  onBlur={() => setActive(null)}
                  onMouseLeave={() => setActive(null)}
                />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
      </div>
    </section>
  );
}
