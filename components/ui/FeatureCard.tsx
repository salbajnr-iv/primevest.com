import * as React from "react";
import { cn } from "@/lib/utils";

export function FeatureCard({
  title,
  description,
  icon,
  badge,
  children,
  secondaryAction,
  primaryAction,
  className,
}: {
  title: string;
  description?: string;
  icon?: React.ReactNode;
  badge?: React.ReactNode;
  children?: React.ReactNode;
  secondaryAction?: React.ReactNode;
  primaryAction?: React.ReactNode;
  className?: string;
}) {
  return (
    <article className={cn("rounded-xl border border-gray-200 bg-white p-4 shadow-sm sm:p-5", className)}>
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          {icon ? <div className="shrink-0">{icon}</div> : null}
          <div className="min-w-0 flex-1 space-y-1">
            <div className="flex flex-wrap items-center gap-2">
              <h3 className="text-base font-semibold text-gray-900 sm:text-lg">{title}</h3>
              {badge}
            </div>
            {description ? <p className="text-sm text-gray-600">{description}</p> : null}
          </div>
        </div>

        {children ? <div className="space-y-3">{children}</div> : null}

        {(secondaryAction || primaryAction) ? (
          <div className="flex flex-wrap items-center justify-between gap-2 sm:gap-3">
            <div>{secondaryAction}</div>
            <div>{primaryAction}</div>
          </div>
        ) : null}
      </div>
    </article>
  );
}
