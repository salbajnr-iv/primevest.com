"use client";

import { dashboardTokens } from "./types";

export interface FilterOption {
  label: string;
  value: string;
}

interface DashboardFiltersProps {
  title?: string;
  filters: FilterOption[];
  active: string;
  onChange: (value: string) => void;
}

export default function DashboardFilters({ title = "Filters", filters, active, onChange }: DashboardFiltersProps) {
  return (
    <section className="rounded-2xl p-4" style={{ border: `1px solid ${dashboardTokens.border}`, background: dashboardTokens.panel }}>
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      <div className="flex flex-wrap gap-2">
        {filters.map((filter) => {
          const selected = filter.value === active;
          return (
            <button
              key={filter.value}
              type="button"
              onClick={() => onChange(filter.value)}
              className="rounded-full px-3 py-1.5 text-xs outline-none focus:ring-2"
              style={{
                border: `1px solid ${selected ? dashboardTokens.brand : dashboardTokens.border}`,
                color: selected ? dashboardTokens.brand : "inherit",
                background: selected ? "rgba(34,197,94,0.08)" : "transparent",
                ['--tw-ring-color' as string]: dashboardTokens.brand,
              }}
            >
              {filter.label}
            </button>
          );
        })}
      </div>
    </section>
  );
}
