"use client";

import * as React from "react";
import Link from "next/link";
import { useAuth } from "@/contexts/AuthContext";
import ThemeToggle from "./ThemeToggle";
import { 
  LayoutDashboard, 
  Wallet, 
  ArrowLeftRight, 
  ClipboardList, 
  ShieldCheck, 
  Settings, 
  Monitor, 
  CheckSquare, 
  Headphones
} from "lucide-react";

interface SidebarContentProps {
  onClose: () => void;
  isMobile?: boolean;
}

const menuItems = [
  { icon: LayoutDashboard, label: 'Overview', href: '/dashboard', active: true },
  { icon: Wallet, label: 'Assets', href: '/wallets' },
  { icon: ArrowLeftRight, label: 'Internal Transfer', href: '/wallets/transfer' },
  { icon: ClipboardList, label: 'Order', href: '/dashboard/trade' },
  { icon: ShieldCheck, label: 'Verification', href: '/verification' },
  { icon: Settings, label: 'Settings', href: '/settings' },
  { icon: Monitor, label: 'Platform', href: '/platform' },
  { icon: CheckSquare, label: 'Task Center', href: '/tasks' },
  { icon: Headphones, label: 'Customer Service', href: '/support' },
];

export const SidebarContent = React.memo(function SidebarContent({ onClose, isMobile = false }: SidebarContentProps) {
  const { user, signOut } = useAuth();
  const [activeItem, setActiveItem] = React.useState('Overview');
  const sidebarRef = React.useRef<HTMLDivElement>(null);

  // Get user's display name with memoization
  const userName = React.useMemo(() => {
    if (user?.user_metadata?.full_name) {
      return user.user_metadata.full_name;
    }
    if (user?.email) {
      return user.email.split("@")[0];
    }
    return "User";
  }, [user]);

  // Handle logout with error handling
  const handleLogout = React.useCallback(async () => {
    try {
      onClose();
      await signOut();
      window.location.href = '/';
    } catch (error) {
      console.error('Logout failed:', error);
      window.location.href = '/';
    }
  }, [onClose, signOut]);

  // Handle menu item click
  const handleMenuItemClick = React.useCallback((label: string) => {
    setActiveItem(label);
    if (isMobile) {
      onClose();
    }
  }, [isMobile, onClose]);

  return (
    <aside 
      ref={sidebarRef}
      className={`bg-white border-r border-slate-200 overflow-y-auto ${isMobile ? "fixed left-0 top-0 z-50 h-screen w-72 max-w-[85vw] shadow-2xl" : "relative h-[calc(100vh-64px)] w-64 hidden md:block"}`}
      role="navigation"
      aria-label="Main navigation"
    >
      {/* Sidebar Header */}
      <div className="p-6 border-b border-slate-200">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center">
            <span className="text-emerald-600 font-semibold text-lg">
              {userName.charAt(0).toUpperCase()}
            </span>
          </div>
          <div className="flex-1 min-w-0">
            <span className="block text-sm font-semibold text-slate-900 truncate">
              {userName}
            </span>
            <span className="block text-xs text-slate-500 truncate">
              {user?.email || "user@example.com"}
            </span>
          </div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <ThemeToggle />
            <button 
              className={`p-2 rounded-lg hover:bg-slate-100 transition-colors ${isMobile ? "" : "hidden"}`} 
              onClick={onClose} 
              aria-label="Close menu"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Menu Items */}
      <div className="py-6">
        {menuItems.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={`w-full flex items-center gap-3 px-6 py-3.5 text-sm font-medium transition-all border-r-2 ${
              activeItem === item.label 
                ? 'text-emerald-600 bg-emerald-50 border-emerald-600' 
                : 'text-slate-500 hover:bg-slate-50 border-transparent hover:text-slate-900'
            }`}
            onClick={() => handleMenuItemClick(item.label)}
            role="menuitem"
          >
            <item.icon size={18} />
            {item.label}
          </Link>
        ))}
      </div>

      {/* Logout Button */}
      <div className="sticky bottom-0 left-0 right-0 mt-4 p-6 border-t border-slate-200 bg-white">
        <button
          className="w-full flex items-center gap-3 px-4 py-3 text-sm font-medium text-slate-700 rounded-lg hover:bg-slate-100 transition-colors"
          onClick={handleLogout}
          aria-label="Log out"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-4 h-4">
            <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
            <polyline points="16 17 21 12 16 7" />
            <line x1="21" y1="12" x2="9" y2="12" />
          </svg>
          Log Out
        </button>
      </div>
    </aside>
  );
});
