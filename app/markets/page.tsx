"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor, getCoinLogo } from "@/hooks/usePriceSimulation";

// Market data with icon paths
const initialMarketData: MarketData[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.00, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.50, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 312.40, change24h: -0.54, marketCap: 48200000000, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp", name: "Ripple", symbol: "XRP", price: 0.62, change24h: 0.89, marketCap: 33800000000, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.52, change24h: -1.23, marketCap: 18200000000, volume24h: 456000000, high24h: 0.54, low24h: 0.50, iconSrc: "/ada-logo.png" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.082, change24h: 5.67, marketCap: 11800000000, volume24h: 2100000000, high24h: 0.088, low24h: 0.075, iconSrc: "/doge-logo.png" },
  { id: "dot", name: "Polkadot", symbol: "DOT", price: 7.85, change24h: -2.34, marketCap: 10200000000, volume24h: 234000000, high24h: 8.20, low24h: 7.50, iconSrc: "/dot-logo.png" },
];

// Market categories
const categories = [
  { id: "all", label: "All" },
  { id: "trending", label: "Trending" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "defi", label: "DeFi" },
  { id: "metaverse", label: "Metaverse" },
];

// Sort options
type SortOption = "price_asc" | "price_desc" | "change_asc" | "change_desc" | "marketcap";

const sortOptions: { value: SortOption; label: string }[] = [
  { value: "price_desc", label: "Price ↓" },
  { value: "price_asc", label: "Price ↑" },
  { value: "change_desc", label: "24h % ↓" },
  { value: "change_asc", label: "24h % ↑" },
  { value: "marketcap", label: "Market Cap" } as { value: SortOption; label: string },
];

