"use client";

import type { KpiGaugeInput } from "@/lib/dashboard/types";
import { dashboardTokens } from "./types";

export default function KpiGauge({ label, value, target = 100, valueLabel, deltaLabel }: KpiGaugeInput) {
  const safeTarget = Number.isFinite(target) && target > 0 ? target : 100;
  const safeValue = Number.isFinite(value) ? value : 0;
  const percent = Math.max(0, Math.min(100, (safeValue / safeTarget) * 100));

  return (
    <article
      className="rounded-2xl p-4"
      style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}
    >
      <div className="text-xs" style={{ color: dashboardTokens.textMuted }}>{label}</div>
      <div className="mt-1 text-2xl font-semibold">{valueLabel}</div>
      {deltaLabel ? <div className="text-xs mt-1" style={{ color: dashboardTokens.success }}>{deltaLabel}</div> : null}

      <div
        className="mt-4 h-2 w-full overflow-hidden rounded-full"
        style={{ background: "color-mix(in srgb, var(--muted) 20%, transparent)" }}
        aria-label={`${label} progress ${Math.round(percent)} percent`}
      >
        <div className="h-full rounded-full" style={{ width: `${percent}%`, background: dashboardTokens.brand }} />
      </div>
    </article>
  );
}
