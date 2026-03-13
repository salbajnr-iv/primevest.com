"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { DASHBOARD_HOME_ROUTE, DASHBOARD_SIDEBAR_SECTIONS } from "@/app/dashboard/_config/routes";
import { EmptyState, ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";
import { useAuth } from "@/contexts/AuthContext";

export const dynamic = "force-dynamic";

interface Account {
  id: string;
  name: string;
  type: "live" | "investment" | "tradew";
  balance: number;
  currency: string;
}

interface Platform {
  id: string;
  name: string;
  description: string;
  downloadLinks: {
    google?: string;
    direct?: string;
  };
}

function AssetCenterContent() {
  const { session } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [platforms, setPlatforms] = useState<Platform[]>([]);
  const [activeAccountType, setActiveAccountType] = useState<"live" | "investment">("live");
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadAssetCenterData = React.useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/dashboard/asset-center", {
        headers: session?.access_token ? { Authorization: `Bearer ${session.access_token}` } : {},
      });
      const payload = await response.json();

      if (!response.ok || !payload.ok) {
        throw new Error(payload.error || "Failed to load asset center data");
      }

      setAccounts(Array.isArray(payload.accounts) ? payload.accounts : []);
      setPlatforms(Array.isArray(payload.platforms) ? payload.platforms : []);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to load asset center data");
      setAccounts([]);
      setPlatforms([]);
    } finally {
      setIsLoading(false);
    }
  }, [session?.access_token]);

  React.useEffect(() => {
    void loadAssetCenterData();
  }, [loadAssetCenterData]);

  const totalAssets = useMemo(() => accounts.reduce((sum, account) => sum + account.balance, 0), [accounts]);

  const filteredAccounts = accounts.filter((account) =>
    activeAccountType === "live" ? account.type === "live" || account.type === "tradew" : account.type === "investment",
  );

  return (
    <div className="tradewill-dashboard">
      <div className="tradewill-layout">
        <aside className="tradewill-sidebar">
          <div className="tradewill-sidebar-header">
            <Link href="/dashboard" className="tradewill-logo">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
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
                    className={`tradewill-nav-item ${item.path === "/dashboard/asset-center" ? "active" : ""}`.trim()}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="tradewill-main">
          <header className="tradewill-header">
            <div className="tradewill-header-left">
              <div className="tradewill-breadcrumb">
                <Link href={DASHBOARD_HOME_ROUTE.path} className="tradewill-nav-item">
                  {DASHBOARD_HOME_ROUTE.label}
                </Link>
                <span className="tradewill-breadcrumb-separator">/</span>
                <span>Asset Center</span>
              </div>
            </div>
          </header>

          <div className="tradewill-content">
            <section className="tradewill-asset-overview">
              <div className="tradewill-section-header">
                <div>
                  <h1 className="tradewill-page-title">Asset</h1>
                  <div className="tradewill-total-asset">≈ {totalAssets.toLocaleString()}</div>
                  <div className="tradewill-total-asset-label">Total Assets</div>
                </div>
              </div>

              <div className="tradewill-account-types">
                <button className={`tradewill-account-type-tab ${activeAccountType === "live" ? "active" : ""}`} onClick={() => setActiveAccountType("live")}>
                  Live Account
                </button>
                <button
                  className={`tradewill-account-type-tab ${activeAccountType === "investment" ? "active" : ""}`}
                  onClick={() => setActiveAccountType("investment")}
                >
                  Investment Account
                </button>
              </div>

              {isLoading ? (
                <LoadingSpinner text="Loading asset center..." className="py-10" />
              ) : error ? (
                <ErrorState title="Unable to load accounts" message={error} onRetry={() => void loadAssetCenterData()} />
              ) : filteredAccounts.length > 0 ? (
                <div className="tradewill-accounts-grid">
                  {filteredAccounts.map((account) => (
                    <div key={account.id} className="tradewill-account-card">
                      <div className="tradewill-account-header">
                        <div>
                          <div className="tradewill-account-name">{account.name}</div>
                          <div className="tradewill-account-type">{account.type}</div>
                        </div>
                      </div>
                      <div className="tradewill-account-balance">
                        {account.currency} {account.balance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <div className="tradewill-account-currency">{account.currency}</div>
                      <div className="tradewill-account-actions">
                        <button className="tradewill-btn tradewill-btn-primary">Deposit</button>
                        <button className="tradewill-btn">Withdraw</button>
                        <button className="tradewill-btn">Transfer</button>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <EmptyState title="No records" message="No accounts found for this type" />
              )}
            </section>

            <section className="tradewill-platforms">
              <div className="tradewill-section-header">
                <h2 className="tradewill-section-title">Trading Platforms</h2>
              </div>

              {isLoading ? (
                <LoadingSpinner text="Loading platform metadata..." className="py-8" />
              ) : platforms.length === 0 ? (
                <EmptyState title="No platforms available" message="Platform metadata is currently unavailable." />
              ) : (
                <div className="tradewill-platforms-grid">
                  {platforms.map((platform) => (
                    <div key={platform.id} className="tradewill-platform-card">
                      <div className="tradewill-platform-header">
                        <div className="tradewill-platform-name">{platform.name}</div>
                        <div className="tradewill-platform-status">Available</div>
                      </div>
                      <div className="tradewill-platform-description">{platform.description}</div>
                      <div className="tradewill-platform-actions">
                        {platform.downloadLinks.google && (
                          <a href={platform.downloadLinks.google} className="tradewill-download-btn">
                            Google Play
                          </a>
                        )}
                        {platform.downloadLinks.direct && (
                          <a href={platform.downloadLinks.direct} className="tradewill-download-btn">
                            Direct Download
                          </a>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </section>
          </div>

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
    <React.Suspense fallback={<LoadingSpinner text="Loading Asset Center..." className="py-12" />}>
      <AssetCenterContent />
    </React.Suspense>
  );
}
