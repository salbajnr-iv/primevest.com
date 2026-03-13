"use client";

import { useMemo, useState } from "react";
import { Bar, BarChart, CartesianGrid, Cell, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";

import type { MetricsBarChartInput } from "@/lib/dashboard/types";
import { EmptyState, ErrorState, Skeleton } from "@/components/ui/LoadingStates";
import { dashboardTokens } from "./types";

export default function MetricsBarChart({
  title,
  data,
  emptyStateLabel = "No orders yet. Your filled orders will appear here.",
  state,
  errorMessage,
  onRetry,
}: MetricsBarChartInput) {
  const [active, setActive] = useState<{ label: string; value: number } | null>(null);

  const normalizedData = useMemo(
    () => (data ?? []).filter((point) => typeof point?.label === "string").map((point) => ({
      label: point.label,
      value: Number.isFinite(point.value) ? point.value : 0,
    })),
    [data]
  );

  const resolvedState = state ?? (normalizedData.length === 0 ? "empty" : "ready");

  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <div className="mb-3 text-sm font-semibold">{title}</div>
      <div className="h-64">
        {resolvedState === "loading" ? (
          <div className="space-y-3 pt-6">
            <Skeleton width="35%" height={14} />
            <div className="flex h-48 items-end gap-2">
              {Array.from({ length: 8 }).map((_, idx) => (
                <Skeleton key={idx} variant="rounded" className="flex-1" height={`${40 + ((idx % 4) + 1) * 18}px`} />
              ))}
            </div>
          </div>
        ) : resolvedState === "error" ? (
          <ErrorState title="Unable to load chart" message={errorMessage || "This chart is temporarily unavailable."} onRetry={onRetry} retryText="Try again" />
        ) : resolvedState === "empty" ? (
          <EmptyState title="No orders yet" message={emptyStateLabel} />
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
      {resolvedState === "ready" && active ? (
        <p className="mt-2 text-xs" style={{ color: dashboardTokens.textMuted }}>
          {active.label}: {active.value}
        </p>
      ) : null}
    </section>
  );
}
