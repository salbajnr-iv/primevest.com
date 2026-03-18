"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "@/components/ThemeToggle";
import { TRADEW_HEADER_NAV_ITEMS } from "@/app/dashboard/_config/routes";
import { ROUTES } from "@/lib/routes";

interface TradeWHeaderProps {
  activeTab?: string;
}

const TradeWHeader: React.FC<TradeWHeaderProps> = ({ activeTab = "overview" }) => {
  const { user } = useAuth();
  const [isMenuOpen, setIsMenuOpen] = React.useState(false);

  const getUserInitials = () => {
    if (!user?.email) return "U";
    const email = user.email;
    const parts = email.split("@")[0].split(".");
    if (parts.length >= 2) {
      return parts[0][0]?.toUpperCase() + parts[1][0]?.toUpperCase();
    }
    return email.slice(0, 2).toUpperCase();
  };

  return (
    <header className="tradew-header">
      <div className="tradew-header-content">
        {/* Logo */}
        <Link href={ROUTES.dashboard.home} className="tradew-logo">
          <svg
            width="32"
            height="32"
            viewBox="0 0 32 32"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
          >
            <rect width="32" height="32" rx="6" fill="#12c65b" />
            <path
              d="M8 12L16 20L24 12"
              stroke="white"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Trade W
        </Link>

        {/* Navigation */}
        <nav className="tradew-nav">
          {TRADEW_HEADER_NAV_ITEMS.map((item) => (
            <Link
              key={item.id}
              href={item.path}
              className={`tradew-nav-item ${activeTab === item.id ? "active" : ""}`}
            >
              {item.label}
            </Link>
          ))}
        </nav>

        {/* User Area */}
        <div className="tradew-user-area">
          {/* Theme Toggle */}
          <ThemeToggle />
          
          {/* Mobile Menu Button */}
          <button
            className="tradew-btn tradew-btn-outline hide-desktop"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Toggle navigation menu"
            title="Toggle navigation menu"
          >
            <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
              <path d="M3 5h14M3 10h14M3 15h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>

          {/* User Avatar */}
          <div className="tradew-user-avatar">
            {getUserInitials()}
          </div>
        </div>
      </div>

      {/* Mobile Navigation Menu */}
      {isMenuOpen && (
        <div className="mobile-nav-menu">
          <nav className="mobile-nav">
            {TRADEW_HEADER_NAV_ITEMS.map((item) => (
              <Link
                key={item.id}
                href={item.path}
                className={`tradew-nav-item ${activeTab === item.id ? "active" : ""}`}
                onClick={() => setIsMenuOpen(false)}
              >
                {item.label}
              </Link>
            ))}
          </nav>
        </div>
      )}

      <style jsx>{`
        .mobile-nav-menu {
          display: none;
          position: absolute;
          top: 64px;
          left: 0;
          right: 0;
          background: var(--tw-bg-primary);
          border-bottom: 1px solid var(--tw-border-primary);
          box-shadow: var(--tw-shadow-md);
          z-index: 999;
        }

        .mobile-nav {
          display: flex;
          flex-direction: column;
          padding: 16px 20px;
          gap: 8px;
        }

        @media (max-width: 768px) {
          .mobile-nav-menu {
            display: block;
          }
        }

        @media (min-width: 769px) {
          .hide-desktop {
            display: none;
          }
        }
      `}</style>
    </header>
  );
};

export default TradeWHeader;
