"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const tutorials = [
  { id: "getting-started", title: "Getting Started", description: "Learn how to set up your account and make your first trade", duration: "5 min", level: "Beginner", category: "Basics" },
  { id: "buy-crypto", title: "How to Buy Cryptocurrency", description: "Step-by-step guide to buying your first crypto", duration: "3 min", level: "Beginner", category: "Trading" },
  { id: "sell-crypto", title: "How to Sell Cryptocurrency", description: "Learn how to sell your crypto assets", duration: "3 min", level: "Beginner", category: "Trading" },
  { id: "deposit", title: "How to Deposit Funds", description: "Add funds to your account using various payment methods", duration: "4 min", level: "Beginner", category: "Payments" },
  { id: "withdraw", title: "How to Withdraw Funds", description: "Withdraw your earnings safely and securely", duration: "4 min", level: "Beginner", category: "Payments" },
  { id: "stop-loss", title: "Using Stop Loss Orders", description: "Protect your investments with automated stop loss orders", duration: "6 min", level: "Intermediate", category: "Trading" },
  { id: "leverage", title: "Leverage Trading Explained", description: "Understand leverage trading and its risks", duration: "8 min", level: "Advanced", category: "Trading" },
  { id: "security", title: "Securing Your Account", description: "Best practices for account security", duration: "5 min", level: "Beginner", category: "Security" },
];

const categories = ["All", "Basics", "Trading", "Payments", "Security"];

export default function TutorialsPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeCategory, setActiveCategory] = React.useState("All");
  const [selectedTutorial, setSelectedTutorial] = React.useState<typeof tutorials[0] | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredTutorials = React.useMemo(() => {
    if (activeCategory === "All") return tutorials;
    return tutorials.filter(t => t.category === activeCategory);
  }, [activeCategory]);

  if (!isClient) return <div className="dashboard-loading"><div className="loading-spinner"></div></div>;

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        <header className="header">
          <div className="header-left">
            <Link href="/" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
            </Link>
            <span className="header-eyebrow">LEARN</span>
            <div className="header-title">Tutorials</div>
          </div>
        </header>

        <section className="hero-section">
          <h1 className="hero-title">Video Tutorials</h1>
          <p className="hero-subtitle">Learn how to use PrimeVest with step-by-step video guides</p>
        </section>

        <div className="market-categories">
          {categories.map((cat) => (
            <button key={cat} className={`category-chip ${activeCategory === cat ? "active" : ""}`} onClick={() => setActiveCategory(cat)}>{cat}</button>
          ))}
        </div>

        <section className="tutorials-list" style={{ padding: "0 16px" }}>
          {filteredTutorials.map((tutorial) => (
            <div key={tutorial.id} className="tutorial-card" onClick={() => setSelectedTutorial(tutorial)}>
              <div className="tutorial-thumbnail">
                <div className="play-button">
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
              <div className="tutorial-content">
                <div className="tutorial-meta">
                  <span className="tutorial-category">{tutorial.category}</span>
                  <span className="tutorial-duration">{tutorial.duration}</span>
                </div>
                <h3 className="tutorial-title">{tutorial.title}</h3>
                <p className="tutorial-description">{tutorial.description}</p>
                <span className={`tutorial-level ${tutorial.level.toLowerCase()}`}>{tutorial.level}</span>
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">Need More Help?</h3>
          <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
            <Link href="/support" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "var(--surface-hover)", borderRadius: 12, textDecoration: "none", color: "var(--text)" }}>
              <span style={{ fontWeight: 500 }}>FAQs</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
            <Link href="/support" style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: 16, background: "var(--surface-hover)", borderRadius: 12, textDecoration: "none", color: "var(--text)" }}>
              <span style={{ fontWeight: 500 }}>Contact Support</span>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ width: 20, height: 20 }}><polyline points="9 18 15 12 9 6" /></svg>
            </Link>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/academy" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #0f9d58 0%, #0b8043 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            Explore Academy
          </Link>
        </div>
      </div>

      {selectedTutorial && (
        <div className="modal-overlay" onClick={() => setSelectedTutorial(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{selectedTutorial.title}</h3>
              <button className="modal-close" onClick={() => setSelectedTutorial(null)}>✕</button>
            </div>
            <div className="modal-body">
              <div className="tutorial-thumbnail" style={{ height: 200, marginBottom: 16, borderRadius: 8, background: "linear-gradient(135deg, #0f9d58 0%, #0b8043 100%)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                <div className="play-button" style={{ width: 60, height: 60 }}>
                  <svg viewBox="0 0 24 24" fill="currentColor"><polygon points="5 3 19 12 5 21 5 3" /></svg>
                </div>
              </div>
              <p style={{ marginBottom: 16 }}>{selectedTutorial.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <span><strong>Duration:</strong> {selectedTutorial.duration}</span>
                <span><strong>Level:</strong> {selectedTutorial.level}</span>
              </div>
              <button style={{ width: "100%", padding: 14, background: "#0f9d58", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Watch Tutorial
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
