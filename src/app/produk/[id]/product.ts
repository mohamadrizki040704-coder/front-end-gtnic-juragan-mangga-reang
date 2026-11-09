// src/lib/product.ts
// Helper bersama untuk halaman detail produk & checkout.

const API_URL = process.env.NEXT_PUBLIC_API_URL ?? "";

export const FALLBACK_PRODUCT_IMAGE = "/mangga.png";

export type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  image: string;
  description: string;
  supplier: string;
  stock: number | null;
};

type RawProduct = Record<string, unknown>;

/** "25000.00", "25.000", 25000, null -> number aman (tidak NaN) */
export function toNumber(value: unknown): number {
  if (typeof value === "number") return Number.isFinite(value) ? value : 0;
  if (typeof value === "string") {
    const cleaned = value.replace(/[^\d.,-]/g, "");
    const normalized =
      cleaned.includes(",") && cleaned.includes(".")
        ? cleaned.replace(/\./g, "").replace(",", ".")
        : cleaned.includes(",")
          ? cleaned.replace(",", ".")
          : /^\d{1,3}(\.\d{3})+$/.test(cleaned)
            ? cleaned.replace(/\./g, "")
            : cleaned;
    const parsed = Number(normalized);
    return Number.isFinite(parsed) ? parsed : 0;
  }
  return 0;
}

function pick(raw: RawProduct, keys: string[]): unknown {
  for (const key of keys) {
    const value = raw[key];
    if (value !== undefined && value !== null && value !== "") return value;
  }
  return undefined;
}

/** Menyeragamkan berbagai kemungkinan nama field dari API */
export function normalizeProduct(raw: RawProduct, fallbackId: string): Product {
  const stock = pick(raw, ["stock", "stok", "quantity", "qty"]);
  return {
    id: String(pick(raw, ["id", "product_id", "pk"]) ?? fallbackId),
    name: String(
      pick(raw, ["name", "nama", "title", "product_name", "nama_produk"]) ??
        "Produk Mangga",
    ),
    price: toNumber(
      pick(raw, [
        "price",
        "harga",
        "price_per_kg",
        "harga_per_kg",
        "price_per_unit",
        "unit_price",
        "harga_satuan",
      ]),
    ),
    unit: String(pick(raw, ["unit", "satuan", "uom"]) ?? "Kg"),
    image: String(
      pick(raw, ["image", "image_url", "gambar", "photo", "thumbnail"]) ??
        FALLBACK_PRODUCT_IMAGE,
    ),
    description: String(pick(raw, ["description", "deskripsi", "desc"]) ?? ""),
    supplier: String(
      pick(raw, ["supplier", "seller", "penjual", "toko", "farmer", "petani"]) ??
        "",
    ),
    stock: stock === undefined ? null : toNumber(stock),
  };
}

export const rupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

/**
 * Ambil satu produk. Return null jika tidak ditemukan (404).
 * SESUAIKAN endpoint dengan API-mu, atau ganti dengan fungsi di @/lib/api.
 */
export async function fetchProduct(id: string): Promise<Product | null> {
  const response = await fetch(`${API_URL}/products/${id}/`, {
    headers: { Accept: "application/json" },
    cache: "no-store",
  });
  if (response.status === 404) return null;
  if (!response.ok) throw new Error("Gagal memuat produk.");

  const data = (await response.json()) as RawProduct;
  // beberapa API membungkus data: { data: {...} } / { product: {...} }
  const raw = (data.data ?? data.product ?? data) as RawProduct;
  return normalizeProduct(raw, id);
}
