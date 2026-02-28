"use client";

import * as React from "react";

interface Account {
  id: string;
  name: string;
  label: string;
  balance: string;
  currency: string;
}

interface TradeWAccountOverviewProps {
  totalBalance: string;
  currency: string;
  accounts: Account[];
}

const TradeWAccountOverview: React.FC<TradeWAccountOverviewProps> = ({
  totalBalance,
  currency,
  accounts,
}) => {
  return (
    <div className="tradew-accounts">
      <div className="tradew-accounts-header">
        <h2 className="tradew-accounts-title">
          <svg width="20" height="20" viewBox="0 0 20 20" fill="currentColor">
            <path d="M10 2a8 8 0 100 16 8 8 0 000-16zM8 7a2 2 0 114 0 2 2 0 01-4 0zm8 8a6 6 0 01-12 0v-1a1 1 0 011-1h10a1 1 0 011 1v1z"/>
          </svg>
          Accounts
        </h2>
      </div>

      <div className="tradew-total-label">
        Total balance
        <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor" opacity="0.5">
          <path d="M8 1.5a6.5 6.5 0 100 13 6.5 6.5 0 000-13zM8 11a3 3 0 110-6 3 3 0 010 6z"/>
        </svg>
      </div>
      
      <div className="tradew-total-amount">
        {currency} {totalBalance}
      </div>

      <div className="tradew-account-buttons">
        <button className="tradew-btn tradew-btn-primary" aria-label="Deposit funds">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M8 1v14M1 8h14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Deposit
        </button>
        <button className="tradew-btn tradew-btn-outline" aria-label="Transfer funds">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M1 8h14M8 1v14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
          Transfer
        </button>
        <button className="tradew-btn tradew-btn-outline" aria-label="Withdraw funds">
          <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
            <path d="M3 8h10M8 3l5 5-5 5" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Withdraw
        </button>
      </div>

      <div className="tradew-account-list">
        {accounts.map((account) => (
          <div key={account.id} className="tradew-account-item">
            <div className="tradew-account-info">
              <div className="tradew-account-name">{account.name}</div>
              <div className="tradew-account-label">{account.label}</div>
            </div>
            <div className="tradew-account-amount">
              {account.currency} {account.balance}
            </div>
            <svg 
              className="tradew-account-arrow" 
              width="16" 
              height="16" 
              viewBox="0 0 16 16" 
              fill="currentColor"
            >
              <path d="M6 4l4 4-4 4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TradeWAccountOverview;
