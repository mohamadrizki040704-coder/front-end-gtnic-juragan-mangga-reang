"use client";

import { useEffect, useRef, useState } from "react";
import type {
  ChangeEvent,
  FormEvent,
  MouseEvent,
  ReactNode,
} from "react";
import { createPortal } from "react-dom";
import Image from "next/image";
import { Cormorant_Garamond, Montserrat } from "next/font/google";

import styles from "./SignupAnimation.module.css";

/* =========================================
   FONT & ASSET
========================================= */

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800", "900"],
});

const MANGO_SRC = "/images/manggaLandingP.png";

/* =========================================
   API ENDPOINT CONFIGURATION
========================================= */
// Dari env Vercel, contoh: https://api-juragan-mangga.onrender.com
// (tanpa "/" di akhir, tanpa "/api", dan BUKAN format markdown [..](..))
const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

// Route backend FastAPI: POST /api/auth/register
const REGISTER_ENDPOINT = `${API_URL}/api/auth/register`;

// Role yang dikirim saat register. Pilihan valid: "BUYER_B2B" | "PETANI"
// ("ADMIN_GUDANG" ditolak backend)
const DEFAULT_ROLE = "BUYER_B2B";

/* =========================================
   TYPES
========================================= */

type SignupModalProps = {
  open: boolean;
  onClose: () => void;
};

type SignupTriggerProps = {
  children: ReactNode;
  className?: string;
};

type FastApiValidationItem = {
  loc?: (string | number)[];
  msg?: string;
};

/* =========================================
   ICONS
========================================= */

function EyeIcon({ visible }: { visible: boolean }) {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {visible ? (
        <>
          <path d="M2 12s3.6-7 10-7 10 7 10 7-3.6 7-10 7S2 12 2 12Z" />
          <circle cx="12" cy="12" r="3" />
        </>
      ) : (
        <>
          <path d="m3 3 18 18" />
          <path d="M10.6 10.6a2 2 0 0 0 2.8 2.8" />
          <path d="M9.9 5.2A10.8 10.8 0 0 1 12 5c6.4 0 10 7 10 7a16.5 16.5 0 0 1-4 4.7" />
          <path d="M6.2 6.2C3.5 8 2 12 2 12s3.6 7 10 7c1.1 0 2.1-.2 3-.5" />
        </>
      )}
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2.5"
      strokeLinecap="round"
      aria-hidden="true"
    >
      <path d="M6 6l12 12M18 6L6 18" />
    </svg>
  );
}

/* =========================================
   SHARED CLASSES
========================================= */

const fieldSurface =
  "bg-[linear-gradient(to_bottom,#FFD04D,#FFAE00)] shadow-[0_6px_12px_rgba(120,60,0,0.22),inset_0_2px_3px_rgba(255,255,255,0.65)]";

const inputClass = `${fieldSurface} h-12 w-full rounded-xl px-5 text-xs font-semibold tracking-[0.12em] text-[#5a3300] outline-none transition placeholder:font-medium placeholder:uppercase placeholder:tracking-[0.2em] placeholder:text-[#9a6200] focus-visible:ring-4 focus-visible:ring-white/70 sm:text-sm sm:placeholder:tracking-[0.35em]`;

const eyeButtonClass =
  "absolute right-4 top-1/2 -translate-y-1/2 rounded-full p-1 text-[#5a3300] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/60";

/* =========================================
   SIGNUP MODAL
========================================= */

