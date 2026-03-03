"use client";

import * as React from "react";

interface NotificationBadgeProps {
  count?: number;
  onClick?: () => void;
}

export default function NotificationBadge({ count = 3, onClick }: NotificationBadgeProps) {
  return (
    <button 
      className="notification-badge-btn"
      onClick={onClick}
      aria-label="Open notifications"
    >
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="notification-badge-icon">
        <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
        <path d="M13.73 21a2 2 0 0 1-3.46 0" />
      </svg>
      <span className="notification-badge-label">Notifications</span>
      {count > 0 && (
        <span className="notification-badge-count">
          {count > 9 ? "9+" : count}
        </span>
      )}
    </button>
  );
}

// Toast notification hook
export function useToast() {
  const [toasts, setToasts] = React.useState<{ id: string; message: string; type: "success" | "error" | "info" }[]>([]);

  const addToast = React.useCallback((message: string, type: "success" | "error" | "info" = "info") => {
    const id = Date.now().toString();
    setToasts(prev => [...prev, { id, message, type }]);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
      setToasts(prev => prev.filter(t => t.id !== id));
    }, 3000);
  }, []);

  const removeToast = React.useCallback((id: string) => {
    setToasts(prev => prev.filter(t => t.id !== id));
  }, []);

  return { toasts, addToast, removeToast };
}

// Toast container component
export function ToastContainer({ toasts, onRemove }: { toasts: { id: string; message: string; type: string }[]; onRemove: (id: string) => void }) {
  return (
    <div style={{
      position: "fixed",
      bottom: 100,
      left: "50%",
      transform: "translateX(-50%)",
      zIndex: 1000,
      display: "flex",
      flexDirection: "column",
      gap: 8,
    }}>
      {toasts.map(toast => (
        <div
          key={toast.id}
          onClick={() => onRemove(toast.id)}
          style={{
            padding: "12px 20px",
            borderRadius: 10,
            background: toast.type === "success" ? "#0f9d58" : toast.type === "error" ? "#d64545" : "#103e36",
            color: "#fff",
            fontSize: 14,
            fontWeight: 500,
            cursor: "pointer",
            boxShadow: "0 8px 24px rgba(0,0,0,0.2)",
            animation: "slideIn 0.3s ease-out",
          }}
        >
          {toast.message}
        </div>
      ))}
    </div>
  );
}