export default function MarketsPage() {
  const { data: marketData, lastUpdate, subscribeToCoin } = usePriceSimulation(initialMarketData, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [sortBy, setSortBy] = React.useState<SortOption>("price_desc");
  const [favorites, setFavorites] = React.useState<string[]>([]);
  const [selectedCoin, setSelectedCoin] = React.useState<MarketData | null>(null);

  // Load favorites from localStorage
  React.useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("marketFavorites");
    if (saved) {
      setFavorites(JSON.parse(saved));
    }
  }, []);

  // Save favorites to localStorage
  const toggleFavorite = (coinId: string) => {
    const newFavorites = favorites.includes(coinId)
      ? favorites.filter(id => id !== coinId)
      : [...favorites, coinId];
    setFavorites(newFavorites);
    localStorage.setItem("marketFavorites", JSON.stringify(newFavorites));
  };

  // Filter and sort markets
  const filteredMarkets = React.useMemo(() => {
    let result = [...marketData];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(
        m => m.name.toLowerCase().includes(query) || m.symbol.toLowerCase().includes(query)
      );
    }

    // Filter by category
    if (activeCategory === "gainers") {
      result = result.filter(m => m.change24h > 0);
    } else if (activeCategory === "losers") {
      result = result.filter(m => m.change24h < 0);
    } else if (activeCategory === "favorites") {
      result = result.filter(m => favorites.includes(m.id));
    }

    // Sort
    switch (sortBy) {
      case "price_asc":
        result.sort((a, b) => a.price - b.price);
        break;
      case "price_desc":
        result.sort((a, b) => b.price - a.price);
        break;
      case "change_asc":
        result.sort((a, b) => a.change24h - b.change24h);
        break;
      case "change_desc":
        result.sort((a, b) => b.change24h - a.change24h);
        break;
      case "marketcap":
        result.sort((a, b) => b.marketCap - a.marketCap);
        break;
    }

    return result;
  }, [marketData, searchQuery, activeCategory, sortBy, favorites]);

  // Get top movers
  const topGainer = React.useMemo(() => 
    [...marketData].sort((a, b) => b.change24h - a.change24h)[0],
    [marketData]
  );

  const topLoser = React.useMemo(() => 
    [...marketData].sort((a, b) => a.change24h - b.change24h)[0],
    [marketData]
  );

  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">MARKETS</span>
            <div className="header-title">
              Markets
              <span className="live-dot" style={{ marginLeft: 8 }}></span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="sync-btn" onClick={() => {}} title="Refresh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
            <button className="sync-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* MARKET STATS */}
        <section className="market-stats">
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">Total Market Cap</span>
              <span className="stat-value">2.42T</span>
              <span className="stat-change positive">+1.8%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">78.5B</span>
              <span className="stat-change negative">-2.3%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">BTC Dominance</span>
              <span className="stat-value">52.1%</span>
              <span className="stat-change negative">-0.2%</span>
            </div>
          </div>
        </section>

        {/* SEARCH & SORT */}
        <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
          <div className="market-search" style={{ flex: 1, marginTop: 0 }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="11" cy="11" r="8" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            <input
              type="text"
              placeholder="Search coins..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <select 
            className="order-input" 
            style={{ width: "auto", padding: "10px 12px", cursor: "pointer" }}
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
          >
            {sortOptions.map(opt => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>

        {/* CATEGORIES */}
        <div className="market-categories">
          {categories.map((cat) => (
            <button
              key={cat.id}
              className={`category-chip ${activeCategory === cat.id ? "active" : ""}`}
              onClick={() => setActiveCategory(cat.id)}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* MARKET LIST */}
        <section className="market-list">
          <div className="market-list-header">
            <span>Asset</span>
            <span>Price</span>
            <span>24h</span>
            <span>Market Cap</span>
          </div>
          <div className="market-list-body">
            {filteredMarkets.map((market) => (
              <div 
                key={market.id} 
                className="market-row"
                onClick={() => setSelectedCoin(market)}
              >
                <div className="market-asset">
                  <div 
                    className="asset-icon" 
                    style={{ background: getCoinColor(market.symbol) }}
                  >
                    {market.iconSrc ? (
                      <Image src={market.iconSrc} alt={market.name} width={20} height={20} unoptimized style={{ borderRadius: '50%' }} />
                    ) : (
                      <span style={{ color: "#fff", fontWeight: 700, fontSize: 12 }}>
                        {market.symbol.slice(0, 2)}
                      </span>
                    )}
                  </div>
                  <div className="asset-info">
                    <span className="asset-name">{market.name}</span>
                    <span className="asset-symbol">{market.symbol}</span>
                  </div>
                </div>
                <div className="market-price">
                  <span className="price-value">€{formatPrice(market.price, market.symbol)}</span>
                </div>
                <div className={`market-change ${market.change24h >= 0 ? "positive" : "negative"}`}>
                  {market.change24h >= 0 ? "+" : ""}{market.change24h.toFixed(2)}%
                </div>
                <div className="market-cap">
                  <span className="cap-value">{formatCompact(market.marketCap)}</span>
                </div>
                <button 
                  className="fav-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleFavorite(market.id);
                  }}
                  style={{ 
                    background: "none", 
                    border: "none",
                    cursor: "pointer",
                    color: favorites.includes(market.id) ? "#0f9d58" : "#ccc",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    padding: "4px"
                  }}
                >
                  <svg viewBox="0 0 24 24" fill={favorites.includes(market.id) ? "currentColor" : "none"} stroke="currentColor" strokeWidth="2" style={{ width: 16, height: 16 }}>
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </section>

        {/* TRENDING SECTION */}
        <section className="trending-section">
          <h3 className="section-title">Market Movers</h3>
          <div className="trending-list">
            {topGainer && (
              <div className="trending-item" onClick={() => setSelectedCoin(topGainer)}>
                <div className="trending-icon up">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 6 13.5 15.5 8.5 10.5 1 18" />
                    <polyline points="17 6 23 6 23 12" />
                  </svg>
                </div>
                <div className="trending-info">
                  <span className="trending-name">Top Gainer</span>
                  <span className="trending-value">{topGainer.symbol} +{topGainer.change24h.toFixed(2)}%</span>
                </div>
              </div>
            )}
            {topLoser && (
              <div className="trending-item" onClick={() => setSelectedCoin(topLoser)}>
                <div className="trending-icon down">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <polyline points="23 18 13.5 8.5 8.5 13.5 1 6" />
                    <polyline points="17 18 23 18 23 12" />
                  </svg>
                </div>
                <div className="trending-info">
                  <span className="trending-name">Top Loser</span>
                  <span className="trending-value">{topLoser.symbol} {topLoser.change24h.toFixed(2)}%</span>
                </div>
              </div>
            )}
            <div className="trending-item">
              <div className="trending-icon volume">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="trending-info">
                <span className="trending-name">Highest Volume</span>
                <span className="trending-value">BTC €28.4B</span>
              </div>
            </div>
          </div>
        </section>

        {/* LAST UPDATE TIME */}
        <div style={{ textAlign: "center", marginTop: 12, fontSize: 10, color: "var(--muted)" }}>
          Last updated: {lastUpdate.toLocaleTimeString()}
        </div>
      </div>

      {/* COIN DETAIL MODAL */}
      {selectedCoin && (
        <div className="modal-overlay" onClick={() => setSelectedCoin(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div 
                  className="asset-icon" 
                  style={{ background: getCoinColor(selectedCoin.symbol), width: 44, height: 44 }}
                >
                  {selectedCoin.iconSrc ? (
                    <Image src={selectedCoin.iconSrc} alt={selectedCoin.name} width={32} height={32} unoptimized style={{ borderRadius: '50%' }} />
                  ) : (
                    <span style={{ color: "#fff", fontWeight: 700 }}>
                      {selectedCoin.symbol.slice(0, 2)}
                    </span>
                  )}
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{selectedCoin.name}</h3>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedCoin.symbol}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCoin(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 32, fontWeight: 800 }}>€{formatPrice(selectedCoin.price, selectedCoin.symbol)}</div>
                <div className={`market-change ${selectedCoin.change24h >= 0 ? "positive" : "negative"}`} style={{ display: "inline-block", marginTop: 8 }}>
                  {selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}% (24h)
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 20 }}>
                <div className="market-stat-card">
                  <span className="stat-label">24h High</span>
                  <span className="stat-value">€{formatPrice(selectedCoin.high24h, selectedCoin.symbol)}</span>
                </div>
                <div className="market-stat-card">
                  <span className="stat-label">24h Low</span>
                  <span className="stat-value">€{formatPrice(selectedCoin.low24h, selectedCoin.symbol)}</span>
                </div>
                <div className="market-stat-card">
                  <span className="stat-label">Market Cap</span>
                  <span className="stat-value">{formatCompact(selectedCoin.marketCap)}</span>
                </div>
                <div className="market-stat-card">
                  <span className="stat-label">Volume (24h)</span>
                  <span className="stat-value">{formatCompact(selectedCoin.volume24h)}</span>
                </div>
              </div>

              <div style={{ display: "flex", gap: 10 }}>
                <Link href="/dashboard/trade" className="order-button buy" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                  Buy {selectedCoin.symbol}
                </Link>
                <Link href="/dashboard/trade" className="order-button sell" style={{ flex: 1, textAlign: "center", textDecoration: "none" }}>
                  Sell {selectedCoin.symbol}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav
        onMenuClick={() => setIsSidebarOpen(true)}
        isMenuActive={isSidebarOpen}
      />
    </div>
  );
}

