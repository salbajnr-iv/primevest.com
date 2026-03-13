"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";

export const dynamic = 'force-dynamic';
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
  const spread = currentPrice * 0.0005;
  for (let i = 0; i < 10; i++) {
    const price = currentPrice - (i + 1) * spread;
    const amount = Math.random() * 8 + 0.5;
    const total = price * amount;
    bids.push({ price: Number(price.toFixed(2)), amount: Number(amount.toFixed(4)), total: Number(total.toFixed(2)) });
  }
  for (let i = 0; i < 10; i++) {
    const price = currentPrice + (i + 1) * spread;
    const amount = Math.random() * 8 + 0.5;
    const total = price * amount;
    asks.push({ price: Number(price.toFixed(2)), amount: Number(amount.toFixed(4)), total: Number(total.toFixed(2)) });
  }
  return { bids, asks };
}

interface RecentTrade {
  time: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
}

function generateRecentTrades(currentPrice: number): RecentTrade[] {
  const trades: RecentTrade[] = [];
  const now = new Date();
  const tradeSizes = [0.1, 0.25, 0.5, 1.0, 2.5, 5.0];
  for (let i = 0; i < 20; i++) {
    const time = new Date(now.getTime() - i * 15000);
    const priceVariation = (Math.random() - 0.5) * currentPrice * 0.001;
    const price = currentPrice + priceVariation;
    const size = tradeSizes[Math.floor(Math.random() * tradeSizes.length)];
    trades.push({ time: time.toLocaleTimeString("de-DE", { hour12: false }), price: Number(price.toFixed(2)), amount: size, side: Math.random() > 0.48 ? "buy" : "sell" });
  }
  return trades;
}

