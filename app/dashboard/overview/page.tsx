"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { DASHBOARD_HOME_ROUTE, DASHBOARD_SIDEBAR_SECTIONS } from "@/app/dashboard/_config/routes";

export const dynamic = 'force-dynamic';

function OverviewContent() {
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="tradewill-loading">
        <div className="tradewill-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  return (
    <div className="tradewill-dashboard">
      <div className="tradewill-layout">
        {/* Sidebar Navigation */}
        <aside className="tradewill-sidebar">
          <div className="tradewill-sidebar-header">
            <Link href="/dashboard" className="tradewill-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z"/>
              </svg>
              PrimeVest
            </Link>
          </div>
          
          <nav className="tradewill-nav">
            {DASHBOARD_SIDEBAR_SECTIONS.map((section) => (
              <div key={section.title} className="tradewill-nav-section">
                <div className="tradewill-nav-section-title">{section.title}</div>
                {section.items.map((item) => (
                  <Link
                    key={item.id}
                    href={item.path}
                    className={`tradewill-nav-item ${item.path === "/dashboard/overview" ? "active" : ""}`.trim()}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="tradewill-main">
          {/* Header */}
          <header className="tradewill-header">
            <div className="tradewill-header-left">
              <div className="tradewill-breadcrumb">
                <Link href={DASHBOARD_HOME_ROUTE.path} className="tradewill-nav-item">{DASHBOARD_HOME_ROUTE.label}</Link>
                <span className="tradewill-breadcrumb-separator">/</span>
                <span>Overview</span>
              </div>
            </div>
            
            <div className="tradewill-header-right">
              <div className="tradewill-user-info">
                <div className="tradewill-user-avatar">U</div>
                <div>
                  <div className="tradewill-user-name">User</div>
                  <div className="tradewill-verification-status">Verification: Not Verified</div>
                </div>
              </div>
            </div>
          </header>

          {/* Page Content */}
          <div className="tradewill-content">
            {/* Welcome Section */}
            <section className="tradewill-asset-overview">
              <div className="tradewill-section-header">
                <div>
                  <h1 className="tradewill-page-title">Dashboard Overview</h1>
                  <div className="tradewill-total-asset">Welcome to PrimeVest</div>
                  <div className="tradewill-total-asset-label">Manage your trading portfolio</div>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="tradewill-accounts-grid">
                <div className="tradewill-account-card">
                  <div className="tradewill-account-header">
                    <div>
                      <div className="tradewill-account-name">Quick Trade</div>
                      <div className="tradewill-account-type">Trading</div>
                    </div>
                  </div>
                  <div className="tradewill-account-actions">
                    <Link href="/dashboard/trade" className="tradewill-btn tradewill-btn-primary">Start Trading</Link>
                  </div>
                </div>

                <div className="tradewill-account-card">
                  <div className="tradewill-account-header">
                    <div>
                      <div className="tradewill-account-name">Asset Center</div>
                      <div className="tradewill-account-type">Portfolio</div>
                    </div>
                  </div>
                  <div className="tradewill-account-actions">
                    <Link href="/dashboard/asset-center" className="tradewill-btn tradewill-btn-primary">View Assets</Link>
                  </div>
                </div>

                <div className="tradewill-account-card">
                  <div className="tradewill-account-header">
                    <div>
                      <div className="tradewill-account-name">Market Overview</div>
                      <div className="tradewill-account-type">Markets</div>
                    </div>
                  </div>
                  <div className="tradewill-account-actions">
                    <Link href="/crypto" className="tradewill-btn tradewill-btn-primary">View Markets</Link>
                  </div>
                </div>

                <div className="tradewill-account-card">
                  <div className="tradewill-account-header">
                    <div>
                      <div className="tradewill-account-name">Wallet</div>
                      <div className="tradewill-account-type">Finance</div>
                    </div>
                  </div>
                  <div className="tradewill-account-actions">
                    <Link href="/wallets" className="tradewill-btn tradewill-btn-primary">Manage Wallet</Link>
                  </div>
                </div>
              </div>
            </section>

            {/* Recent Activity */}
            <section className="tradewill-platforms">
              <div className="tradewill-section-header">
                <h2 className="tradewill-section-title">Recent Activity</h2>
              </div>

              <div className="tradewill-platform-card">
                <div className="tradewill-empty-state">
                  <div className="tradewill-empty-icon">📈</div>
                  <div className="tradewill-empty-text">No recent activity</div>
                  <div className="tradewill-empty-subtext">Start trading to see your activity here</div>
                </div>
              </div>
            </section>
          </div>

          {/* Footer */}
          <footer className="tradewill-footer">
            <p>© 2016 - 2026 PrimeVest Financial Solutions. All Rights Reserved</p>
          </footer>
        </main>
      </div>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}

export default function OverviewPage() {
  return (
    <React.Suspense fallback={
      <div className="tradewill-loading">
        <div className="tradewill-spinner"></div>
        <span>Loading Overview...</span>
      </div>
    }>
      <OverviewContent />
    </React.Suspense>
  );
}
