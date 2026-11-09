"use client";

import { useState, useSyncExternalStore } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";

import { useCart, type CartItem } from "@/lib/cart";
import styles from "./checkout.module.css";

const PAYMENT_METHODS = ["TRANSFER", "COD", "QRIS", "E-WALLET"];
const DEFAULT_IMAGE = "/images/manggaHarumManis.png";

/** "25000", "25.000", "25000.00", "Rp 25.000" -> 25000 */
function parsePrice(value: string | null): number {
  if (!value) return 0;
  const cleaned = value.replace(/[^\d.,]/g, "");
  if (!cleaned) return 0;

  let normalized = cleaned;
  if (cleaned.includes(",") && cleaned.includes(".")) {
    normalized = cleaned.replace(/\./g, "").replace(",", ".");
  } else if (cleaned.includes(",")) {
    normalized = cleaned.replace(",", ".");
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    normalized = cleaned.replace(/\./g, "");
  }

  const parsed = Number(normalized);
  return Number.isFinite(parsed) ? parsed : 0;
}

const formatRupiah = (value: number) =>
  new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    maximumFractionDigits: 0,
  }).format(value);

/** Sama dengan perhitungan di keranjang: harga per Kg, 1 Ton = 1000 Kg */
const subtotal = (item: CartItem) =>
  item.price * item.qty * (item.unit === "Ton" ? 1000 : 1);

type Order = {
  lines: CartItem[];
  total: number;
  payment: string;
  customerName: string;
  address: string;
};

