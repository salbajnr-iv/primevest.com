import * as React from "react";
import { cn } from "@/lib/utils";

type IconBadgeSize = "md" | "lg";

export function IconBadge({
  icon,
  className,
  size = "md",
}: {
  icon: React.ReactNode;
  className?: string;
  size?: IconBadgeSize;
}) {
  return (
    <div
      className={cn(
        "inline-flex items-center justify-center rounded-lg",
        size === "lg" ? "h-12 w-12" : "h-10 w-10",
        className,
      )}
    >
      {icon}
    </div>
  );
}
