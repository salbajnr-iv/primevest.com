"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const FUNNEL_LINKS = [
  { href: "/support", label: "Hub" },
  { href: "/support/contact", label: "Create ticket" },
  { href: "/support/tickets", label: "Track tickets" },
  { href: "/support/status", label: "Platform status" },
  { href: "/support/community", label: "Community" },
];

export default function SupportLayout({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <>
      <header className="header">
        <div className="header-left">
          <Link href="/dashboard" className="header-back" aria-label="Back to dashboard">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </Link>
          <span className="header-eyebrow">SUPPORT</span>
          <div className="header-title">{title}</div>
        </div>
      </header>

      <section className="section">
        <div className="card space-y-2">
          <p className="text-sm text-slate-600">{description}</p>
          <div className="flex flex-wrap gap-2">
            {FUNNEL_LINKS.map((item) => (
              <Link
                key={item.href}
                href={item.href}
                className="menu-btn"
                style={{ opacity: pathname === item.href ? 1 : 0.65 }}
              >
                {item.label}
              </Link>
            ))}
          </div>
        </div>
      </section>

      {children}
    </>
  );
}
