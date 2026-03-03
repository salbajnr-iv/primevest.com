"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { 
  Wallet, 
  ArrowUpRight, 
  ArrowDownRight, 
  ArrowLeftRight, 
  Plus,
  TrendingUp,
  TrendingDown,
  DollarSign
} from "lucide-react";

interface WalletData {
  id: string;
  name: string;
  currency: string;
  balance: number;
  available: number;
  frozen: number;
  change24h: number;
  icon: string;
}

const walletsData: WalletData[] = [
  {
    id: "1",
    name: "Euro Wallet",
    currency: "EUR",
    balance: 12500.50,
    available: 12000.00,
    frozen: 500.50,
    change24h: 0,
    icon: "€"
  },
  {
    id: "2",
    name: "Bitcoin Wallet",
    currency: "BTC",
    balance: 0.45,
    available: 0.42,
    frozen: 0.03,
    change24h: 2.45,
    icon: "₿"
  },
  {
    id: "3",
    name: "Ethereum Wallet", 
    currency: "ETH",
    balance: 3.2,
    available: 3.0,
    frozen: 0.2,
    change24h: 1.82,
    icon: "Ξ"
  },
  {
    id: "4",
    name: "USDT Wallet",
    currency: "USDT",
    balance: 5000.00,
    available: 4800.00,
    frozen: 200.00,
    change24h: -0.05,
    icon: "₮"
  }
];

