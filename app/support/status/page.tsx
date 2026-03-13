"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";

type ServiceState = "operational" | "degraded" | "outage";
type SourceState = "operational" | "degraded" | "unavailable";

interface MaintenanceWindow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  impact: string;
}

interface ComponentStatus {
  id: string;
  name: string;
  status: ServiceState;
  lastChangedAt: string;
  activeIncidents: number;
  plannedMaintenance: MaintenanceWindow[];
}

interface IncidentEvent {
  id: string;
  timestamp: string;
  message: string;
}

interface Incident {
  id: string;
  component: string;
  severity: "minor" | "major" | "critical";
  status: "investigating" | "monitoring" | "resolved";
  startedAt: string;
  updatedAt: string;
  summary: string;
  timeline: IncidentEvent[];
}

interface StatusPayload {
  generatedAt: string;
  source: {
    status: SourceState;
    message: string;
  };
  summary: {
    currentStatus: string;
    activeIncidents: number;
    plannedMaintenanceWindows: number;
  };
  components: ComponentStatus[];
  incidents: Incident[];
}

const FALLBACK_STATUS: StatusPayload = {
  generatedAt: new Date().toISOString(),
  source: {
    status: "unavailable",
    message: "Live status feed is currently unavailable. Showing the latest cached status snapshot.",
  },
  summary: {
    currentStatus: "status-source-unavailable",
    activeIncidents: 1,
    plannedMaintenanceWindows: 1,
  },
  components: [
    {
      id: "api",
      name: "Public API",
      status: "degraded",
      lastChangedAt: "2026-03-13T06:05:00.000Z",
      activeIncidents: 1,
      plannedMaintenance: [],
    },
    {
      id: "deposits",
      name: "Deposits",
      status: "operational",
      lastChangedAt: "2026-03-12T22:00:00.000Z",
      activeIncidents: 0,
      plannedMaintenance: [],
    },
    {
      id: "withdrawals",
      name: "Withdrawals",
      status: "degraded",
      lastChangedAt: "2026-03-13T06:05:00.000Z",
      activeIncidents: 1,
      plannedMaintenance: [
        {
          id: "fallback-maintenance",
          title: "Scheduled wallet maintenance",
          startsAt: "2026-03-15T01:00:00.000Z",
          endsAt: "2026-03-15T02:30:00.000Z",
          impact: "Possible transfer delays.",
        },
      ],
    },
    {
      id: "trading-engine",
      name: "Trading Engine",
      status: "operational",
      lastChangedAt: "2026-03-12T17:45:00.000Z",
      activeIncidents: 0,
      plannedMaintenance: [],
    },
    {
      id: "kyc",
      name: "KYC",
      status: "operational",
      lastChangedAt: "2026-03-12T21:30:00.000Z",
      activeIncidents: 0,
      plannedMaintenance: [],
    },
  ],
  incidents: [
    {
      id: "fallback-incident",
      component: "withdrawals",
      severity: "major",
      status: "investigating",
      startedAt: "2026-03-13T06:05:00.000Z",
      updatedAt: "2026-03-13T06:20:00.000Z",
      summary: "Withdrawal confirmations are delayed while we investigate provider latency.",
      timeline: [
        {
          id: "fallback-event",
          timestamp: "2026-03-13T06:20:00.000Z",
          message: "Fallback incident snapshot loaded while live status source is unavailable.",
        },
      ],
    },
  ],
};

function formatTimestamp(value: string) {
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function statusLabel(status: ServiceState) {
  return status === "operational" ? "Operational" : status === "degraded" ? "Degraded" : "Outage";
}

function statusColor(status: ServiceState) {
  return status === "operational" ? "#22c55e" : status === "degraded" ? "#f59e0b" : "#ef4444";
}

export default function SupportStatusPage() {
  const [state, setState] = React.useState<"loading" | "ready" | "error">("loading");
  const [statusData, setStatusData] = React.useState<StatusPayload | null>(null);
  const [fallbackMessage, setFallbackMessage] = React.useState<string | null>(null);

  const loadStatus = React.useCallback(async () => {
    setState("loading");
    setFallbackMessage(null);

    try {
      const response = await fetch("/api/support/status", { cache: "no-store" });
      const data = (await response.json()) as Partial<StatusPayload>;

      if (!response.ok || !data.components || !data.summary || !data.source) {
        setStatusData(FALLBACK_STATUS);
        setFallbackMessage("We could not reach live status data. Displaying cached system status.");
        setState("ready");
        return;
      }

      const payload = data as StatusPayload;
      if (payload.source.status !== "operational") {
        setFallbackMessage(payload.source.message);
      }

      setStatusData(payload);
      setState("ready");
    } catch {
      setStatusData(FALLBACK_STATUS);
      setFallbackMessage("Status source appears unavailable. Displaying cached status information.");
      setState("ready");
    }
  }, []);

  React.useEffect(() => {
    void loadStatus();
  }, [loadStatus]);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/support" className="header-back" aria-label="Back to support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">SUPPORT</span>
            <div className="header-title">System Status</div>
          </div>
        </header>

        <section className="section">
          <h3 className="section-title">Platform summary</h3>
          <div className="card">
            {state === "loading" && <LoadingSpinner text="Loading status dashboard..." />}
            {state === "error" && <ErrorState onRetry={() => void loadStatus()} />}
            {state === "ready" && statusData && (
              <div className="space-y-3">
                <div className="quick-action-card" style={{ border: "1px solid rgba(148, 163, 184, 0.25)" }}>
                  <div className="quick-action-content">
                    <span>{statusData.summary.currentStatus.replace(/-/g, " ")}</span>
                    <small>
                      {statusData.summary.activeIncidents} active incident(s) · {statusData.summary.plannedMaintenanceWindows} planned maintenance window(s)
                    </small>
                  </div>
                </div>
                {fallbackMessage && (
                  <div className="quick-action-card" style={{ border: "1px solid rgba(245, 158, 11, 0.4)", background: "rgba(245, 158, 11, 0.08)" }}>
                    <div className="quick-action-content">
                      <span>Status source update</span>
                      <small>{fallbackMessage}</small>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Component status</h3>
          <div className="card">
            {state === "ready" && statusData && (
              <div className="space-y-3">
                {statusData.components.map((component) => (
                  <div key={component.id} className="quick-action-card" style={{ borderLeft: `4px solid ${statusColor(component.status)}` }}>
                    <div className="quick-action-content">
                      <span>{component.name} — {statusLabel(component.status)}</span>
                      <small>Last changed {formatTimestamp(component.lastChangedAt)} · {component.activeIncidents} active incident(s)</small>
                      {component.plannedMaintenance.map((window) => (
                        <small key={window.id}>{window.title}: {formatTimestamp(window.startsAt)} - {formatTimestamp(window.endsAt)}</small>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Incident timeline</h3>
          <div className="card">
            {state === "ready" && statusData && statusData.incidents.length === 0 && (
              <div className="quick-action-content">
                <span>No active incidents</span>
                <small>All monitored components are healthy.</small>
              </div>
            )}
            {state === "ready" && statusData && statusData.incidents.length > 0 && (
              <div className="space-y-3">
                {statusData.incidents.map((incident) => (
                  <div key={incident.id} className="quick-action-card">
                    <div className="quick-action-content">
                      <span>{incident.summary}</span>
                      <small>{incident.component} · {incident.severity} · {incident.status} · Updated {formatTimestamp(incident.updatedAt)}</small>
                      {incident.timeline.map((event) => (
                        <small key={event.id}>{formatTimestamp(event.timestamp)} — {event.message}</small>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>
      </div>
      <BottomNav />
    </div>
  );
}
