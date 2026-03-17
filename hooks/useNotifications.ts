"use client";

import * as React from "react";
import { createClient } from "@/lib/supabase/client";

export interface AppNotification {
  id: string;
  type: "success" | "warning" | "info" | "promo";
  title: string;
  message: string;
  time: string;
  read: boolean;
  action?: string;
}

export interface NotificationRow {
  id: number | string;
  type: AppNotification["type"] | null;
  title: string | null;
  message: string | null;
  created_at: string | null;
  read: boolean | null;
  action?: string | null;
}

interface NotificationBroadcastPayload {
  notification_id?: number | string;
}

interface UseNotificationsOptions {
  userId?: string;
  setNotifications: React.Dispatch<React.SetStateAction<AppNotification[]>>;
  fetchUnreadNotifications?: () => Promise<void>;
  enableReplay?: boolean;
  replaySince?: string;
}

export function mapNotificationRow(row: NotificationRow): AppNotification {
  return {
    id: String(row.id),
    type: row.type ?? "info",
    title: row.title ?? "Notification",
    message: row.message ?? "",
    time: row.created_at ? new Date(row.created_at).toLocaleString() : "",
    read: Boolean(row.read),
    action: row.action ?? undefined,
  };
}

export function useNotifications({
  userId,
  setNotifications,
  fetchUnreadNotifications,
  enableReplay = false,
  replaySince,
}: UseNotificationsOptions) {
  const supabase = React.useMemo(() => createClient(), []);

  React.useEffect(() => {
    if (!userId || !supabase) {
      return;
    }

    const topic = `user:${userId}:notifications`;
    const channel = supabase.channel(topic, { config: { private: true } });

    const replayConfig = enableReplay
      ? { replay: { since: replaySince ?? new Date(Date.now() - 5 * 60 * 1000).toISOString() } }
      : undefined;

    channel
      .on(
        "broadcast",
        {
          event: "notification_created",
          ...(replayConfig ?? {}),
        } as Record<string, unknown>,
        async (payload) => {
          const broadcastPayload = payload.payload as NotificationBroadcastPayload | undefined;
          const notificationId = broadcastPayload?.notification_id;

          if (!notificationId) {
            if (fetchUnreadNotifications) {
              await fetchUnreadNotifications();
            }
            return;
          }

          const { data, error } = await supabase
            .from("notifications")
            .select("id, type, title, message, created_at, read, action")
            .eq("id", notificationId)
            .eq("user_id", userId)
            .maybeSingle();

          if (error || !data) {
            if (fetchUnreadNotifications) {
              await fetchUnreadNotifications();
            }
            return;
          }

          const nextNotification = mapNotificationRow(data as NotificationRow);
          setNotifications((prev) => {
            if (prev.some((notification) => notification.id === nextNotification.id)) {
              return prev;
            }
            return [nextNotification, ...prev];
          });
        }
      )
      .subscribe();

    return () => {
      void supabase.removeChannel(channel);
    };
  }, [enableReplay, fetchUnreadNotifications, replaySince, setNotifications, supabase, userId]);
}
