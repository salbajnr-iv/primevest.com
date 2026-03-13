import { NextResponse } from "next/server";

type ServiceState = "operational" | "degraded" | "outage";
type SourceState = "operational" | "degraded" | "unavailable";

interface MaintenanceWindow {
  id: string;
  title: string;
  startsAt: string;
  endsAt: string;
  impact: string;
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

interface ComponentStatus {
  id: string;
  name: string;
  status: ServiceState;
  lastChangedAt: string;
  activeIncidents: number;
  plannedMaintenance: MaintenanceWindow[];
}

const MAINTENANCE_WINDOWS: MaintenanceWindow[] = [
  {
    id: "mw-wallet-reconciliation",
    title: "Wallet reconciliation upgrade",
    startsAt: "2026-03-15T01:00:00.000Z",
    endsAt: "2026-03-15T02:30:00.000Z",
    impact: "Intermittent delays for EUR deposits and withdrawals.",
  },
  {
    id: "mw-kyc-provider",
    title: "KYC document verification provider maintenance",
    startsAt: "2026-03-18T03:00:00.000Z",
    endsAt: "2026-03-18T04:00:00.000Z",
    impact: "Longer-than-usual review times for new submissions.",
  },
];

const INCIDENTS: Incident[] = [
  {
    id: "inc-withdrawal-latency",
    component: "withdrawals",
    severity: "major",
    status: "monitoring",
    startedAt: "2026-03-13T06:05:00.000Z",
    updatedAt: "2026-03-13T07:15:00.000Z",
    summary: "Crypto withdrawal confirmations are delayed for a subset of transactions.",
    timeline: [
      {
        id: "evt-1",
        timestamp: "2026-03-13T06:05:00.000Z",
        message: "We are investigating increased confirmation latency for BTC and ETH withdrawals.",
      },
      {
        id: "evt-2",
        timestamp: "2026-03-13T06:40:00.000Z",
        message: "A fix has been deployed and withdrawal queues are draining.",
      },
      {
        id: "evt-3",
        timestamp: "2026-03-13T07:15:00.000Z",
        message: "Systems are stable. We are monitoring until latency fully normalizes.",
      },
    ],
  },
];

const BASE_COMPONENTS: Omit<ComponentStatus, "activeIncidents">[] = [
  {
    id: "api",
    name: "Public API",
    status: "operational",
    lastChangedAt: "2026-03-12T19:10:00.000Z",
    plannedMaintenance: [],
  },
  {
    id: "deposits",
    name: "Deposits",
    status: "operational",
    lastChangedAt: "2026-03-12T22:00:00.000Z",
    plannedMaintenance: [MAINTENANCE_WINDOWS[0]],
  },
  {
    id: "withdrawals",
    name: "Withdrawals",
    status: "degraded",
    lastChangedAt: "2026-03-13T06:05:00.000Z",
    plannedMaintenance: [MAINTENANCE_WINDOWS[0]],
  },
  {
    id: "trading-engine",
    name: "Trading Engine",
    status: "operational",
    lastChangedAt: "2026-03-12T17:45:00.000Z",
    plannedMaintenance: [],
  },
  {
    id: "kyc",
    name: "KYC",
    status: "operational",
    lastChangedAt: "2026-03-12T21:30:00.000Z",
    plannedMaintenance: [MAINTENANCE_WINDOWS[1]],
  },
];

function getSourceState(): SourceState {
  const source = process.env.SUPPORT_STATUS_SOURCE?.toLowerCase();
  if (source === "degraded" || source === "unavailable") {
    return source;
  }

  return "operational";
}

function buildPayload(sourceState: SourceState) {
  const components: ComponentStatus[] = BASE_COMPONENTS.map((component) => ({
    ...component,
    activeIncidents: INCIDENTS.filter((incident) => incident.component === component.id && incident.status !== "resolved").length,
  }));

  return {
    ok: sourceState !== "unavailable",
    generatedAt: new Date().toISOString(),
    source: {
      status: sourceState,
      message:
        sourceState === "operational"
          ? "Status source is operating normally."
          : sourceState === "degraded"
            ? "Status source is degraded. Data may be delayed by up to 5 minutes."
            : "Status source is unavailable. Returned data may be stale.",
    },
    summary: {
      currentStatus: components.some((component) => component.status === "outage")
        ? "major-outage"
        : components.some((component) => component.status === "degraded")
          ? "degraded-performance"
          : "all-systems-operational",
      activeIncidents: INCIDENTS.filter((incident) => incident.status !== "resolved").length,
      plannedMaintenanceWindows: MAINTENANCE_WINDOWS.length,
    },
    components,
    incidents: INCIDENTS,
    maintenanceWindows: MAINTENANCE_WINDOWS,
  };
}

export async function GET() {
  const sourceState = getSourceState();
  const payload = buildPayload(sourceState);

  if (sourceState === "unavailable") {
    return NextResponse.json(payload, { status: 503 });
  }

  return NextResponse.json(payload, { status: sourceState === "degraded" ? 206 : 200 });
}
