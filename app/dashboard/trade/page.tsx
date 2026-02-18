"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { 
  useOrderForm, 
  tradingPairs, 
  formatCurrency, 
  formatNumber,
  OrderSide,
  OrderType 
} from "@/hooks/useOrderForm";
import { usePriceSimulation, MarketData, formatPrice } from "@/hooks/usePriceSimulation";

// Order book type
interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

// Generate mock order book data
function generateOrderBook(currentPrice: number): { bids: OrderBookEntry[]; asks: OrderBookEntry[] } {
  const bids: OrderBookEntry[] = [];
  const asks: OrderBookEntry[] = [];

  // Generate bids (buy orders) below current price
  for (let i = 0; i < 8; i++) {
    const price = currentPrice - (i + 1) * (currentPrice * 0.0001);
    const amount = Math.random() * 5 + 0.1;
    bids.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number((price * amount).toFixed(2)),
    });
  }

  // Generate asks (sell orders) above current price
  for (let i = 0; i < 8; i++) {
    const price = currentPrice + (i + 1) * (currentPrice * 0.0001);
    const amount = Math.random() * 5 + 0.1;
    asks.push({
      price: Number(price.toFixed(2)),
      amount: Number(amount.toFixed(4)),
      total: Number((price * amount).toFixed(2)),
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

// Generate mock recent trades
function generateRecentTrades(currentPrice: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = new Date();

  for (let i = 0; i < 15; i++) {
    const time = new Date(now.getTime() - i * 30000);
    const price = currentPrice + (Math.random() - 0.5) * currentPrice * 0.0002;
    trades.push({
      time: time.toLocaleTimeString("de-DE", { hour12: false }),
      price: Number(price.toFixed(2)),
      amount: Number((Math.random() * 2 + 0.01).toFixed(4)),
      side: Math.random() > 0.5 ? "buy" : "sell",
    });
  }

  return trades;
}

export default function TradePage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activePair, setActivePair] = React.useState(tradingPairs[0]);
  const [orderBook, setOrderBook] = React.useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>(
    { bids: [], asks: [] }
  );
  const [recentTrades, setRecentTrades] = React.useState<RecentTrade[]>([]);
  const [showOrderHistory, setShowOrderHistory] = React.useState(false);
  
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
    lastOrderTime,
    availableBalance,
  } = useOrderForm(activePair, 10000);

  // Update order book when price changes
  React.useEffect(() => {
    setOrderBook(generateOrderBook(activePair.price));
    setRecentTrades(generateRecentTrades(activePair.price));
  }, [activePair, marketData]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  // Get current price from simulated data
  const currentPriceData = marketData.find(m => m.id === activePair.id);
  const currentPrice = currentPriceData?.price || activePair.price;

  if (!isClient) {
    return (
      <div className="dashboard-loading">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  const validation = validateOrder();
  const fee = formData.total ? calculateFee(parseFloat(formData.total)) : null;

  const handleOrderSubmit = () => {
    const result = submitOrder();
    if (result.success) {
      // Show success feedback
      alert(`Order placed successfully!\n${formData.side.toUpperCase()} ${formData.amount} ${activePair.base} @ €${formData.price || currentPrice}`);
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
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)}>
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

        {/* PRICE DISPLAY */}
        <section className="price-display">
          <div className="current-price">
            <span className="price-label">Current Price</span>
            <span className="price-value">
              €{formatPrice(currentPrice, activePair.base)}
              <small>EUR</small>
            </span>
            <span className={`price-change ${activePair.change24h >= 0 ? "positive" : "negative"}`}>
              {activePair.change24h >= 0 ? "+" : ""}{activePair.change24h.toFixed(2)}% (24h)
            </span>
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

            <button 
              className={`order-button ${formData.side}`}
              onClick={handleOrderSubmit}
              disabled={!validation.isValid}
              style={{ opacity: validation.isValid ? 1 : 0.5 }}
            >
              {formData.side === "buy" ? "Buy" : "Sell"} {activePair.base}
            </button>
          </div>
        </section>

        {/* ORDER BOOK & TRADES TOGGLE */}
        <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
          <button 
            className={`category-chip ${!showOrderHistory ? "active" : ""}`}
            onClick={() => setShowOrderHistory(false)}
          >
            Order Book
          </button>
          <button 
            className={`category-chip ${showOrderHistory ? "active" : ""}`}
            onClick={() => setShowOrderHistory(true)}
          >
            Recent Trades
          </button>
        </div>

        {/* ORDER BOOK */}
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
                  {orderBook.asks.slice(0, 6).map((ask, index) => (
                    <div 
                      key={index} 
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
                  {orderBook.bids.slice(0, 6).map((bid, index) => (
                    <div 
                      key={index} 
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
              {recentTrades.map((trade, index) => (
                <div key={index} className="trade-row">
                  <span className="trade-time">{trade.time}</span>
                  <span className={`trade-price ${trade.side === "buy" ? "positive" : "negative"}`}>
                    €{trade.price.toFixed(activePair.priceDecimals)}
                  </span>
                  <span className="trade-amount">{trade.amount.toFixed(activePair.amountDecimals)}</span>
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

