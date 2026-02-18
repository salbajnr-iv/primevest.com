"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor } from "@/hooks/usePriceSimulation";

const allAssets: MarketData[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.00, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.50, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 312.40, change24h: -0.54, marketCap: 48200000000, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp", name: "Ripple", symbol: "XRP", price: 0.62, change24h: 0.89, marketCap: 33800000000, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.52, change24h: -1.23, marketCap: 18200000000, volume24h: 456000000, high24h: 0.54, low24h: 0.50, iconSrc: "/ada-logo.png" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.082, change24h: 5.67, marketCap: 11800000000, volume24h: 2100000000, high24h: 0.088, low24h: 0.075, iconSrc: "/doge-logo.png" },
  { id: "dot", name: "Polkadot", symbol: "DOT", price: 7.85, change24h: -2.34, marketCap: 10200000000, volume24h: 234000000, high24h: 8.20, low24h: 7.50, iconSrc: "/dot-logo.png" },
];

export default function WatchlistsPage() {
  const { data: marketData } = usePriceSimulation(allAssets, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [watchlists, setWatchlists] = React.useState<{ [key: string]: string[] }>({
    "Favorites": ["btc", "eth", "sol"],
    "DeFi": ["dot", "ada"],
    "Meme Coins": ["doge", "shib"],
  });
  const [activeWatchlist, setActiveWatchlist] = React.useState("Favorites");
  const [newWatchlistName, setNewWatchlistName] = React.useState("");
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
    const saved = localStorage.getItem("watchlists");
    if (saved) {
      setWatchlists(JSON.parse(saved));
    }
  }, []);

  const saveWatchlists = (newWatchlists: { [key: string]: string[] }) => {
    setWatchlists(newWatchlists);
    localStorage.setItem("watchlists", JSON.stringify(newWatchlists));
  };

  const toggleAsset = (symbol: string) => {
    const current = watchlists[activeWatchlist] || [];
    let newWatchlists;
    if (current.includes(symbol)) {
      newWatchlists = { ...watchlists, [activeWatchlist]: current.filter(s => s !== symbol) };
    } else {
      newWatchlists = { ...watchlists, [activeWatchlist]: [...current, symbol] };
    }
    saveWatchlists(newWatchlists);
  };

  const createWatchlist = () => {
    if (newWatchlistName.trim()) {
      const newWatchlists = { ...watchlists, [newWatchlistName]: [] };
      saveWatchlists(newWatchlists);
      setActiveWatchlist(newWatchlistName);
      setNewWatchlistName("");
      setShowCreateModal(false);
    }
  };

  const getWatchlistData = (symbols: string[]) => {
    return marketData.filter(m => symbols.includes(m.id));
  };

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">PRICES</span>
            <div className="header-title">Watchlists</div>
          </div>
          <button className="sync-btn" onClick={() => setShowCreateModal(true)} aria-label="Create new watchlist">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" /></svg>
          </button>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">Your Watchlists</h1>
          <p className="hero-subtitle">Track your favorite assets in one place</p>
        </section>

        <div className="market-categories">
          {Object.keys(watchlists).map((name) => (
            <button key={name} className={`category-chip ${activeWatchlist === name ? "active" : ""}`} onClick={() => setActiveWatchlist(name)}>
              {name} ({watchlists[name].length})
            </button>
          ))}
        </div>

        <section className="market-list">
          <div className="market-list-header"><span>Asset</span><span>Price</span><span>24h</span><span>Market Cap</span></div>
          <div className="market-list-body">
            {getWatchlistData(watchlists[activeWatchlist] || []).length === 0 ? (
              <div className="empty-watchlist">
                <p>No assets in this watchlist</p>
                <p>Click the + button to add assets</p>
              </div>
            ) : (
              getWatchlistData(watchlists[activeWatchlist] || []).map((asset) => (
                <div key={asset.id} className="market-row">
                  <div className="market-asset">
                    <div className="asset-icon" style={{ background: getCoinColor(asset.symbol) }}>
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
                  <div className={`market-change ${asset.change24h >= 0 ? "positive" : "negative"}`}>
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
                    <svg viewBox="0 0 24 24" fill="currentColor" width={16} height={16}>
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
            {marketData.map((asset) => (
              <div key={asset.id} className="asset-list-item">
                <div className="asset-list-item-left">
                  <div className="asset-icon asset-icon-small">
                    {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={16} height={16} unoptimized style={{ borderRadius: "50%" }} />}
                  </div>
                  <span className="asset-symbol">{asset.symbol}</span>
                </div>
                <button
                  onClick={() => toggleAsset(asset.id)}
                  className={`asset-add-btn ${watchlists[activeWatchlist]?.includes(asset.id) ? 'added' : ''}`}
                  aria-label={watchlists[activeWatchlist]?.includes(asset.id) ? "Remove from watchlist" : "Add to watchlist"}
                >
                  {watchlists[activeWatchlist]?.includes(asset.id) ? "Added" : "Add"}
                </button>
              </div>
            ))}
          </div>
        </section>

        <div className="cta-section">
          <Link href="/dashboard/trade" className="cta-button">
            Start Trading
          </Link>
        </div>
      </div>

      {showCreateModal && (
        <div className="modal-overlay" onClick={() => setShowCreateModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Create New Watchlist</h3>
              <button className="modal-close" onClick={() => setShowCreateModal(false)}>✕</button>
            </div>
            <div className="modal-body">
              <input
                type="text"
                placeholder="Watchlist name..."
                value={newWatchlistName}
                onChange={(e) => setNewWatchlistName(e.target.value)}
                className="modal-input"
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
