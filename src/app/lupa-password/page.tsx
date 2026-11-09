"use client";

import Link from "next/link";
import { FormEvent, Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";

import { confirmPasswordReset } from "@/lib/api";

const inputClass =
  "mt-2 h-12 w-full rounded-xl border border-[#f0c36d] bg-[#fffaf0] px-4 outline-none focus:ring-4 focus:ring-orange-200";

function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirmation, setConfirmation] = useState("");
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (submitting) return;

    setError("");
    setMessage("");

    if (!token) {
      setError("Link reset password tidak valid atau sudah kedaluwarsa.");
      return;
    }
    if (password.length < 8) {
      setError("Password minimal 8 karakter.");
      return;
    }
    if (password !== confirmation) {
      setError("Konfirmasi password tidak sama.");
      return;
    }

    setSubmitting(true);
    try {
      await confirmPasswordReset(token, password);
      setMessage("Password berhasil diubah. Silakan login kembali.");
      setPassword("");
      setConfirmation("");
    } catch (requestError) {
      setError(
        requestError instanceof Error
          ? requestError.message
          : "Reset password gagal.",
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section className="w-full max-w-lg rounded-[2rem] bg-white p-8 shadow-xl sm:p-12">
      <p className="text-sm font-bold uppercase tracking-[0.25em] text-[#e08a00]">
        Juragan Mangga Reang
      </p>
      <h1 className="mt-4 text-3xl font-black text-[#3d2500]">
        Buat password baru
      </h1>

      {!token && (
        <p
          role="alert"
          className="mt-6 rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800"
        >
          Link reset password tidak valid. Silakan minta link baru.
        </p>
      )}

      <form onSubmit={submit} className="mt-8 space-y-5">
        <label className="block text-sm font-bold text-[#3d2500]">
          Password baru
          <input
            required
            minLength={8}
            type="password"
            value={password}
            onChange={(event) => setPassword(event.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </label>
        <label className="block text-sm font-bold text-[#3d2500]">
          Ulangi password baru
          <input
            required
            minLength={8}
            type="password"
            value={confirmation}
            onChange={(event) => setConfirmation(event.target.value)}
            className={inputClass}
            autoComplete="new-password"
          />
        </label>

        {message && (
          <p
            role="status"
            className="rounded-xl bg-green-50 p-3 text-sm font-semibold text-green-800"
          >
            {message}
          </p>
        )}
        {error && (
          <p
            role="alert"
            className="rounded-xl bg-red-50 p-3 text-sm font-semibold text-red-800"
          >
            {error}
          </p>
        )}

        <button
          type="submit"
          disabled={submitting || Boolean(message) || !token}
          className="h-12 w-full rounded-xl bg-[#f5a400] font-black uppercase tracking-[0.15em] text-white transition hover:bg-[#df8e00] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {submitting ? "Menyimpan..." : "Simpan password"}
        </button>
      </form>

      <div className="mt-6 flex flex-col items-center gap-2 text-sm font-bold text-[#8a4b00]">
        {!token && (
          <Link href="/lupa-password" className="underline">
            Minta link reset baru
          </Link>
        )}
        <Link href="/" className="underline">
          Kembali ke login
        </Link>
      </div>
    </section>
  );
}

export default function ResetPasswordPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-[#fff7e6] px-4 py-12">
      <Suspense fallback={<p className="font-bold text-[#8a4b00]">Memuat halaman reset...</p>}>
        <ResetPasswordForm />
      </Suspense>
    </main>
  );
}