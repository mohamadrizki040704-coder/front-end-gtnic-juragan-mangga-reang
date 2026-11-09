"use client";

import { useState } from "react";
import Link from "next/link";
import { useSearchParams } from "next/navigation";
import styles from "./checkout.module.css";

const PAYMENT_METHODS = ["TRANSFER", "COD", "QRIS", "E-WALLET"];

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

export default function CheckoutPage() {
  const params = useSearchParams();

  // DATA PRODUK DARI HALAMAN DETAIL (lewat query string)
  const name = params.get("name") || "Produk Mangga";
  // menerima ?price= atau ?harga=
  const price = parsePrice(params.get("price") ?? params.get("harga"));
  const supplier = params.get("supplier") || "";
  const supplierAddress = params.get("address") || "";
  const image = params.get("image") || "/images/manggaHarumManis.png";

  const [quantity, setQuantity] = useState(() => {
    const raw = Number.parseFloat(params.get("quantity") ?? "");
    return Number.isFinite(raw) && raw > 0 ? raw : 1;
  });

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [payment, setPayment] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const total = quantity * price;
  const productMissing = price <= 0;

  const handleCheckout = () => {
    setError("");
    setSuccess("");

    if (productMissing) {
      setError("Data harga produk tidak ditemukan. Pilih produk dari halaman Shop.");
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

    setSuccess(
      `Pesanan berhasil dibuat! ${name}${
        supplier ? ` dari ${supplier}` : ""
      }, ${quantity} Kg, total ${formatRupiah(total)} (${payment}).`,
    );
  };

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

      {/* CHECKOUT CONTAINER */}
      <section className={styles.checkoutContainer}>
        <div className={styles.tableHeader}>
          <span>JUMLAH</span>
          <span>SATUAN</span>
          <span>HARGA</span>
        </div>

        {/* PRODUCT CARD */}
        <div className={styles.productCard}>
          <div className={styles.productImageWrapper}>
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={image} alt={name} className={styles.productImage} />
          </div>

          <div className={styles.productInformation}>
            <h2>{name}</h2>

            <p className={styles.productPrice}>{formatRupiah(price)}/Kg</p>

            {supplier && <p className={styles.supplier}>{supplier}</p>}
            {supplierAddress && (
              <p className={styles.supplier}>{supplierAddress}</p>
            )}
          </div>

          {/* QUANTITY (DOM: + input − ; CSS membalik jadi − input +) */}
          <div className={styles.quantityControl}>
            <button
              type="button"
              onClick={() => setQuantity((q) => q + 1)}
              className={styles.quantityButton}
              aria-label="Tambah jumlah"
            >
              +
            </button>

            <input
              type="number"
              min={0.1}
              step="0.1"
              inputMode="decimal"
              value={quantity}
              onChange={(e) => {
                const nextValue = Number.parseFloat(e.target.value);
                setQuantity(Number.isFinite(nextValue) && nextValue > 0 ? nextValue : 1);
              }}
              className={styles.quantityInput}
              aria-label="Jumlah"
            />

            <button
              type="button"
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              disabled={quantity <= 1}
              className={styles.quantityButton}
              aria-label="Kurangi jumlah"
            >
              −
            </button>
          </div>

          <div className={styles.unit}>Kg</div>

          <div className={styles.itemTotal}>{formatRupiah(total)}</div>
        </div>

        {productMissing && (
          <p role="alert" className={styles.errorText}>
            Data produk belum lengkap (harga tidak terbaca).{" "}
            <Link href="/shop" style={{ textDecoration: "underline" }}>
              Pilih produk dari Shop
            </Link>
          </p>
        )}

        {/* ADDRESS */}
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
                style={address ? undefined : { color: "#9a9a9a", fontWeight: 500 }}
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

        {/* PAYMENT */}
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
        {success && (
          <p
            role="status"
            className={styles.errorText}
            style={{ color: "#0a7a0a" }}
          >
            {success}
          </p>
        )}

        {/* TOTAL */}
        <div className={styles.totalSection}>
          <div className={styles.totalInformation}>
            <span>TOTAL PEMBAYARAN</span>
            <strong>{formatRupiah(total)}</strong>
          </div>

          <button
            type="button"
            className={styles.checkoutButton}
            onClick={handleCheckout}
            disabled={productMissing || Boolean(success)}
          >
            CHECKOUT
          </button>
        </div>
      </section>
    </main>
  );
}
