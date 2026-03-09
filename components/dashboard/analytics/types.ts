export const dashboardTokens = {
  panel: "var(--surface)",
  border: "var(--border)",
  textMuted: "var(--muted)",
  brand: "var(--green)",
  danger: "var(--danger)",
  success: "var(--success)",
};

export type MetricDatum = {
  label: string;
  value: number;
  formattedValue?: string;
  hint?: string;
};
