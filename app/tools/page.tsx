"use client";

import * as React from "react";
import Link from "next/link";
import { ArrowRight, BarChart3, Calendar, CircleHelp, Clock, Newspaper, Shield, ShieldCheck, Star, TrendingUp, Zap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { PageSectionHeader } from "@/components/ui/PageSectionHeader";

interface ToolItem {
  name: string;
  description: string;
  features: string[];
  icon: React.ReactNode;
  path: string;
  category: string;
  popularity: number;
  isNew: boolean;
}

export default function ToolsPage() {
  const [favoriteTools, setFavoriteTools] = React.useState<string[]>([]);
  const [loadingAction, setLoadingAction] = React.useState<string | null>(null);

  const handleWebTrader = async () => {
    setLoadingAction("trader");
    await new Promise((resolve) => setTimeout(resolve, 1000));
    window.location.href = "/dashboard/trade";
  };

  const handleBackToHome = async () => {
    setLoadingAction("home");
    await new Promise((resolve) => setTimeout(resolve, 500));
    window.location.href = "/";
  };

  const toggleFavorite = (toolName: string) => {
    setFavoriteTools((prev) => (prev.includes(toolName) ? prev.filter((name) => name !== toolName) : [...prev, toolName]));
  };

  const tools: ToolItem[] = [
    {
      name: "Economic Calendar",
      description: "Stay ahead of market-moving events with our comprehensive economic calendar.",
      features: ["Real-time updates", "Custom alerts", "Impact levels", "Historical data"],
      icon: <Calendar className="h-5 w-5 text-blue-600" />,
      path: "/tools/economic-calendar",
      category: "Analysis",
      popularity: 4.8,
      isNew: false,
    },
    {
      name: "Market News",
      description: "Get breaking financial news and expert analysis from global markets.",
      features: ["Live updates", "Expert insights", "Multi-market coverage", "Custom feeds"],
      icon: <Newspaper className="h-5 w-5 text-violet-600" />,
      path: "/tools/market-news",
      category: "News",
      popularity: 4.9,
      isNew: true,
    },
    {
      name: "Market Analysis",
      description: "Professional-grade analysis tools for technical and fundamental research.",
      features: ["100+ indicators", "Charting tools", "AI insights", "Pattern recognition"],
      icon: <TrendingUp className="h-5 w-5 text-emerald-600" />,
      path: "/tools/analysis",
      category: "Analysis",
      popularity: 4.7,
      isNew: false,
    },
    {
      name: "Trading View",
      description: "Advanced charting platform with real-time data and professional tools.",
      features: ["Real-time data", "100+ indicators", "Multiple chart types", "Social trading"],
      icon: <BarChart3 className="h-5 w-5 text-teal-600" />,
      path: "/tools/trading-view",
      category: "Charts",
      popularity: 4.9,
      isNew: false,
    },
    {
      name: "FAQs",
      description: "Find answers to common questions about trading, accounts, and platforms.",
      features: ["Comprehensive guides", "Quick answers", "Category filters", "Search functionality"],
      icon: <CircleHelp className="h-5 w-5 text-orange-600" />,
      path: "/support",
      category: "Support",
      popularity: 4.6,
      isNew: false,
    },
  ];

  const benefits = [
    {
      title: "Professional-grade tools",
      desc: "Access the same advanced tooling used by professional traders.",
      icon: <ShieldCheck className="h-5 w-5 text-violet-600" />,
    },
    {
      title: "Real-time market data",
      desc: "Get live market data, news, and analysis with low-latency refresh.",
      icon: <Zap className="h-5 w-5 text-emerald-600" />,
    },
    {
      title: "Comprehensive coverage",
      desc: "From technical analysis to market news, everything in one workflow.",
      icon: <Shield className="h-5 w-5 text-blue-600" />,
    },
  ];

  const stats = [
    { label: "Active tools", value: "50+", icon: <Zap className="h-5 w-5 text-emerald-600" /> },
    { label: "Daily users", value: "10K+", icon: <BarChart3 className="h-5 w-5 text-emerald-600" /> },
    { label: "Uptime", value: "99.9%", icon: <Shield className="h-5 w-5 text-emerald-600" /> },
    { label: "Response time", value: "<50ms", icon: <Clock className="h-5 w-5 text-emerald-600" /> },
  ];

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <main className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-4 py-6 md:px-6">
        <PageSectionHeader
          eyebrow="Toolkit"
          title="Trading tools"
          description="Professional tools and resources to support faster, data-driven decisions."
          action={
            <div className="flex flex-wrap gap-2 sm:gap-3">
              <Button variant="outline" onClick={handleBackToHome} disabled={loadingAction !== null}>
                Back to home
              </Button>
              <Button onClick={handleWebTrader} disabled={loadingAction !== null}>
                {loadingAction === "trader" ? "Loading..." : "Start trading"}
              </Button>
            </div>
          }
        />

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {tools.map((tool) => (
            <FeatureCard
              key={tool.name}
              title={tool.name}
              description={tool.description}
              icon={<IconBadge icon={tool.icon} className="bg-gray-100" />}
              badge={tool.isNew ? <span className="rounded-full bg-emerald-100 px-2 py-1 text-xs font-medium text-emerald-700">NEW</span> : null}
              secondaryAction={
                <Button variant="outline" size="sm" onClick={() => toggleFavorite(tool.name)}>
                  <Star className={`mr-2 h-4 w-4 ${favoriteTools.includes(tool.name) ? "fill-yellow-400 text-yellow-500" : "text-gray-500"}`} />
                  {favoriteTools.includes(tool.name) ? "Saved" : "Save"}
                </Button>
              }
              primaryAction={
                <Button asChild size="sm">
                  <Link href={tool.path}>
                    Open
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              }
            >
              <div className="flex items-center justify-between text-xs text-gray-500">
                <span className="rounded-full bg-gray-100 px-2 py-1">{tool.category}</span>
                <span>★ {tool.popularity}</span>
              </div>
              <ul className="space-y-1">
                {tool.features.map((feature) => (
                  <li key={feature} className="text-sm text-gray-600">• {feature}</li>
                ))}
              </ul>
            </FeatureCard>
          ))}
        </section>

        <section className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {stats.map((stat) => (
            <FeatureCard key={stat.label} title={stat.value} description={stat.label} icon={<IconBadge icon={stat.icon} className="bg-emerald-100" />} className="p-4" />
          ))}
        </section>

        <section className="space-y-4">
          <PageSectionHeader title="Why traders use these tools" description="Compact workflows with clear actions and live data context." />
          <div className="grid gap-4 md:grid-cols-3">
            {benefits.map((benefit) => (
              <FeatureCard
                key={benefit.title}
                title={benefit.title}
                description={benefit.desc}
                icon={<IconBadge icon={benefit.icon} size="lg" className="bg-gray-100" />}
                className="h-full"
              />
            ))}
          </div>
        </section>
      </main>
    </div>
  );
}
