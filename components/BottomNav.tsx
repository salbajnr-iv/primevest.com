"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Icon } from "./Icon";
import type { IconAction } from "@/lib/ui/icon-config";
import { useWindowSize } from "@/docs/hooks/useWindowSize";
import { ROUTES } from "@/lib/routes";

const items = [
  { href: ROUTES.dashboard.home, label: "Dashboard", iconAction: "dashboard" as IconAction },
  { href: ROUTES.wallets.home, label: "Wallets", iconAction: "wallet" as IconAction },
  { href: ROUTES.wallets.transfer, label: "Transfer", iconAction: "transfer" as IconAction },
  { href: ROUTES.settings.home, label: "Settings", iconAction: "settings" as IconAction },
];

interface BottomNavProps {
  onMenuClick?: () => void;
  isMenuActive?: boolean;
}

export default function BottomNav({ onMenuClick, isMenuActive = false }: BottomNavProps) {
  const pathname = usePathname();
  
  // Auto-detect screen size for deterministic visibility
  const { isMobile, isTablet, isReady } = useWindowSize();
  
  // Only show bottom nav on mobile and tablet screens (width < 1024px)
  const showBottomNav = isReady && (isMobile || isTablet);

  if (!showBottomNav) {
    return null;
  }

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur">
      {onMenuClick ? (
        <button
          type="button"
          onClick={onMenuClick}
          className={`absolute -top-12 right-4 rounded-full px-3 py-2 text-xs ${isMenuActive ? "bg-green-700 text-white" : "bg-gray-800 text-white"}`}
        >
          Menu
        </button>
      ) : null}

      <ul className="grid grid-cols-4">
        {items.map(({ href, label, iconAction }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${
                  active ? "text-green-700" : "text-gray-500"
                }`}
              >
                <Icon action={iconAction} size="sm" color={active ? 'primary' : 'secondary'} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

