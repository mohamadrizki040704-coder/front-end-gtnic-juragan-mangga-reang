"use client";

import { API_URL, parseApiError } from "./auth";

type ApiErrorBody = {
  detail?: unknown;
  message?: string;
};

type ApiMessage = {
  detail?: string;
  message?: string;
};

function normalizeMessage(body: ApiMessage | null | undefined): string {
  const detail = body?.detail;
  if (typeof detail === "string" && detail.trim()) return detail;
  if (typeof body?.message === "string" && body.message.trim()) return body.message;
  return "Permintaan gagal.";
}

async function jsonRequest(
  path: string,
  init: RequestInit = {},
): Promise<ApiMessage | null> {
  if (!API_URL || !/^https?:\/\//.test(API_URL)) {
    throw new Error("NEXT_PUBLIC_API_URL belum benar (harus diawali https://).");
  }

  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: {
      Accept: "application/json",
      ...(init.headers ?? {}),
    },
  });

  const body = (await response.json().catch(() => null)) as ApiErrorBody | null;

  if (!response.ok) {
    throw new Error(parseApiError(body, response.status));
  }

  if (response.status === 204) return null;
  return (body ?? {}) as ApiMessage;
}

async function postJson(
  path: string,
  payload: Record<string, string | undefined>,
): Promise<ApiMessage | null> {
  return jsonRequest(path, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });
}

async function tryResetEndpoints<T>(
  attempts: Array<{ path: string; payload: Record<string, string | undefined> }>,
  fallbackMessage: string,
): Promise<T> {
  let lastError: unknown = null;

  for (const attempt of attempts) {
    try {
      return (await postJson(attempt.path, attempt.payload)) as T;
    } catch (error) {
      lastError = error;
    }
  }

  if (lastError instanceof Error) {
    throw lastError;
  }

  throw new Error(fallbackMessage);
}

export async function requestPasswordReset(
  email: string,
): Promise<{ detail: string }> {
  const normalizedEmail = email.trim();
  if (!normalizedEmail) {
    throw new Error("Email wajib diisi.");
  }

  const attempts = [
    { path: "/api/auth/password-reset/request", payload: { email: normalizedEmail } },
    { path: "/api/auth/forgot-password", payload: { email: normalizedEmail } },
    { path: "/api/auth/request-password-reset", payload: { email: normalizedEmail } },
    { path: "/api/auth/forgot-password/request", payload: { email: normalizedEmail } },
  ];

  const result = await tryResetEndpoints<{ detail?: string } | null>(
    attempts,
    "Permintaan reset password gagal.",
  );

  return {
    detail: normalizeMessage(result ?? {}) || "Link reset password telah dikirim.",
  };
}

export async function confirmPasswordReset(
  token: string,
  password: string,
): Promise<{ detail: string }> {
  const normalizedToken = token.trim();
  if (!normalizedToken) {
    throw new Error("Token reset password tidak valid.");
  }

  const attempts = [
    {
      path: "/api/auth/password-reset/confirm",
      payload: { token: normalizedToken, password },
    },
    {
      path: `/api/auth/password-reset/confirm?token=${encodeURIComponent(normalizedToken)}`,
      payload: { password },
    },
    {
      path: "/api/auth/reset-password",
      payload: { token: normalizedToken, password },
    },
    {
      path: "/api/auth/confirm-password-reset",
      payload: { token: normalizedToken, password },
    },
    {
      path: "/api/auth/password-reset",
      payload: { token: normalizedToken, password },
    },
  ];

  const result = await tryResetEndpoints<{ detail?: string } | null>(
    attempts,
    "Reset password gagal.",
  );

  return {
    detail: normalizeMessage(result ?? {}) || "Password berhasil diubah.",
  };
}
