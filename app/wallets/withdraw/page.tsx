"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowUpRight, AlertTriangle } from "lucide-react";

export default function WithdrawPage() {
  const searchParams = useSearchParams();
  const currency = searchParams.get('currency') || 'EUR';
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [amount, setAmount] = React.useState('');
  const [address, setAddress] = React.useState('');
  const [selectedMethod, setSelectedMethod] = React.useState('bank');
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(false);
  const [twoFactorCode, setTwoFactorCode] = React.useState('');

  const availableBalance = currency === 'EUR' ? 12500.50 : 
                           currency === 'BTC' ? 0.42 : 
                           currency === 'ETH' ? 3.0 : 
                           currency === 'USDT' ? 4800.00 : 0;

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const handleWithdraw = () => {
    if (!amount || parseFloat(amount) <= 0) {
      alert('Please enter a valid amount');
      return;
    }
    if (parseFloat(amount) > availableBalance) {
      alert('Insufficient balance');
      return;
    }
    if (selectedMethod !== 'bank' && !address) {
      alert('Please enter a withdrawal address');
      return;
    }
    if (isTwoFactorEnabled && !twoFactorCode) {
      alert('Please enter 2FA code');
      return;
    }
    
    // Process withdrawal
    alert(`Withdrawal of ${amount} ${currency} initiated successfully!`);
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
            <span className="header-eyebrow">WITHDRAW</span>
            <div className="header-title">Withdraw {currency}</div>
          </div>
          <button className="sync-btn" onClick={() => setIsSidebarOpen(true)} aria-label="Open menu" title="Open menu">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="3" y1="12" x2="21" y2="12" />
              <line x1="3" y1="6" x2="21" y2="6" />
              <line x1="3" y1="18" x2="21" y2="18" />
            </svg>
          </button>
        </header>

        {/* BALANCE INFO */}
        <section className="balance-info">
          <div className="balance-card">
            <div className="balance-header">
              <span className="balance-label">Available Balance</span>
            </div>
            <div className="balance-amount">
              {currency === 'EUR' || currency === 'USDT' ? '€' : ''}
              {availableBalance.toLocaleString('de-DE', { 
                minimumFractionDigits: currency === 'EUR' || currency === 'USDT' ? 2 : currency === 'BTC' ? 8 : 4,
                maximumFractionDigits: currency === 'EUR' || currency === 'USDT' ? 2 : currency === 'BTC' ? 8 : 4
              })}
              {' '}{currency}
            </div>
          </div>
        </section>

        {/* WITHDRAWAL METHODS */}
        <section className="withdrawal-methods">
          <h3 className="section-title">Withdrawal Method</h3>
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
              <span className="method-label">Crypto Wallet</span>
            </button>
            <button 
              className={`method-card ${selectedMethod === 'paypal' ? 'active' : ''}`}
              onClick={() => setSelectedMethod('paypal')}
            >
              <div className="method-icon">🅿️</div>
              <span className="method-label">PayPal</span>
            </button>
          </div>
        </section>

        {/* WITHDRAWAL FORM */}
        <section className="withdrawal-form">
          <h3 className="section-title">Withdrawal Details</h3>
          
          <div className="form-group">
            <label>Amount ({currency})</label>
            <input
              type="number"
              placeholder="0.00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              max={availableBalance}
              step={currency === 'BTC' ? '0.00000001' : currency === 'ETH' ? '0.0001' : '0.01'}
              className="form-input"
            />
            <div className="balance-hint">
              Available: {currency === 'EUR' || currency === 'USDT' ? '€' : ''}
              {availableBalance.toLocaleString('de-DE', { 
                minimumFractionDigits: currency === 'EUR' || currency === 'USDT' ? 2 : currency === 'BTC' ? 8 : 4,
                maximumFractionDigits: currency === 'EUR' || currency === 'USDT' ? 2 : currency === 'BTC' ? 8 : 4
              })}
              {' '}{currency}
            </div>
          </div>

          {selectedMethod === 'bank' && (
            <>
              <div className="form-group">
                <label>Bank Name</label>
                <input
                  type="text"
                  placeholder="Deutsche Bank"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>Account Holder Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>IBAN</label>
                <input
                  type="text"
                  placeholder="DE89 3704 0044 0532 0130 00"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>BIC/SWIFT</label>
                <input
                  type="text"
                  placeholder="DEUTDEFF"
                  className="form-input"
                />
              </div>
            </>
          )}

          {selectedMethod === 'crypto' && (
            <div className="form-group">
              <label>Wallet Address</label>
              <input
                type="text"
                placeholder={`Enter ${currency} wallet address`}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className="form-input"
              />
              <div className="address-warning">
                <AlertTriangle size={14} />
                <span>Double-check the address. Crypto transactions cannot be reversed.</span>
              </div>
            </div>
          )}

          {selectedMethod === 'paypal' && (
            <>
              <div className="form-group">
                <label>PayPal Email</label>
                <input
                  type="email"
                  placeholder="john.doe@example.com"
                  className="form-input"
                />
              </div>
              <div className="form-group">
                <label>PayPal Account Name</label>
                <input
                  type="text"
                  placeholder="John Doe"
                  className="form-input"
                />
              </div>
            </>
          )}

          {/* TWO-FACTOR AUTHENTICATION */}
          <div className="form-group">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={isTwoFactorEnabled}
                onChange={(e) => setIsTwoFactorEnabled(e.target.checked)}
              />
              <span className="checkmark"></span>
              Enable 2FA verification for this withdrawal
            </label>
          </div>

          {isTwoFactorEnabled && (
            <div className="form-group">
              <label>2FA Code</label>
              <input
                type="text"
                placeholder="Enter 6-digit code"
                maxLength={6}
                value={twoFactorCode}
                onChange={(e) => setTwoFactorCode(e.target.value)}
                className="form-input"
              />
            </div>
          )}

          {/* FEES INFO */}
          <div className="fees-info">
            <div className="fee-row">
              <span className="fee-label">Withdrawal Fee</span>
              <span className="fee-value">
                {currency === 'EUR' ? '€1.00' : 
                 currency === 'BTC' ? '0.0001 BTC' : 
                 currency === 'ETH' ? '0.005 ETH' : 
                 currency === 'USDT' ? '1.00 USDT' : '0'}
              </span>
            </div>
            <div className="fee-row">
              <span className="fee-label">You will receive</span>
              <span className="fee-value receive">
                {amount ? 
                  (parseFloat(amount) - (currency === 'EUR' ? 1 : currency === 'BTC' ? 0.0001 : currency === 'ETH' ? 0.005 : 1)).toFixed(currency === 'BTC' ? 8 : 2)
                  : '0.00'} {currency}
              </span>
            </div>
          </div>

          <button 
            className="order-button sell" 
            style={{ width: '100%', marginTop: 16 }}
            onClick={handleWithdraw}
          >
            <ArrowUpRight size={16} style={{ marginRight: 8 }} />
            Withdraw {amount || '0.00'} {currency}
          </button>
        </section>

        {/* WARNING SECTION */}
        <section className="warning-section">
          <div className="warning-card">
            <AlertTriangle className="warning-icon" size={20} />
            <div className="warning-content">
              <h4 className="warning-title">Important Notice</h4>
              <ul className="warning-list">
                <li>Withdrawals are processed within 1-3 business days</li>
                <li>Minimum withdrawal: {currency === 'EUR' ? '€10' : currency === 'BTC' ? '0.001 BTC' : '0.01 ETH'}</li>
                <li>Bank transfers may incur additional charges from your bank</li>
                <li>Crypto withdrawals are irreversible once confirmed</li>
              </ul>
            </div>
          </div>
        </section>
      </div>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