export default function SignupModal({
  open,
  onClose,
}: SignupModalProps) {
  const [mounted, setMounted] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    username: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
  });

  const usernameRef = useRef<HTMLInputElement>(null);

  /* MOUNT */
  useEffect(() => {
    const timer = window.setTimeout(() => setMounted(true), 0);
    return () => window.clearTimeout(timer);
  }, []);

  /* BODY SCROLL LOCK */
  useEffect(() => {
    if (!open) return;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [open]);

  /* ESCAPE KEY */
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape" && !loading) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEscape);

    return () => window.removeEventListener("keydown", handleEscape);
  }, [open, onClose, loading]);

  /* FOKUS USERNAME */
  useEffect(() => {
    if (!open || !mounted) return;

    const id = requestAnimationFrame(() =>
      usernameRef.current?.focus({ preventScroll: true })
    );

    return () => cancelAnimationFrame(id);
  }, [open, mounted]);

  /* INPUT HANDLER */
  const handleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));

    setError("");
    setSuccess("");
  };

  /* =========================================
     REGISTER API FETCH
  ========================================= */

  const handleSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (loading) return;

    const { username, email, phone, password, confirmPassword } = formData;

    setError("");
    setSuccess("");

    /* VALIDASI */
    if (!username.trim() || !email.trim() || !phone.trim() || !password || !confirmPassword) {
      setError("Semua kolom wajib diisi.");
      return;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email.trim())) {
      setError("Format email tidak valid.");
      return;
    }

    if (password.length < 8) {
      setError("Password minimal terdiri dari 8 karakter.");
      return;
    }

    if (password.length > 72) {
      setError("Password maksimal 72 karakter.");
      return;
    }

    if (password !== confirmPassword) {
      setError("Konfirmasi password tidak cocok.");
      return;
    }

    /* CEK URL API */
    if (!API_URL) {
      setError("URL backend belum dikonfigurasi. Periksa Environment Variables (NEXT_PUBLIC_API_URL).");
      return;
    }

    if (!/^https?:\/\//.test(API_URL)) {
      setError("NEXT_PUBLIC_API_URL harus diawali https:// (cek format di Vercel).");
      return;
    }

    setLoading(true);

    try {
      /* KIRIM DATA KE BACKEND RENDER */
      const response = await fetch(REGISTER_ENDPOINT, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Accept: "application/json",
        },
        body: JSON.stringify({
          email: email.trim(),
          password: password,
          namaLengkap: username.trim(),
          nomorTelepon: phone.trim(),
          role: DEFAULT_ROLE,
        }),
      });

      /* BACA RESPONS (hanya sekali) */
      const result = await response.json().catch(() => ({}));

      if (!response.ok) {
        // FastAPI 422: detail = array of object; 409/403: detail = string
        const detail = Array.isArray(result.detail)
          ? (result.detail as FastApiValidationItem[])
              .map((d) => `${d.loc?.slice(1).join(".") ?? "field"}: ${d.msg ?? "tidak valid"}`)
              .join(", ")
          : typeof result.detail === "string"
            ? result.detail
            : "";

        throw new Error(
          detail ||
            result.message ||
            result.error ||
            `Registrasi gagal. Status: ${response.status}`
        );
      }

      /* BERHASIL */
      setSuccess(
        result.message || "Registrasi berhasil! Akun kamu sudah terdaftar."
      );

      setFormData({
        username: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
      });

      setShowPassword(false);
      setShowConfirm(false);
    } catch (err) {
      console.error("REGISTER ERROR:", err);

      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke server. Periksa koneksi backend dan konfigurasi CORS di Render."
        );
      } else {
        setError(
          err instanceof Error
            ? err.message
            : "Terjadi kesalahan saat registrasi."
        );
      }
    } finally {
      setLoading(false);
    }
  };

  /* CLOSE BACKDROP */
  const handleBackdrop = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget && !loading) {
      onClose();
    }
  };

  if (!mounted || !open) return null;

  return createPortal(
    <div
      className="fixed inset-0 z-[9999] overflow-y-auto bg-[#FFC857]/30 backdrop-blur-md"
      onMouseDown={handleBackdrop}
    >
      <div
        className="flex min-h-full items-center justify-center px-4 py-20"
        onMouseDown={handleBackdrop}
      >
        {/* KARTU */}
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="signup-title"
          className={`${styles.signupCard || ""} ${styles.cardVisible || ""} ${montserrat.className} relative w-full max-w-[1180px] rounded-[2.5rem] [container-type:inline-size]`}
          style={{
            background:
              "linear-gradient(to bottom, #FFFFFF 0%, #FFFFFF 18%, #FFF3D6 38%, #FFD04D 70%, #FFAE00 100%)",
          }}
        >
          {/* TOMBOL TUTUP */}
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            aria-label="Tutup"
            className="absolute -right-2 -top-2 z-30 flex h-10 w-10 items-center justify-center rounded-full bg-white text-black shadow-[0_6px_14px_rgba(0,0,0,0.25)] transition hover:scale-110 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-orange-400/70 disabled:opacity-50 sm:-right-4 sm:-top-4"
          >
            <CloseIcon />
          </button>

          {/* MANGGA */}
          <div className="pointer-events-none absolute -top-14 left-1/2 z-20 w-[95px] -translate-x-1/2 md:-left-[1%] md:-top-[2%] md:w-[19%] md:translate-x-0">
            <div className={styles.mangoFloat || ""}>
              <Image
                src={MANGO_SRC}
                alt="Mangga utuh dan potongan mangga"
                width={386}
                height={386}
                priority
                className="h-auto w-full drop-shadow-[0_16px_20px_rgba(0,0,0,0.3)]"
              />
            </div>
          </div>

          {/* HEADER */}
          <div className="px-6 pt-20 md:pl-[19.6cqw] md:pr-[2cqw] md:pt-[6.5cqw]">
            <div className="flex flex-col items-center gap-3 md:flex-row md:items-center md:justify-start md:gap-[1cqw]">
              <div className="inline-block">
                <p
                  className={`${cormorant.className} whitespace-nowrap text-[max(1.2rem,3.6cqw)] font-semibold uppercase leading-none tracking-[0.03em] text-black`}
                >
                  Juragan Mangga
                </p>

                <p
                  aria-label="Reang"
                  className="flex justify-between text-[max(2.6rem,5.4cqw)] font-extrabold uppercase leading-none text-[#FFA500]"
                  style={{
                    textShadow: "0 0 14px rgba(255,255,255,0.9)",
                  }}
                >
                  {"REANG".split("").map((char, index) => (
                    <span key={index} aria-hidden="true">
                      {char}
                    </span>
                  ))}
                </p>
              </div>

              <div
                aria-hidden="true"
                className="hidden h-[10cqw] w-[2px] shrink-0 bg-black md:block"
              />

              <h2
                id="signup-title"
                className="whitespace-nowrap text-[max(2.8rem,8.6cqw)] font-black uppercase leading-none tracking-tight text-black"
                style={{
                  textShadow: "0 8px 18px rgba(0,0,0,0.25)",
                }}
              >
                Sign Up
              </h2>
            </div>
          </div>

          {/* FORM */}
          <div className="px-6 pb-10 pt-8 md:pb-[8cqw] md:pl-[5cqw] md:pr-[8cqw] md:pt-[7cqw]">
            <form onSubmit={handleSubmit} noValidate>
              <div className="grid gap-5 md:grid-cols-2 md:gap-x-[5cqw]">
                {/* KOLOM KIRI */}
                <div className="flex flex-col gap-5 md:gap-[2.7cqw]">
                  <div>
                    <label htmlFor="signup-username" className="sr-only">
                      Username
                    </label>
                    <input
                      ref={usernameRef}
                      id="signup-username"
                      name="username"
                      type="text"
                      placeholder="Make username"
                      value={formData.username}
                      onChange={handleChange}
                      autoComplete="username"
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>

                  <div className="relative">
                    <label htmlFor="signup-password" className="sr-only">
                      Password
                    </label>
                    <input
                      id="signup-password"
                      name="password"
                      type={showPassword ? "text" : "password"}
                      placeholder="Make password"
                      value={formData.password}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword((prev) => !prev)}
                      aria-label={showPassword ? "Sembunyikan password" : "Tampilkan password"}
                      aria-pressed={showPassword}
                      className={eyeButtonClass}
                    >
                      <EyeIcon visible={showPassword} />
                    </button>
                  </div>

                  <div className="relative">
                    <label htmlFor="signup-confirm-password" className="sr-only">
                      Konfirmasi password
                    </label>
                    <input
                      id="signup-confirm-password"
                      name="confirmPassword"
                      type={showConfirm ? "text" : "password"}
                      placeholder="Confirm password"
                      value={formData.confirmPassword}
                      onChange={handleChange}
                      autoComplete="new-password"
                      disabled={loading}
                      className={`${inputClass} pr-12`}
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm((prev) => !prev)}
                      aria-label={showConfirm ? "Sembunyikan konfirmasi password" : "Tampilkan konfirmasi password"}
                      aria-pressed={showConfirm}
                      className={eyeButtonClass}
                    >
                      <EyeIcon visible={showConfirm} />
                    </button>
                  </div>
                </div>

                {/* KOLOM KANAN */}
                <div className="flex flex-col gap-5 md:gap-[2.7cqw]">
                  <div>
                    <label htmlFor="signup-phone" className="sr-only">
                      Nomor WhatsApp
                    </label>
                    <input
                      id="signup-phone"
                      name="phone"
                      type="tel"
                      placeholder="Phone number"
                      value={formData.phone}
                      onChange={handleChange}
                      autoComplete="tel"
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>

                  <div>
                    <label htmlFor="signup-email" className="sr-only">
                      Email
                    </label>
                    <input
                      id="signup-email"
                      name="email"
                      type="email"
                      placeholder="Email address"
                      value={formData.email}
                      onChange={handleChange}
                      autoComplete="email"
                      disabled={loading}
                      className={inputClass}
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="h-12 w-full rounded-xl bg-[#FFFDF8] px-5 text-left text-xs font-semibold uppercase tracking-[0.35em] text-[#E08A00] shadow-[0_8px_16px_rgba(120,60,0,0.25),inset_0_-2px_4px_rgba(255,165,0,0.25)] transition hover:-translate-y-0.5 hover:bg-white focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/80 disabled:cursor-not-allowed disabled:opacity-60 sm:text-sm"
                  >
                    {loading ? "Registering..." : "Register"}
                  </button>
                </div>
              </div>

              {/* PESAN ERROR */}
              {error && (
                <p
                  role="alert"
                  className="mt-5 text-center text-xs font-semibold tracking-wide text-red-800 sm:text-sm"
                >
                  {error}
                </p>
              )}

              {/* PESAN SUKSES */}
              {success && (
                <p
                  role="status"
                  className="mt-5 rounded-xl bg-green-100 px-4 py-3 text-center text-xs font-bold text-green-800 sm:text-sm"
                >
                  {success}
                </p>
              )}
            </form>

          </div>
        </div>
      </div>
    </div>,
    document.body
  );
}

/* =========================================
   SIGNUP TRIGGER
========================================= */

export function SignupTrigger({
  children,
  className,
}: SignupTriggerProps) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className={className}
        aria-haspopup="dialog"
      >
        {children}
      </button>

      <SignupModal open={open} onClose={() => setOpen(false)} />
    </>
  );
}
