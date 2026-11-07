
"use client";

import { useState } from "react";
import Link from "next/link";
import type { ReactNode } from "react";

import styles from "./Navbar.module.css";

import { LoginTrigger } from "./loginModal";
import { SignupTrigger } from "./signupModal";
import { useAuth } from "@/lib/auth";

/* =========================================
   SVG PROPERTIES
========================================= */

const svgProps = {
  viewBox: "0 0 24 24",
  width: "1em",
  height: "1em",
  "aria-hidden": true,
  focusable: false,
} as const;

/* =========================================
   NAVIGATION ICONS
========================================= */

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

/* =========================================
   USER ICON
========================================= */

function UserIcon() {
  return (
    <svg
      viewBox="0 0 100 100"
      width="42"
      height="42"
      fill="currentColor"
      aria-hidden="true"
    >
      <circle cx="50" cy="29" r="24" />
      <path d="M7 91V82C7 65 21 52 38 52H62C79 52 93 65 93 82V91Z" />
    </svg>
  );
}

/* =========================================
   NAVIGATION DATA
========================================= */

const navigation: {
  href: string;
  label: string;
  icon: ReactNode;
}[] = [
  {
    href: "/notification",
    label: "Notifikasi",
    icon: BellIcon,
  },
  {
    href: "/#alur",
    label: "Alur",
    icon: HelpIcon,
  },
  {
    href: "/shop",
    label: "Shop",
    icon: ShopIcon,
  },
  {
    href: "/#contact",
    label: "Contact",
    icon: PencilIcon,
  },
];

/* =========================================
   NAVBAR COMPONENT
========================================= */

export default function Navbar() {
  const { role, isLoggedIn, logout } = useAuth();

  const [accountMenuOpen, setAccountMenuOpen] = useState(false);

  /* =========================================
     HANDLE LOGOUT
  ========================================= */

  const handleLogout = () => {
    logout();
    setAccountMenuOpen(false);
  };

  return (
    <header className={styles.header}>

      {/* NAVIGATION PLATE */}

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

      {/* PRIMARY NAVIGATION */}

      <nav
        className={styles.primaryNav}
        aria-label="Navigasi utama"
      >
        {navigation.map((item) => (
          <Link
            key={item.label}
            href={item.href}
            className={styles.navLink}
          >
            <span className={styles.navIcon}>
              {item.icon}
            </span>

            <span>{item.label}</span>
          </Link>
        ))}
      </nav>

      {/* =========================================
          ACCOUNT AREA
      ========================================= */}

      <div className={styles.accountArea}>

        {/* BELUM LOGIN */}

        {!isLoggedIn && (
          <div className={styles.accountLinks}>

            <LoginTrigger className={styles.loginLink}>
              LOGIN
            </LoginTrigger>

            <span
              className={styles.divider}
              aria-hidden="true"
            >
              |
            </span>

            <SignupTrigger className={styles.signupLink}>
              SIGN UP
            </SignupTrigger>

          </div>
        )}

        {/* SUDAH LOGIN */}

        {isLoggedIn && (
          <div className="relative">

            {/* USER BUTTON */}

            <button
              type="button"
              onClick={() =>
                setAccountMenuOpen((previous) => !previous)
              }
              aria-expanded={accountMenuOpen}
              aria-haspopup="true"
              className="flex max-w-85 items-center gap-3 text-black transition hover:scale-[1.02] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-400"
            >
              <span className="shrink-0 text-black">
                <UserIcon />
              </span>

              <span className="max-w-65 truncate text-2xl font-medium uppercase tracking-[0.08em] sm:text-3xl">
                {role ?? "Akun"}
              </span>
            </button>

            {/* ACCOUNT DROPDOWN */}

            {accountMenuOpen && (
              <div className="absolute right-0 top-full z-999 mt-3 w-64 overflow-hidden rounded-2xl border border-orange-200 bg-white shadow-[0_12px_35px_rgba(0,0,0,0.18)]">

                {/* ACCOUNT INFORMATION */}

                <div className="border-b border-orange-100 bg-orange-50 px-5 py-4">

                  <p className="text-xs font-medium uppercase tracking-widest text-orange-700">
                    Login sebagai
                  </p>

                  <p className="mt-1 truncate text-lg font-extrabold uppercase text-black">
                    {role ?? "Akun"}
                  </p>

                </div>

                {/* LOGOUT BUTTON */}

                <button
                  type="button"
                  onClick={handleLogout}
                  className="flex w-full items-center gap-3 px-5 py-4 text-left text-sm font-bold uppercase tracking-wider text-red-600 transition hover:bg-red-50"
                >
                  <svg
                    viewBox="0 0 24 24"
                    width="21"
                    height="21"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    aria-hidden="true"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                    <path d="M16 17l5-5-5-5" />
                    <path d="M21 12H9" />
                  </svg>

                  LOGOUT

                </button>

              </div>
            )}

          </div>
        )}

        {/* =========================================
            SHOPPING CART
        ========================================= */}

        <Link
          href="/keranjang"
          className={styles.cartLink}
        >
          <span className={styles.cartIcon}>
            {CartIcon}
          </span>

          <span>KERANJANG</span>
        </Link>

      </div>

    </header>
  );
}
