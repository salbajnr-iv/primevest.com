"use client";

import * as React from "react";
import Link from "next/link";
<<<<<<< HEAD
import { useState } from "react";
import Image from "next/image";
import MobileThemeToggle from "@/components/MobileThemeToggle";
=======
>>>>>>> 02bdcb7 (Initial commit)

interface NavItemProps {
  href?: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  onClick?: () => void;
  isMenu?: boolean;
}

function NavItem({ href, icon, label, active, onClick, isMenu }: NavItemProps) {
  const content = (
    <>
      <div className={`nav-icon ${isMenu ? "nav-icon-menu" : ""}`}>{icon}</div>
      <span>{label}</span>
    </>
  );

  if (href) {
    return (
      <Link href={href} className={`nav-item ${active ? "active" : ""}`}>
        {content}
      </Link>
    );
  }

  return (
    <button className={`nav-item nav-button ${active ? "active" : ""}`} onClick={onClick}>
      {content}
    </button>
  );
}

interface BottomNavProps {
  onMenuClick?: () => void;
  isMenuActive?: boolean;
}

export default function BottomNav({ onMenuClick, isMenuActive }: BottomNavProps) {
  const [activePath, setActivePath] = React.useState("/dashboard");
<<<<<<< HEAD
  const [isMenuOpen, setIsMenuOpen] = useState(false);
=======
>>>>>>> 02bdcb7 (Initial commit)

  React.useEffect(() => {
    if (typeof window !== "undefined") {
      setActivePath(window.location.pathname);
    }
  }, []);

<<<<<<< HEAD
  // Language options
  const languages = [
    { code: "en", name: "English" },
    { code: "fr-xx", name: "Français" },
    { code: "es-xx", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
  ];

  return (
    <>
      {/* Mobile Navigation */}
      <nav className="nav hide-on-desktop responsive-animation">
        <div className="nav-inner">
          <NavItem
            href="/dashboard"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
                <polyline points="9 22 9 12 15 12 15 22" />
              </svg>
            }
            label="Home"
            active={activePath === "/dashboard"}
          />
          <NavItem
            href="/dashboard"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <rect x="3" y="3" width="7" height="7" />
                <rect x="14" y="3" width="7" height="7" />
                <rect x="14" y="14" width="7" height="7" />
                <rect x="3" y="14" width="7" height="7" />
              </svg>
            }
            label="Portfolio"
            active={activePath === "/dashboard"}
          />
          <NavItem
            href="/dashboard/trade"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                <polyline points="17 6 23 6 23 12" />
              </svg>
            }
            label="Trade"
            active={activePath.includes("/trade")}
          />
          <NavItem
            href="/markets"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
                <line x1="11" y1="8" x2="11" y2="14" />
                <line x1="8" y1="11" x2="14" y2="11" />
              </svg>
            }
            label="Markets"
            active={activePath === "/markets"}
          />
          <NavItem
            href="/crypto"
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
            }
            label="Crypto"
            active={activePath === "/crypto"}
          />
          <NavItem
            icon={<MobileThemeToggle />}
            label="Theme"
            active={false}
            onClick={() => {}}
            isMenu={false}
          />
          <NavItem
            icon={
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            }
            label="Menu"
            active={isMenuActive}
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            isMenu
          />
        </div>
      </nav>

      {/* Mobile Menu Overlay */}
      {isMenuOpen && (
        <div className="lg:hidden fixed inset-0 z-50 bg-black/50 responsive-animation" onClick={() => setIsMenuOpen(false)}>
          <div className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl p-4 sm:p-6 max-h-[80vh] overflow-y-auto responsive-animation" onClick={(e) => e.stopPropagation()}>
            <div className="flex justify-between items-center mb-6">
              <h3 className="text-lg font-semibold text-responsive-lg">Menu</h3>
              <button
                onClick={() => setIsMenuOpen(false)}
                className="p-2 rounded-full hover:bg-gray-100 transition-colors responsive-animation"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                  <path d="M18 6L6 18M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4 sm:space-y-6">
              {/* Invest Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Invest</h4>
                <div className="space-y-2">
                  <Link href="/crypto" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <Image src="https://sbcdn.bitpanda.com/150x150/8d8c9de4b4/menu-icons-_crypto.svg" alt="Cryptocurrencies" width={24} height={24} className="mr-3" />
                    <span className="text-sm text-responsive-sm">Cryptocurrencies</span>
                  </Link>
                  <Link href="/stocks" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <Image src="https://sbcdn.bitpanda.com/150x150/4aad9dd252/menu-icons-_stocks.svg" alt="Stocks" width={24} height={24} className="mr-3" />
                    <span className="text-sm text-responsive-sm">Stocks*</span>
                  </Link>
                  <Link href="/etfs" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <Image src="https://sbcdn.bitpanda.com/150x150/fbd0d7db23/menu-icons-_etfs.svg" alt="ETFs" width={24} height={24} className="mr-3" />
                    <span className="text-sm text-responsive-sm">ETFs*</span>
                  </Link>
                  <Link href="/metals" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <Image src="https://sbcdn.bitpanda.com/150x150/0e9a595fd4/menu-icons-_metals.svg" alt="Precious Metals" width={24} height={24} className="mr-3" />
                    <span className="text-sm text-responsive-sm">Precious Metals</span>
                  </Link>
                </div>
              </div>

              {/* Trading Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Trading</h4>
                <div className="space-y-2">
                  <Link href="/pro" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Pro Trading</span>
                  </Link>
                  <Link href="/algo" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Algo Trading</span>
                  </Link>
                </div>
              </div>

              {/* Learn Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Learn</h4>
                <div className="space-y-2">
                  <Link href="/tutorials" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M4 19.5A2.5 2.5 0 016.5 17H20" />
                        <path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Tutorials</span>
                  </Link>
                  <Link href="/academy" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-indigo-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M22 10v6M2 10l10-5 10 5-10 5z" />
                        <path d="M6 12v5c3 3 9 3 12 0v-5" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Academy</span>
                  </Link>
                  <Link href="/blog" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-pink-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Blog</span>
                  </Link>
                </div>
              </div>

              {/* Prices Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Prices</h4>
                <div className="space-y-2">
                  <Link href="/markets" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M3 3v18h18" />
                        <path d="M18.7 8l-5.1 5.2-2.8-2.7L7 14.3" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Markets</span>
                  </Link>
                  <Link href="/watchlists" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Watchlists</span>
                  </Link>
                </div>
              </div>

              {/* More Options */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">More</h4>
                <div className="space-y-2">
                  <Link href="/fees" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-orange-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Fees</span>
                  </Link>
                  <Link href="/support" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="w-6 h-6 bg-teal-100 rounded-full flex items-center justify-center mr-3">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-4 h-4">
                        <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                      </svg>
                    </span>
                    <span className="text-sm text-responsive-sm">Support</span>
                  </Link>
                </div>
              </div>

              {/* Account Section */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Account</h4>
                <div className="space-y-2">
                  <Link href="/auth/signin" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors border border-gray-300 responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-sm font-medium text-responsive-sm">Log in</span>
                  </Link>
                  <Link href="/auth/signup" className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-colors bg-blue-600 text-white responsive-animation" onClick={() => setIsMenuOpen(false)}>
                    <span className="text-sm font-medium text-responsive-sm">Sign up</span>
                  </Link>
                </div>
              </div>

              {/* Language Selector */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3 text-responsive-sm">Language</h4>
                <div className="space-y-2">
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="w-full text-left p-3 rounded-xl hover:bg-gray-50 transition-colors responsive-animation"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      <span className="text-sm text-responsive-sm">{lang.name}</span>
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
=======
  return (
    <nav className="nav hide-on-desktop">
      <div className="nav-inner">
        <NavItem
          href="/dashboard"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
          }
          label="Home"
          active={activePath === "/dashboard"}
        />
        <NavItem
          href="/dashboard"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="3" width="7" height="7" />
              <rect x="14" y="3" width="7" height="7" />
              <rect x="14" y="14" width="7" height="7" />
              <rect x="3" y="14" width="7" height="7" />
            </svg>
          }
          label="Portfolio"
          active={activePath === "/dashboard"}
        />
        <NavItem
          href="/dashboard/trade"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
              <polyline points="17 6 23 6 23 12" />
            </svg>
          }
          label="Trade"
          active={activePath.includes("/trade")}
        />
        <NavItem
          href="/markets"
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
              <line x1="11" y1="8" x2="11" y2="14" />
              <line x1="8" y1="11" x2="14" y2="11" />
            </svg>
          }
          label="Markets"
          active={activePath === "/markets"}
        />
        <NavItem
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          }
          label="Menu"
          active={isMenuActive}
          onClick={onMenuClick}
          isMenu
        />
      </div>
    </nav>
>>>>>>> 02bdcb7 (Initial commit)
  );
}

