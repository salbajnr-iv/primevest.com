"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowDownRight, Copy, Check } from "lucide-react";

export default function DepositPage() {
  const searchParams = useSearchParams();
  const currency = searchParams.get('currency') || 'EUR';
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [copied, setCopied] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('bank');

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const depositAddress = currency === 'BTC' ? '1A1zP1eP5QGefi2DMPTfTL5SLmv7DivfNa' : 
                         currency === 'ETH' ? '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45' :
                         currency === 'USDT' ? '0x742d35Cc6634C0532925a3b8D4C9db96C4b4Db45' :
                         'DE89 3704 0044 0532 0130 00';

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(depositAddress);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy:', err);
    }
  };

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
            <Link href="/wallets" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">DEPOSIT</span>
            <div className="header-title">Deposit {currency}</div>
          </div>
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* DEPOSIT METHODS */}
        <section className="deposit-methods">
          <h3 className="section-title">Select Deposit Method</h3>
          <div className="method-grid">
            <button 
              className={`method-card ${selectedMethod === 'bank' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('bank')}
            >
              <div className="method-icon">🏦</div>
              <span className="method-label">Bank Transfer</span>
            </button>
            <button 
              className={`method-card ${selectedMethod === 'crypto' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('crypto')}
            >
              <div className="method-icon">₿</div>
              <span className="method-label">Crypto</span>
            </button>
            <button 
              className={`method-card ${selectedMethod === 'card' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('card')}
            >
              <div className="method-icon">💳</div>
              <span className="method-label">Credit Card</span>
            </button>
          </div>
        </section>

        {selectedMethod === 'bank' && (
          <section className="deposit-form">
            <h3 className="section-title">Bank Transfer Details</h3>
            <div className="form-group">
              <label>Amount (EUR)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="bank-details">
              <div className="detail-row">
                <span className="detail-label">Account Holder</span>
                <span className="detail-value">Bitpanda GmbH</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">IBAN</span>
                <span className="detail-value">DE89 3704 0044 0532 0130 00</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">BIC</span>
                <span className="detail-value">DEUTDEFF</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Bank</span>
                <span className="detail-value">Deutsche Bank</span>
              </div>
              <div className="detail-row">
                <span className="detail-label">Reference</span>
                <span className="detail-value">DEPOSIT-{Math.random().toString(36).substr(2, 9).toUpperCase()}</span>
              </div>
            </div>
            <button className="order-button buy" style={{ width: '100%', marginTop: 16 }}>
              Confirm Deposit
            </button>
          </section>
        )}

        {selectedMethod === 'crypto' && (
          <section className="deposit-form">
            <h3 className="section-title">Crypto Deposit Address</h3>
            <div className="crypto-address">
              <div className="address-qr">
                <div className="qr-placeholder">
                  <span className="qr-text">QR Code</span>
                </div>
              </div>
              <div className="address-details">
                <span className="address-label">{currency} Deposit Address</span>
                <div className="address-input-group">
                  <input
                    type="text"
                    value={depositAddress}
                    readOnly
                    className="address-input"
                  />
                  <button 
                    className="copy-btn"
                    onClick={handleCopy}
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                  </button>
                </div>
                <div className="address-info">
                  <p className="info-text">
                    Send only {currency} to this address. Sending other coins may result in permanent loss.
                  </p>
                  <div className="min-deposit">
                    <span className="info-label">Minimum Deposit:</span>
                    <span className="info-value">
                      {currency === 'BTC' ? '0.0001 BTC' : 
                       currency === 'ETH' ? '0.01 ETH' : 
                       currency === 'USDT' ? '10 USDT' : '10 EUR'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>
        )}

        {selectedMethod === 'card' && (
          <section className="deposit-form">
            <h3 className="section-title">Credit Card Deposit</h3>
            <div className="form-group">
              <label>Amount (EUR)</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="form-input"
              />
            </div>
            <div className="form-group">
              <label>Card Number</label>
              <input
                type="text"
                placeholder="1234 5678 9012 3456"
                maxLength={19}
                className="form-input"
              />
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Expiry Date</label>
                <input
                  type="text"
                  placeholder="MM/YY"
                  maxLength={5}
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>CVV</label>
                <input
                  type="text"
                  placeholder="123"
                  maxLength={3}
                  className="form-input"
                />
              </div>
            </div>
            <div className="form-group">
              <label>Cardholder Name</label>
              <input
                type="text"
                placeholder="John Doe"
                className="form-input"
              />
            </div>
            <button className="order-button buy" style={{ width: '100%', marginTop: 16 }}>
              Pay €{amount || '0.00'}
            </button>
          </section>
        )}

        {/* DEPOSIT INFO */}
        <section className="deposit-info">
          <h3 className="section-title">Important Information</h3>
          <div className="info-list">
            <div className="info-item">
              <span className="info-icon">ℹ️</span>
              <span className="info-text">Deposits are typically processed within 1-3 business days</span>
            </div>
            <div className="info-item">
              <span className="info-icon">⚠️</span>
              <span className="info-text">Minimum deposit amount is €10 for bank transfers</span>
            </div>
            <div className="info-item">
              <span className="info-icon">🔒</span>
              <span className="info-text">All deposits are secured with industry-standard encryption</span>
            </div>
          </div>
        </section>
      </div>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
