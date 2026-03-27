"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor } from "@/docs/hooks/usePriceSimulation";

// Enhanced asset data with multiple asset types
const assetsData: MarketData[] = [
  // Cryptocurrencies
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.00, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png", category: "crypto" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.50, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png", category: "crypto" },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 312.40, change24h: -0.54, marketCap: 48200000000, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png", category: "crypto" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png", category: "crypto" },
  
  // Stocks
  { id: "aapl", name: "Apple Inc.", symbol: "AAPL", price: 178.45, change24h: 1.23, marketCap: 2780000000000, volume24h: 520000000, high24h: 180.25, low24h: 177.80, iconSrc: "", category: "stocks" },
  { id: "msft", name: "Microsoft", symbol: "MSFT", price: 378.85, change24h: -0.65, marketCap: 2810000000000, volume24h: 180000000, high24h: 382.50, low24h: 377.20, iconSrc: "", category: "stocks" },
  { id: "goog", name: "Alphabet", symbol: "GOOGL", price: 139.65, change24h: 2.15, marketCap: 1740000000000, volume24h: 280000000, high24h: 141.30, low24h: 138.50, iconSrc: "", category: "stocks" },
  { id: "tsla", name: "Tesla", symbol: "TSLA", price: 242.68, change24h: -3.45, marketCap: 770000000000, volume24h: 980000000, high24h: 251.80, low24h: 240.15, iconSrc: "", category: "stocks" },
  
  // ETFs
  { id: "spy", name: "SPDR S&P 500", symbol: "SPY", price: 452.18, change24h: 0.89, marketCap: 420000000000, volume24h: 75000000, high24h: 455.30, low24h: 450.85, iconSrc: "", category: "etfs" },
  { id: "qqq", name: "Invesco QQQ", symbol: "QQQ", price: 378.94, change24h: 1.12, marketCap: 185000000000, volume24h: 45000000, high24h: 381.50, low24h: 377.25, iconSrc: "", category: "etfs" },
  
  // Metals
  { id: "gold", name: "Gold", symbol: "XAU", price: 2051.20, change24h: -0.35, marketCap: 13000000000000, volume24h: 125000000000, high24h: 2065.80, low24h: 2048.50, iconSrc: "", category: "metals" },
  { id: "silver", name: "Silver", symbol: "XAG", price: 23.45, change24h: 1.85, marketCap: 1400000000000, volume24h: 8500000000, high24h: 23.85, low24h: 23.10, iconSrc: "", category: "metals" },
];

const categories = [
  { id: "all", label: "All Assets", iconSrc: "/vectors/icons/icon-diversify.svg" },
  { id: "crypto", label: "Cryptocurrencies", iconSrc: "/vectors/icons/icon-coins.svg" },
  { id: "stocks", label: "Stocks", iconSrc: "/vectors/icons/icon-analytics.svg" },
  { id: "etfs", label: "ETFs", iconSrc: "/vectors/icons/icon-diversify.svg" },
  { id: "metals", label: "Metals", iconSrc: "/vectors/icons/icon-shield.svg" },
  { id: "watchlist", label: "Watchlist", iconSrc: "/vectors/icons/icon-bolt.svg" },
];

const portfolioAllocation = [
  { category: "Cryptocurrencies", percentage: 45, color: "#f7931a" },
  { category: "Stocks", percentage: 30, color: "#3b82f6" },
  { category: "ETFs", percentage: 15, color: "#10b981" },
  { category: "Metals", percentage: 10, color: "#f59e0b" },
];

