"use client";

import * as React from "react";
import { Suspense } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import DashboardShell from "@/components/dashboard/analytics/DashboardShell";

export const dynamic = "force-dynamic";
import {
  useOrderForm,
  OrderSide,
  TradeInstrument,
} from "@/docs/hooks/useOrderForm";

interface OrderBookEntry {
  price: number;
  amount: number;
  total: number;
}

interface RecentTrade {
  time: string;
  price: number;
  amount: number;
  side: "buy" | "sell";
}

interface TradeInstrumentApi extends Omit<TradeInstrument, "price"> {
  price: number | null;
}

function TradePageContent() {
  const searchParams = useSearchParams();
  const sideParam = searchParams?.get("side");
  const pairParam = searchParams?.get("pair");

  const [isClient, setIsClient] = React.useState(false);
  const [instruments, setInstruments] = React.useState<TradeInstrument[]>([]);
  const [instrumentsLoading, setInstrumentsLoading] = React.useState(true);
  const [instrumentsError, setInstrumentsError] = React.useState<string | null>(null);
  const [activePairId, setActivePairId] = React.useState<string | null>(pairParam ?? null);

  const [orderBook, setOrderBook] = React.useState<{ bids: OrderBookEntry[]; asks: OrderBookEntry[] }>({ bids: [], asks: [] });
  const [orderBookLoading, setOrderBookLoading] = React.useState(false);
  const [orderBookError, setOrderBookError] = React.useState<string | null>(null);

  const [recentTrades, setRecentTrades] = React.useState<RecentTrade[]>([]);
  const [orderBookUnavailable, setOrderBookUnavailable] = React.useState(false);
  const [recentTradesUnavailable, setRecentTradesUnavailable] = React.useState(false);
  const [recentTradesLoading, setRecentTradesLoading] = React.useState(false);
  const [recentTradesError, setRecentTradesError] = React.useState<string | null>(null);

  const [showOrderHistory, setShowOrderHistory] = React.useState(false);
  const [showDepthChart, setShowDepthChart] = React.useState(false);
  const [isSubmittingOrder, setIsSubmittingOrder] = React.useState(false);
  const [orderError, setOrderError] = React.useState<string | null>(null);
  const [orderSuccess, setOrderSuccess] = React.useState<string | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    let mounted = true;

    async function loadInstruments() {
      setInstrumentsLoading(true);
      setInstrumentsError(null);

      try {
        const response = await fetch("/api/trade/pairs", { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok || !payload?.ok) {
          throw new Error(payload?.message || "Failed to load trading pairs.");
        }

        const rows = (payload.data || []) as TradeInstrumentApi[];
        const mapped: TradeInstrument[] = rows
          .filter((row) => typeof row.price === "number")
          .map((row) => ({ ...row, price: row.price as number }));

        if (!mounted) return;

        if (!mapped.length) {
          setInstruments([]);
          setInstrumentsError("No trade instruments are currently available.");
          return;
        }

        setInstruments(mapped);
        const hasRequestedPair = pairParam && mapped.some((item) => item.pairId === pairParam || item.pair === pairParam);
        if (hasRequestedPair) {
          const matched = mapped.find((item) => item.pairId === pairParam || item.pair === pairParam);
          setActivePairId(matched?.pairId ?? mapped[0].pairId);
        } else {
          setActivePairId(mapped[0].pairId);
        }
      } catch (error) {
        if (!mounted) return;
        setInstruments([]);
        setInstrumentsError(error instanceof Error ? error.message : "Failed to load trading pairs.");
      } finally {
        if (mounted) {
          setInstrumentsLoading(false);
        }
      }
    }

    void loadInstruments();

    return () => {
      mounted = false;
    };
  }, [pairParam]);

  const activePair = React.useMemo(
    () => instruments.find((item) => item.pairId === activePairId) ?? null,
    [instruments, activePairId],
  );

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
  } = useOrderForm(
    activePair ?? {
      pair: "",
      pairId: "",
      base: "",
      quote: "EUR",
      minAmount: 0,
      maxAmount: 0,
      priceDecimals: 2,
      amountDecimals: 2,
      price: 0,
    },
    10000,
    sideParam as OrderSide,
  );

  React.useEffect(() => {
    let isCancelled = false;
    const pair = `${activePair.base}/EUR`;

    const fetchOrderBook = async () => {
      try {
        const response = await fetch(`/api/trade/orderbook?pair=${encodeURIComponent(pair)}`, { cache: "no-store" });
        const payload = await response.json();

        if (
          !response.ok ||
          payload?.ok === false ||
          !payload ||
          !Array.isArray(payload.bids) ||
          !Array.isArray(payload.asks)
        ) {
          if (!isCancelled) {
            setOrderBook({ bids: [], asks: [] });
            setOrderBookUnavailable(true);
          }
          return;
        }

        if (!isCancelled) {
          setOrderBook(payload as { bids: OrderBookEntry[]; asks: OrderBookEntry[] });
          setOrderBookUnavailable(false);
        }
      } catch {
        if (!isCancelled) {
          setOrderBook({ bids: [], asks: [] });
          setOrderBookUnavailable(true);
        }
      }
    };

    const fetchRecentTrades = async () => {
      try {
        const response = await fetch(`/api/trades/recent?pair=${encodeURIComponent(pair)}`, { cache: "no-store" });
        const payload = await response.json();

        if (!response.ok || payload?.ok === false || !Array.isArray(payload)) {
          if (!isCancelled) {
            setRecentTrades([]);
            setRecentTradesUnavailable(true);
          }
          return;
        }

        if (!isCancelled) {
          setRecentTrades(payload as RecentTrade[]);
          setRecentTradesUnavailable(false);
        }
      } catch {
        if (!isCancelled) {
          setRecentTrades([]);
          setRecentTradesUnavailable(true);
        }
      }
    };

    void Promise.all([fetchOrderBook(), fetchRecentTrades()]);

    return () => {
      isCancelled = true;
    };
  }, [activePair.base]);

  React.useEffect(() => {
    if (!activePair?.pair) {
      return;
    }

    let mounted = true;

    const fetchOrderBook = async () => {
      setOrderBookLoading(true);
      setOrderBookError(null);

      try {
        const response = await fetch(`/api/trade/orderbook?pair=${encodeURIComponent(activePair.pair)}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load order book.");
        }

        if (mounted) {
          setOrderBook({
            bids: Array.isArray(payload?.bids) ? payload.bids : [],
            asks: Array.isArray(payload?.asks) ? payload.asks : [],
          });
        }
      } catch (error) {
        if (mounted) {
          setOrderBook({ bids: [], asks: [] });
          setOrderBookError(error instanceof Error ? error.message : "Failed to load order book.");
        }
      } finally {
        if (mounted) {
          setOrderBookLoading(false);
        }
      }
    };

    const fetchRecentTrades = async () => {
      setRecentTradesLoading(true);
      setRecentTradesError(null);

      try {
        const response = await fetch(`/api/trades/recent?pair=${encodeURIComponent(activePair.pair)}`, {
          cache: "no-store",
        });
        const payload = await response.json();

        if (!response.ok) {
          throw new Error(payload?.error || "Failed to load recent trades.");
        }

        if (mounted) {
          setRecentTrades(Array.isArray(payload) ? payload : []);
        }
      } catch (error) {
        if (mounted) {
          setRecentTrades([]);
          setRecentTradesError(error instanceof Error ? error.message : "Failed to load recent trades.");
        }
      } finally {
        if (mounted) {
          setRecentTradesLoading(false);
        }
      }
    };

    void fetchOrderBook();
    void fetchRecentTrades();

    const interval = setInterval(() => {
      void fetchOrderBook();
      void fetchRecentTrades();
    }, 5000);

    return () => {
      mounted = false;
      clearInterval(interval);
    };
  }, [activePair?.pair]);

  if (!isClient) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;
  }

  if (instrumentsLoading) {
    return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;
  }

  if (instrumentsError) {
    return <div className="error-message">{instrumentsError}</div>;
  }

  if (!activePair) {
    return <div className="error-message">No active trading pair selected.</div>;
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
        setOrderError(result.errors?.join(", ") || "Failed to place order");
      }
    } catch {
      setOrderError("Network error. Please try again.");
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
        <section className="tradewill-asset-overview">
          <div className="tradewill-section-header">
            <div>
              <h1 className="tradewill-page-title">Trade<span className="live-dot" style={{ marginLeft: 8 }}></span></h1>
              <div className="tradewill-total-asset-label">Professional Trading Interface</div>
            </div>
          </div>

          <section className="trading-pairs">
            <div className="pairs-scroll">
              {instruments.map((pair) => (
                <button key={pair.pairId} className={`pair-chip ${activePair.pairId === pair.pairId ? "active" : ""}`} onClick={() => setActivePairId(pair.pairId)}>
                  <span className="pair-name">{pair.base}/{pair.quote}</span>
                </button>
              ))}
            </div>
          </section>

          <section className="price-display">
            <div className="current-price">
              <div className="price-header">
                <span className="price-label">Current Price</span>
              </div>
              <div className="price-value">€{currentPrice.toFixed(activePair.priceDecimals)}<small>{activePair.quote}</small></div>
            </div>
          </section>

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
                  <label>Price ({activePair.quote})</label>
                  <div className="input-with-actions">
                    <button className="input-action" onClick={() => updateField("price", (parseFloat(formData.price || "0") - currentPrice * 0.001).toFixed(activePair.priceDecimals))}>−</button>
                    <input type="text" value={formData.price} onChange={(e) => updateField("price", e.target.value)} className="order-input" placeholder="0.00" />
                    <button className="input-action" onClick={() => updateField("price", (parseFloat(formData.price || "0") + currentPrice * 0.001).toFixed(activePair.priceDecimals))}>+</button>
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
                {[25, 50, 75, 100].map((pct) => (
                  <button key={pct} onClick={() => setPercentage(pct / 100)} className="percentage-btn">
                    {pct}%
                  </button>
                ))}
              </div>
              <div className="balance-info">
                <span>Available</span>
                <span>€{availableBalance.toLocaleString("de-DE", { minimumFractionDigits: 2 })}</span>
              </div>
              {formData.total && fee && (
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
                {isSubmittingOrder ? "Placing Order..." : `${formData.side === "buy" ? "Buy" : "Sell"} ${activePair.base}`}
              </button>
            </div>
          </section>

          <div className="trading-view-tabs">
            <button className={`category-chip ${!showOrderHistory && !showDepthChart ? "active" : ""}`} onClick={() => { setShowOrderHistory(false); setShowDepthChart(false); }}>Order Book</button>
            <button className={`category-chip ${showOrderHistory ? "active" : ""}`} onClick={() => { setShowOrderHistory(true); setShowDepthChart(false); }}>Recent Trades</button>
            <button className={`category-chip ${showDepthChart ? "active" : ""}`} onClick={() => { setShowOrderHistory(false); setShowDepthChart(true); }}>Depth Chart</button>
          </div>

          {!showOrderHistory && !showDepthChart && (
            <section className="order-book">
              {orderBookLoading && <div className="tradewill-total-asset-label">Loading order book…</div>}
              {orderBookError && <div className="error-message">{orderBookError}</div>}
              {!orderBookLoading && !orderBookError && orderBook.asks.length === 0 && orderBook.bids.length === 0 && (
                <div className="tradewill-total-asset-label">No order book data available.</div>
              )}
              {!orderBookError && (orderBook.asks.length > 0 || orderBook.bids.length > 0) && (
                <div className="order-book-container">
                  <div className="order-book-section asks">
                    <div className="order-book-header"><span>Price ({activePair.quote})</span><span>Amount</span><span>Total</span></div>
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
              )}
            </section>
          )}

          {showOrderHistory && (
            <section className="recent-trades">
              {recentTradesLoading && <div className="tradewill-total-asset-label">Loading recent trades…</div>}
              {recentTradesError && <div className="error-message">{recentTradesError}</div>}
              {!recentTradesLoading && !recentTradesError && recentTrades.length === 0 && (
                <div className="tradewill-total-asset-label">No recent trades available.</div>
              )}
              {!recentTradesError && recentTrades.length > 0 && (
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
              )}
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
