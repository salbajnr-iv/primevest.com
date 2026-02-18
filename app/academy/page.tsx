"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

const courses = [
  { id: "crypto-basics", title: "Cryptocurrency Basics", description: "Understand the fundamentals of cryptocurrency", lessons: 12, duration: "2 hours", level: "Beginner", progress: 0, icon: "₿" },
  { id: "trading-fundamentals", title: "Trading Fundamentals", description: "Learn the basics of trading financial assets", lessons: 15, duration: "3 hours", level: "Beginner", progress: 0, icon: "📈" },
  { id: "technical-analysis", title: "Technical Analysis", description: "Master chart patterns and indicators", lessons: 20, duration: "4 hours", level: "Intermediate", progress: 0, icon: "📊" },
  { id: "risk-management", title: "Risk Management", description: "Protect your capital with proven strategies", lessons: 10, duration: "1.5 hours", level: "Intermediate", progress: 0, icon: "🛡️" },
  { id: "defi-explained", title: "DeFi Explained", description: "Understand decentralized finance", lessons: 18, duration: "3 hours", level: "Advanced", progress: 0, icon: "🔗" },
  { id: "advanced-strategies", title: "Advanced Trading Strategies", description: "Professional trading techniques", lessons: 25, duration: "5 hours", level: "Advanced", progress: 0, icon: "🎯" },
];

const levels = ["All", "Beginner", "Intermediate", "Advanced"];

export default function AcademyPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [activeLevel, setActiveLevel] = React.useState("All");
  const [selectedCourse, setSelectedCourse] = React.useState<typeof courses[0] | null>(null);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  const filteredCourses = React.useMemo(() => {
    if (activeLevel === "All") return courses;
    return courses.filter(c => c.level === activeLevel);
  }, [activeLevel]);

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
            <div className="header-title">Academy</div>
          </div>
        </header>

        <section className="hero-section" style={{ background: "linear-gradient(135deg, #0f9d58 0%, #0b8043 100%)" }}>
          <h1 className="hero-title">Bitpanda Academy</h1>
          <p className="hero-subtitle">Master cryptocurrency and trading with expert-led courses</p>
          <div className="hero-stats">
            <div className="hero-stat">
              <span className="hero-stat-value">6</span>
              <span className="hero-stat-label">Courses</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">100+</span>
              <span className="hero-stat-label">Lessons</span>
            </div>
            <div className="hero-stat">
              <span className="hero-stat-value">Free</span>
              <span className="hero-stat-label">Access</span>
            </div>
          </div>
        </section>

        <div className="market-categories">
          {levels.map((level) => (
            <button key={level} className={`category-chip ${activeLevel === level ? "active" : ""}`} onClick={() => setActiveLevel(level)}>{level}</button>
          ))}
        </div>

        <section className="courses-grid" style={{ padding: "0 16px" }}>
          {filteredCourses.map((course) => (
            <div key={course.id} className="course-card" onClick={() => setSelectedCourse(course)}>
              <div className="course-icon" style={{ background: course.level === "Beginner" ? "#0ec02b" : course.level === "Intermediate" ? "#fbbc04" : "#ea4335" }}>
                {course.icon}
              </div>
              <div className="course-content">
                <span className={`course-level ${course.level.toLowerCase()}`}>{course.level}</span>
                <h3 className="course-title">{course.title}</h3>
                <p className="course-description">{course.description}</p>
                <div className="course-meta">
                  <span>{course.lessons} lessons</span>
                  <span>•</span>
                  <span>{course.duration}</span>
                </div>
              </div>
              <div className="course-progress">
                <div className="progress-bar">
                  <div className="progress-fill" style={{ width: `${course.progress}%` }}></div>
                </div>
                <span className="progress-text">{course.progress}% complete</span>
              </div>
            </div>
          ))}
        </section>

        <section className="info-section">
          <h3 className="section-title">Why Learn with Bitpanda Academy?</h3>
          <div className="features-grid">
            <div className="feature-card">
              <div className="feature-icon">🎓</div>
              <div className="feature-content">
                <h4>Expert Instructors</h4>
                <p>Learn from industry professionals</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">📚</div>
              <div className="feature-content">
                <h4>Comprehensive Content</h4>
                <p>From basics to advanced strategies</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">⏰</div>
              <div className="feature-content">
                <h4>Learn at Your Pace</h4>
                <p>Access courses anytime, anywhere</p>
              </div>
            </div>
            <div className="feature-card">
              <div className="feature-icon">🎯</div>
              <div className="feature-content">
                <h4>Practical Skills</h4>
                <p>Apply what you learn immediately</p>
              </div>
            </div>
          </div>
        </section>

        <div style={{ textAlign: "center", marginTop: 20, marginBottom: 20 }}>
          <Link href="/tutorials" className="cta-button" style={{ display: "inline-block", padding: "14px 32px", background: "linear-gradient(135deg, #0f9d58 0%, #0b8043 100%)", color: "white", borderRadius: 12, fontWeight: 600, textDecoration: "none" }}>
            View Tutorials
          </Link>
        </div>
      </div>

      {selectedCourse && (
        <div className="modal-overlay" onClick={() => setSelectedCourse(null)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <div className="course-icon" style={{ width: 44, height: 44, fontSize: 24 }}>
                  {selectedCourse.icon}
                </div>
                <div><h3 style={{ margin: 0 }}>{selectedCourse.title}</h3></div>
              </div>
              <button className="modal-close" onClick={() => setSelectedCourse(null)}>✕</button>
            </div>
            <div className="modal-body">
              <p style={{ marginBottom: 16 }}>{selectedCourse.description}</p>
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
                <div>
                  <small style={{ color: "var(--muted)" }}>Lessons</small>
                  <div style={{ fontWeight: 600 }}>{selectedCourse.lessons}</div>
                </div>
                <div>
                  <small style={{ color: "var(--muted)" }}>Duration</small>
                  <div style={{ fontWeight: 600 }}>{selectedCourse.duration}</div>
                </div>
                <div>
                  <small style={{ color: "var(--muted)" }}>Level</small>
                  <div style={{ fontWeight: 600 }}>{selectedCourse.level}</div>
                </div>
              </div>
              <button style={{ width: "100%", padding: 14, background: "#0f9d58", color: "#fff", border: "none", borderRadius: 8, fontWeight: 600, cursor: "pointer" }}>
                Start Course
              </button>
            </div>
          </div>
        </div>
      )}

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </div>
  );
}
