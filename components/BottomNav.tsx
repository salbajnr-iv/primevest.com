"use client";

import * as React from "react";
import Link from "next/link";

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isMenu?: boolean;
}

function NavItem({ href, icon, label, active, onClick, isMenu }: NavItemProps) {
  const content = (
    <>
      <div className={`nav-icon ${isMenu ? "nav-icon-menu" : ""}`}>{icon}</div>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`nav-item ${active ? "active" : ""}`}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`nav-item nav-button ${active ? "active" : ""}`} onClick={onClick}>
      {content}
    </button>
  );
}

interface BottomNavProps {
  onMenuClick?: () => void;
  isMenuActive?: boolean;
}

export default function BottomNav({ onMenuClick, isMenuActive }: BottomNavProps) {
  const [activePath, setActivePath] = React.useState("/dashboard");

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []);

  return (
    <nav className="nav hide-on-desktop">
      <div className="nav-inner">
        <NavItem
          href="/dashboard"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
          label="Home"
          active={activePath === "/dashboard"}
        />
        <NavItem
          href="/dashboard"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          label="Portfolio"
          active={activePath === "/dashboard"}
        />
        <NavItem
          href="/dashboard/trade"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          label="Trade"
          active={activePath.includes("/trade")}
        />
        <NavItem
          href="/markets"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          }
          label="Markets"
          active={activePath === "/markets"}
        />
        <NavItem
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          }
          label="Menu"
          active={isMenuActive}
          onClick={onMenuClick}
          isMenu
        />
      </div>
    </nav>
  );
}

