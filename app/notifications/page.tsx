"use client";

import * as React from "react";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { PageMain, PageShell, StickyPageHeader, SurfaceCard } from "@/components/ui/page-layout";
import { useAuth } from "@/contexts/AuthContext";
import { createClient } from "@/lib/supabase/client";

interface Notification {
  id: string;
  type: "success" | "warning" | "info" | "promo";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
}

type NotificationFilter = "all" | "unread" | "system" | "trading";

const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Deposit Completed",
    message: "Your deposit of €1,000.00 has been credited to your account.",
    time: "2 hours ago",
    read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Price Alert",
    message: "Bitcoin has increased by 5% in the last hour.",
    time: "5 hours ago",
    read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Security Notice",
    message:
      "A new device has logged into your account. If this wasn't you, please secure your account.",
    time: "Yesterday",
    read: false,
  },
  {
    id: "4",
    type: "promo",
    title: "VIP Benefits",
    message:
      "Congratulations! You've qualified for BEST VIP Level with reduced trading fees.",
    time: "2 days ago",
    read: true,
  },
  {
    id: "5",
    type: "success",
    title: "Withdrawal Processed",
    message: "Your withdrawal of €500.00 has been sent to your bank account.",
    time: "3 days ago",
    read: true,
  },
  {
    id: "6",
    type: "info",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM UTC.",
    time: "1 week ago",
    read: true,
  },
  {
    id: "7",
    type: "promo",
    title: "New Feature Available",
    message: "Introducing staking rewards - earn up to 30% on selected assets!",
    time: "2 weeks ago",
    read: true,
  },
];

function ConfirmationModal({
  open,
  title,
  description,
  confirmLabel,
  onConfirm,
  onClose,
}: {
  open: boolean;
  title: string;
  description: string;
  confirmLabel: string;
  onConfirm: () => void;
  onClose: () => void;
}) {
  if (!open) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4" role="dialog" aria-modal="true">
      <div className="w-full max-w-md rounded-xl border bg-white p-5 shadow-xl">
        <h3 className="text-lg font-semibold text-gray-900">{title}</h3>
        <p className="mt-2 text-sm text-gray-600">{description}</p>
        <div className="mt-4 flex justify-end gap-2">
          <Button variant="outline" onClick={onClose}>Cancel</Button>
          <Button variant="destructive" onClick={onConfirm}>{confirmLabel}</Button>
        </div>
      </div>
    </div>
  );
}

