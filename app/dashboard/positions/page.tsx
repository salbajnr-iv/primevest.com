"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

interface Position {
  id: string;
  symbol: string;
  name: string;
  amount: string;
  value: string;
  avgPrice: string;
  unrealizedPnL: string;
  pnLPercent: string;
  isProfitable: boolean;
}

const positions: Position[] = [
  {
    id: "1",
    symbol: "BTC",
    name: "Bitcoin",
    amount: "0.5000",
    value: "€33,117.50",
    avgPrice: "€42,156.00",
    unrealizedPnL: "+€2,150.50",
    pnLPercent: "+6.50%",
    isProfitable: true,
  },
  {
    id: "2",
    symbol: "ETH",
    name: "Ethereum",
    amount: "5.0000",
    value: "€16,309.00",
    avgPrice: "€2,987.00",
    unrealizedPnL: "-€845.30",
    pnLPercent: "-4.93%",
    isProfitable: false,
  },
  {
    id: "3",
    symbol: "SOL",
    name: "Solana",
    amount: "25.5000",
    value: "€4,001.28",
    avgPrice: "€142.50",
    unrealizedPnL: "+€612.40",
    pnLPercent: "+18.05%",
    isProfitable: true,
  },
];

export default function PositionsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [expandedPosition, setExpandedPosition] = useState<string | null>(null);

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        {/* Page Header with Back Button */}
        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/dashboard" className="back-button" style={{
            display: "inline-flex",
            alignItems: "center",
            gap: "6px",
            padding: "8px 12px",
            borderRadius: "8px",
            background: "var(--bg-soft)",
            border: "1px solid var(--border)",
            cursor: "pointer",
            textDecoration: "none",
            color: "var(--text)",
            fontSize: "14px",
            fontWeight: 600,
            transition: "all var(--transition-fast)",
          }}>
            ← Portfolio
          </Link>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, flex: 1 }}>Positionen verwalten</h1>
        </div>

        {/* Summary Card */}
        <div style={{
          marginTop: "12px",
          padding: "16px",
          background: "var(--card)",
          border: "1px solid var(--border)",
          borderRadius: "14px",
          display: "grid",
          gridTemplateColumns: "repeat(3, 1fr)",
          gap: "12px"
        }}>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>Positionen</div>
            <div style={{ fontSize: "20px", fontWeight: 700, color: "var(--text)" }}>3</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>Gesamtwert</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "var(--text)" }}>€53,427.78</div>
          </div>
          <div style={{ textAlign: "center" }}>
            <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>Unrealisiert</div>
            <div style={{ fontSize: "16px", fontWeight: 700, color: "#0f9d58" }}>+€1,917.60</div>
          </div>
        </div>

        {/* Positions List */}
        <h3 style={{ marginTop: "20px", marginBottom: "12px", fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Positionen
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "10px" }}>
          {positions.map((position) => (
            <div
              key={position.id}
              onClick={() => setExpandedPosition(expandedPosition === position.id ? null : position.id)}
              style={{
                padding: "14px",
                background: "var(--card)",
                border: "1px solid var(--border)",
                borderRadius: "12px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = "rgba(15, 157, 88, 0.3)";
                e.currentTarget.style.boxShadow = "0 4px 12px rgba(0, 0, 0, 0.04)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = "var(--border)";
                e.currentTarget.style.boxShadow = "none";
              }}
            >
              {/* Header */}
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: expandedPosition === position.id ? "12px" : "0" }}>
                <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: "linear-gradient(135deg, #0f9d58, #0b7b48)",
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: "#fff",
                    fontWeight: 700,
                    fontSize: "14px"
                  }}>
                    {position.symbol[0]}
                  </div>
                  <div>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{position.name}</div>
                    <div style={{ fontSize: "11px", color: "var(--muted)", marginTop: "2px" }}>{position.amount} {position.symbol}</div>
                  </div>
                </div>
                <div style={{ textAlign: "right" }}>
                  <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{position.value}</div>
                  <div style={{
                    fontSize: "12px",
                    fontWeight: 600,
                    color: position.isProfitable ? "#0f9d58" : "#d64545",
                    marginTop: "2px"
                  }}>
                    {position.pnLPercent}
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedPosition === position.id && (
                <div style={{
                  borderTop: "1px dashed var(--border)",
                  paddingTop: "12px",
                  display: "flex",
                  flexDirection: "column",
                  gap: "10px"
                }}>
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "10px" }}>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>Durchschnittspreis</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: "var(--text)" }}>{position.avgPrice}</div>
                    </div>
                    <div>
                      <div style={{ fontSize: "11px", color: "var(--muted)", marginBottom: "4px" }}>Unrealisiert P&L</div>
                      <div style={{ fontSize: "14px", fontWeight: 700, color: position.isProfitable ? "#0f9d58" : "#d64545" }}>
                        {position.unrealizedPnL}
                      </div>
                    </div>
                  </div>

                  {/* Action Buttons */}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "8px" }}>
                    <button style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(15, 157, 88, 0.12)",
                      border: "1px solid rgba(15, 157, 88, 0.3)",
                      color: "#0f9d58",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#0f9d58";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(15, 157, 88, 0.12)";
                      e.currentTarget.style.color = "#0f9d58";
                    }}
                    >
                      Kaufen
                    </button>
                    <button style={{
                      padding: "10px 12px",
                      borderRadius: "8px",
                      background: "rgba(214, 69, 69, 0.12)",
                      border: "1px solid rgba(214, 69, 69, 0.3)",
                      color: "#d64545",
                      fontWeight: 600,
                      fontSize: "13px",
                      cursor: "pointer",
                      transition: "all var(--transition-fast)",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.background = "#d64545";
                      e.currentTarget.style.color = "#fff";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.background = "rgba(214, 69, 69, 0.12)";
                      e.currentTarget.style.color = "#d64545";
                    }}
                    >
                      Verkaufen
                    </button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Settings Section */}
        <h3 style={{ marginTop: "24px", marginBottom: "12px", fontSize: "13px", fontWeight: 600, color: "var(--muted)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
          Einstellungen
        </h3>

        <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
          <div style={{
            padding: "14px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Automatische Rebalancierung</span>
            <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
          </div>
          <div style={{
            padding: "14px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between"
          }}>
            <span style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>Preiswarnungen</span>
            <input type="checkbox" defaultChecked style={{ width: "20px", height: "20px", cursor: "pointer" }} />
          </div>
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
