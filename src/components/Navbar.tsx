
"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import type { ReactNode } from "react";

import styles from "./Navbar.module.css";
import { LoginTrigger } from "./loginModal";
import { SignupTrigger } from "./signupModal";
import { authFetch, useAuth } from "../lib/auth";

const svgProps = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
  focusable: false,
} as const;

const BellIcon = (
  <svg {...svgProps} fill="#ff9c00">
    <path d="M12 2a6 6 0 0 0-6 6v4l-2 3v1h16v-1l-2-3V8a6 6 0 0 0-6-6Zm0 20a2.5 2.5 0 0 0 2.4-2H9.6A2.5 2.5 0 0 0 12 22Z" />
  </svg>
);

const HelpIcon = (
  <svg {...svgProps}>
    <circle cx="12" cy="12" r="10" fill="#111" />
    <path
      d="M9.4 9.6a2.6 2.6 0 1 1 3.7 2.3c-.8.4-1.1.9-1.1 1.8"
      stroke="#fff"
      strokeWidth="2"
      strokeLinecap="round"
      fill="none"
    />
    <circle cx="12" cy="17.2" r="1.3" fill="#fff" />
  </svg>
);

const ShopIcon = (
  <svg {...svgProps} fill="#ff9c00">
    <path d="M3 9.5 5 4h14l2 5.5V11a3 3 0 0 1-5.3 1.9A3 3 0 0 1 12 14a3 3 0 0 1-3.7-1.1A3 3 0 0 1 3 11V9.5ZM5 15h14v5H5v-5Z" />
  </svg>
);

const PencilIcon = (
  <svg {...svgProps} fill="#111">
    <path d="m4 20 1.2-5L16 4.2 19.8 8 9 18.8 4 20Z" />
  </svg>
);

const CartIcon = (
  <svg {...svgProps} fill="#6b3b00">
    <path d="M4 9h16l-1.8 10H5.8L4 9Zm4.2-5.2L10 6H7.4L6 4.8l2.2-1Zm7.6 0 2.2 1L16.6 6H14l1.8-2.2Z" />
  </svg>
);

type Notification = {
  id: string;
  message: string;
  time: string;
};

type Rfq = {
  id: number;
  statusNego: string;
};

type Tracking = {
  id: number;
  statusMilestone: string;
  updatedAt: string;
};

const STORAGE_PREFIX = "mangga_notifications_";

const statusLabels: Record<string, string> = {
  PENDING: "Menunggu persetujuan",
  APPROVED: "Pesanan telah disetujui",
  REJECTED: "Pesanan ditolak",
  COMPLETED: "Pesanan selesai",
  DIPROSES_PETANI: "Mangga sedang diproses petani",
  SORTIR_GUDANG: "Mangga sedang disortir di gudang",
  IN_TRANSIT: "Mangga sedang dalam perjalanan",
  DELIVERED: "Mangga telah sampai",
};

