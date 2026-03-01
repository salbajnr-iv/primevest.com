"use client";

import * as React from "react";
import { useState, useEffect } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

export const dynamic = 'force-dynamic';

// Account types
interface Account {
  id: string;
  name: string;
  type: string;
  balance: number;
  currency: string;
}

// Mock account data
const mockAccounts: Account[] = [
  { id: 'mt4', name: 'MT4 Account', type: 'live', balance: 0, currency: 'USD' },
  { id: 'mt5', name: 'MT5 Account', type: 'live', balance: 0, currency: 'USD' },
  { id: 'investment', name: 'Investment Account', type: 'investment', balance: 0, currency: 'USD' },
  { id: 'tradew', name: 'Trade W Account', type: 'tradew', balance: 0, currency: 'USD' },
];

// Platform data
interface Platform {
  id: string;
  name: string;
  description: string;
  downloadLinks: {
    google?: string;
    direct?: string;
  };
}

const mockPlatforms: Platform[] = [
  {
    id: 'mt4',
    name: 'Meta Trader 4',
    description: 'Already have an account? Download MT4 Terminal Directly.',
    downloadLinks: {
      google: '#',
      direct: '#'
    }
  },
  {
    id: 'mt5',
    name: 'Meta Trader 5',
    description: 'Already have an account? Download MT5 Terminal Directly.',
    downloadLinks: {
      google: '#',
      direct: '#'
    }
  }
];

function AssetCenterContent() {
  const [isClient, setIsClient] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>(mockAccounts);
  const [platforms, setPlatforms] = useState<Platform[]>(mockPlatforms);
  const [activeAccountType, setActiveAccountType] = useState<'live' | 'investment'>('live');
  const [totalAssets, setTotalAssets] = useState(0);

  useEffect(() => {
    setIsClient(true);
    // Calculate total assets
    const total = accounts.reduce((sum, account) => sum + account.balance, 0);
    setTotalAssets(total);
  }, [accounts]);

  if (!isClient) {
    return (
      <div className="tradewill-loading">
        <div className="tradewill-spinner"></div>
        <span>Loading...</span>
      </div>
    );
  }

  const filteredAccounts = accounts.filter(account => 
    activeAccountType === 'live' ? 
      account.type === 'live' || account.type === 'tradew' : 
      account.type === 'investment'
  );

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
              <Link href="/dashboard/overview" className="tradewill-nav-item">Overview</Link>
              <Link href="/dashboard/asset-center" className="tradewill-nav-item active">Assets</Link>
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
                <span>Asset Center</span>
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
            {/* Asset Overview */}
            <section className="tradewill-asset-overview">
              <div className="tradewill-section-header">
                <div>
                  <h1 className="tradewill-page-title">Asset</h1>
                  <div className="tradewill-total-asset">≈ {totalAssets.toLocaleString()}</div>
                  <div className="tradewill-total-asset-label">Total Assets</div>
                </div>
              </div>

              {/* Account Type Tabs */}
              <div className="tradewill-account-types">
                <button 
                  className={`tradewill-account-type-tab ${activeAccountType === 'live' ? 'active' : ''}`}
                  onClick={() => setActiveAccountType('live')}
                >
                  Live Account
                </button>
                <button 
                  className={`tradewill-account-type-tab ${activeAccountType === 'investment' ? 'active' : ''}`}
                  onClick={() => setActiveAccountType('investment')}
                >
                  Investment Account
                </button>
              </div>

              {/* Account Cards */}
              <div className="tradewill-accounts-grid">
                {filteredAccounts.length > 0 ? (
                  filteredAccounts.map((account) => (
                    <div key={account.id} className="tradewill-account-card">
                      <div className="tradewill-account-header">
                        <div>
                          <div className="tradewill-account-name">{account.name}</div>
                          <div className="tradewill-account-type">{account.type}</div>
                        </div>
                      </div>
                      <div className="tradewill-account-balance">
                        {account.currency} {account.balance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="tradewill-account-currency">{account.currency}</div>
                      <div className="tradewill-account-actions">
                        <button className="tradewill-btn tradewill-btn-primary">Deposit</button>
                        <button className="tradewill-btn">Withdraw</button>
                        <button className="tradewill-btn">Transfer</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="tradewill-empty-state">
                    <div className="tradewill-empty-icon">📊</div>
                    <div className="tradewill-empty-text">No records</div>
                    <div className="tradewill-empty-subtext">No accounts found for this type</div>
                  </div>
                )}
              </div>
            </section>

            {/* Trading Platforms */}
            <section className="tradewill-platforms">
              <div className="tradewill-section-header">
                <h2 className="tradewill-section-title">Trading Platforms</h2>
              </div>

              <div className="tradewill-platforms-grid">
                {platforms.map((platform) => (
                  <div key={platform.id} className="tradewill-platform-card">
                    <div className="tradewill-platform-header">
                      <div className="tradewill-platform-name">{platform.name}</div>
                      <div className="tradewill-platform-status">Available</div>
                    </div>
                    <div className="tradewill-platform-description">
                      {platform.description}
                    </div>
                    <div className="tradewill-platform-actions">
                      {platform.downloadLinks.google && (
                        <a href={platform.downloadLinks.google} className="tradewill-download-btn">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M3,20.5V3.5C3,2.91 3.34,2.39 3.84,2.15L13.69,12L3.84,21.85C3.34,21.6 3,21.09 3,20.5M16.81,15.12L6.05,21.34L14.54,12.85L16.81,15.12M20.16,10.81C20.5,11.08 20.75,11.5 20.75,12C20.75,12.5 20.53,12.9 20.18,13.18L17.89,14.5L15.39,12L17.89,9.5L20.16,10.81M6.05,2.66L16.81,8.88L14.54,11.15L6.05,2.66Z"/>
                          </svg>
                          Google Play
                        </a>
                      )}
                      {platform.downloadLinks.direct && (
                        <a href={platform.downloadLinks.direct} className="tradewill-download-btn">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>
                          </svg>
                          Direct Download
                        </a>
                      )}
                    </div>
                  </div>
                ))}
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

export default function AssetCenterPage() {
  return (
    <React.Suspense fallback={
      <div className="tradewill-loading">
        <div className="tradewill-spinner"></div>
        <span>Loading Asset Center...</span>
      </div>
    }>
      <AssetCenterContent />
    </React.Suspense>
  );
}
