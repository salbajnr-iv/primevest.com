"use client";

import { buildCSV, downloadCSV } from "@/lib/dashboard/export/csv";
import { downloadSimplePDF } from "@/lib/dashboard/export/pdf";
import { dashboardTokens } from "./types";

interface ExportMenuProps<T extends Record<string, unknown>> {
  title: string;
  rows: T[];
}

export default function ExportMenu<T extends Record<string, unknown>>({ title, rows }: ExportMenuProps<T>) {
  const onCSV = () => {
    const csv = buildCSV(rows);
    downloadCSV(`${title.toLowerCase().replaceAll(" ", "-")}.csv`, csv);
  };

  const onPDF = () => {
    downloadSimplePDF(title, rows);
  };

  return (
    <div className="flex gap-2">
      <button
        type="button"
        onClick={onCSV}
        className="rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2"
        style={{ border: `1px solid ${dashboardTokens.border}`, ['--tw-ring-color' as string]: dashboardTokens.brand }}
      >
        Export CSV
      </button>
      <button
        type="button"
        onClick={onPDF}
        className="rounded-lg px-3 py-2 text-xs font-medium outline-none focus:ring-2"
        style={{ border: `1px solid ${dashboardTokens.border}`, ['--tw-ring-color' as string]: dashboardTokens.brand }}
      >
        Export PDF
      </button>
    </div>
  );
}
