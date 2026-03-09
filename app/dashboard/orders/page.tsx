"use client";

import React, { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";
import Sidebar from "@/components/Sidebar";
import { OrderHistoryItem, OrderStatus, OrderType } from "@/lib/dashboard/types";

export default function OrdersPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [filterType, setFilterType] = useState<"all" | OrderType>("all");
  const [filterStatus, setFilterStatus] = useState<"all" | OrderStatus>("all");
  const [orders, setOrders] = useState<OrderHistoryItem[]>([]);

  useEffect(() => {
    const loadOrders = async () => {
      const response = await fetch("/api/orders/history", { cache: "no-store" });
      const data = await response.json();
      setOrders(data.orders ?? []);
    };

    const timeout = setTimeout(() => {
      void loadOrders();
    }, 0);

    const interval = setInterval(() => {
      void loadOrders();
    }, 30000);

    return () => {
      clearTimeout(timeout);
      clearInterval(interval);
    };
  }, []);

  const filteredOrders = useMemo(() => {
    return orders.filter((order) => {
      const typeMatch = filterType === "all" || order.type === filterType;
      const statusMatch = filterStatus === "all" || order.status === filterStatus;
      return typeMatch && statusMatch;
    });
  }, [filterStatus, filterType, orders]);

  const getTypeColor = (type: OrderType) => {
    if (type === "buy") return { bg: "rgba(15, 157, 88, 0.12)", color: "#0f9d58" };
    if (type === "sell") return { bg: "rgba(214, 69, 69, 0.12)", color: "#d64545" };
    return { bg: "rgba(0, 122, 255, 0.12)", color: "#007aff" };
  };

  const getStatusColor = (status: OrderStatus) => {
    if (status === "completed") return { bg: "rgba(15, 157, 88, 0.12)", color: "#0f9d58", label: "Abgeschlossen" };
    if (status === "pending") return { bg: "rgba(255, 152, 0, 0.12)", color: "#ff9800", label: "Ausstehend" };
    return { bg: "rgba(214, 69, 69, 0.12)", color: "#d64545", label: "Storniert" };
  };

  const getTypeLabel = (type: OrderType) => (type === "buy" ? "Kauf" : type === "sell" ? "Verkauf" : "Tausch");

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" />

        <div style={{ padding: "12px 0", display: "flex", alignItems: "center", gap: "8px" }}>
          <Link href="/dashboard" className="back-button" style={{ display: "inline-flex", alignItems: "center", gap: "6px", padding: "8px 12px", borderRadius: "8px", background: "var(--bg-soft)", border: "1px solid var(--border)", textDecoration: "none", color: "var(--text)", fontSize: "14px", fontWeight: 600 }}>
            ← Portfolio
          </Link>
          <h1 style={{ margin: 0, fontSize: "18px", fontWeight: 700, flex: 1 }}>Orders & Trading History</h1>
        </div>

        <div style={{ marginTop: "16px", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          <button onClick={() => setFilterType("all")} style={{ padding: "8px 14px", borderRadius: "8px", border: filterType === "all" ? "1px solid var(--green)" : "1px solid var(--border)", background: filterType === "all" ? "var(--green)" : "var(--bg-soft)", color: filterType === "all" ? "#fff" : "var(--text)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>Alle</button>
          {(["buy", "sell", "swap"] as OrderType[]).map((type) => (
            <button key={type} onClick={() => setFilterType(type)} style={{ padding: "8px 14px", borderRadius: "8px", border: filterType === type ? "1px solid" : "1px solid var(--border)", borderColor: filterType === type ? getTypeColor(type).color : "var(--border)", background: filterType === type ? getTypeColor(type).bg : "var(--bg-soft)", color: filterType === type ? getTypeColor(type).color : "var(--text)", fontWeight: 600, fontSize: "13px", cursor: "pointer" }}>{getTypeLabel(type)}</button>
          ))}
        </div>

        <div style={{ marginTop: "12px", display: "flex", gap: "6px", overflowX: "auto", paddingBottom: "4px" }}>
          <button onClick={() => setFilterStatus("all")} style={{ padding: "6px 12px", borderRadius: "6px", border: filterStatus === "all" ? "1px solid var(--green)" : "1px solid var(--border)", background: filterStatus === "all" ? "var(--green)" : "transparent", color: filterStatus === "all" ? "#fff" : "var(--muted)", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>Status</button>
          {(["completed", "pending", "cancelled"] as OrderStatus[]).map((status) => (
            <button key={status} onClick={() => setFilterStatus(status)} style={{ padding: "6px 12px", borderRadius: "6px", border: filterStatus === status ? "1px solid" : "1px solid var(--border)", borderColor: filterStatus === status ? getStatusColor(status).color : "var(--border)", background: filterStatus === status ? getStatusColor(status).bg : "transparent", color: filterStatus === status ? getStatusColor(status).color : "var(--muted)", fontSize: "12px", fontWeight: 500, cursor: "pointer" }}>{getStatusColor(status).label}</button>
          ))}
        </div>

        <div style={{ marginTop: "16px", display: "flex", flexDirection: "column", gap: "10px" }}>
          {filteredOrders.length > 0 ? filteredOrders.map((order) => (
            <div key={order.id} style={{ padding: "14px", background: "var(--card)", border: "1px solid var(--border)", borderRadius: "12px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
              <div style={{ display: "flex", alignItems: "center", gap: "12px", flex: 1 }}>
                <div style={{ width: "40px", height: "40px", borderRadius: "10px", background: getTypeColor(order.type).bg, display: "flex", alignItems: "center", justifyContent: "center", color: getTypeColor(order.type).color, fontWeight: 700, fontSize: "14px" }}>
                  {order.type === "buy" && "↓"}
                  {order.type === "sell" && "↑"}
                  {order.type === "swap" && "⇄"}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{order.asset}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>{new Date(order.createdAt).toLocaleString("de-DE")}</div>
                </div>
                <div style={{ textAlign: "right", marginRight: "12px" }}>
                  <div style={{ fontSize: "14px", fontWeight: 600, color: "var(--text)" }}>{order.amount}</div>
                  <div style={{ fontSize: "12px", color: "var(--muted)", marginTop: "2px" }}>€{order.total.toFixed(2)}</div>
                </div>
              </div>

              <div style={{ padding: "6px 12px", borderRadius: "6px", background: getStatusColor(order.status).bg, color: getStatusColor(order.status).color, fontSize: "12px", fontWeight: 600 }}>{getStatusColor(order.status).label}</div>
            </div>
          )) : (
            <div style={{ padding: "40px 16px", textAlign: "center", color: "var(--muted)" }}>
              <div style={{ fontSize: "14px", fontWeight: 600, marginBottom: "8px" }}>Keine Orders gefunden</div>
              <div style={{ fontSize: "12px" }}>Versuchen Sie, die Filter anzupassen</div>
            </div>
          )}
        </div>
      </div>

      <Sidebar isOpen={isSidebarOpen} onClose={() => setIsSidebarOpen(false)} />
      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