export default function CheckoutPage() {
  const params = useSearchParams();
  const { items, update, clear } = useCart();

  // true setelah hidrasi (keranjang dibaca dari localStorage di browser)
  const hydrated = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  /* ---------- SUMBER DATA ----------
     1. Beli langsung: /checkout?name=..&price=..  (satu produk)
     2. Dari keranjang: /checkout                  (semua isi keranjang) */
  const directPrice = parsePrice(params.get("price") ?? params.get("harga"));
  const isDirect = directPrice > 0;

  const [directQty, setDirectQty] = useState(() => {
    const raw = Number.parseFloat(params.get("quantity") ?? "");
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  });

  const lines: CartItem[] = isDirect
    ? [
        {
          id: "direct",
          name: params.get("name") || "Produk Mangga",
          price: directPrice,
          supplier: params.get("supplier") || "",
          address: params.get("address") || "",
          image: params.get("image") || DEFAULT_IMAGE,
          qty: directQty,
          unit: "Kg",
        },
      ]
    : items;

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [payment, setPayment] = useState("");
  const [error, setError] = useState("");
  const [order, setOrder] = useState<Order | null>(null);

  const total = lines.reduce((sum, line) => sum + subtotal(line), 0);
  const loading = !hydrated && !isDirect;
  const priceMissing = lines.some((line) => line.price <= 0);
  const blocked = loading || lines.length === 0 || priceMissing;

  function changeQty(line: CartItem, value: number) {
    if (isDirect) {
      const next = Math.max(0.1, Math.round(value * 10) / 10 || 1);
      setDirectQty(next);
    } else {
      const next = Math.min(9999, Math.max(1, Math.round(value) || 1));
      update(line.id, { qty: next });
    }
  }

  function handleCheckout() {
    setError("");

    if (lines.length === 0) {
      setError("Keranjang masih kosong. Pilih produk dari halaman Shop.");
      return;
    }
    if (priceMissing) {
      setError("Ada produk dengan harga yang tidak terbaca.");
      return;
    }
    if (!customerName.trim()) {
      setError("Masukkan nama konsumen!");
      return;
    }
    if (!address.trim()) {
      setError("Masukkan alamat pengantaran!");
      return;
    }
    if (!payment) {
      setError("Pilih metode pembayaran!");
      return;
    }

    setOrder({
      lines: lines.map((line) => ({ ...line })),
      total,
      payment,
      customerName: customerName.trim(),
      address: address.trim(),
    });

    // Pesanan dari keranjang -> kosongkan keranjang
    if (!isDirect) clear();
  }

  return (
    <main className={styles.checkoutPage}>
      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>JURAGAN MANGGA</div>
          <div className={styles.brandName}>REANG</div>
          <div className={styles.brandLine}></div>
        </div>

        <div className={styles.heading}>
          <h1>CHECKOUT</h1>
          <p>PRODUCT</p>
        </div>

        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/manggaLandingP.png"
          alt="Mangga Juragan Mangga Reang"
          className={styles.headerMango}
        />
      </header>

      <section className={styles.checkoutContainer}>
        {/* ============ PESANAN BERHASIL ============ */}
        {order ? (
          <div style={{ color: "#fff" }}>
            <p className={styles.emptyState}>Pesanan berhasil dibuat!</p>

            <ul
              style={{
                listStyle: "none",
                margin: "0 auto",
                padding: 0,
                maxWidth: 720,
                display: "grid",
                gap: 10,
                fontSize: 18,
                fontWeight: 700,
              }}
            >
              {order.lines.map((line) => (
                <li
                  key={line.id}
                  style={{ display: "flex", justifyContent: "space-between", gap: 16 }}
                >
                  <span>
                    {line.name} ({line.qty} {line.unit})
                  </span>
                  <span>{formatRupiah(subtotal(line))}</span>
                </li>
              ))}
              <li
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  borderTop: "2px solid #fff",
                  paddingTop: 10,
                  color: "#000",
                  fontSize: 22,
                }}
              >
                <span>TOTAL ({order.payment})</span>
                <span>{formatRupiah(order.total)}</span>
              </li>
              <li style={{ fontSize: 16, fontWeight: 600 }}>
                Dikirim ke: {order.customerName}, {order.address}
              </li>
            </ul>

            <div style={{ textAlign: "center", marginTop: 30 }}>
              <Link
                href="/shop"
                className={styles.checkoutButton}
                style={{ display: "inline-block", textDecoration: "none" }}
              >
                KEMBALI KE SHOP
              </Link>
            </div>
          </div>
        ) : (
          <>
            <div className={styles.tableHeader}>
              <span>JUMLAH</span>
              <span>SATUAN</span>
              <span>HARGA</span>
            </div>

            {/* ============ DAFTAR PRODUK ============ */}
            {loading && <p className={styles.emptyState}>Memuat keranjang...</p>}

            {!loading && lines.length === 0 && (
              <div className={styles.emptyState}>
                <p>Keranjang masih kosong.</p>
                <Link
                  href="/shop"
                  style={{ color: "#fff", textDecoration: "underline" }}
                >
                  Pilih produk dari Shop
                </Link>
              </div>
            )}

            <div style={{ display: "grid", gap: 20 }}>
              {lines.map((line) => (
                <div key={line.id} className={styles.productCard}>
                  <div className={styles.productImageWrapper}>
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={line.image || DEFAULT_IMAGE}
                      alt={line.name}
                      className={styles.productImage}
                    />
                  </div>

                  <div className={styles.productInformation}>
                    <h2>{line.name}</h2>
                    <p className={styles.productPrice}>
                      {formatRupiah(line.price)}/Kg
                    </p>
                    {line.supplier && (
                      <p className={styles.supplier}>{line.supplier}</p>
                    )}
                    {line.address && (
                      <p className={styles.supplier}>{line.address}</p>
                    )}
                  </div>

                  {/* DOM: + input − ; CSS membalik jadi − input + */}
                  <div className={styles.quantityControl}>
                    <button
                      type="button"
                      onClick={() => changeQty(line, line.qty + 1)}
                      className={styles.quantityButton}
                      aria-label={`Tambah jumlah ${line.name}`}
                    >
                      +
                    </button>

                    <input
                      type="number"
                      min={isDirect ? 0.1 : 1}
                      step={isDirect ? "0.1" : "1"}
                      inputMode="decimal"
                      value={line.qty}
                      onChange={(e) =>
                        changeQty(line, Number.parseFloat(e.target.value))
                      }
                      className={styles.quantityInput}
                      aria-label={`Jumlah ${line.name}`}
                    />

                    <button
                      type="button"
                      onClick={() => changeQty(line, line.qty - 1)}
                      disabled={line.qty <= 1}
                      className={styles.quantityButton}
                      aria-label={`Kurangi jumlah ${line.name}`}
                    >
                      −
                    </button>
                  </div>

                  <div className={styles.unit}>{line.unit}</div>

                  <div className={styles.itemTotal}>
                    {formatRupiah(subtotal(line))}
                  </div>
                </div>
              ))}
            </div>

            {priceMissing && (
              <p role="alert" className={styles.errorText}>
                Harga salah satu produk tidak terbaca.{" "}
                <Link href="/keranjang" style={{ textDecoration: "underline" }}>
                  Periksa keranjang
                </Link>
              </p>
            )}

            {/* ============ ALAMAT ============ */}
            <section className={styles.addressSection}>
              <h3>ALAMAT PENGANTARAN</h3>

              <div className={styles.addressRow}>
                <label htmlFor="customerName">NAMA KONSUMEN</label>
                <input
                  id="customerName"
                  type="text"
                  value={customerName}
                  onChange={(e) => setCustomerName(e.target.value)}
                  className={styles.customerInput}
                  placeholder="MASUKKAN NAMA KONSUMEN"
                  autoComplete="name"
                />
              </div>

              <div className={styles.addressRow}>
                <label htmlFor="customerAddress">ALAMAT KONSUMEN</label>

                {editingAddress ? (
                  <input
                    id="customerAddress"
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    className={styles.addressInput}
                    placeholder="MASUKKAN ALAMAT LENGKAP"
                    autoComplete="street-address"
                    autoFocus
                  />
                ) : (
                  <div
                    className={styles.addressDisplay}
                    style={
                      address ? undefined : { color: "#9a9a9a", fontWeight: 500 }
                    }
                  >
                    {address || "BELUM ADA ALAMAT, KLIK UBAH ALAMAT"}
                  </div>
                )}

                <button
                  type="button"
                  className={styles.editAddressButton}
                  onClick={() => setEditingAddress(!editingAddress)}
                >
                  {editingAddress ? "SIMPAN" : "UBAH ALAMAT"}
                </button>
              </div>
            </section>

            {/* ============ PEMBAYARAN ============ */}
            <section className={styles.paymentSection}>
              <h3>METODE PEMBAYARAN</h3>

              <div className={styles.paymentOptions}>
                {PAYMENT_METHODS.map((method) => (
                  <button
                    key={method}
                    type="button"
                    onClick={() => setPayment(method)}
                    aria-pressed={payment === method}
                    className={`${styles.paymentButton} ${
                      payment === method ? styles.paymentActive : ""
                    }`}
                  >
                    {method}
                  </button>
                ))}
              </div>
            </section>

            {error && (
              <p role="alert" className={styles.errorText}>
                {error}
              </p>
            )}

            {/* ============ TOTAL ============ */}
            <div className={styles.totalSection}>
              <div className={styles.totalInformation}>
                <span>
                  TOTAL PEMBAYARAN ({lines.length} PRODUK)
                </span>
                <strong>{formatRupiah(total)}</strong>
              </div>

              <button
                type="button"
                className={styles.checkoutButton}
                onClick={handleCheckout}
                disabled={blocked}
              >
                CHECKOUT
              </button>
            </div>
          </>
        )}
      </section>
    </main>
  );
}