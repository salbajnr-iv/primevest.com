"use client";

import * as React from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import BottomNav from "@/components/BottomNav";
import { 
  useOrderForm, 
  tradingPairs, 
  OrderSide
} from "@/hooks/useOrderForm";
import { usePriceSimulation, formatPrice } from "@/hooks/usePriceSimulation";

// Order book type
interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

// Generate mock order book data with realistic spreads
function generateOrderBook(currentPrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];
  const spread = currentPrice * 0.0005; // 0.05% spread

  // Generate bids (buy orders) below current price with realistic volume
  for (let i = 0; i < 10; i++) {
    const price = currentPrice - (i + 1) * spread;
    const amount = Math.random() * 8 + 0.5; // More realistic amounts
    const total = price * amount;
    bids.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number(total.toFixed(2)),
    });
  }

  // Generate asks (sell orders) above current price with realistic volume
  for (let i = 0; i < 10; i++) {
    const price = currentPrice + (i + 1) * spread;
    const amount = Math.random() * 8 + 0.5;
    const total = price * amount;
    asks.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number(total.toFixed(2)),
    });
  }

  return { bids, asks };
}

// Recent trades type
interface RecentTrade {
  time: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
}

// Generate mock recent trades with more realistic data
function generateRecentTrades(currentPrice: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = new Date();
  const tradeSizes = [0.1, 0.25, 0.5, 1.0, 2.5, 5.0]; // Realistic trade sizes

  for (let i = 0; i < 20; i++) {
    const time = new Date(now.getTime() - i * 15000); // Trades every 15 seconds
    const priceVariation = (Math.random() - 0.5) * currentPrice * 0.001; // ±0.1% variation
    const price = currentPrice + priceVariation;
    const size = tradeSizes[Math.floor(Math.random() * tradeSizes.length)];
    
    trades.push({
      time: time.toLocaleTimeString("de-DE", { hour12: false }),
      price: Number(price.toFixed(2)),
      amount: size,
      side: Math.random() > 0.48 ? "buy" : "sell", // Slightly more buys
    });
  }

  return trades;
}

