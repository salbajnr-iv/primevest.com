"use client";

import Link from "next/link";
import { useState } from "react";
import Image from "next/image";

export default function BitpandaNavbar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isInvestOpen, setIsInvestOpen] = useState(false);
  const [isPricesOpen, setIsPricesOpen] = useState(false);
  const [isTradingOpen, setIsTradingOpen] = useState(false);
  const [isLearnOpen, setIsLearnOpen] = useState(false);
  const [isLanguageOpen, setIsLanguageOpen] = useState(false);

  // Language options
  const languages = [
    { code: "en", name: "English" },
    { code: "fr-xx", name: "Français" },
    { code: "es-xx", name: "Español" },
    { code: "de", name: "Deutsch" },
    { code: "it", name: "Italiano" },
  ];

  // Invest dropdown items
  const investItems = [
    {
      href: "/crypto",
      icon: "https://sbcdn.bitpanda.com/150x150/8d8c9de4b4/menu-icons-_crypto.svg",
      title: "Cryptocurrencies",
      description: "Buy, sell & swap cryptocurrencies",
      isNew: false,
    },
    {
      href: "/metals",
      icon: "https://sbcdn.bitpanda.com/150x150/0e9a595fd4/menu-icons-_metals.svg",
      title: "Precious Metals",
      description: "Invest in precious metals",
      isNew: false,
    },
    {
      href: "/stocks",
      icon: "https://sbcdn.bitpanda.com/150x150/4aad9dd252/menu-icons-_stocks.svg",
      title: "Stocks*",
      description: "Invest in stocks with zero commissions",
      isNew: false,
    },
    {
      href: "/etfs",
      icon: "https://sbcdn.bitpanda.com/150x150/fbd0d7db23/menu-icons-_etfs.svg",
      title: "ETFs*",
      description: "Invest in ETFs 24/7",
      isNew: false,
    },
    {
      href: "/indices",
      icon: "https://sbcdn.bitpanda.com/150x150/99981c86d1/menu-icons-_bci.svg",
      title: "Crypto Indices",
      description: "The world's first real crypto index",
      isNew: false,
    },
    {
      href: "/commodities",
      icon: "https://sbcdn.bitpanda.com/150x150/2678f11a47/menu-icons-_commoditie.svg",
      title: "Commodities*",
      description: "Invest in commodities 24/7",
      isNew: false,
    },
    {
      href: "/leverage",
      icon: "https://sbcdn.bitpanda.com/150x150/78bdc95aa6/menu-icons-_weath-07.svg",
      title: "Leverage",
      description: "Go Long or Short on top cryptocurrencies",
      isNew: true,
    },
  ];

  // Top leverage items
  const leverageItems = [
    {
      href: "/prices/bitcoin",
      name: "Bitcoin",
      symbol: "BTC",
      icon: "https://a.storyblok.com/f/167140/x/6bfae2b6f5/asset-btc.svg",
    },
    {
      href: "/prices/ethereum",
      name: "Ethereum",
      symbol: "ETH",
      icon: "https://sbcdn.bitpanda.com/32x32/e3e26994c3/asset-eth.svg",
    },
    {
      href: "/prices/solana",
      name: "Solana",
      symbol: "SOL",
      icon: "https://sbcdn.bitpanda.com/135x135/7ad7935213/asset-solana-sol.png",
    },
    {
      href: "/prices/doge",
      name: "Dogecoin",
      symbol: "DOGE",
      icon: "https://sbcdn.bitpanda.com/36x36/ae9eb22382/asset-dogecoin-doge.svg",
    },
    {
      href: "/prices/shiba",
      name: "Shiba Inu",
      symbol: "SHIB",
      icon: "https://sbcdn.bitpanda.com/32x32/1c34769278/asset-shiba-inu.svg",
    },
    {
      href: "/prices/xrp",
      name: "XRP",
      symbol: "XRP",
      icon: "https://sbcdn.bitpanda.com/32x32/53760d755f/asset-xrp.svg",
    },
    {
      href: "/prices/vision",
      name: "Vision",
      symbol: "VSN",
      icon: "https://sbcdn.bitpanda.com/512x512/83163fbadd/vision-vsn.png",
    },
  ];

  // Metals items
  const metalsItems = [
    {
      href: "/prices/gold",
      name: "Gold",
      symbol: "XAU",
      icon: "https://a.storyblok.com/f/167140/x/a16b96aae3/xau.svg",
    },
    {
      href: "/prices/silver",
      name: "Silver",
      symbol: "XAG",
      icon: "https://a.storyblok.com/f/167140/x/1e7ede93c8/xag.svg",
    },
    {
      href: "/prices/palladium",
      name: "Palladium",
      symbol: "XPD",
      icon: "https://a.storyblok.com/f/167140/x/b8a940f730/xpd.svg",
    },
    {
      href: "/prices/platinum",
      name: "Platinum",
      symbol: "XPT",
      icon: "https://a.storyblok.com/f/167140/x/432ab3cf55/xpt.svg",
    },
  ];

  return (
    <header className="sticky top-0 z-50 bg-white/95 backdrop-blur-xl border-b border-gray-100 shadow-sm transition-professional">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full group">
            <div className="flex items-center h-full">
              <Image
                src="/bitpanda-logo.svg"
                alt="Bitpanda Pro logo"
                width={140}
                height={48}
                style={{
                  height: "100%",
                  maxWidth: "160px",
                  objectFit: "contain",
                }}
                priority
                className="transition-transform duration-300 group-hover:scale-105"
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-8">
            {/* Invest Dropdown */}
            <div className="relative group">
              <button className="text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 font-medium flex items-center gap-1 focus-enhanced py-3 px-2 rounded-xl hover:bg-gray-50">
                Invest
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-3 w-[600px] bg-[var(--color-neutrals-card-fill-primary)] shadow-2xl rounded-2xl border border-gray-100 py-5 px-6 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 card-premium">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <div className="text-xs font-semibold text-[var(--color-neutrals-text-secondary)] uppercase tracking-wider mb-4">
                      Invest in:
                    </div>
                    <div className="space-y-1">
                      {investItems.map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-start p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group/link"
                          onClick={() => setIsInvestOpen(false)}
                        >
                          <Image
                            src={item.icon}
                            alt={item.title}
                            width={36}
                            height={36}
                            className="mr-3 flex-shrink-0"
                          />
                          <div className="flex-1 min-w-0">
                            <div className="flex items-center">
                              <span className="font-medium text-[var(--color-neutrals-text-primary)] group-hover/link:text-[var(--color-brand-text-primary)] transition-colors duration-200">
                                {item.title}
                              </span>
                              {item.isNew && (
                                <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-[var(--color-positive-fill-primary)] text-[var(--color-positive-text-primary-inverted)] rounded-full">
                                  New
                                </span>
                              )}
                            </div>
                            <small className="text-[var(--color-neutrals-text-secondary)] text-xs block mt-1">
                              {item.description}
                            </small>
                          </div>
                        </Link>
                      ))}
                    </div>
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-[var(--color-neutrals-text-secondary)] uppercase tracking-wider mb-4">
                      Top Leverage
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {leverageItems.slice(0, 4).map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group/link"
                          onClick={() => setIsInvestOpen(false)}
                        >
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={30}
                            height={30}
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[var(--color-neutrals-text-primary)] text-sm font-medium block group-hover/link:text-[var(--color-brand-text-primary)] transition-colors duration-200">
                              {item.name}
                            </span>
                            <small className="text-[var(--color-neutrals-text-secondary)] text-xs block">
                              {item.symbol}
                            </small>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href="/prices/cryptocurrencies"
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 col-span-2 group/link"
                        onClick={() => setIsInvestOpen(false)}
                      >
                        <span className="text-[var(--color-neutrals-text-primary)] text-sm font-medium group-hover/link:text-[var(--color-brand-text-primary)] transition-colors duration-200">
                          See all Cryptocurrencies
                        </span>
                      </Link>
                    </div>

                    <div className="text-xs font-semibold text-[var(--color-neutrals-text-secondary)] uppercase tracking-wider mb-4 mt-5">
                      Precious Metals
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                      {metalsItems.slice(0, 4).map((item, index) => (
                        <Link
                          key={index}
                          href={item.href}
                          className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 group/link"
                          onClick={() => setIsInvestOpen(false)}
                        >
                          <Image
                            src={item.icon}
                            alt={item.name}
                            width={30}
                            height={30}
                            className="mr-2 flex-shrink-0"
                          />
                          <div className="min-w-0">
                            <span className="text-[var(--color-neutrals-text-primary)] text-sm font-medium group-hover/link:text-[var(--color-brand-text-primary)] transition-colors duration-200">
                              {item.name}
                            </span>
                          </div>
                        </Link>
                      ))}
                      <Link
                        href="/prices/precious-metals"
                        className="flex items-center p-3 rounded-xl hover:bg-gray-50 transition-all duration-200 col-span-2 group/link"
                        onClick={() => setIsInvestOpen(false)}
                      >
                        <span className="text-[var(--color-neutrals-text-primary)] text-sm font-medium group-hover/link:text-[var(--color-brand-text-primary)] transition-colors duration-200">
                          See all Precious Metals
                        </span>
                      </Link>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Prices Dropdown */}
            <div className="relative group">
              <button className="text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 font-medium flex items-center gap-1 focus-enhanced py-3 px-2 rounded-xl hover:bg-gray-50">
                Prices
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-3 w-52 bg-[var(--color-neutrals-card-fill-primary)] shadow-2xl rounded-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 card-premium">
                <Link
                  href="/markets"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsPricesOpen(false)}
                >
                  Markets
                </Link>
                <Link
                  href="/watchlists"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsPricesOpen(false)}
                >
                  Watchlists
                </Link>
              </div>
            </div>

            {/* Trading Dropdown */}
            <div className="relative group">
              <button className="text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 font-medium flex items-center gap-1 focus-enhanced py-3 px-2 rounded-xl hover:bg-gray-50">
                <span className="flex items-center">
                  Trading
                  <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-[var(--color-positive-fill-primary)] text-[var(--color-positive-text-primary-inverted)] rounded-full">
                    new
                  </span>
                </span>
                <svg
                  className="w-4 h-4 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-3 w-52 bg-[var(--color-neutrals-card-fill-primary)] shadow-2xl rounded-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 card-premium">
                <Link
                  href="/pro"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsTradingOpen(false)}
                >
                  Pro Trading
                </Link>
                <Link
                  href="/algo"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsTradingOpen(false)}
                >
                  Algo Trading
                </Link>
              </div>
            </div>

            {/* Fees Link */}
            <Link
              href="/fees"
              className="text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 font-medium focus-enhanced py-3 px-2 rounded-xl hover:bg-gray-50"
            >
              Fees
            </Link>

            {/* Learn Dropdown */}
            <div className="relative group">
              <button className="text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 font-medium flex items-center gap-1 focus-enhanced py-3 px-2 rounded-xl hover:bg-gray-50">
                Learn
                <svg
                  className="w-4 h-4 ml-1 transition-transform duration-300 group-hover:rotate-180"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute top-full left-0 mt-3 w-52 bg-[var(--color-neutrals-card-fill-primary)] shadow-2xl rounded-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 card-premium">
                <Link
                  href="/tutorials"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsLearnOpen(false)}
                >
                  Tutorials
                </Link>
                <Link
                  href="/academy"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsLearnOpen(false)}
                >
                  Academy
                </Link>
                <Link
                  href="/blog"
                  className="block px-4 py-3 hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                  onClick={() => setIsLearnOpen(false)}
                >
                  Blog
                </Link>
              </div>
            </div>
          </nav>

          {/* Auth Buttons and Language Selector */}
          <div className="hidden lg:flex items-center gap-4">
            {/* Language Selector */}
            <div className="relative group">
              <button
                className="flex items-center text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] transition duration-300 p-2 rounded-xl hover:bg-gray-50 focus-enhanced"
                onClick={() => setIsLanguageOpen(!isLanguageOpen)}
                aria-label="Select language"
              >
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 104 0 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
                <svg
                  className="ml-1 w-4 h-4 transition-transform duration-300"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M19 9l-7 7-7-7"
                  />
                </svg>
              </button>

              <div className="absolute right-0 mt-3 w-48 bg-[var(--color-neutrals-card-fill-primary)] shadow-2xl rounded-2xl border border-gray-100 py-3 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 z-50 card-premium">
                {languages.map((lang) => (
                  <button
                    key={lang.code}
                    className="block w-full text-left px-4 py-3 text-sm text-[var(--color-neutrals-text-primary)] hover:bg-gray-50 hover:text-[var(--color-brand-text-primary)] rounded-xl mx-2 transition-all duration-200"
                    onClick={() => setIsLanguageOpen(false)}
                  >
                    {lang.name}
                  </button>
                ))}
              </div>
            </div>

            {/* Login Button */}
            <Link 
              href="/auth/signin" 
              className="bg-white hover:bg-gray-50 text-[var(--color-neutrals-text-primary)] px-6 py-3 rounded-xl transition-all duration-300 font-medium border border-gray-300 shadow-sm hover:shadow-md btn-refined focus-enhanced"
            >
              Log in
            </Link>
            
            {/* Signup Button */}
            <Link 
              href="/auth/signup" 
              className="bg-gradient-to-r from-[var(--color-brand-fill-primary)] to-[var(--color-brand-text-primary)] hover:from-[var(--color-brand-text-primary)] hover:to-[var(--color-brand-fill-pressed)] text-white px-6 py-3 rounded-xl transition-all duration-300 font-medium shadow-lg hover:shadow-xl transform hover:-translate-y-0.5 btn-refined focus-enhanced"
            >
              Sign-up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2 rounded-xl hover:bg-gray-50 transition-colors duration-200 focus-enhanced"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6 text-[var(--color-neutrals-text-primary)]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              )}
            </svg>
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="lg:hidden py-5 border-t border-gray-100 transition-professional">
            <div className="space-y-3">
              {/* Invest Section */}
              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-[var(--color-neutrals-text-primary)] py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsInvestOpen(!isInvestOpen)}
                >
                  Invest
                  <svg
                    className={`w-5 h-5 text-[var(--color-neutrals-text-secondary)] transition-transform duration-300 ${
                      isInvestOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isInvestOpen && (
                  <div className="mt-2 pl-5 space-y-2 border-l-2 border-gray-100 ml-2.5">
                    <Link
                      href="/crypto"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cryptocurrencies
                    </Link>
                    <Link
                      href="/stocks"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Stocks*
                    </Link>
                    <Link
                      href="/etfs"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ETFs*
                    </Link>
                    <Link
                      href="/commodities"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Commodities*
                    </Link>
                    <Link
                      href="/indices"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Crypto Indices
                    </Link>
                    <Link
                      href="/metals"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Precious Metals
                    </Link>
                    <Link
                      href="/leverage"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Leverage
                    </Link>
                  </div>
                )}
              </div>

              {/* Prices Section */}
              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-[var(--color-neutrals-text-primary)] py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsPricesOpen(!isPricesOpen)}
                >
                  Prices
                  <svg
                    className={`w-5 h-5 text-[var(--color-neutrals-text-secondary)] transition-transform duration-300 ${
                      isPricesOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isPricesOpen && (
                  <div className="mt-2 pl-5 space-y-2 border-l-2 border-gray-100 ml-2.5">
                    <Link
                      href="/markets"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Markets
                    </Link>
                    <Link
                      href="/watchlists"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Watchlists
                    </Link>
                  </div>
                )}
              </div>

              {/* Trading Section */}
              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-[var(--color-neutrals-text-primary)] py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsTradingOpen(!isTradingOpen)}
                >
                  <span className="flex items-center">
                    Trading
                    <span className="ml-2 px-2.5 py-0.5 text-xs font-medium bg-[var(--color-positive-fill-primary)] text-[var(--color-positive-text-primary-inverted)] rounded-full">
                      new
                    </span>
                  </span>
                  <svg
                    className={`w-5 h-5 text-[var(--color-neutrals-text-secondary)] transition-transform duration-300 ${
                      isTradingOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isTradingOpen && (
                  <div className="mt-2 pl-5 space-y-2 border-l-2 border-gray-100 ml-2.5">
                    <Link
                      href="/pro"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pro Trading
                    </Link>
                    <Link
                      href="/algo"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Algo Trading
                    </Link>
                  </div>
                )}
              </div>

              {/* Fees Link */}
              <Link 
                href="/fees" 
                className="block font-medium text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                onClick={() => setIsMenuOpen(false)}
              >
                Fees
              </Link>

              {/* Learn Section */}
              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-[var(--color-neutrals-text-primary)] py-3 px-3 rounded-xl hover:bg-gray-50 transition-colors duration-200"
                  onClick={() => setIsLearnOpen(!isLearnOpen)}
                >
                  Learn
                  <svg
                    className={`w-5 h-5 text-[var(--color-neutrals-text-secondary)] transition-transform duration-300 ${
                      isLearnOpen ? "rotate-180" : ""
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M19 9l-7 7-7-7"
                    />
                  </svg>
                </button>

                {isLearnOpen && (
                  <div className="mt-2 pl-5 space-y-2 border-l-2 border-gray-100 ml-2.5">
                    <Link
                      href="/tutorials"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tutorials
                    </Link>
                    <Link
                      href="/academy"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Academy
                    </Link>
                    <Link
                      href="/blog"
                      className="block py-3 px-4 text-[var(--color-neutrals-text-primary)] hover:text-[var(--color-brand-text-primary)] hover:bg-gray-50 rounded-xl transition-all duration-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Blog
                    </Link>
                  </div>
                )}
              </div>

              {/* Auth Buttons - Mobile */}
              <div className="pt-5 space-y-4 border-t border-gray-100 mt-5">
                <Link
                  href="/auth/signin"
                  className="block w-full text-center py-3 px-4 border border-gray-300 rounded-xl text-[var(--color-neutrals-text-primary)] font-medium hover:bg-gray-50 transition-all duration-200"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block w-full text-center py-3 px-4 bg-gradient-to-r from-[var(--color-brand-fill-primary)] to-[var(--color-brand-text-primary)] text-white rounded-xl font-medium hover:from-[var(--color-brand-text-primary)] hover:to-[var(--color-brand-fill-pressed)] transition-all duration-200 shadow-md hover:shadow-lg"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Sign-up
                </Link>
              </div>
            </div>
          </div>
        )}
      </div>
    </header>
  );
}