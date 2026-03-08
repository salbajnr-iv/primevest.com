"use client";

import Link from "next/link";
import DashboardHeader from "@/components/DashboardHeader";
import BottomNav from "@/components/BottomNav";

export const dynamic = "force-dynamic";

const quickActions = [
  { label: "Buy", href: "/dashboard/buy", color: "buy", icon: "+" },
  { label: "Sell", href: "/dashboard/sell", color: "sell", icon: "−" },
  { label: "Swap", href: "/dashboard/swap", color: "swap", icon: "⇄" },
  { label: "Deposit", href: "/dashboard/deposit", color: "deposit", icon: "↓" },
];

const recentActivity = [
  { id: "DEP-94821", type: "Deposit", amount: "+500.00 €", status: "completed", href: "/dashboard/deposit" },
  { id: "BUY-94807", type: "Buy BTC", amount: "-250.00 €", status: "completed", href: "/dashboard/buy" },
  { id: "SWP-94791", type: "Swap ETH → BTC", amount: "0.14 ETH", status: "pending", href: "/dashboard/swap" },
];

export default function DashboardPage() {
  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <DashboardHeader userName="User" portfolioValue="12,540.50 €" portfolioChange="+2.41%" notificationCount={3} />

        <main>
          <section className="portfolio">
            <div className="portfolio-inner">
              <small>Available Balance</small>
              <div className="value-row">
                <div className="value">8,240.50<span className="value-currency">€</span></div>
                <div className="value-detail">
                  <div className="value-label">24h</div>
                  <div className="change">+1.2%</div>
                </div>
              </div>
            </div>
          </section>

          <section style={{ marginTop: 16 }}>
            <div className="page-header">
              <h3 className="section-title" style={{ margin: 0 }}>Quick Actions</h3>
              <Link href="/wallets" className="text-green-700 underline" style={{ fontSize: 13 }}>Open Wallets</Link>
            </div>
            <div className="portfolio-actions" style={{ marginTop: 12 }}>
              {quickActions.map((action) => (
                <Link key={action.label} href={action.href} className="action-btn">
                  <div className={`action-icon ${action.color}`}>
                    <span style={{ fontSize: 16, fontWeight: 700 }}>{action.icon}</span>
                  </div>
                  <span>{action.label}</span>
                </Link>
              ))}
            </div>
          </section>

          <section style={{ marginTop: 20 }}>
            <div className="page-header">
              <h3 className="section-title" style={{ margin: 0 }}>Recent Activity</h3>
              <Link href="/transactions" className="text-green-700 underline" style={{ fontSize: 13 }}>View all</Link>
            </div>

            <div className="list-card" style={{ marginTop: 12 }}>
              {recentActivity.map((item, index) => (
                <Link
                  href={item.href}
                  key={item.id}
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    padding: "12px 0",
                    borderBottom: index === recentActivity.length - 1 ? "none" : "1px solid var(--border)",
                    textDecoration: "none",
                    color: "inherit",
                  }}
                >
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.type}</div>
                    <div style={{ fontSize: 12, color: "var(--muted)" }}>{item.id}</div>
                  </div>
                  <div style={{ textAlign: "right" }}>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>{item.amount}</div>
                    <div style={{ fontSize: 12, color: item.status === "completed" ? "var(--success)" : "#f59e0b" }}>
                      {item.status}
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </main>

        <BottomNav />
      </div>
    </div>
  );
}
