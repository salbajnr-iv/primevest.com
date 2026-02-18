"use client";

import * as React from "react";

interface StakingCardProps {
  totalStaked?: number;
  apy?: number;
  rewards?: number;
  onStake?: () => void;
  onUnstake?: () => void;
}

export default function StakingCard({ 
  totalStaked = 1250.50, 
  apy = 12.5, 
  rewards = 45.80,
  onStake,
  onUnstake 
}: StakingCardProps) {
  const [isExpanded, setIsExpanded] = React.useState(false);

  const stakingOptions = [
    { name: "Bitcoin", symbol: "BTC", apy: 4.2, minAmount: 0.001, icon: "#F7931A" },
    { name: "Ethereum", symbol: "ETH", apy: 8.5, minAmount: 0.01, icon: "#627EEA" },
    { name: "Solana", symbol: "SOL", apy: 15.2, minAmount: 1, icon: "#9945FF" },
    { name: "Cardano", symbol: "ADA", apy: 10.8, minAmount: 10, icon: "#0033AD" },
  ];

  return (
    <section className="staking-card" style={{ marginTop: 10 }}>
      <div 
        className="staking-header"
        onClick={() => setIsExpanded(!isExpanded)}
        style={{
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          padding: "14px 16px",
          background: "linear-gradient(135deg, rgba(15,157,88,0.15), rgba(15,157,88,0.05))",
          borderRadius: 18,
          border: "1px solid rgba(15,157,88,0.2)",
          cursor: "pointer",
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
          <div style={{
            width: 40,
            height: 40,
            borderRadius: 10,
            background: "var(--green)",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20, color: "#fff" }}>
              <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
            </svg>
          </div>
          <div>
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--text)" }}>Staking Rewards</div>
            <div style={{ fontSize: 11, color: "var(--muted)" }}>Earn up to {Math.max(...stakingOptions.map(s => s.apy))}% APY</div>
          </div>
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <div style={{ textAlign: "right" }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: "var(--green)" }}>€{rewards.toFixed(2)}</div>
            <div style={{ fontSize: 10, color: "var(--muted)" }}>Pending Rewards</div>
          </div>
          <svg 
            viewBox="0 0 24 24" 
            fill="none" 
            stroke="currentColor" 
            strokeWidth="2"
            style={{ 
              width: 20, 
              height: 20, 
              color: "var(--muted)",
              transform: isExpanded ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease"
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </div>
      </div>

      {isExpanded && (
        <div className="staking-content" style={{ 
          marginTop: 10,
          padding: 16,
          background: "var(--card)",
          borderRadius: 18,
          border: "1px solid var(--border)",
        }}>
          {/* Summary stats */}
          <div style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(3, 1fr)", 
            gap: 10, 
            marginBottom: 16 
          }}>
            <div style={{ textAlign: "center", padding: 10, background: "var(--bg-soft)", borderRadius: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>€{totalStaked.toLocaleString()}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Total Staked</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "var(--bg-soft)", borderRadius: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--green)" }}>{apy}%</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Avg. APY</div>
            </div>
            <div style={{ textAlign: "center", padding: 10, background: "var(--bg-soft)", borderRadius: 12 }}>
              <div style={{ fontSize: 18, fontWeight: 700, color: "var(--text)" }}>€{rewards.toFixed(2)}</div>
              <div style={{ fontSize: 10, color: "var(--muted)" }}>Rewards</div>
            </div>
          </div>

          {/* Staking options */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: "var(--muted)", marginBottom: 10, textTransform: "uppercase", letterSpacing: "0.05em" }}>
              Available for Staking
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {stakingOptions.map((option) => (
                <div 
                  key={option.symbol}
                  style={{
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: 12,
                    background: "var(--bg-soft)",
                    borderRadius: 12,
                    cursor: "pointer",
                    transition: "all 0.2s ease",
                  }}
                  onMouseOver={(e) => {
                    e.currentTarget.style.transform = "translateX(4px)";
                    e.currentTarget.style.background = "rgba(15,157,88,0.08)";
                  }}
                  onMouseOut={(e) => {
                    e.currentTarget.style.transform = "translateX(0)";
                    e.currentTarget.style.background = "var(--bg-soft)";
                  }}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{
                      width: 32,
                      height: 32,
                      borderRadius: 8,
                      background: option.icon,
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "center",
                      color: "#fff",
                      fontSize: 11,
                      fontWeight: 700,
                    }}>
                      {option.symbol.slice(0, 2)}
                    </div>
                    <div>
                      <div style={{ fontSize: 13, fontWeight: 600, color: "var(--text)" }}>{option.name}</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>Min: {option.minAmount} {option.symbol}</div>
                    </div>
                  </div>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ textAlign: "right" }}>
                      <div style={{ fontSize: 14, fontWeight: 700, color: "var(--green)" }}>{option.apy}%</div>
                      <div style={{ fontSize: 10, color: "var(--muted)" }}>APY</div>
                    </div>
                    <button 
                      onClick={onStake}
                      style={{
                        padding: "6px 14px",
                        background: "var(--green)",
                        color: "#fff",
                        border: "none",
                        borderRadius: 8,
                        fontSize: 12,
                        fontWeight: 600,
                        cursor: "pointer",
                      }}
                    >
                      Stake
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div style={{ display: "flex", gap: 10 }}>
            <button 
              onClick={onStake}
              style={{
                flex: 1,
                padding: 12,
                background: "var(--green)",
                color: "#fff",
                border: "none",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Start Staking
            </button>
            <button 
              onClick={onUnstake}
              style={{
                flex: 1,
                padding: 12,
                background: "transparent",
                color: "var(--green)",
                border: "1px solid var(--green)",
                borderRadius: 10,
                fontSize: 14,
                fontWeight: 600,
                cursor: "pointer",
              }}
            >
              Unstake
            </button>
          </div>
        </div>
      )}
    </section>
  );
}