export default function TradePage() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  
  // Get initial pair and side from URL params
  const pairParam = searchParams?.get('pair');
  const sideParam = searchParams?.get('side');
  
  const [activePair, setActivePair] = React.useState(() => {
    if (pairParam) {
      const foundPair = tradingPairs.find(p => p.id === pairParam);
      return foundPair || tradingPairs[0];
    }
    return tradingPairs[0];
  });
  const [orderBook, setOrderBook] = React.useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>(
    { bids: [], asks: [] }
  );
  const [recentTrades, setRecentTrades] = React.useState<RecentTrade[]>([]);
  const [showOrderHistory, setShowOrderHistory] = React.useState(false);
  const [showDepthChart, setShowDepthChart] = React.useState(false);
  const [priceAlerts, setPriceAlerts] = React.useState<{price: number; type: 'above' | 'below'}[]>([]);
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = React.useState<string | null>(null);
  
  // Price simulation
  const { data: marketData } = usePriceSimulation(
    tradingPairs.map(p => ({
      id: p.id,
      name: p.base,
      symbol: p.base,
      price: p.price,
      change24h: p.change24h,
      marketCap: 0,
      volume24h: p.volume24h,
      high24h: p.price * 1.02,
      low24h: p.price * 0.98,
    })),
    2000
  );

  // Order form hook
  const {
    formData,
    updateField,
    setMaxAmount,
    setPercentage,
    validateOrder,
    calculateFee,
    submitOrder,
    orderHistory,
    availableBalance,
  } = useOrderForm(activePair, 10000, sideParam as OrderSide);

  // Update order book when price changes
  // Get current price from simulated data
  const currentPriceData = marketData.find(m => m.id === activePair.id);
  const currentPrice = currentPriceData?.price || activePair.price;

  React.useEffect(() => {
    const current = currentPrice;
    setOrderBook(generateOrderBook(current));
    setRecentTrades(generateRecentTrades(current));
  }, [activePair, currentPrice]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const validation = validateOrder();
  const fee = formData.total ? calculateFee(parseFloat(formData.total)) : null;

  const handleOrderSubmit = async () => {
    setIsSubmittingOrder(true);
    setOrderError(null);
    setOrderSuccess(null);
    
    try {
      const result = await submitOrder();
      if (result.success) {
        setOrderSuccess(`Order placed successfully!\n${formData.side.toUpperCase()} ${formData.amount} ${activePair.base} @ €${formData.price || currentPrice}`);
      } else {
        setOrderError(result.errors?.join(', ') || 'Failed to place order');
      }
    } catch {
      setOrderError('Network error. Please try again.');
    } finally {
      setIsSubmittingOrder(false);
    }
  };

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
            <span className="header-eyebrow">TRADE</span>
            <div className="header-title">
              Trade
              <span className="live-dot" style={{ marginLeft: 8 }}></span>
            </div>
          </div>
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* TRADING PAIRS */}
        <section className="trading-pairs">
          <div className="pairs-scroll">
            {tradingPairs.map((pair) => (
              <button
                key={pair.id}
                className={`pair-chip ${activePair.id === pair.id ? "active" : ""}`}
                onClick={() => setActivePair(pair)}
              >
                <span className="pair-name">{pair.base}/EUR</span>
                <span className={`pair-change ${pair.change24h >= 0 ? "positive" : "negative"}`}>
                  {pair.change24h >= 0 ? "+" : ""}{pair.change24h.toFixed(2)}%
                </span>
              </button>
            ))}
          </div>
        </section>

        {/* PRICE DISPLAY WITH ENHANCED INFO */}
        <section className="price-display">
          <div className="current-price">
            <div className="price-header">
              <span className="price-label">Current Price</span>
              <div className="price-actions">
                <button 
                  className="icon-btn"
                  aria-label="Set price alert"
                  title="Set price alert"
                  onClick={() => {
                    const alert = { price: currentPrice, type: 'above' as const };
                    setPriceAlerts([...priceAlerts, alert]);
                  }}
                >
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                    <path d="M13.73 21a2 2 0 0 1-3.46 0" />
                  </svg>
                </button>
                <button className="icon-btn" aria-label="Full screen chart" title="Full screen chart">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="price-value">
              €{formatPrice(currentPrice, activePair.base)}
              <small>EUR</small>
            </div>
            <div className="price-details">
              <span className={`price-change ${activePair.change24h >= 0 ? "positive" : "negative"}`}>
                {activePair.change24h >= 0 ? "+" : ""}{activePair.change24h.toFixed(2)}% (24h)
              </span>
              <span className="price-volume">Vol: {(activePair.volume24h / 1000000).toFixed(1)}M €</span>
            </div>
          </div>
          
          {/* Mini Chart Placeholder */}
          <div className="mini-chart" style={{ height: "60px", background: "var(--bg-soft)", borderRadius: "8px", margin: "12px 0", position: "relative" }}>
            <svg viewBox="0 0 200 60" preserveAspectRatio="none" style={{ width: "100%", height: "100%" }}>
              <path 
                d="M0,40 C20,35 40,25 60,30 C80,35 100,20 120,25 C140,30 160,15 180,20 C190,22 195,18 200,20" 
                fill="none"
                stroke={activePair.change24h >= 0 ? "var(--success)" : "var(--danger)"}
                strokeWidth="2"
              />
            </svg>
          </div>
        </section>

        {/* ORDER FORM */}
        <section className="order-form">
          {/* Buy/Sell Tabs */}
          <div className="order-tabs">
            <button
              className={`order-tab ${formData.side === "buy" ? "active" : ""}`}
              onClick={() => updateField("side", "buy")}
            >
              Buy {activePair.base}
            </button>
            <button
              className={`order-tab ${formData.side === "sell" ? "active" : ""}`}
              onClick={() => updateField("side", "sell")}
            >
              Sell {activePair.base}
            </button>
          </div>

          {/* Order Type Tabs */}
          <div className="order-type-tabs">
            <button
              className={`order-type-tab ${formData.orderType === "limit" ? "active" : ""}`}
              onClick={() => updateField("orderType", "limit")}
            >
              Limit
            </button>
            <button
              className={`order-type-tab ${formData.orderType === "market" ? "active" : ""}`}
              onClick={() => updateField("orderType", "market")}
            >
              Market
            </button>
          </div>

          {/* Order Inputs */}
          <div className="order-inputs">
            {formData.orderType === "limit" && (
              <div className="order-input-group">
                <label>Price (EUR)</label>
                <div className="input-with-actions">
                  <button className="input-action" onClick={() => {
                    const newPrice = (parseFloat(formData.price) - activePair.price * 0.001).toFixed(activePair.priceDecimals);
                    updateField("price", newPrice);
                  }}>−</button>
                  <input
                    type="text"
                    value={formData.price}
                    onChange={(e) => updateField("price", e.target.value)}
                    className="order-input"
                    placeholder="0.00"
                  />
                  <button className="input-action" onClick={() => {
                    const newPrice = (parseFloat(formData.price) + activePair.price * 0.001).toFixed(activePair.priceDecimals);
                    updateField("price", newPrice);
                  }}>+</button>
                </div>
              </div>
            )}

            <div className="order-input-group">
              <label>Amount ({activePair.base})</label>
              <div className="input-with-actions">
                <button className="input-action" onClick={setMaxAmount}>Max</button>
                <input
                  type="text"
                  placeholder="0.00"
                  value={formData.amount}
                  onChange={(e) => updateField("amount", e.target.value)}
                  className="order-input"
                />
                <button className="input-action">{activePair.base}</button>
              </div>
            </div>

            {/* Percentage buttons */}
            <div style={{ display: "flex", gap: 6, marginTop: 8 }}>
              {[25, 50, 75, 100].map(pct => (
                <button
                  key={pct}
                  onClick={() => setPercentage(pct / 100)}
                  style={{
                    flex: 1,
                    padding: "6px 8px",
                    borderRadius: 6,
                    background: "var(--bg-soft)",
                    border: "1px solid var(--border)",
                    fontSize: 11,
                    fontWeight: 600,
                    color: "var(--muted)",
                    cursor: "pointer",
                  }}
                >
                  {pct}%
                </button>
              ))}
            </div>

            {/* Available balance */}
            <div style={{ 
              display: "flex", 
              justifyContent: "space-between", 
              fontSize: 12, 
              color: "var(--muted)",
              marginTop: 8 
            }}>
              <span>Available</span>
              <span style={{ fontWeight: 600 }}>€{availableBalance.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
            </div>

            {formData.total && (
              <>
                <div className="order-total">
                  <span>Total</span>
                  <span className="total-value">€{parseFloat(formData.total).toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                </div>
                {fee && (
                  <div style={{ 
                    display: "flex", 
                    justifyContent: "space-between", 
                    fontSize: 11, 
                    color: "var(--muted)",
                    padding: "8px 10px",
                    background: "var(--bg-soft)",
                    borderRadius: 8 
                  }}>
                    <span>Fee ({fee.feePercent.toFixed(2)}%)</span>
                    <span>€{fee.fee.toFixed(2)}</span>
                  </div>
                )}
              </>
            )}

            {/* Validation errors */}
            {!validation.isValid && validation.errors.length > 0 && (
              <div style={{ 
                padding: 10, 
                background: "rgba(214, 69, 69, 0.1)", 
                borderRadius: 8,
                fontSize: 11,
                color: "#d64545"
              }}>
                {validation.errors.map((err, i) => (
                  <div key={i}>• {err}</div>
                ))}
              </div>
            )}

            {/* Order submission errors */}
            {orderError && (
              <div style={{ 
                padding: 10, 
                background: "rgba(214, 69, 69, 0.1)", 
                borderRadius: 8,
                fontSize: 11,
                color: "#d64545"
              }}>
                {orderError}
              </div>
            )}

            {/* Order success message */}
            {orderSuccess && (
              <div style={{ 
                padding: 10, 
                background: "rgba(34, 197, 94, 0.1)", 
                borderRadius: 8,
                fontSize: 11,
                color: "#22c55e",
                whiteSpace: "pre-line"
              }}>
                {orderSuccess}
              </div>
            )}

            <button 
              className={`order-button ${formData.side}`}
              onClick={handleOrderSubmit}
              disabled={!validation.isValid || isSubmittingOrder}
              style={{ opacity: (validation.isValid && !isSubmittingOrder) ? 1 : 0.5 }}
            >
              {isSubmittingOrder ? 'Placing Order...' : `${formData.side === "buy" ? "Buy" : "Sell"} ${activePair.base}`}
            </button>
          </div>
        </section>

        {/* ORDER BOOK & TRADES TOGGLE WITH MORE OPTIONS */}
        <div className="trading-view-tabs" style={{ display: "flex", gap: "4px", marginTop: "12px", background: "var(--bg-soft)", padding: "4px", borderRadius: "8px" }}>
          <button 
            className={`category-chip ${!showOrderHistory && !showDepthChart ? "active" : ""}`}
            onClick={() => { setShowOrderHistory(false); setShowDepthChart(false); }}
            style={{ flex: 1 }}
          >
            Order Book
          </button>
          <button 
            className={`category-chip ${showOrderHistory ? "active" : ""}`}
            onClick={() => { setShowOrderHistory(true); setShowDepthChart(false); }}
            style={{ flex: 1 }}
          >
            Recent Trades
          </button>
          <button 
            className={`category-chip ${showDepthChart ? "active" : ""}`}
            onClick={() => { setShowOrderHistory(false); setShowDepthChart(true); }}
            style={{ flex: 1 }}
          >
            Depth Chart
          </button>
        </div>

        {/* DEPTH CHART */}
        {showDepthChart && (
          <section className="depth-chart">
            <div className="depth-chart-container" style={{ height: "300px", background: "var(--bg-soft)", borderRadius: "8px", padding: "16px", position: "relative" }}>
              <div className="depth-chart-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "12px" }}>
                <span className="depth-title">Market Depth</span>
                <div className="depth-legend" style={{ display: "flex", gap: "16px", fontSize: "12px" }}>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "12px", height: "12px", background: "var(--danger)", borderRadius: "2px" }}></div>
                    <span>Sell</span>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: "4px" }}>
                    <div style={{ width: "12px", height: "12px", background: "var(--success)", borderRadius: "2px" }}></div>
                    <span>Buy</span>
                  </div>
                </div>
              </div>
              
              {/* Simplified depth chart visualization */}
              <svg viewBox="0 0 400 250" style={{ width: "100%", height: "250px" }}>
                {/* Grid lines */}
                {[...Array(6)].map((_, i) => (
                  <line
                    key={`h-${i}`}
                    x1="0"
                    y1={i * 40 + 20}
                    x2="400"
                    y2={i * 40 + 20}
                    stroke="var(--border)"
                    strokeWidth="0.5"
                  />
                ))}
                
                {/* Buy side depth */}
                <path
                  d="M200,250 L200,150 L220,155 L240,165 L260,180 L280,200 L300,220 L320,235 L340,245 L360,248 L380,249 L400,250 L400,250 Z"
                  fill="rgba(34, 197, 94, 0.3)"
                  stroke="var(--success)"
                  strokeWidth="1"
                />
                
                {/* Sell side depth */}
                <path
                  d="M200,250 L200,140 L180,148 L160,160 L140,175 L120,195 L100,215 L80,230 L60,242 L40,247 L20,249 L0,250 L0,250 Z"
                  fill="rgba(239, 68, 68, 0.3)"
                  stroke="var(--danger)"
                  strokeWidth="1"
                />
                
                {/* Current price line */}
                <line
                  x1="200"
                  y1="20"
                  x2="200"
                  y2="250"
                  stroke="var(--text)"
                  strokeWidth="1"
                  strokeDasharray="4,4"
                />
              </svg>
              
              <div className="depth-stats" style={{ display: "flex", justifyContent: "space-around", marginTop: "12px", fontSize: "11px" }}>
                <div>
                  <div style={{ color: "var(--muted)" }}>Max Buy Volume</div>
                  <div style={{ fontWeight: "600" }}>€{(orderBook.bids.reduce((sum, bid) => sum + bid.total, 0) / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)" }}>Max Sell Volume</div>
                  <div style={{ fontWeight: "600" }}>€{(orderBook.asks.reduce((sum, ask) => sum + ask.total, 0) / 1000).toFixed(1)}K</div>
                </div>
                <div>
                  <div style={{ color: "var(--muted)" }}>Spread</div>
                  <div style={{ fontWeight: "600" }}>€{((orderBook.asks[0]?.price || 0) - (orderBook.bids[0]?.price || 0)).toFixed(2)}</div>
                </div>
              </div>
            </div>
          </section>
        )}
        {!showOrderHistory && (
          <section className="order-book">
            <div className="order-book-container">
              {/* Asks (Sell Orders) */}
              <div className="order-book-section asks">
                <div className="order-book-header">
                  <span>Price (EUR)</span>
                  <span>Amount</span>
                  <span>Total</span>
                </div>
                <div className="order-book-list">
                  {orderBook.asks.slice().reverse().slice(0, 8).map((ask, index) => (
                    <div 
                      key={`ask-${index}`}
                      className="order-book-row"
                      onClick={() => updateField("price", ask.price.toFixed(activePair.priceDecimals))}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="row-price negative">{ask.price.toFixed(activePair.priceDecimals)}</span>
                      <span className="row-amount">{ask.amount.toFixed(activePair.amountDecimals)}</span>
                      <span className="row-total">{ask.total.toLocaleString("de-DE")}</span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Current Price */}
              <div className="order-book-spread">
                <span className="spread-price">€{currentPrice.toFixed(activePair.priceDecimals)}</span>
                <span className="spread-label">Current Price</span>
              </div>

              {/* Bids (Buy Orders) */}
              <div className="order-book-section bids">
                <div className="order-book-list">
                  {orderBook.bids.slice(0, 8).map((bid, index) => (
                    <div 
                      key={`bid-${index}`}
                      className="order-book-row"
                      onClick={() => updateField("price", bid.price.toFixed(activePair.priceDecimals))}
                      style={{ cursor: "pointer" }}
                    >
                      <span className="row-price positive">{bid.price.toFixed(activePair.priceDecimals)}</span>
                      <span className="row-amount">{bid.amount.toFixed(activePair.amountDecimals)}</span>
                      <span className="row-total">{bid.total.toLocaleString("de-DE")}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </section>
        )}

        {/* RECENT TRADES */}
        {showOrderHistory && (
          <section className="recent-trades">
            <div className="trades-list">
              {recentTrades.slice(0, 15).map((trade, index) => (
                <div key={index} className="trade-row">
                  <span className="trade-time">{trade.time}</span>
                  <span className={`trade-price ${trade.side === "buy" ? "positive" : "negative"}`}>
                    €{trade.price.toFixed(activePair.priceDecimals)}
                  </span>
                  <span className="trade-amount">{trade.amount.toFixed(activePair.amountDecimals)}</span>
                  <span className={`trade-side ${trade.side}`}>
                    {trade.side === "buy" ? "B" : "S"}
                  </span>
                </div>
              ))}
            </div>
          </section>
        )}

        {/* ORDER HISTORY */}
        {orderHistory.length > 0 && (
          <section style={{ marginTop: 12 }}>
            <h3 className="section-title" style={{ marginBottom: 8 }}>
              Recent Orders ({orderHistory.length})
            </h3>
            <div className="transactions-card">
              {orderHistory.map((order, index) => (
                <div key={index} className={`transaction-row ${index < orderHistory.length - 1 ? "has-border" : ""}`}>
                  <div className={`transaction-type-icon ${order.side}`}>
                    {order.side === "buy" ? (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M12 5v14M5 12h14" />
                      </svg>
                    ) : (
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M5 12h14" />
                      </svg>
                    )}
                  </div>
                  <div className="transaction-info">
                    <div className="transaction-asset">
                      <span className="asset-name">{order.side.toUpperCase()}</span>
                      <span className="asset-symbol">{activePair.base}</span>
                    </div>
                    <div className="transaction-meta">
                      <span className="tx-type-label">{order.orderType} order</span>
                    </div>
                  </div>
                  <div className="transaction-amounts">
                    <div className="tx-amount">{order.amount} {activePair.base}</div>
                    <div className="tx-value">€{order.total}</div>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>

      <BottomNav
        onMenuClick={() => setIsSidebarOpen(true)}
        isMenuActive={isSidebarOpen}
      />
    </div>
  );
}

