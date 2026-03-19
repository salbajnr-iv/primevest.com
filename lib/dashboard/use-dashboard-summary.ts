"use client";

import * as React from "react";
import type { PortfolioSummary } from "@/lib/dashboard/types";

const EMPTY_SUMMARY: PortfolioSummary = {
  userName: "User",
  portfolioValue: 0,
  portfolioChangePct: 0,
  availableBalance: 0,
  availableBalanceChangePct: 0,
  notificationCount: 0,
};

interface DashboardSummaryResponse {
  ok?: boolean;
  summary?: Partial<PortfolioSummary>;
}

export function useDashboardSummary() {
  const [summary, setSummary] = React.useState<PortfolioSummary>(EMPTY_SUMMARY);
  const [isLoading, setIsLoading] = React.useState(true);

  React.useEffect(() => {
    let isMounted = true;

    const loadSummary = async () => {
      try {
        const response = await fetch("/api/dashboard/summary", {
          credentials: "include",
          cache: "no-store",
        });

        const payload = (await response.json().catch(() => null)) as DashboardSummaryResponse | null;
        if (!response.ok || !payload?.ok || !payload.summary || !isMounted) {
          return;
        }

        setSummary({
          userName: payload.summary.userName ?? EMPTY_SUMMARY.userName,
          portfolioValue: Number(payload.summary.portfolioValue ?? 0),
          portfolioChangePct: Number(payload.summary.portfolioChangePct ?? 0),
          availableBalance: Number(payload.summary.availableBalance ?? 0),
          availableBalanceChangePct: Number(payload.summary.availableBalanceChangePct ?? 0),
          notificationCount: Number(payload.summary.notificationCount ?? 0),
        });
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    void loadSummary();

    return () => {
      isMounted = false;
    };
  }, []);

  return { summary, isLoading };
}
