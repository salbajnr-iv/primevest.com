"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";

interface ListRowProps {
  icon?: string;
  iconSrc?: string;
  name: string;
  label: string;
  amount: string;
  pill?: string;
  pillClass?: string;
  href?: string;
  negative?: boolean;
}

export default function ListRow({
  icon,
  iconSrc,
  name,
  label,
  amount,
  pill,
  pillClass = "",
  href,
  negative = false,
}: ListRowProps) {
  const content = (
    <div className="list-row">
      <div className="list-left">
        <div className="token-icon">
          {iconSrc ? (
            <Image src={iconSrc} alt={name} width={16} height={16} />
          ) : icon === "pie" ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M11 3a1 1 0 0 1 1-1 9 9 0 1 1-9 9 1 1 0 0 1 1-1h7V3zM13 4.062V11h6.938A7.002 7.002 0 0 0 13 4.062z" />
            </svg>
          ) : icon === "btc" ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M13.5 2h-3a5.5 5.5 0 0 0-5.5 5.5v9A5.5 5.5 0 0 0 10.5 22h3a5.5 5.5 0 0 0 5.5-5.5v-9A5.5 5.5 0 0 0 13.5 2zm.3 4.2c1.5.2 2.4 1.2 2.4 2.5 0 1-.5 1.8-1.5 2.1.9.4 1.4 1.1 1.4 2.2 0 1.8-1.3 2.9-3.5 2.9H10v-1.6h.9V8.3H10V6.7h2.1c.7 0 1.2 0 1.7.1zM12 9.2v2.2h.9c.8 0 1.3-.4 1.3-1.1 0-.7-.5-1.1-1.3-1.1H12zm0 3.7v2.5h1c.9 0 1.5-.5 1.5-1.2 0-.8-.6-1.3-1.6-1.3H12z" />
            </svg>
          ) : icon === "eth" ? (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <path d="M12 1.5L5 12l7 4 7-4-7-10.5zM6.5 13.5l4 2.5v-7l-4 2.5-4-2.5v7z" />
            </svg>
          ) : (
            <svg viewBox="0 0 24 24" fill="currentColor">
              <circle cx="12" cy="12" r="10" />
            </svg>
          )}
        </div>
        <div>
          <div className="token-name">{name}</div>
          <div className="token-label">{label}</div>
        </div>
      </div>
      <div className="list-right">
        <div className="amount">{amount}</div>
        {pill && (
          <div className={`pill ${negative ? "negative" : ""} ${pillClass}`}>
            {pill}
          </div>
        )}
      </div>
    </div>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}

