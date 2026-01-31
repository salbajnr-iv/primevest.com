"use client";

<<<<<<< HEAD
// BitpandaNavbar content has been merged into BottomNav component
// This component is now empty as all navigation functionality has been moved to BottomNav

export default function BitpandaNavbar() {
  return null;
}
=======
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
    <header className="sticky top-0 z-50 bg-[#1e3930] border-b border-green-900">
      <div className="bp-container">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center h-full">
            <div className="flex items-center h-full">
              <Image
                src="/bitpanda-logo.svg"
                alt="Bitpanda Pro logo"
                width={120}
                height={40}
                style={{
                  height: "100%",
                  maxWidth: "140px",
                  objectFit: "contain",
                }}
                priority
              />
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden lg:flex items-center space-x-8">
            <div
              className="relative group"
              onMouseEnter={() => setIsInvestOpen(true)}
              onMouseLeave={() => setIsInvestOpen(false)}
            >
              <button className="flex items-center text-white hover:text-green-200 font-medium">
                Invest
                <svg
                  className="ml-1 w-4 h-4"
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
                <div
                  className="absolute top-full left-0 mt-2 w-[600px] bg-white shadow-lg rounded-md border border-gray-200 py-4 px-6"
                  onMouseEnter={() => setIsInvestOpen(true)}
                  onMouseLeave={() => setIsInvestOpen(false)}
                >
                  <div className="grid grid-cols-2 gap-6">
                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Invest in:
                      </div>
                      <div className="space-y-3">
                        {investItems.map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="navbar-hover-section-link flex items-start p-2 rounded hover:bg-gray-50"
                            onClick={() => setIsInvestOpen(false)}
                          >
                            <Image
                              src={item.icon}
                              alt={item.title}
                              width={36}
                              height={36}
                              className="mr-3"
                            />
                            <div>
                              <div className="flex items-center">
                                <span className="text-navbar-content font-medium text-gray-900">
                                  {item.title}
                                </span>
                                {item.isNew && (
                                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                                    New
                                  </span>
                                )}
                              </div>
                              <small className="text-gray-500 text-xs">
                                {item.description}
                              </small>
                            </div>
                          </Link>
                        ))}
                      </div>
                    </div>

                    <div>
                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3">
                        Top Leverage
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {leverageItems.slice(0, 4).map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="navbar-hover-section-link flex items-center p-2 rounded hover:bg-gray-50"
                            onClick={() => setIsInvestOpen(false)}
                          >
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={30}
                              height={30}
                              className="mr-2"
                            />
                            <div>
                              <span className="text-navbar-content text-gray-900 text-sm">
                                {item.name}
                              </span>
                              <small className="text-gray-500 text-xs block">
                                {item.symbol}
                              </small>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href="/prices/cryptocurrencies"
                          className="navbar-common-link flex items-center p-2 rounded hover:bg-gray-50 col-span-2"
                          onClick={() => setIsInvestOpen(false)}
                        >
                          <div>
                            <span className="text-navbar-content text-gray-900 text-sm">
                              See all Cryptocurrencies
                            </span>
                          </div>
                        </Link>
                      </div>

                      <div className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-3 mt-4">
                        Precious Metals
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        {metalsItems.slice(0, 4).map((item, index) => (
                          <Link
                            key={index}
                            href={item.href}
                            className="navbar-hover-section-link flex items-center p-2 rounded hover:bg-gray-50"
                            onClick={() => setIsInvestOpen(false)}
                          >
                            <Image
                              src={item.icon}
                              alt={item.name}
                              width={30}
                              height={30}
                              className="mr-2"
                            />
                            <div>
                              <span className="text-navbar-content text-gray-900 text-sm">
                                {item.name}
                              </span>
                            </div>
                          </Link>
                        ))}
                        <Link
                          href="/prices/precious-metals"
                          className="navbar-common-link flex items-center p-2 rounded hover:bg-gray-50 col-span-2"
                          onClick={() => setIsInvestOpen(false)}
                        >
                          <div>
                            <span className="text-navbar-content text-gray-900 text-sm">
                              See all Precious Metals
                            </span>
                          </div>
                        </Link>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsPricesOpen(true)}
              onMouseLeave={() => setIsPricesOpen(false)}
            >
              <button className="flex items-center text-white hover:text-green-200 font-medium">
                Prices
                <svg
                  className="ml-1 w-4 h-4"
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
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 py-2"
                  onMouseEnter={() => setIsPricesOpen(true)}
                  onMouseLeave={() => setIsPricesOpen(false)}
                >
                  <Link
                    href="/markets"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsPricesOpen(false)}
                  >
                    Markets
                  </Link>
                  <Link
                    href="/watchlists"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsPricesOpen(false)}
                  >
                    Watchlists
                  </Link>
                </div>
              )}
            </div>

            <div
              className="relative"
              onMouseEnter={() => setIsTradingOpen(true)}
              onMouseLeave={() => setIsTradingOpen(false)}
            >
              <button className="flex items-center text-white hover:text-green-200 font-medium">
                <span className="flex items-center">
                  Trading
                  <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                    new
                  </span>
                </span>
                <svg
                  className="ml-1 w-4 h-4"
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
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 py-2"
                  onMouseEnter={() => setIsTradingOpen(true)}
                  onMouseLeave={() => setIsTradingOpen(false)}
                >
                  <Link
                    href="/pro"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsTradingOpen(false)}
                  >
                    Pro Trading
                  </Link>
                  <Link
                    href="/algo"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsTradingOpen(false)}
                  >
                    Algo Trading
                  </Link>
                </div>
              )}
            </div>

            <Link
              href="/fees"
              className="text-white hover:text-green-200 font-medium"
            >
              Fees
            </Link>

            <div
              className="relative"
              onMouseEnter={() => setIsLearnOpen(true)}
              onMouseLeave={() => setIsLearnOpen(false)}
            >
              <button className="flex items-center text-white hover:text-green-200 font-medium">
                Learn
                <svg
                  className="ml-1 w-4 h-4"
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
                <div
                  className="absolute top-full left-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 py-2"
                  onMouseEnter={() => setIsLearnOpen(true)}
                  onMouseLeave={() => setIsLearnOpen(false)}
                >
                  <Link
                    href="/tutorials"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsLearnOpen(false)}
                  >
                    Tutorials
                  </Link>
                  <Link
                    href="/academy"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsLearnOpen(false)}
                  >
                    Academy
                  </Link>
                  <Link
                    href="/blog"
                    className="block px-4 py-2 hover:bg-gray-50 text-gray-900"
                    onClick={() => setIsLearnOpen(false)}
                  >
                    Blog
                  </Link>
                </div>
              )}
            </div>
          </nav>

          {/* Auth Buttons and Language Selector */}
          <div className="hidden lg:flex items-center space-x-3">
            <div className="relative">
              <button
                className="flex items-center text-white hover:text-green-200"
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
                  className="ml-1 w-4 h-4"
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

              {isLanguageOpen && (
                <div
                  className="absolute right-0 mt-2 w-48 bg-white shadow-lg rounded-md border border-gray-200 py-2"
                  onMouseEnter={() => setIsLanguageOpen(true)}
                  onMouseLeave={() => setIsLanguageOpen(false)}
                >
                  {languages.map((lang) => (
                    <button
                      key={lang.code}
                      className="block w-full text-left px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                      onClick={() => setIsLanguageOpen(false)}
                    >
                      {lang.name}
                    </button>
                  ))}
                </div>
              )}
            </div>

            <Link href="/auth/signin" className="bp-button bp-button-secondary">
              Log in
            </Link>
            <Link href="/auth/signup" className="bp-button bp-button-primary">
              Sign-up
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            className="lg:hidden p-2"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label={isMenuOpen ? "Close menu" : "Open menu"}
          >
            <svg
              className="w-6 h-6"
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
          <div className="lg:hidden py-4 border-t border-green-900">
            <div className="space-y-4">
              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-white"
                  onClick={() => setIsInvestOpen(!isInvestOpen)}
                >
                  Invest
                  <svg
                    className={`w-4 h-4 transition-transform ${
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
                  <div className="mt-2 pl-4 space-y-2">
                    <Link
                      href="/crypto"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Cryptocurrencies
                    </Link>
                    <Link
                      href="/stocks"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Stocks*
                    </Link>
                    <Link
                      href="/etfs"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      ETFs*
                    </Link>
                    <Link
                      href="/commodities"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Commodities*
                    </Link>
                    <Link
                      href="/indices"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Crypto Indices
                    </Link>
                    <Link
                      href="/metals"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Precious Metals
                    </Link>
                    <Link
                      href="/leverage"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Leverage
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-white"
                  onClick={() => setIsPricesOpen(!isPricesOpen)}
                >
                  Prices
                  <svg
                    className={`w-4 h-4 transition-transform ${
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
                  <div className="mt-2 pl-4 space-y-2">
                    <Link
                      href="/markets"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Markets
                    </Link>
                    <Link
                      href="/watchlists"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Watchlists
                    </Link>
                  </div>
                )}
              </div>

              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-white"
                  onClick={() => setIsTradingOpen(!isTradingOpen)}
                >
                  <span className="flex items-center">
                    Trading
                    <span className="ml-2 px-2 py-0.5 text-xs font-medium bg-green-100 text-green-800 rounded-full">
                      new
                    </span>
                  </span>
                  <svg
                    className={`w-4 h-4 transition-transform ${
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
                  <div className="mt-2 pl-4 space-y-2">
                    <Link
                      href="/pro"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Pro Trading
                    </Link>
                    <Link
                      href="/algo"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Algo Trading
                    </Link>
                  </div>
                )}
              </div>

              <Link href="/fees" className="block font-medium text-white">
                Fees
              </Link>

              <div>
                <button
                  className="flex items-center justify-between w-full text-left font-medium text-white"
                  onClick={() => setIsLearnOpen(!isLearnOpen)}
                >
                  Learn
                  <svg
                    className={`w-4 h-4 transition-transform ${
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
                  <div className="mt-2 pl-4 space-y-2">
                    <Link
                      href="/tutorials"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Tutorials
                    </Link>
                    <Link
                      href="/academy"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Academy
                    </Link>
                    <Link
                      href="/blog"
                      className="block py-2 text-green-200"
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Blog
                    </Link>
                  </div>
                )}
              </div>

              <div className="pt-4 space-y-3">
                <Link
                  href="/auth/signin"
                  className="block bp-button bp-button-secondary w-full text-center"
                  onClick={() => setIsMenuOpen(false)}
                >
                  Log in
                </Link>
                <Link
                  href="/auth/signup"
                  className="block bp-button bp-button-primary w-full text-center"
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
>>>>>>> 02bdcb7 (Initial commit)
