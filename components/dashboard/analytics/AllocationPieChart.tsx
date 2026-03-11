"use client";

import { useState } from "react";
import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from "recharts";
import { dashboardTokens } from "./types";

interface PieDatum { name: string; value: number; color: string; }

export default function AllocationPieChart({ title, data }: { title: string; data: PieDatum[] }) {
  const [active, setActive] = useState<PieDatum | null>(null);

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="h-64">
        <ResponsiveContainer width="100%" height="100%">
          <PieChart>
            <Pie data={data} dataKey="value" nameKey="name" innerRadius={56} outerRadius={92} paddingAngle={3}>
              {data.map((entry) => (
                <Cell
                  key={entry.name}
                  fill={entry.color}
                  stroke={active?.name === entry.name ? "#111" : "transparent"}
                  strokeWidth={2}
                  tabIndex={0}
                  role="button"
                  aria-label={`${entry.name} allocation ${entry.value} percent`}
                  onFocus={() => setActive(entry)}
                  onMouseEnter={() => setActive(entry)}
                  onBlur={() => setActive(null)}
                  onMouseLeave={() => setActive(null)}
                  title={`${entry.name}: ${entry.value}%`}
                />
              ))}
            </Pie>
            <Tooltip formatter={(v) => [`${v}%`, "Allocation"]} />
          </PieChart>
        </ResponsiveContainer>
      </div>
      {active ? (
        <p className="mt-2 text-xs" style={{ color: dashboardTokens.textMuted }}>
          {active.name}: {active.value}%
        </p>
      ) : null}
    </section>
  );
}
