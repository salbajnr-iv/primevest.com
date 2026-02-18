"use client";

import * as React from "react";
import Link from "next/link";

interface QuickActionsCardProps {
  title: string;
  value: string;
  subtitle: string;
  tag?: string;
  accent?: boolean;
  href?: string;
}

export default function QuickActionsCard({
  title,
  value,
  subtitle,
  tag,
  accent = false,
  href,
}: QuickActionsCardProps) {
  const content = (
    <article className={`card ${accent ? "card--accent" : ""}`}>
      <div>
        <h4>{title}</h4>
        <span>{value}</span>
      </div>
      <div className="card-sub">{subtitle}</div>
      {tag && <div className="card-tag">{tag}</div>}
    </article>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