export default function AssetsPage() {
  const { data: marketData } = usePriceSimulation(assetsData, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedAsset, setSelectedAsset] = React.useState<MarketData | null>(null);
  const [sortBy, setSortBy] = React.useState("marketCap");
  const [viewMode, setViewMode] = React.useState("list");

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredAssets = React.useMemo(() => {
    let result = [...marketData];
    
    // Filter by category
    if (activeCategory !== "all" && activeCategory !== "watchlist") {
      result = result.filter(asset => asset.category === activeCategory);
    }
    
    // Filter by search query
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(asset => 
        asset.name.toLowerCase().includes(query) || 
        asset.symbol.toLowerCase().includes(query)
      );
    }
    
    // Sort assets
    result.sort((a, b) => {
      switch (sortBy) {
        case "price":
          return b.price - a.price;
        case "change":
          return b.change24h - a.change24h;
        case "volume":
          return b.volume24h - a.volume24h;
        case "marketCap":
        default:
          return b.marketCap - a.marketCap;
      }
    });
    
    return result;
  }, [marketData, searchQuery, activeCategory, sortBy]);

  const totalMarketCap = marketData.reduce((sum, asset) => sum + asset.marketCap, 0);
  const totalVolume = marketData.reduce((sum, asset) => sum + asset.volume24h, 0);
  const avgChange = marketData.reduce((sum, asset) => sum + asset.change24h, 0) / marketData.length;
  const gainers = marketData.filter(asset => asset.change24h > 0).length;
  const losers = marketData.filter(asset => asset.change24h < 0).length;

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">INVEST</span>
            <div className="header-title">
              Assets
              <span className="live-dot" style={{ marginLeft: 8 }}></span>
            </div>
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <button 
              className="sync-btn" 
              onClick={() => {}} 
              title="Refresh" 
              aria-label="Refresh"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                <path d="M3 3v5h5" />
                <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                <path d="M16 21h5v-5" />
              </svg>
            </button>
            <button 
              className={`sync-btn ${viewMode === "grid" ? "active" : ""}`}
              onClick={() => setViewMode(viewMode === "list" ? "grid" : "list")} 
              title="Toggle view" 
              aria-label="Toggle view"
            >
              {viewMode === "list" ? (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <rect x="3" y="3" width="7" height="7" />
                  <rect x="14" y="3" width="7" height="7" />
                  <rect x="14" y="14" width="7" height="7" />
                  <rect x="3" y="14" width="7" height="7" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ width: 16, height: 16 }}>
                  <line x1="8" y1="6" x2="21" y2="6" />
                  <line x1="8" y1="12" x2="21" y2="12" />
                  <line x1="8" y1="18" x2="21" y2="18" />
                  <line x1="3" y1="6" x2="3.01" y2="6" />
                  <line x1="3" y1="12" x2="3.01" y2="12" />
                  <line x1="3" y1="18" x2="3.01" y2="18" />
                </svg>
              )}
            </button>
            <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* MARKET OVERVIEW */}
        <section className="market-stats" style={{ backgroundImage: "url(/vectors/bg-crypto.svg)", backgroundSize: "cover", backgroundPosition: "center" }}>
          <div className="stats-row">
            <div className="stat-card">
              <span className="stat-label">Total Market Cap</span>
              <span className="stat-value">{formatCompact(totalMarketCap)}</span>
              <span className={`stat-change ${avgChange >= 0 ? "positive" : "negative"}`}>
                {avgChange >= 0 ? "+" : ""}{avgChange.toFixed(2)}%
              </span>
            </div>
            <div className="stat-card">
              <span className="stat-label">24h Volume</span>
              <span className="stat-value">{formatCompact(totalVolume)}</span>
              <span className="stat-change positive">+5.2%</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Assets</span>
              <span className="stat-value">{marketData.length}</span>
              <span className="stat-change positive">+{marketData.length}</span>
            </div>
            <div className="stat-card">
              <span className="stat-label">Market Sentiment</span>
              <span className="stat-value">{gainers}/{gainers + losers}</span>
              <span className={`stat-change ${gainers > losers ? "positive" : "negative"}`}>
                {gainers > losers ? "📈 Bullish" : "📉 Bearish"}
              </span>
            </div>
          </div>
        </section>

        {/* PORTFOLIO ALLOCATION */}
        <section className="portfolio-allocation">
          <h3 className="section-title">Portfolio Allocation</h3>
          <div className="allocation-chart">
            <div className="allocation-bars">
              {portfolioAllocation.map((item, index) => (
                <div key={index} className="allocation-item">
                  <div className="allocation-info">
                    <span className="allocation-label">{item.category}</span>
                    <span className="allocation-percentage">{item.percentage}%</span>
                  </div>
                  <div className="allocation-bar">
                    <div 
                      className="allocation-fill" 
                      style={{ 
                        width: `${item.percentage}%`, 
                        backgroundColor: item.color 
                      }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <div className="market-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input 
            type="text" 
            placeholder="Search assets..." 
            value={searchQuery} 
            onChange={(e) => setSearchQuery(e.target.value)} 
          />
        </div>

        <div className="market-categories">
          {categories.map((cat) => (
            <button 
              key={cat.id} 
              className={`category-chip ${activeCategory === cat.id ? "active" : ""}`} 
              onClick={() => setActiveCategory(cat.id)}
            >
              <span className="category-icon"><Image src={cat.iconSrc} alt={cat.label} width={18} height={18} /></span>
              <span className="category-label">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="market-controls">
          <div className="sort-controls">
            <label className="sort-label">Sort by:</label>
            <select 
              className="sort-select" 
              value={sortBy} 
              onChange={(e) => setSortBy(e.target.value)}
            >
              <option value="marketCap">Market Cap</option>
              <option value="price">Price</option>
              <option value="change">24h Change</option>
              <option value="volume">Volume</option>
            </select>
          </div>
          <div className="results-count">
            {filteredAssets.length} assets
          </div>
        </div>

        <section className={`market-list ${viewMode === "grid" ? "grid-view" : "list-view"}`}>
          <div className="market-list-header">
            <span>Asset</span>
            <span>Price</span>
            <span>24h</span>
            <span>Market Cap</span>
            <span>Volume</span>
          </div>
          <div className="market-list-body">
            {filteredAssets.map((asset) => (
              <div key={asset.id} className="market-row" onClick={() => setSelectedAsset(asset)}>
                <div className="market-asset">
                  <div className="asset-icon" style={{ background: getCoinColor(asset.symbol) }}>
                    {asset.iconSrc && <Image src={asset.iconSrc} alt={asset.name} width={20} height={20} unoptimized style={{ borderRadius: '50%' }} />}
                    {!asset.iconSrc && <span className="asset-category-icon">
                      <Image
                        src={asset.category === "crypto" ? "/vectors/icons/icon-coins.svg" : asset.category === "stocks" ? "/vectors/icons/icon-analytics.svg" : asset.category === "etfs" ? "/vectors/icons/icon-diversify.svg" : "/vectors/icons/icon-shield.svg"}
                        alt={asset.category ?? "asset"}
                        width={16}
                        height={16}
                      />
                    </span>}
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
                <div className="market-volume">
                  <span className="volume-value">{formatCompact(asset.volume24h)}</span>
                </div>
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

      {selectedAsset && (
        <div className="modal-overlay" onClick={() => setSelectedAsset(null)}>
          <div className="modal-content asset-modal" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-asset-header">
                <div className="asset-icon asset-icon-large">
                  {selectedAsset.iconSrc && <Image src={selectedAsset.iconSrc} alt={selectedAsset.name} width={32} height={32} unoptimized style={{ borderRadius: '50%' }} />}
                  {!selectedAsset.iconSrc && <span className="asset-category-icon-large">
                    <Image
                      src={selectedAsset.category === "crypto" ? "/vectors/icons/icon-coins.svg" : selectedAsset.category === "stocks" ? "/vectors/icons/icon-analytics.svg" : selectedAsset.category === "etfs" ? "/vectors/icons/icon-diversify.svg" : "/vectors/icons/icon-shield.svg"}
                      alt={selectedAsset.category ?? "asset"}
                      width={22}
                      height={22}
                    />
                  </span>}
                </div>
                <div>
                  <h3 className="modal-asset-name">{selectedAsset.name}</h3>
                  <span className="modal-asset-symbol">{selectedAsset.symbol}</span>
                  <span className="modal-asset-category">{(selectedAsset.category ?? "asset").toUpperCase()}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedAsset(null)}>✕</button>
            </div>
            
            <div className="modal-body">
              {/* Price Section with Chart */}
              <div className="modal-price-section">
                <div className="modal-price">€{formatPrice(selectedAsset.price, selectedAsset.symbol)}</div>
                <div className={`modal-change ${selectedAsset.change24h >= 0 ? "positive" : "negative"}`}>
                  {selectedAsset.change24h >= 0 ? "+" : ""}{selectedAsset.change24h.toFixed(2)}% (24h)
                </div>
                
                {/* Simple Chart Visualization */}
                <div className="modal-chart">
                  <div className="chart-header">
                    <span className="chart-title">Price Chart (7D)</span>
                    <div className="chart-toggles">
                      <button className="chart-toggle active">1D</button>
                      <button className="chart-toggle">1W</button>
                      <button className="chart-toggle">1M</button>
                      <button className="chart-toggle">1Y</button>
                    </div>
                  </div>
                  <div className="chart-container">
                    <svg viewBox="0 0 300 100" className="price-chart">
                      <polyline
                        points="10,80 50,70 90,75 130,60 170,65 210,50 250,55 290,45"
                        fill="none"
                        stroke={selectedAsset.change24h >= 0 ? "#10b981" : "#ef4444"}
                        strokeWidth="2"
                      />
                      <linearGradient id="chartGradient" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stopColor={selectedAsset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0.2" />
                        <stop offset="100%" stopColor={selectedAsset.change24h >= 0 ? "#10b981" : "#ef4444"} stopOpacity="0" />
                      </linearGradient>
                      <polygon
                        points="10,80 50,70 90,75 130,60 170,65 210,50 250,55 290,45 290,100 10,100"
                        fill="url(#chartGradient)"
                      />
                    </svg>
                  </div>
                </div>
              </div>
              
              {/* Detailed Statistics */}
              <div className="modal-stats">
                <div className="modal-stat">
                  <span className="modal-stat-label">Market Cap</span>
                  <span className="modal-stat-value">{formatCompact(selectedAsset.marketCap)}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">24h Volume</span>
                  <span className="modal-stat-value">{formatCompact(selectedAsset.volume24h)}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">24h High</span>
                  <span className="modal-stat-value">€{formatPrice(selectedAsset.high24h, selectedAsset.symbol)}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">24h Low</span>
                  <span className="modal-stat-value">€{formatPrice(selectedAsset.low24h, selectedAsset.symbol)}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">Circulating Supply</span>
                  <span className="modal-stat-value">{formatCompact(Math.floor(selectedAsset.marketCap / selectedAsset.price))}</span>
                </div>
                <div className="modal-stat">
                  <span className="modal-stat-label">All Time High</span>
                  <span className="modal-stat-value">€{formatPrice(selectedAsset.high24h * 1.15, selectedAsset.symbol)}</span>
                </div>
              </div>
              
              {/* Recent Transactions */}
              <div className="modal-transactions">
                <h4 className="modal-section-title">Recent Transactions</h4>
                <div className="transaction-list">
                  <div className="transaction-item">
                    <div className="transaction-type buy">BUY</div>
                    <div className="transaction-details">
                      <span className="transaction-amount">0.025 {selectedAsset.symbol}</span>
                      <span className="transaction-time">2 hours ago</span>
                    </div>
                    <div className="transaction-value">€{(selectedAsset.price * 0.025).toFixed(2)}</div>
                  </div>
                  <div className="transaction-item">
                    <div className="transaction-type sell">SELL</div>
                    <div className="transaction-details">
                      <span className="transaction-amount">0.010 {selectedAsset.symbol}</span>
                      <span className="transaction-time">5 hours ago</span>
                    </div>
                    <div className="transaction-value">€{(selectedAsset.price * 0.010).toFixed(2)}</div>
                  </div>
                  <div className="transaction-item">
                    <div className="transaction-type buy">BUY</div>
                    <div className="transaction-details">
                      <span className="transaction-amount">0.050 {selectedAsset.symbol}</span>
                      <span className="transaction-time">1 day ago</span>
                    </div>
                    <div className="transaction-value">€{(selectedAsset.price * 0.050).toFixed(2)}</div>
                  </div>
                </div>
              </div>
              
              {/* Action Buttons */}
              <div className="modal-action-buttons">
                <Link href={`/dashboard/trade?side=buy&asset=${selectedAsset.id}`} className="order-button buy">
                  Buy {selectedAsset.symbol}
                </Link>
                <Link href={`/dashboard/trade?side=sell&asset=${selectedAsset.id}`} className="order-button sell">
                  Sell {selectedAsset.symbol}
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
