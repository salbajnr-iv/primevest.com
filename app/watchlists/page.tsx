"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor } from "@/lib/hooks/usePriceSimulation";
import { useLanguage } from "@/contexts/LanguageContext";
import { translations } from "@/lib/i18n/translations";
            
const allAssets: MarketData[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.0, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.5, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 312.4, change24h: -0.54, marketCap: 48200000000, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp", name: "Ripple", symbol: "XRP", price: 0.62, change24h: 0.89, marketCap: 33800000000, volume24h: 1200000000, high24h: 0.64, low24h: 0.6, iconSrc: "/xrp-logo.png" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.52, change24h: -1.23, marketCap: 18200000000, volume24h: 456000000, high24h: 0.54, low24h: 0.5, iconSrc: "/ada-logo.png" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.082, change24h: 5.67, marketCap: 11800000000, volume24h: 2100000000, high24h: 0.088, low24h: 0.075, iconSrc: "/doge-logo.png" },
  { id: "dot", name: "Polkadot", symbol: "DOT", price: 7.85, change24h: -2.34, marketCap: 10200000000, volume24h: 234000000, high24h: 8.2, low24h: 7.5, iconSrc: "/dot-logo.png" },
];

export default function WatchlistsPage() {
  const { language } = useLanguage();
  const t = (k: string) => translations[language]?.[k] ?? k;

  const { data: marketData } = usePriceSimulation(allAssets, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [watchlists, setWatchlists] = React.useState<{ [key: string]: string[] }>({
    Favorites: ["btc", "eth", "sol"],
    DeFi: ["dot", "ada"],
    "Meme Coins": ["doge", "shib"],
  });
  const [activeWatchlist, setActiveWatchlist] = React.useState("Favorites");
  const [newWatchlistName, setNewWatchlistName] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    try {
      const saved = localStorage.getItem("watchlists");
      if (saved) setWatchlists(JSON.parse(saved));
    } catch {
      // ignore JSON parse errors
    }
  }, []);

  const saveWatchlists = (newWatchlists: { [key: string]: string[] }) => {
    setWatchlists(newWatchlists);
    try {
      localStorage.setItem("watchlists", JSON.stringify(newWatchlists));
    } catch {
      // storage might be unavailable
    }
  };

  // Debounced toggler to avoid rapid thrashing
  const toggleRef = React.useRef<number | null>(null);
  const toggleAsset = (symbol: string) => {
    if (toggleRef.current) window.clearTimeout(toggleRef.current);
    toggleRef.current = window.setTimeout(() => {
      const current = watchlists[activeWatchlist] || [];
      const next = current.includes(symbol)
        ? current.filter((s) => s !== symbol)
        : [...current, symbol];
      saveWatchlists({ ...watchlists, [activeWatchlist]: next });
    }, 200);
  };

  const createWatchlist = () => {
    const name = newWatchlistName.trim();
    if (name && !watchlists[name]) {
      const newWatchlists = { ...watchlists, [name]: [] };
      saveWatchlists(newWatchlists);
      setActiveWatchlist(name);
      setNewWatchlistName("");
      setShowCreateModal(false);
    }
  };

  const getWatchlistData = (symbols: string[]) => {
    return marketData.filter((m) => symbols.includes(m.id));
  };

  if (!isClient)
    return (
      <div className="dashboard-loading" role="status" aria-live="polite">
        <div className="loading-spinner" aria-label={t("common.loading")} />
      </div>
    );


  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back" aria-label={t("common.back")}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">PRICES</span>
            <div className="header-title">
              {t("markets.favorites")} / Watchlists
              <span className="live-dot" style={{ marginLeft: 8 }}></span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button className="sync-btn" onClick={() => {}} title="Refresh" aria-label="Refresh">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
            <button className="sync-btn" onClick={() => setShowCreateModal(true)} aria-label={t("common.submit")} title="Create new watchlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
            </button>
            <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">{t("markets.favorites")}</h1>
          <p className="hero-subtitle">{t("markets.search")}</p>
        </section>

        <div className="market-categories" role="tablist" aria-label="Watchlists">
          {Object.keys(watchlists).map((name) => {
            const isSelected = activeWatchlist === name;
            return (
              <button
                key={name}
                className={`category-chip ${isSelected ? "active" : ""}`}
                onClick={() => setActiveWatchlist(name)}
                role="tab"
                aria-selected={isSelected ? "true" : "false"}
              >
                {name} ({watchlists[name].length})
              </button>
            );
          })}
        </div>

        <section className="market-list" aria-labelledby="market-list-header">
          <div id="market-list-header" className="market-list-header"><span>Asset</span><span>{t("markets.price")}</span><span>{t("markets.change")}</span><span>{t("markets.marketCap")}</span></div>
          <div className="market-list-body">
            {getWatchlistData(watchlists[activeWatchlist] || []).length === 0 ? (
              <div className="empty-watchlist" role="note">
                <p>No watchlist items yet</p>
                <p>Your watchlist is empty. Add assets with the + button.</p>
              </div>
            ) : (
              getWatchlistData(watchlists[activeWatchlist] || []).map((asset) => (
                <div key={asset.id} className="market-row">
                  <div className="market-asset">
                    <div className="asset-icon" style={{ background: getCoinColor(asset.symbol) }} aria-hidden="true">
                      {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={20} height={20} unoptimized style={{ borderRadius: "50%" }} />}
                    </div>
                    <div className="asset-info">
                      <span className="asset-name">{asset.name}</span>
                      <span className="asset-symbol">{asset.symbol}</span>
                    </div>
                  </div>
                  <div className="market-price">
                    <span className="price-value">€{formatPrice(asset.price, asset.symbol)}</span>
                  </div>
                  <div className={`market-change ${asset.change24h >= 0 ? "positive" : "negative"}`} aria-label={`${asset.change24h.toFixed(2)} percent ${asset.change24h >= 0 ? "up" : "down"}`}>
                    {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                  </div>
                  <div className="market-cap">
                    <span className="cap-value">{formatCompact(asset.marketCap)}</span>
                  </div>
                  <button
                    onClick={() => toggleAsset(asset.id)}
                    aria-label={watchlists[activeWatchlist]?.includes(asset.id) ? "Remove from watchlist" : "Add to watchlist"}
                    style={{ background: "none", border: "none", cursor: "pointer", color: "#0f9d58", padding: 8 }}
                  >
                    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16} aria-hidden="true">
                      <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
                    </svg>
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="info-section">
          <h3 className="section-title">Add to Watchlist</h3>
          <p className="add-watchlist-description">Browse all assets and add them to your watchlist:</p>
          <div className="asset-list-container">
            {marketData.map((asset) => {
              const isInWatchlist = watchlists[activeWatchlist]?.includes(asset.id) ?? false;
              return (
                <div key={asset.id} className="asset-list-item">
                  <div className="asset-list-item-left">
                    <div className="asset-icon asset-icon-small" aria-hidden="true">
                      {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={16} height={16} unoptimized style={{ borderRadius: "50%" }} />}
                    </div>
                    <span className="asset-symbol">{asset.symbol}</span>
                  </div>
                  <button
                    onClick={() => toggleAsset(asset.id)}
                    className={`asset-add-btn ${isInWatchlist ? "added" : ""}`}
                    aria-pressed={isInWatchlist ? "true" : "false"}
                    aria-label={isInWatchlist ? "Remove from watchlist" : "Add to watchlist"}
                  >
                    {isInWatchlist ? "Added" : "Add"}
                  </button>
                </div>
              );
            })}
          </div>
        </section>

        <div className="cta-section">
          <Link href="/dashboard/trade" className="cta-button">
            Start Trading
          </Link>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)} role="dialog" aria-modal="true" aria-labelledby="create-watchlist-title">
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3 id="create-watchlist-title">Create New Watchlist</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)} aria-label={t("common.close")}>
                ✕
              </button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Watchlist name..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                className="modal-input"
                aria-label="Watchlist name"
              />
              <button onClick={createWatchlist} className="modal-submit-btn">
                Create Watchlist
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