function NotificationItem({
  notification,
  updateError,
  onNotificationClick,
}: {
  notification: Notification;
  updateError?: string;
  onNotificationClick: (notification: Notification) => void;
}) {
  const [dropdownOpen, setDropdownOpen] = React.useState(false);

  const getTypeStyle = () => {
    switch (notification.type) {
      case "success":
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#0f9d58" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          ),
          bgColor: "bg-green-100",
          borderColor: "border-green-300",
          textColor: "text-green-700",
        };
      case "warning":
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#ff9800" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
              <line x1="12" y1="9" x2="12" y2="13" />
              <line x1="12" y1="17" x2="12.01" y2="17" />
            </svg>
          ),
          bgColor: "bg-amber-100",
          borderColor: "border-amber-300",
          textColor: "text-amber-700",
        };
      case "promo":
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#9c27b0" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2" />
            </svg>
          ),
          bgColor: "bg-purple-100",
          borderColor: "border-purple-300",
          textColor: "text-purple-700",
        };
      case "info":
      default:
        return {
          icon: (
            <svg viewBox="0 0 24 24" fill="none" stroke="#007aff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="16" x2="12" y2="12" />
              <line x1="12" y1="8" x2="12.01" y2="8" />
            </svg>
          ),
          bgColor: "bg-blue-100",
          borderColor: "border-blue-300",
          textColor: "text-blue-700",
        };
    }
  };

  const { icon, bgColor, borderColor, textColor } = getTypeStyle();

  return (
    <article
      className={`rounded-xl border bg-white p-4 transition ${borderColor} ${
        notification.read ? "opacity-80" : "shadow-sm"
      }`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <div className={`mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${bgColor}`}>
          <div className="h-5 w-5">{icon}</div>
        </div>

        <div className="min-w-0 flex-1">
          <div className="flex items-start justify-between gap-2">
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-gray-900">{notification.title}</h4>
              <p className="text-sm text-gray-600">{notification.message}</p>
            </div>

            <div className="relative ml-2 shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8"
                onClick={(e) => {
                  e.stopPropagation();
                  setDropdownOpen((prev) => !prev);
                }}
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-4 w-4">
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="19" cy="12" r="1" />
                  <circle cx="5" cy="12" r="1" />
                </svg>
              </Button>

              {dropdownOpen && (
                <div className="absolute right-0 z-20 mt-1 w-40 rounded-lg border bg-white py-1 shadow-md">
                  {!notification.read && (
                    <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                      Mark as read
                    </button>
                  )}
                  <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => setDropdownOpen(false)}>
                    Dismiss
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{notification.time}</span>
            {!notification.read && <Badge variant="secondary">Unread</Badge>}
            {notification.action && <span className={textColor}>{notification.action}</span>}
          </div>

          {updateError && <p className="mt-2 text-xs text-red-600">{updateError}</p>}
        </div>
      </div>
    </article>
  );
}

export default function NotificationsPage() {
  const { user: authUser, loading: authLoading } = useAuth();
  const [isClient, setIsClient] = React.useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = React.useState(false);
  const [filter, setFilter] = React.useState<NotificationFilter>("all");
  const [notificationsList, setNotificationsList] = React.useState<Notification[]>([]);
  const [bulkMenuOpen, setBulkMenuOpen] = React.useState(false);
  const [clearAllModalOpen, setClearAllModalOpen] = React.useState(false);
  const [updateErrors, setUpdateErrors] = React.useState<Record<string, string>>({});
  const [toolbarError, setToolbarError] = React.useState<string | null>(null);
  const supabase = createClient();

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setNotificationsList(notifications);
      return;
    }

    (async () => {
      if (!supabase) {
        setNotificationsList(notifications);
        return;
      }

      try {
        const { data, error } = await supabase
          .from("notifications")
          .select("*")
          .eq("user_id", authUser.id)
          .order("created_at", { ascending: false });

        if (error) {
          console.warn("Notifications table not available or query failed, using mock data", error);
          setNotificationsList(notifications);
        } else if (data && data.length > 0) {
          interface SupabaseNotification {
            id: number;
            type: "success" | "warning" | "info" | "promo";
            title: string;
            message: string;
            created_at: string;
            read: boolean;
            action?: string;
          }

          const mapped = data.map((row: SupabaseNotification) => ({
            id: String(row.id),
            type: row.type || "info",
            title: row.title || "Notification",
            message: row.message || "",
            time: row.created_at ? new Date(row.created_at).toLocaleString() : "",
            read: !!row.read,
            action: row.action || undefined,
          }));
          setNotificationsList(mapped);
        } else {
          setNotificationsList(notifications);
        }
      } catch (err) {
        console.error("Failed to load notifications", err);
        setNotificationsList(notifications);
      }
    })();
  }, [authLoading, authUser, supabase]);

  const unreadCount = notificationsList.filter((n) => !n.read).length;

  const getCategory = React.useCallback((notification: Notification) => {
    if (notification.type === "info" || notification.type === "warning") return "system";
    return "trading";
  }, []);

  const filteredNotifications = notificationsList.filter((notification) => {
    if (filter === "unread") return !notification.read;
    if (filter === "system") return getCategory(notification) === "system";
    if (filter === "trading") return getCategory(notification) === "trading";
    return true;
  });

  const markAllAsRead = async () => {
    setToolbarError(null);
    const previous = notificationsList;
    setNotificationsList((prev) => prev.map((n) => ({ ...n, read: true })));

    if (!authUser || !supabase) return;
    try {
      const { error } = await supabase.from("notifications").update({ read: true }).eq("user_id", authUser.id);
      if (error) {
        setNotificationsList(previous);
        setToolbarError("Could not mark all notifications as read. Please try again.");
      }
    } catch (err) {
      console.error("Error updating notifications", err);
      setNotificationsList(previous);
      setToolbarError("Could not mark all notifications as read. Please try again.");
    }
  };

  const handleNotificationClick = async (clickedNotification: Notification) => {
    if (clickedNotification.read) return;

    setUpdateErrors((prev) => {
      const next = { ...prev };
      delete next[clickedNotification.id];
      return next;
    });

    setNotificationsList((prev) => prev.map((n) => (n.id === clickedNotification.id ? { ...n, read: true } : n)));

    if (authUser && supabase) {
      try {
        const { error } = await supabase.from("notifications").update({ read: true }).eq("id", clickedNotification.id);

        if (error) {
          setNotificationsList((prev) => prev.map((n) => (n.id === clickedNotification.id ? { ...n, read: false } : n)));
          setUpdateErrors((prev) => ({
            ...prev,
            [clickedNotification.id]: "Failed to update status. Tap again to retry.",
          }));
        }
      } catch (err) {
        console.error("Error updating notification:", err);
        setNotificationsList((prev) => prev.map((n) => (n.id === clickedNotification.id ? { ...n, read: false } : n)));
        setUpdateErrors((prev) => ({
          ...prev,
          [clickedNotification.id]: "Failed to update status. Tap again to retry.",
        }));
      }
    }
  };

  if (!isClient || authLoading) {
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

  return (
    <PageShell>
      <StickyPageHeader
        eyebrow="Alerts"
        title="Notifications"
        badge={unreadCount > 0 ? <Badge>{unreadCount} unread</Badge> : undefined}
        action={<Button onClick={markAllAsRead} disabled={unreadCount === 0}>Mark all read</Button>}
      />

      <PageMain>
          <SurfaceCard className="p-3">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div className="flex flex-wrap gap-2">
                {(["all", "unread", "system", "trading"] as NotificationFilter[]).map((tab) => (
                  <Button
                    key={tab}
                    size="sm"
                    variant={filter === tab ? "default" : "outline"}
                    onClick={() => setFilter(tab)}
                    className="capitalize"
                  >
                    {tab}
                  </Button>
                ))}
              </div>

              <div className="relative self-start md:self-auto">
                <Button variant="ghost" size="sm" onClick={() => setBulkMenuOpen((prev) => !prev)}>
                  More actions
                </Button>
                {bulkMenuOpen && (
                  <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border bg-white py-1 shadow-md">
                    <button
                      className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100"
                      onClick={() => {
                        setBulkMenuOpen(false);
                        setClearAllModalOpen(true);
                      }}
                    >
                      Clear all notifications
                    </button>
                  </div>
                )}
              </div>
            </div>
            {toolbarError && <p className="mt-2 text-sm text-red-600">{toolbarError}</p>}
          </SurfaceCard>

          <section className="space-y-3">
            {filteredNotifications.length > 0 ? (
              filteredNotifications.map((notification) => (
                <NotificationItem
                  key={notification.id}
                  notification={notification}
                  updateError={updateErrors[notification.id]}
                  onNotificationClick={handleNotificationClick}
                />
              ))
            ) : (
              <div className="rounded-xl border bg-white p-10 text-center text-sm text-gray-600">No notifications to show</div>
            )}
          </section>
      </PageMain>

      <ConfirmationModal
        open={clearAllModalOpen}
        title="Clear all notifications?"
        description="This will remove all notifications from this list. This action cannot be undone."
        confirmLabel="Clear all"
        onClose={() => setClearAllModalOpen(false)}
        onConfirm={() => {
          setNotificationsList([]);
          setClearAllModalOpen(false);
        }}
      />

      <BottomNav onMenuClick={() => setIsSidebarOpen(true)} isMenuActive={isSidebarOpen} />
    </PageShell>
  );
}
