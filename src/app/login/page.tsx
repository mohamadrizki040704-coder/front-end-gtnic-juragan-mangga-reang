"use client";

import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { useRouter } from "next/navigation";

import { loginRequest, useAuth } from "../../lib/auth";

export default function LoginPage() {
  const router = useRouter();
  const { isLoggedIn } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    if (isLoggedIn) router.replace("/");
  }, [isLoggedIn, router]);

  const handleLogin = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (isLoading) return;

    if (!email.trim() || !password) {
      setError("Email dan password wajib diisi.");
      return;
    }

    setIsLoading(true);
    setError("");

    try {
      await loginRequest(email, password);
      router.push("/");
    } catch (err) {
      if (err instanceof TypeError) {
        setError(
          "Tidak dapat terhubung ke server. Server mungkin baru bangun, coba lagi dalam 1 menit."
        );
      } else {
        setError(err instanceof Error ? err.message : "Gagal login.");
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gray-100">
      <div className="w-full max-w-md rounded-lg bg-white p-8 shadow-md">
        <h2 className="mb-6 text-center text-2xl font-bold text-gray-800">
          Login Mangga Reang
        </h2>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded bg-red-100 p-3 text-sm text-red-700"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} noValidate className="space-y-4">
          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-gray-700"
            >
              Email
            </label>
            <input
              id="login-email"
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              disabled={isLoading}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-gray-700"
            >
              Password
            </label>
            <input
              id="login-password"
              type="password"
              autoComplete="current-password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              disabled={isLoading}
              className="mt-1 w-full rounded-md border border-gray-300 p-2 text-gray-800 focus:border-orange-500 focus:outline-none focus:ring-1 focus:ring-orange-500"
            />
          </div>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full rounded-md bg-orange-600 py-2 font-semibold text-white transition hover:bg-orange-700 disabled:bg-orange-300"
          >
            {isLoading ? "Memproses..." : "Login"}
          </button>
        </form>
      </div>
    </div>
  );
}
