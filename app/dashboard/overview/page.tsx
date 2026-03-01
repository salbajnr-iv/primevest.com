"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

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
            <div className="tradewill-nav-section">
              <div className="tradewill-nav-section-title">Account</div>
              <Link href="/dashboard/overview" className="tradewill-nav-item active">Overview</Link>
              <Link href="/dashboard/asset-center" className="tradewill-nav-item">Assets</Link>
              <Link href="/dashboard/transfer" className="tradewill-nav-item">Internal Transfer</Link>
              <Link href="/dashboard/orders" className="tradewill-nav-item">Order</Link>
              <Link href="/dashboard/verification" className="tradewill-nav-item">Verification</Link>
              <Link href="/dashboard/settings" className="tradewill-nav-item">Settings</Link>
            </div>
            
            <div className="tradewill-nav-section">
              <div className="tradewill-nav-section-title">Platform</div>
              <Link href="/dashboard/platform" className="tradewill-nav-item">Platform</Link>
              <Link href="/dashboard/tasks" className="tradewill-nav-item">Task Center</Link>
              <Link href="/dashboard/support" className="tradewill-nav-item">Customer Service</Link>
            </div>
          </nav>
        </aside>

        {/* Main Content */}
        <main className="tradewill-main">
          {/* Header */}
          <header className="tradewill-header">
            <div className="tradewill-header-left">
              <div className="tradewill-breadcrumb">
                <Link href="/dashboard" className="tradewill-nav-item">Dashboard</Link>
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
