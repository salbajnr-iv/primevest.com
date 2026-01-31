"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
<<<<<<< HEAD
import { useLanguage } from "@/contexts/LanguageContext";
=======
>>>>>>> 02bdcb7 (Initial commit)

interface SettingItemProps {
  label: string;
  description?: string;
  icon: React.ReactNode;
  href?: string;
  value?: string;
  onClick?: () => void;
  danger?: boolean;
  toggle?: boolean;
  toggleValue?: boolean;
  onToggle?: (value: boolean) => void;
}

function SettingItem({ label, description, icon, href, value, onClick, danger, toggle, toggleValue, onToggle }: SettingItemProps) {
  const content = (
    <>
      <div className="setting-item-left">
        <div className="setting-item-icon">{icon}</div>
        <div className="setting-item-text">
          <span className={danger ? "text-danger" : ""}>{label}</span>
          {description && <small>{description}</small>}
        </div>
      </div>
      <div className="setting-item-right">
        {value && <span className="setting-item-value">{value}</span>}
        {toggle && (
          <button 
            className={`toggle-switch ${toggleValue ? "active" : ""}`}
<<<<<<< HEAD
            aria-label={toggleValue ? "Turn off" : "Turn on"}
=======
>>>>>>> 02bdcb7 (Initial commit)
            onClick={(e) => {
              e.stopPropagation();
              onToggle?.(!toggleValue);
            }}
          >
            <span className="toggle-thumb" />
          </button>
        )}
        {!toggle && (href || onClick) && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </>
  );

  if (href) {
    return <Link href={href} className="setting-item">{content}</Link>;
  }

  if (onClick) {
    return <button className="setting-item setting-button" onClick={onClick}>{content}</button>;
  }

  return <div className="setting-item">{content}</div>;
}

export default function SettingsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [notifications, setNotifications] = React.useState(true);
  const [emailUpdates, setEmailUpdates] = React.useState(true);
  const [priceAlerts, setPriceAlerts] = React.useState(true);
  const [marketingEmails, setMarketingEmails] = React.useState(false);
<<<<<<< HEAD
  const { language: currentLanguage, getLanguageOption, isLoading: isLanguageLoading } = useLanguage();
=======
>>>>>>> 02bdcb7 (Initial commit)

  React.useEffect(() => {
    setIsClient(true);
  }, []);

<<<<<<< HEAD
  // Get current language display name
  const currentLanguageOption = getLanguageOption(currentLanguage);
  const currentLanguageDisplay = currentLanguageOption 
    ? `${currentLanguageOption.flag} ${currentLanguageOption.name}`
    : 'English';

  if (!isClient) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
=======
  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
>>>>>>> 02bdcb7 (Initial commit)
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">SETTINGS</span>
            <div className="header-title">Settings</div>
          </div>
<<<<<<< HEAD
          <div className="header-actions">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* PROGRESSIVE SETTINGS */}
        <div className="card" style={{ marginBottom: '1.5rem', padding: '1.25rem' }}>
          <div className="summary-row">
            <div className="summary-item">
              <span className="summary-label">Account Status</span>
              <span className="summary-value" style={{ color: '#0f9d58' }}>Active</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Verification</span>
              <span className="summary-value" style={{ color: '#ff9800' }}>Basic</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Security</span>
              <span className="summary-value" style={{ color: '#007aff' }}>Standard</span>
            </div>
          </div>
        </div>

        {/* ACCOUNT SECTION */}
        <section className="section">
          <h3 className="section-title">Account</h3>
          <div className="card">
=======
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* ACCOUNT */}
        <section className="settings-section">
          <h3 className="section-title">Account</h3>
          <div className="settings-card">
>>>>>>> 02bdcb7 (Initial commit)
            <SettingItem
              label="Personal Information"
              description="Update your personal details"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                  <circle cx="12" cy="7" r="4" />
                </svg>
              }
              href="/profile"
            />
            <SettingItem
<<<<<<< HEAD
              label="Security Settings"
=======
              label="Security"
>>>>>>> 02bdcb7 (Initial commit)
              description="Password, 2FA, and security settings"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              href="/settings/security"
            />
            <SettingItem
              label="Verification (KYC)"
              description="Identity verification status"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                  <polyline points="22 4 12 14.01 9 11.01" />
                </svg>
              }
              href="/profile"
            />
          </div>
        </section>

<<<<<<< HEAD
        {/* NOTIFICATIONS SECTION */}
        <section className="section">
          <h3 className="section-title">Notifications</h3>
          <div className="card">
