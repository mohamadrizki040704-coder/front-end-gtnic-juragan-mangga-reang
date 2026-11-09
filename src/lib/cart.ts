"use client";

import { useCallback, useMemo, useSyncExternalStore } from "react";

import { getUserId, useAuth } from "./auth";

export type CartUnit = "Kg" | "Ton";

export type CartItem = {
  id: string;
  name: string;
  price: number; // harga per Kg
  supplier: string;
  address: string;
  image: string;
  qty: number;
  unit: CartUnit;
};

/* Disimpan per pengguna: mangga_cart_<id>, belum login: mangga_cart_guest */
const CART_EVENT = "mangga-cart-change";
const EMPTY = "[]";

const keyFor = (userId: string | null) => `mangga_cart_${userId ?? "guest"}`;

function readRaw(key: string): string {
  try {
    return window.localStorage.getItem(key) ?? EMPTY;
  } catch {
    return EMPTY;
  }
}

function coerceNumber(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) return value;
  if (typeof value === "string" && value.trim() !== "") {
    const parsed = Number(value.replace(/\s+/g, ""));
    return Number.isFinite(parsed) ? parsed : null;
  }
  return null;
}

function parse(raw: string): CartItem[] {
  try {
    const data: unknown = JSON.parse(raw);
    if (!Array.isArray(data)) return [];

    return data.flatMap((item) => {
      if (!item || typeof item !== "object") return [];

      const record = item as Record<string, unknown>;
      const id = typeof record.id === "string" ? record.id : "";
      const name = typeof record.name === "string" ? record.name : "";
      const price = coerceNumber(record.price);
      const qty = coerceNumber(record.qty);
      const unit = record.unit;

      if (!id || !name || price === null || qty === null) return [];
      if (unit !== "Kg" && unit !== "Ton") return [];

      return [{
        id,
        name,
        price,
        supplier: typeof record.supplier === "string" ? record.supplier : "",
        address: typeof record.address === "string" ? record.address : "",
        image: typeof record.image === "string" ? record.image : "",
        qty,
        unit,
      }];
    });
  } catch {
    return [];
  }
}

function write(key: string, items: CartItem[]) {
  try {
    window.localStorage.setItem(key, JSON.stringify(items));
  } catch {
    /* storage diblokir: abaikan */
  }
  window.dispatchEvent(new Event(CART_EVENT));
}

function subscribe(callback: () => void) {
  window.addEventListener(CART_EVENT, callback);
  window.addEventListener("storage", callback);
  return () => {
    window.removeEventListener(CART_EVENT, callback);
    window.removeEventListener("storage", callback);
  };
}

const MAX_QTY = 9999;
const toKg = (i: Pick<CartItem, "qty" | "unit">) =>
  i.qty * (i.unit === "Ton" ? 1000 : 1);

function fromKg(totalKg: number): Pick<CartItem, "qty" | "unit"> {
  if (totalKg >= 1000 && totalKg % 1000 === 0) {
    return { qty: Math.min(MAX_QTY, totalKg / 1000), unit: "Ton" };
  }
  return { qty: Math.min(MAX_QTY, Math.max(1, Math.round(totalKg))), unit: "Kg" };
}

export function useCart() {
  const { token } = useAuth();
  const key = keyFor(getUserId(token));

  const raw = useSyncExternalStore(
    subscribe,
    () => readRaw(key),
    () => EMPTY
  );

  const items = useMemo(() => parse(raw), [raw]);

  const add = useCallback(
    (item: Omit<CartItem, "qty" | "unit">, totalKg: number) => {
      const list = parse(readRaw(key));
      const existing = list.find((i) => i.id === item.id);

      if (existing) {
        const merged = fromKg(toKg(existing) + totalKg);
        write(
          key,
          list.map((i) => (i.id === item.id ? { ...i, ...merged } : i))
        );
      } else {
        write(key, [...list, { ...item, ...fromKg(totalKg) }]);
      }
    },
    [key]
  );

  const update = useCallback(
    (id: string, patch: Partial<CartItem>) => {
      const list = parse(readRaw(key));
      write(key, list.map((i) => (i.id === id ? { ...i, ...patch } : i)));
    },
    [key]
  );

  const remove = useCallback(
    (id: string) => {
      const list = parse(readRaw(key));
      write(key, list.filter((i) => i.id !== id));
    },
    [key]
  );

  const clear = useCallback(() => write(key, []), [key]);

  return { items, add, update, remove, clear };
}
