import * as React from "react";
import { cn } from "@/lib/utils";

export function PageSectionHeader({
  eyebrow,
  title,
  description,
  action,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  action?: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between", className)}>
      <div className="space-y-1">
        {eyebrow ? <p className="text-xs uppercase tracking-wide text-gray-500">{eyebrow}</p> : null}
        <h2 className="text-2xl font-semibold text-gray-900 sm:text-3xl">{title}</h2>
        {description ? <p className="text-sm text-gray-600">{description}</p> : null}
      </div>
      {action ? <div className="shrink-0">{action}</div> : null}
    </div>
  );
}
