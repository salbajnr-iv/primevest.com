"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Wallet, ArrowLeftRight, Settings } from "lucide-react";

const items = [
  { href: "/dashboard", label: "Dashboard", Icon: LayoutDashboard },
  { href: "/wallets", label: "Wallets", Icon: Wallet },
  { href: "/wallets/transfer", label: "Transfer", Icon: ArrowLeftRight },
  { href: "/settings", label: "Settings", Icon: Settings },
];

interface BottomNavProps {
  onMenuClick?: () => void;
  isMenuActive?: boolean;
}

export default function BottomNav({ onMenuClick, isMenuActive = false }: BottomNavProps) {
  const pathname = usePathname();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 border-t border-gray-200 bg-white/95 backdrop-blur md:hidden">
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
        {items.map(({ href, label, Icon }) => {
          const active = pathname?.startsWith(href);
          return (
            <li key={href}>
              <Link
                href={href}
                className={`flex flex-col items-center justify-center gap-1 py-2 text-xs ${
                  active ? "text-green-700" : "text-gray-500"
                }`}
              >
                <Icon size={18} />
                <span>{label}</span>
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
