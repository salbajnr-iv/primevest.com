"use client";

import * as React from "react";

interface SidebarErrorBoundaryState {
  hasError: boolean;
  error?: Error;
}

export class SidebarErrorBoundary extends React.Component<
  React.PropsWithChildren<object>,
  SidebarErrorBoundaryState
> {
  constructor(props: React.PropsWithChildren<object>) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): SidebarErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('Sidebar Error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="sidebar-error-fallback">
          <div className="sidebar-error-content">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            <p>Unable to load sidebar</p>
            <button 
              onClick={() => this.setState({ hasError: false })}
              className="sidebar-error-retry"
            >
              Retry
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

interface SidebarLoadingProps {
  isMobile?: boolean;
}

export function SidebarLoading({ isMobile = false }: SidebarLoadingProps) {
  return (
    <aside className={isMobile ? "sidebar" : "sidebar-desktop"}>
      <div className="sidebar-header">
        <div className="sidebar-user">
          <div className="sidebar-avatar skeleton-shimmer" />
          <div className="sidebar-user-info">
            <div className="skeleton-shimmer" style={{ height: '16px', width: '120px', marginBottom: '4px' }} />
            <div className="skeleton-shimmer" style={{ height: '12px', width: '160px' }} />
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
          <div className="skeleton-shimmer" style={{ width: '36px', height: '36px', borderRadius: '50%' }} />
        </div>
      </div>

      <nav className="sidebar-nav">
        <ul className="sidebar-menu">
          {[...Array(7)].map((_, index) => (
            <li key={index}>
              <div className="sidebar-menu-item skeleton-shimmer">
                <div className="sidebar-menu-icon skeleton-shimmer" />
                <div className="skeleton-shimmer" style={{ height: '16px', width: '100px' }} />
              </div>
            </li>
          ))}
        </ul>
      </nav>

      <div className="sidebar-footer">
        <div className="sidebar-logout skeleton-shimmer">
          <div className="skeleton-shimmer" style={{ width: '20px', height: '20px' }} />
          <div className="skeleton-shimmer" style={{ height: '16px', width: '60px' }} />
        </div>
      </div>
    </aside>
  );
}
