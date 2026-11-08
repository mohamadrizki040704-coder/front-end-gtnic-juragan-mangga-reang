"use client";

import { useEffect, useState } from "react";

import { authFetch, getToken, parseApiError, useAuth } from "./auth";

export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

type ApiNotification = {
  id: number;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

/* Waktu dari backend bisa tanpa zona (UTC): tambahkan "Z" agar tampil benar */
function normalizeDate(value: string): string {
  return /(Z|[+-]\d{2}:\d{2})$/.test(value) ? value : `${value}Z`;
}

function toItem(n: ApiNotification): NotificationItem {
  return {
    id: String(n.id),
    title: n.title,
    message: n.message,
    createdAt: normalizeDate(n.createdAt),
    read: n.read,
  };
}

async function failIfNotOk(res: Response): Promise<void> {
  if (res.ok) return;
  const body = await res.json().catch(() => null);
  throw new Error(parseApiError(body, res.status));
}

/** Ambil notifikasi milik pengguna yang sedang login (kosong jika belum login). */
export async function getNotifications(): Promise<NotificationItem[]> {
  if (!getToken()) return [];

  const res = await authFetch("/api/notifikasi/?limit=100");
  await failIfNotOk(res);

  const data = (await res.json()) as ApiNotification[];
  return data.map(toItem);
}

/** Tandai satu notifikasi sudah dibaca. */
export async function markNotificationRead(id: string): Promise<void> {
  const res = await authFetch(`/api/notifikasi/${encodeURIComponent(id)}/read`, {
    method: "PUT",
  });
  await failIfNotOk(res);
}

/** Tandai semua notifikasi sudah dibaca. */
export async function markAllNotificationsRead(): Promise<void> {
  const res = await authFetch("/api/notifikasi/read-all", { method: "PUT" });
  await failIfNotOk(res);
}

/** Jumlah notifikasi belum dibaca. */
export async function getUnreadCount(): Promise<number> {
  if (!getToken()) return 0;

  const res = await authFetch("/api/notifikasi/unread-count");
  await failIfNotOk(res);

  const data = (await res.json()) as { count: number };
  return data.count;
}

/** Hook: jumlah belum dibaca, diperbarui otomatis tiap beberapa detik. */
export function useUnreadCount(intervalMs = 30000): number {
  const { isLoggedIn } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isLoggedIn) return;

    const load = async () => {
      try {
        setCount(await getUnreadCount());
      } catch {
        /* abaikan: coba lagi pada putaran berikutnya */
      }
    };

    load();
    const timer = setInterval(load, intervalMs);
    return () => clearInterval(timer);
  }, [isLoggedIn, intervalMs]);

  return isLoggedIn ? count : 0;
}
