"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor } from "@/hooks/usePriceSimulation";
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
      <div className="dashboard-app container-pro">
        <header className="header">
          <div className="row-between" style={{ width: '100%' }}>
            <div className="asset-inline">
              <Link href="/" className="btn" aria-label={t("common.back")}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><polyline points="15 18 9 12 15 6" /></svg>
              </Link>
              <div>
                <div className="header-eyebrow">PRICES</div>
                <div className="header-title">{t("markets.favorites")} / Watchlists</div>
              </div>
            </div>
            <button className="btn btn-primary" onClick={() => setShowCreateModal(true)} aria-label={t("common.submit")} title="Create new watchlist">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" aria-hidden="true"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
              <span>Create</span>
            </button>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="title-lg">{t("markets.favorites")}</h1>
          <p className="subtitle">{t("markets.search")}</p>
        </section>

        <div className="market-categories" role="tablist" aria-label="Watchlists" style={{ display: 'flex', flexWrap: 'wrap', gap: 8, padding: '8px 0 16px' }}>
          {Object.keys(watchlists).map((name) => (
            <button
              key={name}
              className={`chip ${activeWatchlist === name ? "chip-active" : ""}`}
              onClick={() => setActiveWatchlist(name)}
              role="tab"
              aria-selected={activeWatchlist === name ? "true" : "false"}
            >
              {name} ({watchlists[name].length})
            </button>
          ))}
        </div>

        <section className="market-list card-surface" aria-labelledby="market-list-header">
          <div id="market-list-header" className="grid-header">
            <span>Asset</span>
            <span>{t("markets.price")}</span>
            <span>{t("markets.change")}</span>
            <span>{t("markets.marketCap")}</span>
            <span style={{ textAlign: 'right' }}>Action</span>
          </div>
          <div className="market-list-body">
            {getWatchlistData(watchlists[activeWatchlist] || []).length === 0 ? (
              <div className="empty-watchlist text-center muted" role="note" style={{ padding: '24px 16px' }}>
                <p className="text-strong" style={{ margin: 0 }}>No assets yet</p>
                <p style={{ margin: '6px 0 0' }}>Use the Create button or the list below to add assets</p>
              </div>
            ) : (
              getWatchlistData(watchlists[activeWatchlist] || []).map((asset) => (
                <div key={asset.id} className="grid-row">
                  <div className="asset-inline">
                    <div className="asset-chip" style={{ background: getCoinColor(asset.symbol) }} aria-hidden="true">
                      {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={18} height={18} unoptimized />}
                    </div>
                    <div style={{ display: 'grid', lineHeight: 1 }}>
                      <span className="text-strong">{asset.name}</span>
                      <span className="muted" style={{ fontSize: 12 }}>{asset.symbol}</span>
                    </div>
                  </div>
                  <div className="text-tabular text-strong">
                    €{formatPrice(asset.price, asset.symbol)}
                  </div>
                  <div className={`text-strong ${asset.change24h >= 0 ? "positive" : "negative"}`} aria-label={`${asset.change24h.toFixed(2)} percent ${asset.change24h >= 0 ? "up" : "down"}`} style={{ color: asset.change24h >= 0 ? '#0F9D58' : '#D93025' }}>
                    {asset.change24h >= 0 ? "+" : ""}{asset.change24h.toFixed(2)}%
                  </div>
                  <div className="text-tabular">
                    {formatCompact(asset.marketCap)}
                  </div>
                  <button
                    onClick={() => toggleAsset(asset.id)}
                    aria-label={watchlists[activeWatchlist]?.includes(asset.id) ? "Remove from watchlist" : "Add to watchlist"}
                    className={watchlists[activeWatchlist]?.includes(asset.id) ? 'btn btn-ghost-success' : 'btn btn-ghost'}
                  >
                    {watchlists[activeWatchlist]?.includes(asset.id) ? 'Added' : 'Add'}
                  </button>
                </div>
              ))
            )}
          </div>
        </section>

        <section className="info-section section">
          <div className="row-between section-title" style={{ marginBottom: 8 }}>
            <h3 style={{ fontSize: 18, fontWeight: 650, margin: 0 }}>Add to Watchlist</h3>
          </div>
          <p className="muted" style={{ fontSize: 13, margin: '0 0 12px' }}>Browse all assets and add them to your watchlist:</p>
          <div className="asset-grid">
            {marketData.map((asset) => (
              <div key={asset.id} className="asset-card">
                <div className="asset-card-left">
                  <div className="asset-card-icon" aria-hidden="true">
                    {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={16} height={16} unoptimized />}
                  </div>
                  <div style={{ display: 'grid', lineHeight: 1 }}>
                    <span className="text-strong">{asset.symbol}</span>
                    <span className="muted" style={{ fontSize: 12 }}>{asset.name}</span>
                  </div>
                </div>
                <button
                  onClick={() => toggleAsset(asset.id)}
                  className={watchlists[activeWatchlist]?.includes(asset.id) ? 'btn btn-ghost-success' : 'btn btn-ghost'}
                  aria-pressed={watchlists[activeWatchlist]?.includes(asset.id) ? "true" : "false"}
                  aria-label={watchlists[activeWatchlist]?.includes(asset.id) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {watchlists[activeWatchlist]?.includes(asset.id) ? 'Added' : 'Add'}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="cta">
          <Link href="/dashboard/trade" className="btn-cta">
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
                className="form-input"
                aria-label="Watchlist name"
              />
              <div className="modal-footer">
                <button onClick={createWatchlist} className="btn btn-primary">
                  Create Watchlist
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
