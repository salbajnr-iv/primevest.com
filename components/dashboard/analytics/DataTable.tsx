"use client";

import { useId, useState } from "react";
import type { CSSProperties, ReactNode } from "react";

import { dashboardTokens } from "./types";

export interface DataColumn<T> {
  key: keyof T;
  label: string;
  render?: (value: T[keyof T], row: T) => ReactNode;
}

export default function DataTable<T extends Record<string, unknown>>({
  title,
  columns,
  rows,
}: {
  title: string;
  columns: DataColumn<T>[];
  rows: T[];
}) {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const tooltipId = useId();

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr>
              {columns.map((column) => (
                <th key={String(column.key)} className="p-2 text-left text-xs font-medium" style={{ color: dashboardTokens.textMuted }}>
                  {column.label}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, idx) => (
              <tr key={idx} style={{ borderTop: `1px solid ${dashboardTokens.border}` }}>
                {columns.map((column) => {
                  const value = row[column.key];
                  const content = column.render ? column.render(value, row) : String(value);
                  const tooltipText = `${column.label}: ${String(value)}`;
                  const tooltipKey = `${idx}-${String(column.key)}`;

                  return (
                    <td key={String(column.key)} className="p-2">
                      <span
                        tabIndex={0}
                        title={tooltipText}
                        aria-label={tooltipText}
                        aria-describedby={activeTooltip === tooltipKey ? tooltipId : undefined}
                        onFocus={() => setActiveTooltip(tooltipKey)}
                        onBlur={() => setActiveTooltip(null)}
                        className="rounded px-1 py-0.5 outline-none focus:ring-2"
                        style={{ ['--tw-ring-color' as string]: dashboardTokens.brand } as CSSProperties}
                      >
                        {content}
                      </span>
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p id={tooltipId} className="sr-only" aria-live="polite">
        {activeTooltip ? "Metric details available in focused cell tooltip." : "Focus a metric cell to hear details."}
      </p>
    </section>
  );
}