=======
        {/* NOTIFICATIONS */}
        <section className="settings-section">
          <h3 className="section-title">Notifications</h3>
          <div className="settings-card">
>>>>>>> 02bdcb7 (Initial commit)
            <SettingItem
              label="Push Notifications"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                  <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                </svg>
              }
              toggle
              toggleValue={notifications}
              onToggle={setNotifications}
            />
            <SettingItem
              label="Email Updates"
              description="Receive activity summaries via email"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              toggle
              toggleValue={emailUpdates}
              onToggle={setEmailUpdates}
            />
            <SettingItem
              label="Price Alerts"
              description="Get notified about price changes"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                  <polyline points="17 6 23 6 23 12" />
                </svg>
              }
              toggle
              toggleValue={priceAlerts}
              onToggle={setPriceAlerts}
            />
            <SettingItem
              label="Marketing Emails"
              description="Receive offers and promotions"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                  <polyline points="22,6 12,13 2,6" />
                </svg>
              }
              toggle
              toggleValue={marketingEmails}
              onToggle={setMarketingEmails}
            />
          </div>
        </section>

<<<<<<< HEAD
        {/* PREFERENCES SECTION */}
        <section className="section">
          <h3 className="section-title">Preferences</h3>
          <div className="card">
=======
        {/* PREFERENCES */}
        <section className="settings-section">
          <h3 className="section-title">Preferences</h3>
          <div className="settings-card">
>>>>>>> 02bdcb7 (Initial commit)
            <SettingItem
              label="Currency"
              value="EUR"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              }
              href="/settings/currency"
            />
            <SettingItem
              label="Language"
<<<<<<< HEAD
              value={isLanguageLoading ? 'Loading...' : currentLanguageDisplay}
=======
              value="English"
>>>>>>> 02bdcb7 (Initial commit)
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="2" y1="12" x2="22" y2="12" />
                  <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
                </svg>
              }
              href="/settings/language"
            />
            <SettingItem
              label="Theme"
              value="System"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="5" />
                  <line x1="12" y1="1" x2="12" y2="3" />
                  <line x1="12" y1="21" x2="12" y2="23" />
                  <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                  <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                  <line x1="1" y1="12" x2="3" y2="12" />
                  <line x1="21" y1="12" x2="23" y2="12" />
                  <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                  <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
                </svg>
              }
              href="/settings/theme"
            />
          </div>
        </section>

<<<<<<< HEAD
        {/* PRIVACY & LEGAL SECTION */}
        <section className="section">
          <h3 className="section-title">Privacy & Legal</h3>
          <div className="card">
=======
        {/* PRIVACY & LEGAL */}
        <section className="settings-section">
          <h3 className="section-title">Privacy & Legal</h3>
          <div className="settings-card">
>>>>>>> 02bdcb7 (Initial commit)
            <SettingItem
              label="Privacy Policy"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                </svg>
              }
              href="/privacy"
            />
            <SettingItem
              label="Terms of Service"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                </svg>
              }
              href="/terms"
            />
            <SettingItem
<<<<<<< HEAD
              label="Cookie Policy"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <path d="M8 12h.01" />
                  <path d="M12 12h.01" />
                  <path d="M16 12h.01" />
                  <path d="M10 16h.01" />
                  <path d="M14 8h.01" />
                </svg>
              }
              href="/cookies"
            />
            <SettingItem
=======
>>>>>>> 02bdcb7 (Initial commit)
              label="Delete Account"
              description="Permanently delete your account and data"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <polyline points="3 6 5 6 21 6" />
                  <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                </svg>
              }
              danger
              onClick={() => {
                if (confirm("Are you sure you want to delete your account? This action cannot be undone.")) {
                  // Handle account deletion
                  console.log("Delete account");
                }
              }}
            />
          </div>
        </section>

<<<<<<< HEAD
        {/* APP INFO */}
        <section className="section">
          <div className="card">
            <div className="app-info">
              <div className="app-info-item">
                <span className="app-info-label">App Version</span>
                <span className="app-info-value">1.0.0</span>
              </div>
              <div className="app-info-item">
                <span className="app-info-label">Build</span>
                <span className="app-info-value">#12345</span>
              </div>
            </div>
          </div>
        </section>
=======
        {/* VERSION INFO */}
        <div className="version-info">
          <p>Version 1.0.0</p>
        </div>
>>>>>>> 02bdcb7 (Initial commit)
      </div>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />
    </div>
  );
}