function TradePageContent() {
  const searchParams = useSearchParams();
  const [isClient, setIsClient] = React.useState(false);
  const pairParam = searchParams?.get('pair');
  const sideParam = searchParams?.get('side');
  const [activePair, setActivePair] = React.useState(() => {
    if (pairParam) {
      const foundPair = tradingPairs.find(p => p.id === pairParam);
      return foundPair || tradingPairs[0];
    }
    return tradingPairs[0];
  });
  const [orderBook, setOrderBook] = React.useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [recentTrades, setRecentTrades] = React.useState<RecentTrade[]>([]);
  const [showOrderHistory, setShowOrderHistory] = React.useState(false);
  const [showDepthChart, setShowDepthChart] = React.useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = React.useState<string | null>(null);

  const { data: marketData } = usePriceSimulation(
    tradingPairs.map(p => ({ id: p.id, name: p.base, symbol: p.base, price: p.price, change24h: p.change24h, marketCap: 0, volume24h: p.volume24h, high24h: p.price * 1.02, low24h: p.price * 0.98 })),
    2000
  );

  const { formData, updateField, setMaxAmount, setPercentage, validateOrder, calculateFee, submitOrder, orderHistory, availableBalance } = useOrderForm(activePair, 10000, sideParam as OrderSide);
  const currentPriceData = marketData.find(m => m.id === activePair.id);
  const currentPrice = currentPriceData?.price || activePair.price;

  React.useEffect(() => {
    setOrderBook(generateOrderBook(currentPrice));
    setRecentTrades(generateRecentTrades(currentPrice));
  }, [activePair, currentPrice]);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;
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
    <DashboardShell
      mainClassName="pb-20"
      pageHeader={
        <div className="tradewill-breadcrumb" style={{ padding: "12px 0" }}>
          <Link href="/dashboard" className="tradewill-nav-item">Dashboard</Link>
          <span className="tradewill-breadcrumb-separator">/</span>
          <span>Trade</span>
        </div>
      }
    >
      <div className="tradewill-content">
            {/* Trading Interface */}
            <section className="tradewill-asset-overview">
              <div className="tradewill-section-header">
                <div>
                  <h1 className="tradewill-page-title">Trade<span className="live-dot" style={{ marginLeft: 8 }}></span></h1>
                  <div className="tradewill-total-asset-label">Professional Trading Interface</div>
                </div>
              </div>

              {/* Trading Pairs */}
              <section className="trading-pairs">
                <div className="pairs-scroll">
                  {tradingPairs.map((pair) => (
                    <button key={pair.id} className={`pair-chip ${activePair.id === pair.id ? "active" : ""}`} onClick={() => setActivePair(pair)}>
                      <span className="pair-name">{pair.base}/EUR</span>
                      <span className={`pair-change ${pair.change24h >= 0 ? "positive" : "negative"}`}>
                        {pair.change24h >= 0 ? "+" : ""}{pair.change24h.toFixed(2)}%
                      </span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Price Display */}
              <section className="price-display">
                <div className="current-price">
                  <div className="price-header">
                    <span className="price-label">Current Price</span>
                  </div>
                  <div className="price-value">€{formatPrice(currentPrice, activePair.base)}<small>EUR</small></div>
                  <div className="price-details">
                    <span className={`price-change ${activePair.change24h >= 0 ? "positive" : "negative"}`}>
                      {activePair.change24h >= 0 ? "+" : ""}{activePair.change24h.toFixed(2)}% (24h)
                    </span>
                  </div>
                </div>
              </section>

              {/* Order Form */}
              <section className="order-form">
                <div className="order-tabs">
                  <button className={`order-tab ${formData.side === "buy" ? "active" : ""}`} onClick={() => updateField("side", "buy")}>Buy {activePair.base}</button>
                  <button className={`order-tab ${formData.side === "sell" ? "active" : ""}`} onClick={() => updateField("side", "sell")}>Sell {activePair.base}</button>
                </div>
                <div className="order-type-tabs">
                  <button className={`order-type-tab ${formData.orderType === "limit" ? "active" : ""}`} onClick={() => updateField("orderType", "limit")}>Limit</button>
                  <button className={`order-type-tab ${formData.orderType === "market" ? "active" : ""}`} onClick={() => updateField("orderType", "market")}>Market</button>
                </div>
                <div className="order-inputs">
                  {formData.orderType === "limit" && (
                    <div className="order-input-group">
                      <label>Price (EUR)</label>
                      <div className="input-with-actions">
                        <button className="input-action" onClick={() => updateField("price", (parseFloat(formData.price) - activePair.price * 0.001).toFixed(activePair.priceDecimals))}>−</button>
                        <input type="text" value={formData.price} onChange={(e) => updateField("price", e.target.value)} className="order-input" placeholder="0.00" />
                        <button className="input-action" onClick={() => updateField("price", (parseFloat(formData.price) + activePair.price * 0.001).toFixed(activePair.priceDecimals))}>+</button>
                      </div>
                    </div>
                  )}
                  <div className="order-input-group">
                    <label>Amount ({activePair.base})</label>
                    <div className="input-with-actions">
                      <button className="input-action" onClick={setMaxAmount}>Max</button>
                      <input type="text" placeholder="0.00" value={formData.amount} onChange={(e) => updateField("amount", e.target.value)} className="order-input" />
                      <button className="input-action">{activePair.base}</button>
                    </div>
                  </div>
                  <div className="percentage-buttons">
                    {[25, 50, 75, 100].map(pct => (
                      <button key={pct} onClick={() => setPercentage(pct / 100)} className="percentage-btn">
                        {pct}%
                      </button>
                    ))}
                  </div>
                  <div className="balance-info">
                    <span>Available</span>
                    <span>€{availableBalance.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
                  </div>
                  {formData.total && (
                    <>
                      <div className="order-total"><span>Total</span><span className="total-value">€{parseFloat(formData.total).toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span></div>
                      <div className="fee-info">
                        <span>Fee ({fee.feePercent.toFixed(2)}%)</span>
                        <span>€{fee.fee.toFixed(2)}</span>
                      </div>
                    </>
                  )}
                  {!validation.isValid && validation.errors.length > 0 && (
                    <div className="error-message">
                      {validation.errors.map((err, i) => <div key={i}>• {err}</div>)}
                    </div>
                  )}
                  {orderError && <div className="error-message">{orderError}</div>}
                  {orderSuccess && <div className="success-message" style={{ whiteSpace: "pre-line" }}>{orderSuccess}</div>}
                  <button className={`order-button ${formData.side}`} onClick={handleOrderSubmit} disabled={!validation.isValid || isSubmittingOrder} style={{ opacity: (validation.isValid && !isSubmittingOrder) ? 1 : 0.5 }}>
                    {isSubmittingOrder ? 'Placing Order...' : `${formData.side === "buy" ? "Buy" : "Sell"} ${activePair.base}`}
                  </button>
                </div>
              </section>

              {/* Trading View Tabs */}
              <div className="trading-view-tabs">
                <button className={`category-chip ${!showOrderHistory && !showDepthChart ? "active" : ""}`} onClick={() => { setShowOrderHistory(false); setShowDepthChart(false); }}>Order Book</button>
                <button className={`category-chip ${showOrderHistory ? "active" : ""}`} onClick={() => { setShowOrderHistory(true); setShowDepthChart(false); }}>Recent Trades</button>
                <button className={`category-chip ${showDepthChart ? "active" : ""}`} onClick={() => { setShowOrderHistory(false); setShowDepthChart(true); }}>Depth Chart</button>
              </div>

              {!showOrderHistory && !showDepthChart && (
                <section className="order-book">
                  <div className="order-book-container">
                    <div className="order-book-section asks">
                      <div className="order-book-header"><span>Price (EUR)</span><span>Amount</span><span>Total</span></div>
                      <div className="order-book-list">
                        {orderBook.asks.slice().reverse().slice(0, 8).map((ask, index) => (
                          <div key={`ask-${index}`} className="order-book-row" onClick={() => updateField("price", ask.price.toFixed(activePair.priceDecimals))} style={{ cursor: "pointer" }}>
                            <span className="row-price negative">{ask.price.toFixed(activePair.priceDecimals)}</span>
                            <span className="row-amount">{ask.amount.toFixed(activePair.amountDecimals)}</span>
                            <span className="row-total">{ask.total.toLocaleString("de-DE")}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="order-book-spread">
                      <span className="spread-price">€{currentPrice.toFixed(activePair.priceDecimals)}</span>
                      <span className="spread-label">Current Price</span>
                    </div>
                    <div className="order-book-section bids">
                      <div className="order-book-list">
                        {orderBook.bids.slice(0, 8).map((bid, index) => (
                          <div key={`bid-${index}`} className="order-book-row" onClick={() => updateField("price", bid.price.toFixed(activePair.priceDecimals))} style={{ cursor: "pointer" }}>
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

              {showOrderHistory && (
                <section className="recent-trades">
                  <div className="trades-list">
                    {recentTrades.slice(0, 15).map((trade, index) => (
                      <div key={index} className="trade-row">
                        <span className="trade-time">{trade.time}</span>
                        <span className={`trade-price ${trade.side === "buy" ? "positive" : "negative"}`}>€{trade.price.toFixed(activePair.priceDecimals)}</span>
                        <span className="trade-amount">{trade.amount.toFixed(activePair.amountDecimals)}</span>
                        <span className={`trade-side ${trade.side}`}>{trade.side === "buy" ? "B" : "S"}</span>
                      </div>
                    ))}
                  </div>
                </section>
              )}

              {orderHistory.length > 0 && (
                <section style={{ marginTop: 12 }}>
                  <h3 className="section-title" style={{ marginBottom: 8 }}>Recent Orders ({orderHistory.length})</h3>
                  <div className="transactions-card">
                    {orderHistory.map((order, index) => (
                      <div key={index} className={`transaction-row ${index < orderHistory.length - 1 ? "has-border" : ""}`}>
                        <div className={`transaction-type-icon ${order.side}`}>
                          {order.side === "buy" ? <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 5v14M5 12h14" /></svg> : <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M5 12h14" /></svg>}
                        </div>
                        <div className="transaction-info">
                          <div className="transaction-asset"><span className="asset-name">{order.side.toUpperCase()}</span><span className="asset-symbol">{activePair.base}</span></div>
                          <div className="transaction-meta"><span className="tx-type-label">{order.orderType} order</span></div>
                        </div>
                        <div className="transaction-amounts"><div className="tx-amount">{order.amount} {activePair.base}</div><div className="tx-value">€{order.total}</div></div>
                      </div>
                    ))}
                  </div>
                </section>
              )}
            </section>
      </div>
    </DashboardShell>
  );
}

export default function TradePage() {
  return (
    <Suspense fallback={
      <div className="tradewill-loading">
        <div className="tradewill-spinner"></div>
        <span>Loading Trade Interface...</span>
      </div>
    }>
      <TradePageContent />
    </Suspense>
  );
}