export default function Navbar() {
  const { isLoggedIn, logout, role, token } = useAuth();

  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);

  useEffect(() => {
    if (!isLoggedIn || role !== "BUYER_B2B" || !token) {
      setNotifications([]);
      return;
    }

    let active = true;

    const storageKey = `${STORAGE_PREFIX}${token.slice(-12)}`;

    const pollNotifications = async () => {
      try {
        const rfqResponse = await authFetch("/api/rfq/me");

        if (!rfqResponse.ok) return;

        const rfqs: Rfq[] = await rfqResponse.json();

        const currentSnapshot: Record<string, string> = {};
        const newNotifications: Notification[] = [];

        await Promise.all(
          rfqs.map(async (rfq) => {
            const statusKey = `rfq-${rfq.id}`;
            currentSnapshot[statusKey] = rfq.statusNego;

            const trackingResponse = await authFetch(
              `/api/logistik/${rfq.id}`
            );

            if (!trackingResponse.ok) return;

            const trackingList: Tracking[] =
              await trackingResponse.json();

            const latestTracking = trackingList.reduce<Tracking | null>(
              (latest, item) => {
                if (
                  !latest ||
                  new Date(item.updatedAt).getTime() >
                    new Date(latest.updatedAt).getTime()
                ) {
                  return item;
                }
                return latest;
              },
              null
            );

            if (latestTracking) {
              currentSnapshot[`tracking-${rfq.id}`] =
                `${latestTracking.id}-${latestTracking.statusMilestone}`;
            }
          })
        );

        if (!active) return;

        const previousSnapshot = JSON.parse(
          localStorage.getItem(`${storageKey}_snapshot`) || "null"
        ) as Record<string, string> | null;

        if (previousSnapshot) {
          for (const rfq of rfqs) {
            const oldStatus = previousSnapshot[`rfq-${rfq.id}`];
            const newStatus = currentSnapshot[`rfq-${rfq.id}`];

            if (oldStatus && oldStatus !== newStatus) {
              newNotifications.push({
                id: `rfq-${rfq.id}-${newStatus}`,
                message: `Pesanan #${rfq.id}: ${
                  statusLabels[newStatus] || newStatus
                }`,
                time: new Date().toISOString(),
              });
            }

            const oldTracking =
              previousSnapshot[`tracking-${rfq.id}`];

            const newTracking =
              currentSnapshot[`tracking-${rfq.id}`];

            if (oldTracking && newTracking && oldTracking !== newTracking) {
              const milestone = newTracking.split("-").slice(1).join("-");

              newNotifications.push({
                id: `tracking-${rfq.id}-${newTracking}`,
                message: `Logistik #${rfq.id}: ${
                  statusLabels[milestone] || milestone
                }`,
                time: new Date().toISOString(),
              });
            }
          }
        }

        localStorage.setItem(
          `${storageKey}_snapshot`,
          JSON.stringify(currentSnapshot)
        );

        if (newNotifications.length > 0) {
          setNotifications((previous) => {
            const combined = [...newNotifications, ...previous];

            const unique = combined.filter(
              (item, index, array) =>
                array.findIndex((other) => other.id === item.id) === index
            );

            const result = unique.slice(0, 20);

            localStorage.setItem(
              `${storageKey}_items`,
              JSON.stringify(result)
            );

            return result;
          });
        } else {
          const saved = localStorage.getItem(`${storageKey}_items`);

          if (saved) {
            setNotifications(JSON.parse(saved));
          }
        }
      } catch (error) {
        console.error("Gagal memeriksa notifikasi:", error);
      }
    };

    const saved = localStorage.getItem(`${storageKey}_items`);

    if (saved) {
      try {
        setNotifications(JSON.parse(saved));
      } catch {
        setNotifications([]);
      }
    }

    pollNotifications();

    const interval = window.setInterval(
      pollNotifications,
      30_000
    );

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, [isLoggedIn, role, token]);

  const clearNotifications = () => {
    setNotifications([]);

    if (token) {
      const storageKey = `${STORAGE_PREFIX}${token.slice(-12)}`;
      localStorage.removeItem(`${storageKey}_items`);
    }
  };

  const navigation: {
    href: string;
    label: string;
    icon: ReactNode;
  }[] = [
    {
      href: "/#alur",
      label: "Alur",
      icon: <HelpIcon />,
    },
    {
      href: "/shop",
      label: "Shop",
      icon: <ShopIcon />,
    },
    {
      href: "/#contact",
      label: "Contact",
      icon: <PencilIcon />,
    },
  ];

  return (
    <header className={styles.header}>
      <svg
        className={styles.navPlate}
        viewBox="0 0 700 46"
        preserveAspectRatio="none"
        aria-hidden="true"
        focusable="false"
      >
        <path
          d="M0 0C60 1 72 8 76 20L83 37Q87 46 100 46H600Q613 46 617 37L624 20C628 8 640 1 700 0Z"
          fill="#fffdf8"
        />
      </svg>

      <nav
        className={styles.primaryNav}
        aria-label="Navigasi utama"
      >
        <div className={styles.notificationWrapper}>
          <button
            type="button"
            className={`${styles.navLink} ${styles.notificationButton}`}
            onClick={() => setShowNotifications((value) => !value)}
            aria-expanded={showNotifications}
            aria-label={`Notifikasi, ${notifications.length} pemberitahuan`}
          >
            <span className={styles.navIcon}>{BellIcon}</span>
            <span>Notifikasi</span>

            {notifications.length > 0 && (
              <span className={styles.notificationBadge}>
                {notifications.length > 9 ? "9+" : notifications.length}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className={styles.notificationPanel}>
              <div className={styles.notificationHeader}>
                <strong>NOTIFIKASI</strong>

                {notifications.length > 0 && (
                  <button
                    type="button"
                    onClick={clearNotifications}
                  >
                    Hapus
                  </button>
                )}
              </div>

              {notifications.length === 0 ? (
                <p className={styles.emptyNotification}>
                  Belum ada notifikasi baru.
                </p>
              ) : (
                <div className={styles.notificationList}>
                  {notifications.map((item) => (
                    <div
                      key={item.id}
                      className={styles.notificationItem}
                    >
                      <span className={styles.notificationDot} />
                      <div>
                        <p>{item.message}</p>
                        <small>
                          {new Date(item.time).toLocaleString("id-ID")}
                        </small>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={styles.navLink}
          >
            <span className={styles.navIcon}>{item.icon}</span>
            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      <div className={styles.accountArea}>
        <div className={styles.accountLinks}>
          {isLoggedIn ? (
            <button
              type="button"
              onClick={logout}
              className={styles.loginLink}
            >
              LOGOUT
            </button>
          ) : (
            <>
              <LoginTrigger className={styles.loginLink}>
                LOGIN
              </LoginTrigger>

              <span className={styles.divider} aria-hidden="true">
                |
              </span>

              <SignupTrigger className={styles.signupLink}>
                SIGN UP
              </SignupTrigger>
            </>
          )}
        </div>

        <Link
          href="/keranjang"
          className={styles.cartLink}
        >
          <span className={styles.cartIcon}>{CartIcon}</span>
          <span>KERANJANG</span>
        </Link>
      </div>
    </header>
  );
}
