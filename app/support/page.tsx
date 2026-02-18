"use client";

import * as React from "react";
import Link from "next/link";
import BottomNav from "@/components/BottomNav";

interface FAQItemProps {
  question: string;
  answer: string;
}

function FAQItem({ question, answer }: FAQItemProps) {
  const [isOpen, setIsOpen] = React.useState(false);

  return (
    <div className={`faq-item ${isOpen ? 'open' : ''}`}>
      <button className="faq-question" onClick={() => setIsOpen(!isOpen)}>
        <span>{question}</span>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
          <polyline points="6 9 12 15 18 9" />
        </svg>
      </button>
      {isOpen && (
        <div className="faq-answer">
          <p>{answer}</p>
        </div>
      )}
    </div>
  );
}

const faqs: FAQItemProps[] = [
  {
    question: "How do I deposit funds?",
    answer: "To deposit funds, go to your Dashboard and tap on 'Gratis einzahlen' or navigate to the Deposit section. You can deposit via SEPA transfer, credit card, or other supported payment methods.",
  },
  {
    question: "How can I withdraw my funds?",
    answer: "Go to your Wallet, select the asset you want to withdraw, and tap on 'Withdraw'. Enter the destination address and amount. withdrawals are processed within 24 hours.",
  },
  {
    question: "Is my data secure?",
    answer: "Yes, we use industry-leading encryption and security measures to protect your data. All sensitive information is encrypted at rest and in transit.",
  },
  {
    question: "What are the trading fees?",
    answer: "Our fees vary based on your trading volume and VIP level. Check our Fees page for detailed information on current rates.",
  },
  {
    question: "How do I enable two-factor authentication?",
    answer: "Go to Settings → Security → Two-Factor Authentication and follow the instructions to set up 2FA using an authenticator app.",
  },
];

export default function SupportPage() {
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [searchQuery, setSearchQuery] = React.useState("");
  const [showChatModal, setShowChatModal] = React.useState(false);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  if (!isClient) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-app">
          <div className="loading-spinner-container">
            <div className="loading-spinner"></div>
          </div>
        </div>
      </div>
    );
  }

  const filteredFaqs = faqs.filter(faq =>
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="dashboard-container">
      <div className="dashboard-app">
        {/* HEADER */}
        <header className="header">
          <div className="header-left">
            <Link href="/dashboard" className="header-back">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="15 18 9 12 15 6" />
              </svg>
            </Link>
            <span className="header-eyebrow">HELP</span>
            <div className="header-title">Support</div>
          </div>
          <div className="header-actions">
            <button className="menu-btn" onClick={() => setIsSidebarOpen(true)}>
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          </div>
        </header>

        {/* SEARCH */}
        <section className="section">
          <div className="card">
            <div className="search-container">
              <div className="search-input-wrapper">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <input
                  type="text"
                  placeholder="Search for help..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="search-input"
                />
              </div>
            </div>
          </div>
        </section>

        {/* QUICK ACTIONS */}
        <section className="section">
          <h3 className="section-title">Quick Help</h3>
          <div className="card">
            <div className="quick-actions-grid">
              <button className="quick-action-card" onClick={() => setShowChatModal(true)}>
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Live Chat</span>
                  <small>Chat with support</small>
                </div>
              </button>
              <Link href="mailto:support@example.com" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Email</span>
                  <small>Send us an email</small>
                </div>
              </Link>
              <Link href="/support/faqs" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <circle cx="12" cy="12" r="10" />
                    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>FAQs</span>
                  <small>Browse frequently asked questions</small>
                </div>
              </Link>
              <Link href="/support" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" />
                    <path d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Help Center</span>
                  <small>Browse articles</small>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* SUPPORT OPTIONS */}
        <section className="section">
          <h3 className="section-title">Support Options</h3>
          <div className="card">
            <div className="quick-actions-grid">
              <Link href="/support/tickets" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                    <line x1="9" y1="9" x2="15" y2="15" />
                    <line x1="15" y1="9" x2="9" y2="15" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Submit Ticket</span>
                  <small>Get detailed help</small>
                </div>
              </Link>
              <Link href="/support/status" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Status</span>
                  <small>Check service status</small>
                </div>
              </Link>
              <Link href="/support/community" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Community</span>
                  <small>Ask other users</small>
                </div>
              </Link>
              <Link href="/support/contact" className="quick-action-card">
                <div className="quick-action-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="quick-action-content">
                  <span>Contact Us</span>
                  <small>Direct support</small>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* FREQUENTLY ASKED QUESTIONS */}
        <section className="section">
          <h3 className="section-title">Frequently Asked Questions</h3>
          <div className="card">
            {filteredFaqs.length > 0 ? (
              <div className="faq-container">
                {filteredFaqs.map((faq, index) => (
                  <FAQItem key={index} question={faq.question} answer={faq.answer} />
                ))}
              </div>
            ) : (
              <div className="empty-state">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <circle cx="11" cy="11" r="8" />
                  <line x1="21" y1="21" x2="16.65" y2="16.65" />
                </svg>
                <p>No results found for {'"' + searchQuery + '"'}</p>
              </div>
            )}
          </div>
        </section>

        {/* CONTACT SUPPORT */}
        <section className="section">
          <h3 className="section-title">Contact Support</h3>
          <div className="card">
            <div className="contact-support">
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                  </svg>
                </div>
                <div className="contact-content">
                  <span className="contact-label">Phone Support</span>
                  <span className="contact-value">+43 123 456 789</span>
                </div>
              </div>
              <div className="contact-item">
                <div className="contact-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                    <polyline points="22,6 12,13 2,6" />
                  </svg>
                </div>
                <div className="contact-content">
                  <span className="contact-label">Email Support</span>
                  <span className="contact-value">support@example.com</span>
                </div>
              </div>
            </div>
          </div>
        </section>
      </div>

      <BottomNav 
        onMenuClick={() => setIsSidebarOpen(true)} 
        isMenuActive={isSidebarOpen} 
      />

      {/* Live Chat Modal */}
      {showChatModal && (
        <div className="modal-overlay" onClick={() => setShowChatModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Live Chat</h3>
              <button className="modal-close" onClick={() => setShowChatModal(false)}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>
            <div className="modal-body">
              <div className="chat-placeholder">
                <div className="chat-icon">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                </div>
                <h4>Live Chat Coming Soon</h4>
                <p>Our live chat feature is currently under development. Please contact us via email or check our FAQ for immediate assistance.</p>
              </div>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowChatModal(false)}>
                Close
              </button>
              <a href="mailto:support@example.com" className="btn btn-primary">
                Contact via Email
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

