"use client";

import * as React from "react";
import Image from "next/image";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { usePriceSimulation, MarketData, formatPrice, formatCompact, getCoinColor } from "@/hooks/usePriceSimulation";

const cryptoData: MarketData[] = [
  { id: "btc", name: "Bitcoin", symbol: "BTC", price: 43250.00, change24h: 2.45, marketCap: 842000000000, volume24h: 28400000000, high24h: 43800, low24h: 42100, iconSrc: "/btc-logo.png" },
  { id: "eth", name: "Ethereum", symbol: "ETH", price: 2280.50, change24h: 1.82, marketCap: 274000000000, volume24h: 12100000000, high24h: 2320, low24h: 2180, iconSrc: "/eth-logo.png" },
  { id: "bnb", name: "Binance Coin", symbol: "BNB", price: 312.40, change24h: -0.54, marketCap: 48200000000, volume24h: 1400000000, high24h: 318, low24h: 308, iconSrc: "/bnb-logo.png" },
  { id: "sol", name: "Solana", symbol: "SOL", price: 98.75, change24h: 4.21, marketCap: 42100000000, volume24h: 3800000000, high24h: 102, low24h: 92, iconSrc: "/sol-logo.png" },
  { id: "xrp", name: "Ripple", symbol: "XRP", price: 0.62, change24h: 0.89, marketCap: 33800000000, volume24h: 1200000000, high24h: 0.64, low24h: 0.60, iconSrc: "/xrp-logo.png" },
  { id: "ada", name: "Cardano", symbol: "ADA", price: 0.52, change24h: -1.23, marketCap: 18200000000, volume24h: 456000000, high24h: 0.54, low24h: 0.50, iconSrc: "/ada-logo.png" },
  { id: "doge", name: "Dogecoin", symbol: "DOGE", price: 0.082, change24h: 5.67, marketCap: 11800000000, volume24h: 2100000000, high24h: 0.088, low24h: 0.075, iconSrc: "/doge-logo.png" },
  { id: "dot", name: "Polkadot", symbol: "DOT", price: 7.85, change24h: -2.34, marketCap: 10200000000, volume24h: 234000000, high24h: 8.20, low24h: 7.50, iconSrc: "/dot-logo.png" },
];

const categories = [
  { id: "all", label: "All" },
  { id: "gainers", label: "Gainers" },
  { id: "losers", label: "Losers" },
  { id: "defi", label: "DeFi" },
];

export default function CryptoPage() {
  const { data: marketData } = usePriceSimulation(cryptoData, 3000);
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("all");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedCoin, setSelectedCoin] = React.useState<MarketData | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredMarkets = React.useMemo(() => {
    let result = [...marketData];
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(m => m.name.toLowerCase().includes(query) || m.symbol.toLowerCase().includes(query));
    }
    if (activeCategory === "gainers") result = result.filter(m => m.change24h > 0);
    if (activeCategory === "losers") result = result.filter(m => m.change24h < 0);
    return result;
  }, [marketData, searchQuery, activeCategory]);

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">INVEST</span>
            <div className="header-title">Cryptocurrencies</div>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">Invest in Cryptocurrencies</h1>
          <p className="hero-subtitle">Buy, sell and swap 300+ cryptocurrencies</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">300+</span>
              <span className="hero-stat-label">Cryptocurrencies</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">€0</span>
              <span className="hero-stat-label">Trading Fees</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">24/7</span>
              <span className="hero-stat-label">Trading</span>
            </div>
          </div>
        </section>

        <div className="market-search">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" /></svg>
          <input type="text" placeholder="Search cryptocurrencies..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
        </div>

        <div className="market-categories">
          {categories.map((cat) => (
            <button key={cat.id} className={`category-chip ${activeCategory === cat.id ? "active" : ""}`} onClick={() => setActiveCategory(cat.id)}>{cat.label}</button>
          ))}
        </div>

        <section className="market-list">
          <div className="market-list-header"><span>Asset</span><span>Price</span><span>24h</span><span>Market Cap</span></div>
          <div className="market-list-body">
            {filteredMarkets.map((market) => (
              <div key={market.id} className="market-row" onClick={() => setSelectedCoin(market)}>
                <div className="market-asset">
                  <div className="asset-icon" style={{ background: getCoinColor(market.symbol) }}>
                    {market.iconSrc && <Image src={market.iconSrc} alt={market.name} width={20} height={20} unoptimized style={{ borderRadius: '50%' }} />}
                  </div>
                  <div className="asset-info"><span className="asset-name">{market.name}</span><span className="asset-symbol">{market.symbol}</span></div>
                </div>
                <div className="market-price"><span className="price-value">€{formatPrice(market.price, market.symbol)}</span></div>
                <div className={`market-change ${market.change24h >= 0 ? "positive" : "negative"}`}>{market.change24h >= 0 ? "+" : ""}{market.change24h.toFixed(2)}%</div>
                <div className="market-cap"><span className="cap-value">{formatCompact(market.marketCap)}</span></div>
              </div>
            ))}
          </div>
        </section>

        <div className="cta-section">
          <Link href="/dashboard/buy" className="cta-button">
            Start Trading
          </Link>
        </div>
      </div>

      {selectedCoin && (
        <div className="modal-overlay" onClick={() => setSelectedCoin(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="modal-asset-header">
                <div className="asset-icon asset-icon-large">
                  {selectedCoin.iconSrc && <Image src={selectedCoin.iconSrc} alt={selectedCoin.name} width={32} height={32} unoptimized style={{ borderRadius: '50%' }} />}
                </div>
                <div><h3 className="modal-asset-name">{selectedCoin.name}</h3><span className="modal-asset-symbol">{selectedCoin.symbol}</span></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCoin(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="modal-price-section">
                <div className="modal-price">€{formatPrice(selectedCoin.price, selectedCoin.symbol)}</div>
                <div className={`modal-change ${selectedCoin.change24h >= 0 ? "positive" : "negative"}`}>{selectedCoin.change24h >= 0 ? "+" : ""}{selectedCoin.change24h.toFixed(2)}% (24h)</div>
              </div>
              <div className="modal-action-buttons">
                <Link href="/dashboard/buy" className="order-button buy">Buy {selectedCoin.symbol}</Link>
                <Link href="/dashboard/sell" className="order-button sell">Sell {selectedCoin.symbol}</Link>
              </div>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
