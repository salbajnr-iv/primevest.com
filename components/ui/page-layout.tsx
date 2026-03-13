import * as React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

export function PageShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="dashboard-container">
      <div className="dashboard-app pb-24">{children}</div>
    </div>
  );
}

export function StickyPageHeader({
  eyebrow,
  title,
  badge,
  action,
  backHref = "/dashboard",
}: {
  eyebrow: string;
  title: string;
  badge?: React.ReactNode;
  action?: React.ReactNode;
  backHref?: string;
}) {
  return (
    <header className="sticky top-0 z-10 border-b bg-white/95 px-4 py-3 backdrop-blur md:px-6">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <Link href={backHref} className="inline-flex h-9 w-9 items-center justify-center rounded-md border text-gray-600">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <div>
            <p className="text-xs uppercase tracking-wide text-gray-500">{eyebrow}</p>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-semibold text-gray-900">{title}</h1>
              {badge}
            </div>
          </div>
        </div>
        {action}
      </div>
    </header>
  );
}

export function PageMain({ children }: { children: React.ReactNode }) {
  return <main className="mx-auto flex w-full max-w-5xl flex-col gap-4 px-4 py-4 md:px-6">{children}</main>;
}

export function SurfaceCard({ children, className }: { children: React.ReactNode; className?: string }) {
  return <section className={cn("rounded-xl border bg-white", className)}>{children}</section>;
}
