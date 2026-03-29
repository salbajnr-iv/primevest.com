"use client";

import { Badge } from "@/components/ui/badge";
import { Clock, Check, AlertTriangle } from "lucide-react";
import type { MarketFreshnessState } from "@/lib/market/freshness";

interface FreshnessBadgeProps {
  freshness: MarketFreshnessState;
  className?: string;
  size?: "sm" | "default";
}

export function FreshnessBadge({ freshness, className, size = "default" }: FreshnessBadgeProps) {
  const sizeClass = size === "sm" ? "text-xs px-2 py-0.5 h-5" : "text-sm px-2.5 py-1 h-7";

  const getVariantAndIcon = (status: MarketFreshnessState) => {
    switch (status) {
      case "live":
        return { variant: "default" as const, icon: Check, label: "Live" };
      case "delayed":
        return { variant: "secondary" as const, icon: Clock, label: "Delayed" };
      case "stale":
        return { variant: "destructive" as const, icon: AlertTriangle, label: "Stale" };
      default:
        return { variant: "outline" as const, icon: Clock, label: "Unknown" };
    }
  };

  const { variant, icon: Icon, label } = getVariantAndIcon(freshness);

  return (
    <Badge variant={variant} className={`${sizeClass} ${className ?? ""}`}>
      <Icon className="w-3 h-3 mr-1" />
      {label}
    </Badge>
  );
}

