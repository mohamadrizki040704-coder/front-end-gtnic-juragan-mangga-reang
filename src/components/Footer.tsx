import Link from "next/link";

export default function Footer() {
  return (
    <footer className="bg-stone-950 px-6 py-8 text-white">
      <div className="mx-auto flex max-w-7xl flex-col items-center justify-between gap-6 text-center sm:flex-row sm:text-left">
        {/* Logo dan Nama Brand */}
        <div>
          <Link href="/" className="inline-block">
            <h2 className="text-xl font-black">
              <span className="text-orange-400">JMangga</span>Reang
            </h2>
          </Link>

          <p className="mt-1 text-sm text-stone-400">
            Juragan Mangga Reang
          </p>
        </div>

        {/* Navigasi Footer */}
        <nav
          aria-label="Navigasi footer"
          className="flex flex-wrap justify-center gap-5 text-sm text-stone-300"
        >
          <Link
            href="/"
            className="transition hover:text-orange-400"
          >
            Beranda
          </Link>

          <Link
            href="/shop"
            className="transition hover:text-orange-400"
          >
            Shop
          </Link>

          <Link
            href="/#alur"
            className="transition hover:text-orange-400"
          >
            Alur
          </Link>

          <Link
            href="/#contact"
            className="transition hover:text-orange-400"
          >
            Contact
          </Link>
        </nav>

        {/* Copyright */}
        <p className="text-xs text-stone-400">
          © 2026 Juragan Mangga Reang. All rights reserved.
        </p>
      </div>
    </footer>
  );
}