"use client";

import { useEffect, useState, useSyncExternalStore } from "react";

export const API_URL = process.env.NEXT_PUBLIC_API_URL?.trim().replace(/\/+$/, "");

const TOKEN_KEY = "mangga_access_token";
const AUTH_EVENT = "mangga-auth-change";

type JwtPayload = {
  user_id?: number | string;
  role?: string;
  exp?: number;
  demo?: boolean;
};

function decodeJwt(token: string): JwtPayload | null {
  try {
    const part = token.split(".")[1];
    const base64 = part.replace(/-/g, "+").replace(/_/g, "/");
    const json = decodeURIComponent(
      atob(base64)
        .split("")
        .map((c) => "%" + c.charCodeAt(0).toString(16).padStart(2, "0"))
        .join("")
    );
    return JSON.parse(json) as JwtPayload;
  } catch {
    return null;
  }
}

function isExpired(token: string): boolean {
  const payload = decodeJwt(token);
  if (!payload?.exp) return false;
  return payload.exp * 1000 <= Date.now();
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  try {
    const token = window.localStorage.getItem(TOKEN_KEY);
    if (!token) return null;
    if (decodeJwt(token)?.demo || isExpired(token)) {
      window.localStorage.removeItem(TOKEN_KEY);
      return null;
    }
    return token;
  } catch {
    return null;
  }
}

export function setToken(token: string) {
  try {
    window.localStorage.setItem(TOKEN_KEY, token);
  } catch {}
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearToken() {
  try {
    window.localStorage.removeItem(TOKEN_KEY);
  } catch {}
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function getRole(token: string | null): string | null {
  return token ? decodeJwt(token)?.role ?? null : null;
}

export function getUserId(token: string | null): string | null {
  if (!token) return null;
  const id = decodeJwt(token)?.user_id;
  return id === undefined || id === null || id === "" ? null : String(id);
}

function subscribe(callback: () => void) {
  window.addEventListener(AUTH_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(AUTH_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

export function useAuth() {
  const token = useSyncExternalStore(subscribe, getToken, () => null);
  return {
    token,
    isLoggedIn: token !== null,
    role: getRole(token),
    logout: clearToken,
  };
}

type ValidationItem = { loc?: (string | number)[]; msg?: string };

export function parseApiError(
  result: { detail?: unknown; message?: string } | null | undefined,
  status: number
): string {
  const detail = result?.detail;

  if (Array.isArray(detail)) {
    return (detail as ValidationItem[])
      .map((d) => `${d.loc?.slice(1).join(".") ?? "field"}: ${d.msg ?? "tidak valid"}`)
      .join(", ");
  }
  if (typeof detail === "string" && detail) {
    if (detail === "Invalid email or password") return "Email atau password salah.";
    return detail;
  }
  return result?.message || `Permintaan gagal. Status: ${status}`;
}

async function wakeServer(timeoutMs = 70000): Promise<void> {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);
  try {
    await fetch(`${API_URL}/health`, { mode: "no-cors", signal: controller.signal });
  } catch {
  } finally {
    clearTimeout(timer);
  }
}

async function postLogin(email: string, password: string): Promise<Response> {
  return fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ email: email.trim(), password }),
  });
}

export async function loginRequest(email: string, password: string): Promise<string> {
  if (!API_URL || !/^https?:\/\//.test(API_URL)) {
    throw new Error("NEXT_PUBLIC_API_URL belum benar (harus diawali https://).");
  }

  let response: Response;
  try {
    response = await postLogin(email, password);
  } catch (err) {
    if (!(err instanceof TypeError)) throw err;
    await wakeServer();
    response = await postLogin(email, password);
  }

  const result = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(parseApiError(result, response.status));
  }

  const token: string | undefined = result.accessToken ?? result.access_token;
  if (!token) throw new Error("Respons login tidak berisi token.");

  setToken(token);
  return token;
}

export async function authFetch(path: string, init: RequestInit = {}): Promise<Response> {
  if (!API_URL) throw new Error("NEXT_PUBLIC_API_URL belum dikonfigurasi.");

  const token = getToken();
  const headers = new Headers(init.headers);
  headers.set("Accept", "application/json");
  if (init.body && !headers.has("Content-Type")) {
    headers.set("Content-Type", "application/json");
  }
  if (token) headers.set("Authorization", `Bearer ${token}`);

  const response = await fetch(`${API_URL}${path}`, { ...init, headers });

  if (response.status === 401) clearToken();

  return response;
}

/* =========================================
   PROFIL PENGGUNA (nama, email, role) dari GET /api/auth/me
========================================= */

export type Profile = {
  id: number;
  email: string;
  namaLengkap: string;
  nomorTelepon?: string | null;
  role: string;
  namaPerusahaan: string | null;
};

export function useProfile(): Profile | null {
  const { token } = useAuth();
  const [state, setState] = useState<{ token: string; profile: Profile } | null>(null);

  useEffect(() => {
    if (!token) return;

    let active = true;

    (async () => {
      try {
        const res = await authFetch("/api/auth/me");
        if (!res.ok) return;
        const profile = (await res.json()) as Profile;
        if (active) setState({ token, profile });
      } catch {
        /* abaikan: nama tetap memakai teks cadangan */
      }
    })();

    return () => {
      active = false;
    };
  }, [token]);

  // hanya dipakai jika milik token yang sedang aktif (aman saat ganti akun)
  return token && state?.token === token ? state.profile : null;
}
