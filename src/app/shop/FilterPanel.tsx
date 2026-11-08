"use client";

import { useState, type ReactNode } from "react";

export default function FilterPanel({
  children,
  activeCount = 0,
}: {
  children: ReactNode;
  activeCount?: number;
}) {
  const [open, setOpen] = useState(false);

  return (
    <aside className="h-fit w-full shrink-0 rounded-4xl bg-white p-5 lg:sticky lg:top-6 lg:w-60">
      {/* Tombol toggle: hanya tampil di bawah lg (HP & tablet) */}
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        aria-controls="filter-body"
        className="flex w-full items-center justify-between lg:hidden"
      >
        <span className="text-xl font-black uppercase tracking-[0.35em] text-black">
          Filter{activeCount > 0 ? ` (${activeCount})` : ""}
        </span>
        <span
          aria-hidden="true"
          className={`text-xl transition-transform ${open ? "rotate-180" : ""}`}
        >
          ▾
        </span>
      </button>

      {/* Isi filter: tertutup di HP, selalu terbuka di desktop.
          Tetap ada di DOM saat tertutup, jadi nilai form tetap terkirim. */}
      <div id="filter-body" className={`${open ? "block" : "hidden"} lg:block`}>
        <h2 className="hidden text-2xl font-black uppercase tracking-[0.45em] text-black lg:block">
          Filter
        </h2>
        {children}
      </div>
    </aside>
  );
}
