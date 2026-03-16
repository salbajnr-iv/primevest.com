"use client";

import * as React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { ROUTES } from "@/lib/routes";
import {
  AlertCircle,
  ArrowLeftRight,
  Headphones,
  ChevronDown,
  Compass,
  Home,
  LayoutDashboard,
  LineChart,
  ListOrdered,
  MessageCircle,
  Newspaper,
  PlusCircle,
  Search,
  Settings,
  ShieldCheck,
  TrendingUp,
  Users,
  Wallet,
} from "lucide-react";

interface SidebarContentProps {
  onClose: () => void;
  isMobile?: boolean;
}

type MenuSection = {
  title: string;
  items: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; href: string }[];
};

const menuSections: MenuSection[] = [
  {
    title: "Dashboard Overview",
    items: [{ icon: Home, label: "Dashboard Home", href: ROUTES.dashboard.home }],
  },
  {
    title: "Portfolio Management",
    items: [
      { icon: Wallet, label: "My Portfolio", href: ROUTES.dashboard.portfolio },
      { icon: PlusCircle, label: "Add Funds", href: ROUTES.dashboard.deposit },
      { icon: ArrowLeftRight, label: "Withdraw Funds", href: ROUTES.wallets.withdraw },
    ],
  },
  {
    title: "Market Insights",
    items: [
      { icon: TrendingUp, label: "Market Overview", href: ROUTES.markets.home },
      { icon: LineChart, label: "Top Gainers and Losers", href: ROUTES.markets.home },
      { icon: Newspaper, label: "Market News", href: ROUTES.markets.news },
    ],
  },
  {
    title: "Trading Tools",
    items: [
      { icon: LayoutDashboard, label: "Trade Now", href: ROUTES.dashboard.trade },
      { icon: ListOrdered, label: "Order History", href: ROUTES.dashboard.orders },
      { icon: Compass, label: "Trading Strategies", href: ROUTES.markets.tutorials },
    ],
  },
  {
    title: "Account Settings",
    items: [
      { icon: Settings, label: "Profile Settings", href: ROUTES.settings.home },
      { icon: AlertCircle, label: "Notifications", href: ROUTES.settings.notifications },
      { icon: ShieldCheck, label: "Security Settings", href: ROUTES.settings.securityKyc },
    ],
  },
  {
    title: "Help and Support",
    items: [
      { icon: MessageCircle, label: "FAQ", href: ROUTES.support.faqs },
      { icon: Headphones, label: "Contact Support", href: ROUTES.support.home },
      { icon: Users, label: "Community Forum", href: ROUTES.support.community },
    ],
  },
];

export const SidebarContent = React.memo(function SidebarContent({ onClose, isMobile = false }: SidebarContentProps) {
  const { user, signOut } = useAuth();
  const pathname = usePathname();
  const [search, setSearch] = React.useState("");
  const [openSections, setOpenSections] = React.useState<Record<string, boolean>>(
    () => Object.fromEntries(menuSections.map((section) => [section.title, true])),
  );

  const userName = React.useMemo(() => {
    if (user?.user_metadata?.full_name) return user.user_metadata.full_name;
    if (user?.email) return user.email.split("@")[0];
    return "User";
  }, [user]);

  const filteredSections = React.useMemo(() => {
    if (!search.trim()) return menuSections;
    const needle = search.toLowerCase();
    return menuSections
      .map((section) => ({
        ...section,
        items: section.items.filter((item) => item.label.toLowerCase().includes(needle)),
      }))
      .filter((section) => section.items.length > 0);
  }, [search]);

  const toggleSection = (title: string) => {
    setOpenSections((prev) => ({ ...prev, [title]: !prev[title] }));
  };

  const handleLogout = React.useCallback(async () => {
    try {
      onClose();
      await signOut();
      window.location.href = ROUTES.root.home;
    } catch {
      window.location.href = ROUTES.root.home;
    }
  }, [onClose, signOut]);

  return (
    <aside
      className={`bg-white border-r border-slate-200 overflow-y-auto ${isMobile ? "fixed left-0 top-0 z-50 h-screen w-80 max-w-[88vw] shadow-2xl" : "relative h-[calc(100vh-64px)] w-80 hidden md:block"}`}
      role="navigation"
      aria-label="Main navigation"
    >
      <div className="p-5 border-b border-slate-200">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-700 font-semibold text-lg">{userName.charAt(0).toUpperCase()}</span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-slate-900 truncate">{userName}</span>
            <span className="block text-xs text-slate-500 truncate">{user?.email || "user@example.com"}</span>
          </div>
          <ThemeToggle />
        </div>

        <div className="relative">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search features..."
            className="w-full rounded-xl border border-slate-200 py-2 pl-9 pr-3 text-sm outline-none focus:border-emerald-500"
          />
        </div>
      </div>

      <div className="py-4">
        {filteredSections.map((section) => {
          const isOpen = openSections[section.title];
          return (
            <div key={section.title} className="mb-2">
              <button
                onClick={() => toggleSection(section.title)}
                className="w-full px-4 py-2 text-xs font-semibold uppercase tracking-wide text-slate-500 flex items-center justify-between"
              >
                {section.title}
                <ChevronDown size={14} className={`transition-transform ${isOpen ? "rotate-180" : ""}`} />
              </button>
              {isOpen ? (
                <div>
                  {section.items.map((item) => {
                    const isActive = pathname === item.href;
                    return (
                      <Link
                        key={item.label}
                        href={item.href}
                        onClick={isMobile ? onClose : undefined}
                        className={`mx-2 my-1 flex items-center gap-3 rounded-xl px-3 py-2 text-sm transition-colors ${isActive ? "bg-emerald-50 text-emerald-700" : "text-slate-600 hover:bg-slate-50 hover:text-slate-900"}`}
                      >
                        <item.icon size={16} />
                        {item.label}
                      </Link>
                    );
                  })}
                </div>
              ) : null}
            </div>
          );
        })}
      </div>

      <div className="sticky bottom-0 left-0 right-0 p-4 border-t border-slate-200 bg-white space-y-2">
        <button
          className="w-full flex items-center gap-2 px-3 py-2 text-sm text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <ShieldCheck size={15} />
          Log Out
        </button>
      </div>
    </aside>
  );
});
