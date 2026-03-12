"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MetricsBarChartInput } from "@/lib/dashboard/types";
import { dashboardTokens } from "./types";

export default function MetricsBarChart({ title, data, emptyStateLabel = "No metrics available yet." }: MetricsBarChartInput) {
  const [active, setActive] = useState<{ label: string; value: number } | null>(null);

  const normalizedData = useMemo(
    () => (data ?? []).filter((point) => typeof point?.label === "string").map((point) => ({
      label: point.label,
      value: Number.isFinite(point.value) ? point.value : 0,
    })),
    [data]
  );

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="h-64">
        {normalizedData.length === 0 ? (
          <div className="h-full w-full flex items-center justify-center text-sm" style={{ color: dashboardTokens.textMuted }}>
            {emptyStateLabel}
          </div>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={normalizedData}>
              <CartesianGrid strokeDasharray="3 3" stroke={dashboardTokens.border} />
              <XAxis dataKey="label" tick={{ fontSize: 12 }} />
              <YAxis tick={{ fontSize: 12 }} />
              <Tooltip cursor={{ fill: "rgba(14, 192, 43, 0.08)" }} formatter={(v) => [`${v}`, "Value"]} />
              <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                {normalizedData.map((entry) => (
                  <Cell
                    key={entry.label}
                    fill={active?.label === entry.label ? "#16a34a" : "#22c55e"}
                    tabIndex={0}
                    role="button"
                    aria-label={`${entry.label} metric ${entry.value}`}
                    onFocus={() => setActive(entry)}
                    onMouseEnter={() => setActive(entry)}
                  />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        )}
      </div>
      {active ? (
        <p className="mt-2 text-xs" style={{ color: dashboardTokens.textMuted }}>
          {active.label}: {active.value}
        </p>
      ) : null}
    </section>
  );
}
