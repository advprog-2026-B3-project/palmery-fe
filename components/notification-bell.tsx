"use client";

import { useEffect, useState } from "react";
import {
  fetchNotifications,
  markNotificationAsRead,
  type NotificationInbox,
  type NotificationItem,
} from "@/lib/payment-api";

type NotificationBellProps = {
  userId: string;
};

function formatTimestamp(value: string): string {
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }
  return date.toLocaleString("id-ID", {
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function NotificationBell({ userId }: NotificationBellProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [inbox, setInbox] = useState<NotificationInbox>({
    userId,
    unreadCount: 0,
    notifications: [],
  });

  useEffect(() => {
    let active = true;

    async function loadInbox() {
      if (!userId.trim()) {
        setInbox({ userId, unreadCount: 0, notifications: [] });
        setLoading(false);
        return;
      }

      setLoading(true);
      setError(null);

      try {
        const nextInbox = await fetchNotifications(userId);
        if (active) {
          setInbox(nextInbox);
        }
      } catch (loadError) {
        if (active) {
          setError(loadError instanceof Error ? loadError.message : "Unexpected error");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    }

    void loadInbox();

    return () => {
      active = false;
    };
  }, [userId]);

  async function handleNotificationClick(notification: NotificationItem) {
    if (notification.status === "READ") {
      return;
    }

    try {
      const updatedNotification = await markNotificationAsRead(notification.id, userId);
      setInbox((currentInbox) => ({
        ...currentInbox,
        unreadCount: Math.max(0, currentInbox.unreadCount - 1),
        notifications: currentInbox.notifications.map((item) =>
          item.id === updatedNotification.id ? updatedNotification : item,
        ),
      }));
    } catch (updateError) {
      setError(updateError instanceof Error ? updateError.message : "Unexpected error");
    }
  }

  return (
    <div className="relative">
      <button
        type="button"
        onClick={() => setOpen((current) => !current)}
        className="relative rounded-full border border-stone-700/80 bg-stone-900/80 p-2 text-stone-200 transition hover:border-amber-400/70 hover:text-white"
        aria-label="Open notifications"
      >
        <svg viewBox="0 0 24 24" className="h-5 w-5 fill-none stroke-current stroke-[1.7]">
          <path d="M6.5 16.5h11l-1.1-1.8a4.8 4.8 0 0 1-.7-2.5v-1.8a3.7 3.7 0 0 0-7.4 0v1.8c0 .9-.2 1.7-.7 2.5z" />
          <path d="M10 18.5a2 2 0 0 0 4 0" />
        </svg>
        {inbox.unreadCount > 0 ? (
          <span className="absolute -right-1 -top-1 inline-flex min-w-5 items-center justify-center rounded-full bg-amber-400 px-1.5 text-[10px] font-semibold text-stone-950">
            {inbox.unreadCount}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 top-14 w-[22rem] rounded-3xl border border-stone-700/80 bg-[linear-gradient(180deg,rgba(40,27,13,0.98),rgba(18,14,10,0.98))] p-4 shadow-2xl">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-stone-100">Inbox Notifikasi</p>
              <p className="text-xs text-stone-400">{userId || "No viewer selected"}</p>
            </div>
            <span className="rounded-full border border-amber-500/30 bg-amber-400/10 px-2 py-1 text-xs text-amber-200">
              {inbox.unreadCount} unread
            </span>
          </div>

          {loading ? <p className="mt-4 text-sm text-stone-300">Loading notifications...</p> : null}
          {error ? <p className="mt-4 text-sm text-rose-300">{error}</p> : null}

          {!loading && inbox.notifications.length === 0 ? (
            <div className="mt-4 rounded-2xl border border-dashed border-stone-700 p-4 text-sm text-stone-400">
              Belum ada notifikasi untuk user ini.
            </div>
          ) : null}

          <div className="mt-4 max-h-96 space-y-2 overflow-y-auto pr-1">
            {inbox.notifications.map((notification) => {
              const unread = notification.status === "UNREAD";
              return (
                <button
                  key={notification.id}
                  type="button"
                  onClick={() => void handleNotificationClick(notification)}
                  className={`w-full rounded-2xl border p-3 text-left transition ${
                    unread
                      ? "border-stone-600 bg-stone-900/80 text-stone-100 hover:border-amber-400/50"
                      : "border-stone-800 bg-stone-50 text-stone-950 hover:border-stone-400"
                  }`}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <p className="text-sm font-semibold">{notification.title}</p>
                      <p className="mt-1 text-xs opacity-80">{notification.description}</p>
                    </div>
                    <span
                      className={`rounded-full px-2 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] ${
                        unread ? "bg-amber-300/20 text-amber-200" : "bg-stone-900/10 text-stone-500"
                      }`}
                    >
                      {notification.status}
                    </span>
                  </div>
                  <p className="mt-3 text-[11px] opacity-70">{formatTimestamp(notification.createdAt)}</p>
                </button>
              );
            })}
          </div>
        </div>
      ) : null}
    </div>
  );
}
