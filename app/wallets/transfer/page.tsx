"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";
import { ArrowLeftRight, Users, Search } from "lucide-react";
import { useDashboardSummary } from "@/lib/dashboard/use-dashboard-summary";
import { useTransferUsers } from "@/lib/wallets/use-transfer-users";

type SupportedCurrency = "EUR" | "BTC" | "ETH" | "USDT";

interface User {
  id: string;
  name: string;
  email: string;
  avatar: string;
}

interface TransferHistory {
  id: string;
  from: string;
  to: string;
  amount: number;
  currency: string;
  date: string;
  status: "completed" | "pending";
}

export default function TransferPage() {
  const { summary } = useDashboardSummary();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [amount, setAmount] = React.useState("");
  const [selectedCurrency, setSelectedCurrency] = React.useState<SupportedCurrency>("EUR");
  const [recipient, setRecipient] = React.useState("");
  const [searchQuery, setSearchQuery] = React.useState("");
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);
  const [note, setNote] = React.useState("");
  const [isTwoFactorEnabled, setIsTwoFactorEnabled] = React.useState(false);
  const [twoFactorCode, setTwoFactorCode] = React.useState("");

  const { users: apiUsers, isLoading: usersLoading, error: usersError } = useTransferUsers({ search: searchQuery });

  const [transferHistory, setTransferHistory] = React.useState<TransferHistory[]>([]);
  const [balances, setBalances] = React.useState<Record<SupportedCurrency, number>>({
    EUR: 0, BTC: 0, ETH: 0, USDT: 0
  });
  const [historyLoading, setHistoryLoading] = React.useState(true);
  const [balancesLoading, setBalancesLoading] = React.useState(true);

  React.useEffect(() => {
    setIsClient(true);
    
    // Fetch history and balances
    fetch('/api/wallets/transfers')
      .then(res => res.json())
      .then(setTransferHistory)
      .finally(() => setHistoryLoading(false));

    fetch('/api/ballets/balances')
      .then(res => res.json())
      .then(setBalances)
      .finally(() => setBalancesLoading(false));
  }, []);

  const filteredUsers = apiUsers || [];

  const handleTransfer = () => {
    if (!selectedUser && !recipient) {
      alert("Please select a recipient");
      return;
    }
    if (!amount || parseFloat(amount) <= 0) {
      alert("Please enter a valid amount");
      return;
    }
    const availableBalance = balances[selectedCurrency] ?? 0;
    if (parseFloat(amount) > availableBalance) {
      alert(selectedCurrency === "EUR" ? "Insufficient cash balance" : "Insufficient asset balance");
      return;
    }
    if (isTwoFactorEnabled && !twoFactorCode) {
      alert("Please enter 2FA code");
      return;
    }
    
    alert(`Transfer of ${amount} ${selectedCurrency} to ${selectedUser?.name || recipient} initiated successfully!`);
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
        <header className="header">
          <div className="header-left">
            <Link href="/wallets" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">TRANSFER</span>
            <div className="header-title">
              Internal Transfer
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

        <section className="quick-transfer">
          <h3 className="section-title">Quick Transfer</h3>
          <div className="transfer-form">
            <div className="form-group">
              <label>Recipient</label>
              <div className="recipient-input-group">
                <div className="input-icon">
                  <Users size={18} />
                </div>
                <input
                  type="text"
                  placeholder="Search users or enter email"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="form-input with-icon"
                />
                <Search size={18} className="search-icon" />
              </div>
            </div>

            {searchQuery.length > 2 && (
              <div className="user-suggestions">
                {usersLoading && <div>Loading users...</div>}
                {usersError && <div>Error loading users</div>}
                {filteredUsers.length > 0 && filteredUsers.map((user: User) => (
                  <button
                    key={user.id}
                    className="user-suggestion"
                    onClick={() => {
                      setSelectedUser(user);
                      setSearchQuery("");
                      setRecipient(user.email);
                    }}
                  >
                    <div className="user-avatar">
                      {user.avatar}
                    </div>
                    <div className="user-info">
                      <span className="user-name">{user.name}</span>
                      <span className="user-email">{user.email}</span>
                    </div>
                  </button>
                ))}
              </div>
            )}

            {selectedUser && (
              <div className="selected-user">
                <div className="user-avatar">
                  {selectedUser.avatar}
                </div>
                <div className="user-info">
                  <span className="user-name">{selectedUser.name}</span>
                  <span className="user-email">{selectedUser.email}</span>
                </div>
                <button 
                  className="remove-user"
                  onClick={() => {
                    setSelectedUser(null);
                    setRecipient("");
                  }}
                >
                  ×
                </button>
              </div>
            )}

            <div className="form-group">
              <label>Currency</label>
              <select 
                value={selectedCurrency} 
                onChange={(e) => setSelectedCurrency(e.target.value as SupportedCurrency)}
                className="form-input"
              >
                <option value="EUR">EUR ({balances.EUR.toLocaleString("de-DE", { style: "currency", currency: "EUR" })})</option>
                <option value="BTC">BTC ({balances.BTC.toFixed(8)})</option>
                <option value="ETH">ETH ({balances.ETH.toFixed(4)})</option>
                <option value="USDT">USDT (${balances.USDT.toLocaleString("de-DE", { minimumFractionDigits: 2 })})</option>
              </select>
            </div>

            <div className="form-group">
              <label>Amount ({selectedCurrency})</label>
              <input
                type="number"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                max={balances[selectedCurrency] ?? 0}
                step={selectedCurrency === "BTC" ? "0.00000001" : selectedCurrency === "ETH" ? "0.0001" : "0.01"}
                className="form-input"
              />
              <div className="balance-hint">
                {selectedCurrency === "EUR" ? "Available cash balance" : "Available asset balance"}: {
                  selectedCurrency === "EUR" || selectedCurrency === "USDT" ? "€" : ""
                }{
                  (balances[selectedCurrency] ?? 0).toLocaleString("de-DE", { 
                    minimumFractionDigits: selectedCurrency === "EUR" || selectedCurrency === "USDT" ? 2 : selectedCurrency === "BTC" ? 8 : 4,
                    maximumFractionDigits: selectedCurrency === "EUR" || selectedCurrency === "USDT" ? 2 : selectedCurrency === "BTC" ? 8 : 4
                  })
                } {" "}{selectedCurrency}
              </div>
            </div>

            <div className="form-group">
              <label>Note (Optional)</label>
              <textarea
                placeholder="Add a note for this transfer..."
                value={note}
                onChange={(e) => setNote(e.target.value)}
                className="form-textarea"
                rows={3}
              />
            </div>

            <div className="form-group">
              <label className="checkbox-label">
                <input
                  type="checkbox"
                  checked={isTwoFactorEnabled}
                  onChange={(e) => setIsTwoFactorEnabled(e.target.checked)}
                />
                <span className="checkmark"></span>
                Enable 2FA verification for this transfer
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

            <button 
              className="order-button buy" 
              style={{ width: "100%", marginTop: 16 }}
              onClick={handleTransfer}
            >
              <ArrowLeftRight size={16} style={{ marginRight: 8 }} />
              Transfer {amount || "0.00"} {selectedCurrency}
            </button>
          </div>
        </section>

        <section className="transfer-history">
          <h3 className="section-title">Recent Transfers</h3>
          <div className="history-list">
            {transferHistory.map((transfer) => (
              <div key={transfer.id} className="history-item">
                <div className="history-icon">
                  {transfer.from === "You" ? (
                    <ArrowLeftRight size={16} className="sent" />
                  ) : (
                    <ArrowLeftRight size={16} className="received" />
                  )}
                </div>
                <div className="history-details">
                  <div className="history-title">
                    {transfer.from === "You" ? "Sent to" : "Received from"} {transfer.to === "You" ? transfer.from : transfer.to}
                  </div>
                  <div className="history-date">{transfer.date}</div>
                </div>
                <div className="history-amount">
                  <div className={`amount ${transfer.from === "You" ? "sent" : "received"}`}>
                    {transfer.from === "You" ? "-" : "+"}{transfer.amount} {transfer.currency}
                  </div>
                  <div className={`status ${transfer.status}`}>
                    {transfer.status}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <section className="transfer-info">
          <h3 className="section-title">Transfer Information</h3>
          <div className="info-cards">
            <div className="info-card">
              <div className="info-icon">⚡</div>
              <div className="info-content">
                <h4>Instant Transfers</h4>
                <p>Internal transfers are processed instantly</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">💰</div>
              <div className="info-content">
                <h4>No Fees</h4>
                <p>Internal transfers are completely free</p>
              </div>
            </div>
            <div className="info-card">
              <div className="info-icon">🔒</div>
              <div className="info-content">
                <h4>Secure</h4>
                <p>All transfers are protected with 2FA</p>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