export default function WalletsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [selectedWallet, setSelectedWallet] = React.useState<WalletData | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const totalBalance = walletsData.reduce((sum, wallet) => {
    if (wallet.currency === "EUR" || wallet.currency === "USDT") {
      return sum + wallet.balance;
    }
    // Convert crypto to EUR (simplified)
    return sum + (wallet.balance * 30000); // Simplified conversion
  }, 0);

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
            <span className="header-eyebrow">ASSETS</span>
            <div className="header-title">
              Wallets
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
            <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* TOTAL BALANCE */}
        <section className="balance-overview">
          <div className="balance-card">
            <div className="balance-header">
              <span className="balance-label">Total Balance</span>
              <Wallet className="balance-icon" size={20} />
            </div>
            <div className="balance-amount">€{totalBalance.toLocaleString('de-DE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
            <div className="balance-change positive">
              <TrendingUp size={16} />
              <span>+5.2% (24h)</span>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="quick-actions">
          <h3 className="section-title">Quick Actions</h3>
          <div className="actions-grid">
            <Link href="/wallets/deposit" className="action-card deposit">
              <ArrowDownRight className="action-icon" size={24} />
              <span className="action-label">Deposit</span>
            </Link>
            <Link href="/wallets/withdraw" className="action-card withdraw">
              <ArrowUpRight className="action-icon" size={24} />
              <span className="action-label">Withdraw</span>
            </Link>
            <Link href="/wallets/transfer" className="action-card transfer">
              <ArrowLeftRight className="action-icon" size={24} />
              <span className="action-label">Transfer</span>
            </Link>
            <Link href="/wallets/exchange" className="action-card exchange">
              <DollarSign className="action-icon" size={24} />
              <span className="action-label">Exchange</span>
            </Link>
          </div>
        </section>

        {/* WALLETS LIST */}
        <section className="wallets-list">
          <div className="list-header">
            <h3 className="section-title">Your Wallets</h3>
            <button className="add-wallet-btn">
              <Plus size={16} />
              Add Wallet
            </button>
          </div>
          
          <div className="wallets-grid">
            {walletsData.map((wallet) => (
              <div 
                key={wallet.id} 
                className="wallet-card"
                onClick={() => setSelectedWallet(wallet)}
              >
                <div className="wallet-header">
                  <div className="wallet-icon">
                    <span className="wallet-symbol">{wallet.icon}</span>
                  </div>
                  <div className="wallet-info">
                    <span className="wallet-name">{wallet.name}</span>
                    <span className="wallet-currency">{wallet.currency}</span>
                  </div>
                  {wallet.change24h !== 0 && (
                    <div className={`wallet-change ${wallet.change24h >= 0 ? 'positive' : 'negative'}`}>
                      {wallet.change24h >= 0 ? (
                        <TrendingUp size={14} />
                      ) : (
                        <TrendingDown size={14} />
                      )}
                      <span>{wallet.change24h >= 0 ? '+' : ''}{wallet.change24h.toFixed(2)}%</span>
                    </div>
                  )}
                </div>
                
                <div className="wallet-balance">
                  <div className="balance-row">
                    <span className="balance-label">Total Balance</span>
                    <span className="balance-value">
                      {wallet.currency === 'EUR' || wallet.currency === 'USDT' ? '€' : ''}
                      {wallet.balance.toLocaleString('de-DE', { 
                        minimumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4,
                        maximumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4
                      })}
                      {' '}{wallet.currency}
                    </span>
                  </div>
                  <div className="balance-row">
                    <span className="balance-label">Available</span>
                    <span className="available-value">
                      {wallet.currency === 'EUR' || wallet.currency === 'USDT' ? '€' : ''}
                      {wallet.available.toLocaleString('de-DE', { 
                        minimumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4,
                        maximumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4
                      })}
                    </span>
                  </div>
                  {wallet.frozen > 0 && (
                    <div className="balance-row">
                      <span className="balance-label">Frozen</span>
                      <span className="frozen-value">
                        {wallet.currency === 'EUR' || wallet.currency === 'USDT' ? '€' : ''}
                        {wallet.frozen.toLocaleString('de-DE', { 
                          minimumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4,
                          maximumFractionDigits: wallet.currency === 'EUR' || wallet.currency === 'USDT' ? 2 : wallet.currency === 'BTC' ? 8 : 4
                        })}
                      </span>
                    </div>
                  )}
                </div>

                <div className="wallet-actions">
                  <button className="wallet-action-btn deposit-btn">
                    <ArrowDownRight size={14} />
                    Deposit
                  </button>
                  <button className="wallet-action-btn withdraw-btn">
                    <ArrowUpRight size={14} />
                    Withdraw
                  </button>
                  <button className="wallet-action-btn transfer-btn">
                    <ArrowLeftRight size={14} />
                    Transfer
                  </button>
                </div>
              </div>
            ))}
          </div>
        </section>
      </div>

      {/* WALLET DETAIL MODAL */}
      {selectedWallet && (
        <div className="modal-overlay" onClick={() => setSelectedWallet(null)}>
          <div className="modal-content" style={{ maxWidth: 400 }} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="wallet-icon" style={{ width: 44, height: 44 }}>
                  <span className="wallet-symbol" style={{ fontSize: 18 }}>{selectedWallet.icon}</span>
                </div>
                <div>
                  <h3 style={{ margin: 0, fontSize: 18 }}>{selectedWallet.name}</h3>
                  <span style={{ color: "var(--muted)", fontSize: 13 }}>{selectedWallet.currency}</span>
                </div>
              </div>
              <button className="modal-close" onClick={() => setSelectedWallet(null)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div style={{ textAlign: "center", marginBottom: 20 }}>
                <div style={{ fontSize: 28, fontWeight: 800 }}>
                  {selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? '€' : ''}
                  {selectedWallet.balance.toLocaleString('de-DE', { 
                    minimumFractionDigits: selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? 2 : selectedWallet.currency === 'BTC' ? 8 : 4,
                    maximumFractionDigits: selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? 2 : selectedWallet.currency === 'BTC' ? 8 : 4
                  })}
                  {' '}{selectedWallet.currency}
                </div>
                <div style={{ fontSize: 14, color: "var(--muted)", marginTop: 4 }}>
                  Available: {selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? '€' : ''}
                  {selectedWallet.available.toLocaleString('de-DE', { 
                    minimumFractionDigits: selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? 2 : selectedWallet.currency === 'BTC' ? 8 : 4,
                    maximumFractionDigits: selectedWallet.currency === 'EUR' || selectedWallet.currency === 'USDT' ? 2 : selectedWallet.currency === 'BTC' ? 8 : 4
                  })}
                </div>
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <Link 
                  href={`/wallets/deposit?currency=${selectedWallet.currency}`}
                  className="order-button buy" 
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  <ArrowDownRight size={16} style={{ marginRight: 4 }} />
                  Deposit
                </Link>
                <Link 
                  href={`/wallets/withdraw?currency=${selectedWallet.currency}`}
                  className="order-button sell" 
                  style={{ textAlign: "center", textDecoration: "none" }}
                >
                  <ArrowUpRight size={16} style={{ marginRight: 4 }} />
                  Withdraw
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
