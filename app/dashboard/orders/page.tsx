"use client";

import React, { useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";

interface Order {
  id: string;
  type: "buy" | "sell" | "swap";
  asset: string;
  symbol: string;
  amount: string;
  price: string;
  total: string;
  date: string;
  time: string;
  status: "completed" | "pending" | "cancelled";
}

const orders: Order[] = [
  {
    id: "1",
    type: "buy",
    asset: "Bitcoin",
    symbol: "BTC",
    amount: "0.25",
    price: "€42,156.00",
    total: "€10,539.00",
    date: "Feb 8, 2026",
    time: "14:32",
    status: "completed",
  },
  {
    id: "2",
    type: "sell",
    asset: "Ethereum",
    symbol: "ETH",
    amount: "2.0",
    price: "€3,261.80",
    total: "€6,523.60",
    date: "Feb 7, 2026",
    time: "11:15",
    status: "completed",
  },
  {
    id: "3",
    type: "buy",
    asset: "Solana",
    symbol: "SOL",
    amount: "10.0",
    price: "€156.72",
    total: "€1,567.20",
    date: "Feb 6, 2026",
    time: "09:45",
    status: "completed",
  },
  {
    id: "4",
    type: "buy",
    asset: "Bitcoin",
    symbol: "BTC",
    amount: "0.1",
    price: "€41,500.00",
    total: "€4,150.00",
    date: "Feb 5, 2026",
    time: "16:22",
    status: "pending",
  },
  {
    id: "5",
    type: "swap",
    asset: "ETH → SOL",
    symbol: "ETH/SOL",
    amount: "1.0 → 25",
    price: "Market",
    total: "€3,261.80",
    date: "Feb 4, 2026",
    time: "13:08",
    status: "completed",
  },
];

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | "buy" | "sell" | "swap">("all");
  const [filterStatus, setFilterStatus] = useState<"all" | "completed" | "pending" | "cancelled">("all");

  const filteredOrders = orders.filter((order) => {
    const typeMatch = filterType === "all" || order.type === filterType;
    const statusMatch = filterStatus === "all" || order.status === filterStatus;
    return typeMatch && statusMatch;
  });

  const getTypeColor = (type: string) => {
    switch (type) {
      case "buy":
        return { bg: "rgba(15, 157, 88, 0.12)", color: "#0f9d58" };
      case "sell":
        return { bg: "rgba(214, 69, 69, 0.12)", color: "#d64545" };
      case "swap":
        return { bg: "rgba(0, 122, 255, 0.12)", color: "#007aff" };
      default:
        return { bg: "rgba(0, 0, 0, 0.1)", color: "#000" };
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "completed":
        return { bg: "rgba(15, 157, 88, 0.12)", color: "#0f9d58", label: "Abgeschlossen" };
      case "pending":
        return { bg: "rgba(255, 152, 0, 0.12)", color: "#ff9800", label: "Ausstehend" };
      case "cancelled":
        return { bg: "rgba(214, 69, 69, 0.12)", color: "#d64545", label: "Storniert" };
      default:
        return { bg: "rgba(0, 0, 0, 0.1)", color: "#000", label: "Unbekannt" };
    }
  };

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "buy":
        return "Kauf";
      case "sell":
        return "Verkauf";
      case "swap":
        return "Tausch";
      default:
        return type;
    }
  };

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
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, flex: 1 }}>Orders & Trading History</h1>
        </div>

        {/* Filter Tabs */}
        <div style={{ marginTop: "16px", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          <button
            onClick={() => setFilterType("all")}
            style={{
              padding: "8px 14px",
              borderRadius: "8px",
              border: filterType === "all" ? "1px solid var(--green)" : "1px solid var(--border)",
              background: filterType === "all" ? "var(--green)" : "var(--bg-soft)",
              color: filterType === "all" ? "#fff" : "var(--text)",
              fontWeight: 600,
              fontSize: "13px",
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap"
            }}
          >
            Alle
          </button>
          {["buy", "sell", "swap"].map((type) => (
            <button
              key={type}
              onClick={() => setFilterType(type as "buy" | "sell" | "swap")}
              style={{
                padding: "8px 14px",
                borderRadius: "8px",
                border: filterType === type ? "1px solid" : "1px solid var(--border)",
                borderColor: filterType === type ? getTypeColor(type).color : "var(--border)",
                background: filterType === type ? getTypeColor(type).bg : "var(--bg-soft)",
                color: filterType === type ? getTypeColor(type).color : "var(--text)",
                fontWeight: 600,
                fontSize: "13px",
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap"
              }}
            >
              {getTypeLabel(type)}
            </button>
          ))}
        </div>

        {/* Status Filters */}
        <div style={{ marginTop: "12px", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          <button
            onClick={() => setFilterStatus("all")}
            style={{
              padding: "6px 12px",
              borderRadius: "6px",
              border: filterStatus === "all" ? "1px solid var(--green)" : "1px solid var(--border)",
              background: filterStatus === "all" ? "var(--green)" : "transparent",
              color: filterStatus === "all" ? "#fff" : "var(--muted)",
              fontSize: "12px",
              fontWeight: 500,
              cursor: "pointer",
              transition: "all var(--transition-fast)",
              whiteSpace: "nowrap"
            }}
          >
            Status
          </button>
          {["completed", "pending", "cancelled"].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status as "completed" | "pending" | "cancelled")}
              style={{
                padding: "6px 12px",
                borderRadius: "6px",
                border: filterStatus === status ? "1px solid" : "1px solid var(--border)",
                borderColor: filterStatus === status ? getStatusColor(status).color : "var(--border)",
                background: filterStatus === status ? getStatusColor(status).bg : "transparent",
                color: filterStatus === status ? getStatusColor(status).color : "var(--muted)",
                fontSize: "12px",
                fontWeight: 500,
                cursor: "pointer",
                transition: "all var(--transition-fast)",
                whiteSpace: "nowrap"
              }}
            >
              {getStatusColor(status).label}
            </button>
          ))}
        </div>

        {/* Orders List */}
        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order) => (
              <div
                key={order.id}
                style={{
                  padding: "14px",
                  background: "var(--card)",
                  border: "1px solid var(--border)",
                  borderRadius: "12px",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
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
                <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                  {/* Type Icon */}
                  <div style={{
                    width: "40px",
                    height: "40px",
                    borderRadius: "10px",
                    background: getTypeColor(order.type).bg,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                    color: getTypeColor(order.type).color,
                    fontWeight: 700,
                    fontSize: "14px"
                  }}>
                    {order.type === "buy" && "↓"}
                    {order.type === "sell" && "↑"}
                    {order.type === "swap" && "⇄"}
                  </div>

                  {/* Order Info */}
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                      {order.asset}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                      {order.date} · {order.time}
                    </div>
                  </div>

                  {/* Amount */}
                  <div style={{ textAlign: "right", marginRight: "12px" }}>
                    <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>
                      {order.amount}
                    </div>
                    <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>
                      {order.total}
                    </div>
                  </div>
                </div>

                {/* Status Badge */}
                <div style={{
                  padding: "6px 12px",
                  borderRadius: "6px",
                  background: getStatusColor(order.status).bg,
                  color: getStatusColor(order.status).color,
                  fontSize: "12px",
                  fontWeight: 600,
                  whiteSpace: "nowrap"
                }}>
                  {getStatusColor(order.status).label}
                </div>
              </div>
            ))
          ) : (
            <div style={{
              padding: "40px 16px",
              textAlign: "center",
              color: "var(--muted)"
            }}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Keine Orders gefunden</div>
              <div style={{ fontSize: "12px" }}>Versuchen Sie, die Filter anzupassen</div>
            </div>
          )}
        </div>

        {/* Summary */}
        {filteredOrders.length > 0 && (
          <div style={{
            marginTop: "24px",
            padding: "16px",
            background: "var(--card)",
            border: "1px solid var(--border)",
            borderRadius: "12px",
            display: "grid",
            gridTemplateColumns: "repeat(2, 1fr)",
            gap: "12px"
          }}>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>Gesamtzahl Orders</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>{filteredOrders.length}</div>
            </div>
            <div>
              <div style={{ fontSize: "11px", color: "var(--muted)", fontWeight: 600, marginBottom: "4px" }}>Gesamtwert</div>
              <div style={{ fontSize: "18px", fontWeight: 700, color: "var(--text)" }}>
                €{filteredOrders.reduce((sum, o) => sum + parseFloat(o.total.replace(/[^0-9.]/g, "")), 0).toFixed(2)}
              </div>
            </div>
          </div>
        )}
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
