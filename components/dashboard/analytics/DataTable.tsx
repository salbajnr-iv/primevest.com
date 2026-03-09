"use client";

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

                  return (
                    <td key={String(column.key)} className="p-2">
                      <span
                        tabIndex={0}
                        title={`${column.label}: ${String(value)}`}
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
    </section>
  );
}
