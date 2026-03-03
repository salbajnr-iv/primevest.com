"use client";

import * as React from "react";
import Link from "next/link";
import Image from "next/image";
  label: string;
  value?: string;
  icon?: React.ReactNode;
  href?: string;
  onClick?: () => void;
  danger?: boolean;
}

function ProfileItem({ label, value, icon, href, onClick, danger }: ProfileItemProps) {
  const content = (
    <>
      <div className="profile-item-left">
        {icon && <div className="profile-item-icon">{icon}</div>}
        <span className={danger ? "text-danger" : ""}>{label}</span>
      </div>
      <div className="profile-item-right">
        {value && <span className="profile-item-value">{value}</span>}
        {href && (
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="9 18 15 12 9 6" />
          </svg>
        )}
      </div>
    </>
  );

  if (href) {
    return <Link href={href} className="profile-item">{content}</Link>;
  }

  if (onClick) {
    return <button className="profile-item profile-button" onClick={onClick}>{content}</button>;
  }

  return <div className="profile-item">{content}</div>;
}

export default function ProfilePage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [profile, setProfile] = React.useState<Profile | null>(null);
  const [editing, setEditing] = React.useState(false);
  const [form, setForm] = React.useState({ name: '', phone: '', accountType: '' });
  const [saving, setSaving] = React.useState(false);
  const [statusMessage, setStatusMessage] = React.useState<string | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

    );
  }

  if (!authUser) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="empty-state">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <p>Please sign in to view your profile.</p>
          </div>
        </div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!authUser) return;
    setSaving(true);
    setStatusMessage(null);
    try {
      const payload = {
        id: authUser.id,
        full_name: form.name,
        phone: form.phone,
        account_type: form.accountType,
        updated_at: new Date().toISOString(),
      };

      console.log('Attempting to save profile with payload:', payload);
      
      const { error: upsertError } = await supabase.from('profiles').upsert(payload);
      
      if (upsertError) {
        console.error('Profile upsert error details:', {
          message: upsertError.message,
          code: upsertError.code,
          details: upsertError.details,
          hint: upsertError.hint
        });
        throw new Error(`Profile save failed: ${upsertError.message} (Code: ${upsertError.code})`);
      }

      console.log('Profile saved successfully to database');

      // Update auth user metadata
      const { error: authErr } = await supabase.auth.updateUser({ 
        data: { 
          full_name: form.name,
          phone: form.phone,
          accountType: form.accountType
        } 
      });
      
      if (authErr) {
        console.warn('Could not update auth user metadata:', authErr);
      } else {
        console.log('Auth user metadata updated successfully');
      }

      setProfile(prev => ({ 
        ...(prev || {}), 
        name: form.name, 
        email: prev?.email || '', 
        phone: form.phone, 
        kycStatus: prev?.kycStatus || 'pending',
        memberSince: prev?.memberSince || '',
        accountType: form.accountType 
      }));
      
      setEditing(false);
      setStatusMessage('Profile saved successfully');
    } catch (err: unknown) {
      const error = err as Error;
      console.error('Save failed', error);
      
      // Provide more specific error message based on error type
      if (error.message?.includes('RLS') || error.message?.includes('policy')) {
        setStatusMessage('Permission denied. Please check your account settings.');
      } else if (error.message?.includes('network') || error.message?.includes('fetch')) {
        setStatusMessage('Network error. Please check your connection and try again.');
      } else {
        setStatusMessage('Could not save profile. Please try again.');
      }
    } finally {
      setSaving(false);
      setTimeout(() => setStatusMessage(null), 5000);
    }
  };

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">ACCOUNT</span>
            <div className="header-title">Profile</div>
          </div>
          <div className="header-actions">
            {statusMessage && <span className="status-message">{statusMessage}</span>}
            {!editing ? (
              <button className="btn btn-secondary" onClick={() => setEditing(true)}>Edit</button>
            ) : (
              <>
                <button className="btn btn-primary" onClick={handleSave} disabled={saving}>{saving ? 'Saving...' : 'Save'}</button>
                <button className="btn btn-secondary" onClick={() => { setEditing(false); setForm({ name: profile?.name || '', phone: profile?.phone || '', accountType: profile?.accountType || 'Personal' }); }}>Cancel</button>
              </>
            )}
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* PROFILE CARD */}
        <section className="profile-section">
          <div className="profile-card">
            <div className="profile-header">
              <div className="profile-avatar-large">
                {profile?.avatar_url ? (
                  <Image src={profile.avatar_url} alt={profile.name} width={80} height={80} />
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                    <circle cx="12" cy="7" r="4" />
                  </svg>
                )}
              </div>
              <div className="profile-details">
                <h2 className="profile-name">{profile?.name || authUser.email}</h2>
                <p className="profile-email">{profile?.email || authUser.email}</p>
                <div className="profile-meta">
                  <span>Member since {profile?.memberSince || '—'}</span>
                  <span className="divider">•</span>
                  <span>{profile?.accountType || 'Personal'}</span>
                </div>
              </div>
        <section className="profile-card">
          <div className="profile-avatar">
            {profile?.avatar_url ? (
              <img src={profile.avatar_url} alt={profile.name} style={{ width: '100%', height: '100%', borderRadius: '50%' }} />
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
            )}
          </div>
          <div className="profile-info">
            <h2 className="profile-name">{profile?.name || authUser.email}</h2>
            <p className="profile-email">{profile?.email || authUser.email}</p>
            <div className="profile-meta">
              <span>Member since {profile?.memberSince || '—'}</span>
              <span className="dot">•</span>
              <span>{profile?.accountType || 'Personal'}</span>
            </div>
          </div>
        </section>

        {/* KYC SECTION */}
        <section className="section">
          <h3 className="section-title">Identity Verification</h3>
          <div className="card">
            {profile?.kycStatus === "verified" ? (
              <div className="verification-card verified">
                <div className="verification-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#0f9d58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <section className="kyc-section">
          <h3 className="section-title">Identity Verification</h3>
          <div className="kyc-card">
            {profile?.kycStatus === "verified" ? (
              <div className="kyc-verified">
                <div className="kyc-icon verified">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
                    <polyline points="22 4 12 14.01 9 11.01" />
                  </svg>
                </div>
                <div className="verification-content">
                  <span className="verification-status verified">Verified</span>
                  <p>Your identity has been verified. You have full access to all platform features.</p>
                </div>
              </div>
            ) : (
              <div className="verification-card pending">
                <div className="verification-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <line x1="12" y1="8" x2="12" y2="12" />
                    <line x1="12" y1="16" x2="12.01" y2="16" />
                  </svg>
                </div>
                <div className="verification-content">
                  <span className="verification-status pending">Verification Required</span>
                  <p>Complete your identity verification to unlock all features.</p>
                </div>
                <Link href="/profile/kyc" className="btn btn-primary">
                  Verify Now
                </Link>
              </div>
            )}
          </div>
        </section>

        {/* PERSONAL INFORMATION */}
        <section className="section">
          <h3 className="section-title">Personal Information</h3>
          <div className="card">
            {editing ? (
              <div className="form-container">
                <div className="form-group">
                  <label className="form-label">Full Name</label>
        <section className="info-section">
          <h3 className="section-title">Personal Information</h3>
          <div className="list-card">
            {editing ? (
              <div>
                <div className="form-group">
                  <label className="form-label">Full name</label>
                  <input
                    className="form-input"
                    value={form.name}
                    onChange={(e) => setForm((s) => ({ ...s, name: e.target.value }))}
                    placeholder="Enter your full name"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number</label>
                  <input
                    className="form-input"
                    value={form.phone}
                    onChange={(e) => setForm((s) => ({ ...s, phone: e.target.value }))}
                    placeholder="Enter your phone number"
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Type</label>
                  <select 
                    className="form-select" 
                    aria-label="Account Type"
                    value={form.accountType} 
                    onChange={(e) => setForm((s) => ({ ...s, accountType: e.target.value }))}
                  >
                    <option value="Personal">Personal</option>
                    <option value="Business">Business</option>
                  </select>
                </div>
              </div>
            ) : (
              <>
                <ProfileItem02bdcb7 (Initial commit)
                  label="Full Name"
                  value={profile?.name || authUser.email}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  }
                />
                <ProfileItem
                  label="Email Address"
                  value={profile?.email || authUser.email}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                      <polyline points="22,6 12,13 2,6" />
                    </svg>
                  }
                />
                <ProfileItem
                  label="Phone Number"
                  value={profile?.phone || '—'}
                  icon={
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                    </svg>
                  }
                />
              </>
            )}
          </div>
        </section>

        {/* ACCOUNT SETTINGS */}
        <section className="section">
          <h3 className="section-title">Account Settings</h3>
          <div className="card">
            <ProfileItem
              label="Security Settings"
        <section className="info-section">
          <h3 className="section-title">Account Settings</h3>
          <div className="list-card">
            <ListItem
              label="Security"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              href="/settings#security"
            />
            <ProfileItem02bdcb7 (Initial commit)
              label="Preferences"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="3" />
                  <path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z" />
                </svg>
              }
              href="/settings"
            />
            <ProfileItem02bdcb7 (Initial commit)
              label="Two-Factor Authentication"
              value="Enabled"
              icon={
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                  <path d="M7 11V7a5 5 0 0 1 10 0v4" />
                </svg>
              }
              href="/settings#security"
            />
          </div>
        </section>
      </div>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />
    </div>
  );
}
