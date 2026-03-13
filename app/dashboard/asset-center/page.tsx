"use client";

import * as React from "react";
import { useMemo, useState } from "react";
import Link from "next/link";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";
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
    <DashboardShell
      mainClassName="pb-20"
      pageHeader={
        <div className="tradewill-breadcrumb" style={{ padding: "12px 0" }}>
          <Link href="/dashboard" className="tradewill-nav-item">Dashboard</Link>
          <span className="tradewill-breadcrumb-separator">/</span>
          <span>Asset Center</span>
        </div>
      }
    >
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
    </DashboardShell>
  );
}

export default function AssetCenterPage() {
  return (
    <React.Suspense fallback={<LoadingSpinner text="Loading Asset Center..." className="py-12" />}>
      <AssetCenterContent />
    </React.Suspense>
  );
}
