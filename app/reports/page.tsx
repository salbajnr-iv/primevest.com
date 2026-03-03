"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface ReportItem {
  id: string;
  title: string;
  description: string;
  type: "tax" | "annual" | "custom" | "activity";
  date: string;
  size: string;
  icon: React.ReactNode;
}

const reports: ReportItem[] = [
  {
    id: "1",
    title: "Tax Report 2023",
    description: "Complete tax report for fiscal year 2023",
    type: "tax",
    date: "Jan 15, 2024",
    size: "2.4 MB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <line x1="12" y1="1" x2="12" y2="23" />
        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
      </svg>
    ),
  },
  {
    id: "2",
    title: "Annual Summary 2023",
    description: "Your complete trading activity summary for 2023",
    type: "annual",
    date: "Jan 10, 2024",
    size: "1.8 MB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
        <line x1="16" y1="2" x2="16" y2="6" />
        <line x1="8" y1="2" x2="8" y2="6" />
        <line x1="3" y1="10" x2="21" y2="10" />
      </svg>
    ),
  },
  {
    id: "3",
    title: "Q4 2023 Report",
    description: "Quarterly performance report (Oct - Dec 2023)",
    type: "custom",
    date: "Jan 5, 2024",
    size: "980 KB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
        <polyline points="14 2 14 8 20 8" />
        <line x1="16" y1="13" x2="8" y2="13" />
        <line x1="16" y1="17" x2="8" y2="17" />
      </svg>
    ),
  },
  {
    id: "4",
    title: "Activity Log",
    description: "Complete log of all account activities",
    type: "activity",
    date: "Dec 31, 2023",
    size: "3.2 MB",
    icon: (
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
        <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
      </svg>
    ),
  },
];

function ReportItem({ report }: { report: ReportItem }) {
  // Define type-specific styling
  const getTypeStyle = () => {
    const colors = {
      tax: { color: '#0f9d58', bg: 'rgba(15, 157, 88, 0.1)' },
      annual: { color: '#007aff', bg: 'rgba(0, 122, 255, 0.1)' },
      custom: { color: '#9c27b0', bg: 'rgba(156, 39, 176, 0.1)' },
      activity: { color: '#ff9800', bg: 'rgba(255, 152, 0, 0.1)' }
    };
    return colors[report.type] || colors.custom;
  };

  const typeStyle = getTypeStyle();

  return (
    <div className="report-item">
      <div className="report-icon" style={{ backgroundColor: typeStyle.bg }}>
        {report.icon}
      </div>
      <div className="report-info">
        <h4>{report.title}</h4>
        <p>{report.description}</p>
        <div className="report-meta">
          <span>{report.date}</span>
          <span className="divider">•</span>
          <span>{report.size}</span>
        </div>
      </div>
      <div className="report-actions">
        <button className="btn btn-secondary btn-small">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
            <polyline points="7 10 12 15 17 10" />
            <line x1="12" y1="15" x2="12" y2="3" />
          </svg>
          Download
        </button>
        <button className="btn-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="12" cy="12" r="1" />
            <circle cx="19" cy="12" r="1" />
            <circle cx="5" cy="12" r="1" />
          </svg>
        </button>
      </div>
    </div>
  );
}

export default function ReportsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [reportsState, setReportsState] = React.useState<ReportItem[]>(reports);
  const [thirtyDaysAgo, setThirtyDaysAgo] = React.useState<Date>(new Date());
  const supabase = createClient();

  React.useEffect(() => {
    setThirtyDaysAgo(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000));
  }, []);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setReportsState(reports);
      return;
    }

    (async () => {
      try {
        const { data, error } = await supabase
          .from('reports')
          .select('*')
          .eq('user_id', authUser.id)
          .order('created_at', { ascending: false });

        if (error) {
          console.warn('Reports table not available, using static data', error);
          setReportsState(reports);
        } else if (data && data.length > 0) {
          interface SupabaseReport {
            id: number;
            title: string;
            description: string;
            type: 'tax' | 'annual' | 'custom' | 'activity';
            created_at?: string;
            size: string;
            icon?: string;
          }
          
          const mapped = data.map((row: SupabaseReport) => ({
            id: String(row.id),
            title: row.title || 'Report',
            description: row.description || '',
            type: row.type || 'custom',
            date: row.created_at ? new Date(row.created_at).toLocaleDateString() : '',
            size: row.size || '',
            icon: row.icon || null,
          }));
          setReportsState(mapped as ReportItem[]);
        } else {
          setReportsState(reports);
        }
      } catch (err) {
        console.error('Error fetching reports', err);
        setReportsState(reports);
      }
    })();
  }, [authLoading, authUser, supabase]);

  if (!isClient || authLoading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
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
            <span className="header-eyebrow">DOCUMENTS</span>
            <div className="header-title">Reports</div>
          </div>
          <div className="header-actions">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* REPORT SUMMARY */}
        <section className="section">
          <div className="summary-card">
            <div className="summary-item">
              <span className="summary-label">Total Reports</span>
              <span className="summary-value">{reportsState.length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Tax Reports</span>
              <span className="summary-value">{reportsState.filter(r => r.type === 'tax').length}</span>
            </div>
            <div className="summary-item">
              <span className="summary-label">Recent</span>
              <span className="summary-value">{reportsState.filter(r => new Date(r.date) > thirtyDaysAgo).length}</span>
            </div>
          </div>
        </section>

        {/* GENERATE REPORT */}
        <section className="section">
          <div className="card">
            <div className="generate-report-card">
              <div className="generate-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="12" y1="18" x2="12" y2="12" />
                  <line x1="9" y1="15" x2="15" y2="15" />
                </svg>
              </div>
              <div className="generate-info">
                <h3>Generate Custom Report</h3>
                <p>Create a custom report for any time period</p>
              </div>
              <button className="btn btn-primary">
                Create Report
              </button>
            </div>
          </div>
        </section>

        {/* REPORT FILTERS */}
        <section className="section">
          <div className="card">
            <div className="filters-container">
              <div className="filter-tabs">
                <button className={`filter-tab active`}>All Reports</button>
                <button className={`filter-tab`}>Tax</button>
                <button className={`filter-tab`}>Annual</button>
                <button className={`filter-tab`}>Custom</button>
              </div>
            </div>
          </div>
        </section>

        {/* AVAILABLE REPORTS */}
        <section className="section">
          <h3 className="section-title">Available Reports</h3>
          <div className="card">
            <div className="reports-container">
              {reportsState.map((report) => (
                <ReportItem key={report.id} report={report} />
              ))}
            </div>
          </div>
        </section>

        {/* REPORT INFO */}
        <section className="section">
          <div className="card">
            <div className="info-card">
              <div className="info-icon">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="16" x2="12" y2="12" />
                  <line x1="12" y1="8" x2="12.01" y2="8" />
                </svg>
              </div>
              <div className="info-content">
                <h4>About Reports</h4>
                <p>Reports include all your trading activity, deposits, withdrawals, and tax-relevant information. All reports are generated in PDF format.</p>
              </div>
            </div>
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

