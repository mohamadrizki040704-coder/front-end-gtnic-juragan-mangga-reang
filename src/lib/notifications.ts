export type NotificationItem = {
  id: string;
  title: string;
  message: string;
  createdAt: string;
  read: boolean;
};

const STORAGE_KEY = "gtnic_notifications";

// Mengambil seluruh notifikasi
export function getNotifications(): NotificationItem[] {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const data = localStorage.getItem(STORAGE_KEY);

    return data ? JSON.parse(data) : [];
  } catch (error) {
    console.error("Gagal mengambil notifikasi:", error);
    return [];
  }
}

// Menyimpan notifikasi
export function saveNotifications(
  notifications: NotificationItem[]
) {
  if (typeof window === "undefined") return;

  localStorage.setItem(
    STORAGE_KEY,
    JSON.stringify(notifications)
  );
}

// Menambahkan notifikasi baru
export function addNotification(
  title: string,
  message: string
) {
  const notifications = getNotifications();

  const newNotification: NotificationItem = {
    id: crypto.randomUUID(),
    title,
    message,
    createdAt: new Date().toISOString(),
    read: false,
  };

  saveNotifications([
    newNotification,
    ...notifications,
  ]);
}

// Menandai semua notifikasi sudah dibaca
export function markAllNotificationsRead() {
  const notifications = getNotifications();

  const updatedNotifications = notifications.map(
    (notification) => ({
      ...notification,
      read: true,
    })
  );

  saveNotifications(updatedNotifications);

  return updatedNotifications;
}