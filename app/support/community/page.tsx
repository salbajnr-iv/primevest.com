"use client";

import * as React from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { track } from "@vercel/analytics";
import BottomNav from "@/components/BottomNav";
import { ErrorState, LoadingSpinner } from "@/components/ui/LoadingStates";

interface CommunityResource {
  id: string;
  title: string;
  summary: string;
  href: string;
  source: string;
}

interface CommunityPayload {
  generatedAt: string;
  announcements: CommunityResource[];
  guides: CommunityResource[];
  forums: CommunityResource[];
}

function ResourceSection({
  title,
  resources,
  category,
  onResourceClick,
}: {
  title: string;
  resources: CommunityResource[];
  category: "announcements" | "guides" | "forums";
  onResourceClick: (resource: CommunityResource, category: string) => void;
}) {
  return (
    <section className="section">
      <h3 className="section-title">{title}</h3>
      <div className="card space-y-3">
        {resources.map((resource) => (
          <Link
            key={resource.id}
            href={resource.href}
            className="quick-action-card"
            onClick={() => onResourceClick(resource, category)}
          >
            <div className="quick-action-content">
              <span>{resource.title}</span>
              <small>{resource.summary}</small>
              <small>Source: {resource.source}</small>
            </div>
          </Link>
        ))}
      </div>
    </section>
  );
}

export default function SupportCommunityPage() {
  const router = useRouter();
  const [communityData, setCommunityData] = React.useState<CommunityPayload | null>(null);
  const [status, setStatus] = React.useState<"loading" | "ready" | "error">("loading");

  const loadCommunityResources = React.useCallback(async () => {
    setStatus("loading");

    try {
      const response = await fetch("/api/support/community", { cache: "no-store" });
      if (!response.ok) {
        throw new Error("Unable to load curated community resources");
      }

      const data = (await response.json()) as CommunityPayload;
      setCommunityData(data);
      setStatus("ready");
    } catch {
      setStatus("error");
    }
  }, []);

  React.useEffect(() => {
    loadCommunityResources();
  }, [loadCommunityResources]);

  const trackResourceClick = React.useCallback((resource: CommunityResource, category: string) => {
    track("support_community_resource_click", {
      resourceId: resource.id,
      category,
      destination: resource.href,
    });
  }, []);

  const trackCtaClick = React.useCallback((cta: "ask_community" | "open_ticket", destination: string) => {
    track("support_community_cta_click", {
      cta,
      destination,
    });
  }, []);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/support" className="header-back" aria-label="Back to support">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">SUPPORT</span>
            <div className="header-title">Community</div>
          </div>
        </header>

        <section className="section">
          <div className="card space-y-2">
            <h3 className="section-title">Before you post</h3>
            <p className="text-sm text-slate-600">
              Community content is informational only and should not be treated as official account support, legal advice, or investment guidance.
            </p>
            <p className="text-sm text-slate-600">
              Never share personal data, passwords, OTP codes, or wallet recovery phrases. Urgent account issues should be handled via a support ticket.
            </p>
          </div>
        </section>

        <section className="section">
          <h3 className="section-title">Get help quickly</h3>
          <div className="card space-y-3">
            <button
              type="button"
              className="primary-btn"
              onClick={() => {
                trackCtaClick("ask_community", "/support/community");
                loadCommunityResources();
              }}
            >
              Ask community
            </button>
            <button
              type="button"
              className="secondary-btn"
              onClick={() => {
                trackCtaClick("open_ticket", "/support/tickets");
                router.push("/support/tickets");
              }}
            >
              Open ticket
            </button>
            <small className="text-slate-500">Use Open ticket for urgent, security, or account-specific requests.</small>
          </div>
        </section>

        {status === "loading" && (
          <section className="section">
            <div className="card">
              <LoadingSpinner text="Loading curated community resources..." />
            </div>
          </section>
        )}

        {status === "error" && (
          <section className="section">
            <div className="card">
              <ErrorState
                title="Community resources unavailable"
                message="We could not load curated resources right now."
                onRetry={loadCommunityResources}
              />
            </div>
          </section>
        )}

        {status === "ready" && communityData && (
          <>
            <ResourceSection
              title="Announcements"
              resources={communityData.announcements}
              category="announcements"
              onResourceClick={trackResourceClick}
            />
            <ResourceSection
              title="Guides"
              resources={communityData.guides}
              category="guides"
              onResourceClick={trackResourceClick}
            />
            <ResourceSection
              title="Forum links"
              resources={communityData.forums}
              category="forums"
              onResourceClick={trackResourceClick}
            />
            <section className="section">
              <div className="card">
                <small className="text-slate-500">Curated resources refreshed: {new Date(communityData.generatedAt).toLocaleString()}</small>
              </div>
            </section>
          </>
        )}
      </div>
      <BottomNav />
    </div>
  );
}
