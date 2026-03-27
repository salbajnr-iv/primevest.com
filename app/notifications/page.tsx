"use client";

import * as React from "react";
import BottomNav from "@/components/BottomNav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { FeatureCard } from "@/components/ui/FeatureCard";
import { IconBadge } from "@/components/ui/IconBadge";
import { PageSectionHeader } from "@/components/ui/PageSectionHeader";
import { PageMain, PageShell, StickyPageHeader } from "@/components/ui/page-layout";
import { useAuth } from "@/contexts/AuthContext";
import { mapNotificationRow, useNotifications, type AppNotification, type NotificationRow } from "@/docs/hooks/useNotifications";
import { createClient } from "@/lib/supabase/client";

type Notification = AppNotification;
type NotificationFilter = "all" | "unread" | "system" | "trading";

const notifications: Notification[] = [
  {
    id: "1",
    type: "success",
    title: "Deposit Completed",
    message: "Your deposit of €1,000.00 has been credited to your account.",
    time: "2 hours ago",
    is_read: false,
  },
  {
    id: "2",
    type: "info",
    title: "Price Alert",
    message: "Bitcoin has increased by 5% in the last hour.",
    time: "5 hours ago",
    is_read: false,
  },
  {
    id: "3",
    type: "warning",
    title: "Security Notice",
    message: "A new device has logged into your account. If this wasn't you, please secure your account.",
    time: "Yesterday",
    is_read: false,
  },
  {
    id: "4",
    type: "promo",
    title: "VIP Benefits",
    message: "Congratulations! You've qualified for BEST VIP Level with reduced trading fees.",
    time: "2 days ago",
    is_read: true,
  },
  {
    id: "5",
    type: "success",
    title: "Withdrawal Processed",
    message: "Your withdrawal of €500.00 has been sent to your bank account.",
    time: "3 days ago",
    is_read: true,
  },
  {
    id: "6",
    type: "info",
    title: "System Maintenance",
    message: "Scheduled maintenance will occur on Sunday, 2:00 AM - 4:00 AM UTC.",
    time: "1 week ago",
    is_read: true,
  },
  {
    id: "7",
    type: "promo",
    title: "New Feature Available",
    message: "Introducing staking rewards - earn up to 30% on selected assets!",
    time: "2 weeks ago",
    is_read: true,
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
  if (!open) return null;

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
        return { bgColor: "bg-green-100", borderColor: "border-green-300", textColor: "text-green-700" };
      case "warning":
        return { bgColor: "bg-amber-100", borderColor: "border-amber-300", textColor: "text-amber-700" };
      case "promo":
        return { bgColor: "bg-purple-100", borderColor: "border-purple-300", textColor: "text-purple-700" };
      default:
        return { bgColor: "bg-blue-100", borderColor: "border-blue-300", textColor: "text-blue-700" };
    }
  };

  const { bgColor, borderColor, textColor } = getTypeStyle();

  return (
    <article
      className={`rounded-xl border bg-white p-4 shadow-sm transition ${borderColor} ${notification.is_read ? "opacity-80" : "shadow-sm"}`}
      onClick={() => onNotificationClick(notification)}
    >
      <div className="flex items-start gap-3">
        <IconBadge icon={<div className="h-5 w-5" />} className={`mt-0.5 shrink-0 ${bgColor}`} />
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
                  {!notification.is_read && <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Mark as read</button>}
                  <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100">Dismiss</button>
                </div>
              )}
            </div>
          </div>
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{notification.time}</span>
            {!notification.is_read && <Badge variant="secondary">Unread</Badge>}
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
  const fetchUnreadNotifications = React.useCallback(async (userId?: string) => {
    if (!userId) return;

    const supabase = createClient();

    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .eq("user_id", userId)
      .eq("is_read", false)
      .order("created_at", { ascending: false })
      .limit(50);

    if (error) return;

    const unreadNotifications = (data ?? []).map((row: unknown) => mapNotificationRow(row as NotificationRow));
    setNotificationsList((current) => {
      const currentReadNotifications = current.filter((notification) => notification.is_read);
      return [...unreadNotifications, ...currentReadNotifications];
    });
  }, []);

  React.useEffect(() => {
    setIsClient(true);
  }, []);

  React.useEffect(() => {
    if (authLoading || !authUser) {
      setNotificationsList(notifications);
      return;
    }

    const load = async () => {
      const supabase = createClient();

      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", authUser.id)
        .order("created_at", { ascending: false });

      if (error || !data || data.length === 0) {
        setNotificationsList(notifications);
        return;
      }

      setNotificationsList(data.map((row: unknown) => mapNotificationRow(row as NotificationRow)));
    };

    void load();
  }, [authLoading, authUser]);

  const handleFetchUnreadNotifications = React.useCallback(async () => {
    await fetchUnreadNotifications(authUser?.id);
  }, [authUser?.id, fetchUnreadNotifications]);

  useNotifications({
    userId: authUser?.id,
    setNotifications: setNotificationsList,
    fetchUnreadNotifications: handleFetchUnreadNotifications,
    enableReplay: false,
  });

  const unreadCount = notificationsList.filter((n) => !n.is_read).length;

  const filteredNotifications = notificationsList.filter((notification) => {
    if (filter === "unread") return !notification.is_read;
    if (filter === "system") return notification.type === "info" || notification.type === "warning";
    if (filter === "trading") return notification.type !== "info" && notification.type !== "warning";
    return true;
  });

  const markAllAsRead = async () => {
    setToolbarError(null);
    const previous = notificationsList;
    setNotificationsList((prev) => prev.map((n) => ({ ...n, is_read: true })));

    if (!authUser) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("user_id", authUser.id)
      .eq("is_read", false);

    if (error) {
      setNotificationsList(previous);
      setToolbarError("Could not mark all notifications as read. Please try again.");
    }
  };

  const handleNotificationClick = async (clickedNotification: Notification) => {
    if (clickedNotification.is_read) return;

    setUpdateErrors((prev) => {
      const next = { ...prev };
      delete next[clickedNotification.id];
      return next;
    });

    setNotificationsList((prev) => prev.map((n) => (n.id === clickedNotification.id ? { ...n, is_read: true } : n)));

    if (!authUser) return;

    const supabase = createClient();

    const { error } = await supabase
      .from("notifications")
      .update({ is_read: true })
      .eq("id", clickedNotification.id)
      .eq("user_id", authUser.id);

    if (error) {
      setNotificationsList((prev) => prev.map((n) => (n.id === clickedNotification.id ? { ...n, is_read: false } : n)));
      setUpdateErrors((prev) => ({ ...prev, [clickedNotification.id]: "Failed to update status. Tap again to retry." }));
    }
  };

  if (!isClient || authLoading) {
    return <div className="dashboard-container"><div className="dashboard-app"><div className="loading-spinner-container"><div className="loading-spinner" /></div></div></div>;
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
        <FeatureCard title="Filter notifications" description="Switch between unread, system, and trading updates.">
          <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
            <div className="flex flex-wrap gap-2">
              {(["all", "unread", "system", "trading"] as NotificationFilter[]).map((tab) => (
                <Button key={tab} size="sm" variant={filter === tab ? "default" : "outline"} onClick={() => setFilter(tab)} className="capitalize">{tab}</Button>
              ))}
            </div>
            <div className="relative self-start md:self-auto">
              <Button variant="ghost" size="sm" onClick={() => setBulkMenuOpen((prev) => !prev)}>More actions</Button>
              {bulkMenuOpen && (
                <div className="absolute right-0 z-20 mt-1 w-48 rounded-lg border bg-white py-1 shadow-md">
                  <button className="block w-full px-3 py-2 text-left text-sm hover:bg-gray-100" onClick={() => { setBulkMenuOpen(false); setClearAllModalOpen(true); }}>
                    Clear all notifications
                  </button>
                </div>
              )}
            </div>
          </div>
          {toolbarError && <p className="mt-2 text-sm text-red-600">{toolbarError}</p>}
        </FeatureCard>

        <PageSectionHeader eyebrow="Inbox" title="Recent activity" description="Tap any item to mark it as read." />

        <section className="space-y-3">
          {filteredNotifications.length > 0 ? (
            filteredNotifications.map((notification) => (
              <NotificationItem key={notification.id} notification={notification} updateError={updateErrors[notification.id]} onNotificationClick={handleNotificationClick} />
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
