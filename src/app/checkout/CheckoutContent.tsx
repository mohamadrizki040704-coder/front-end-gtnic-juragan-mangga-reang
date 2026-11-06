"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import styles from "./checkout.module.css";

export default function CheckoutPage() {
  const params = useSearchParams();

  // DATA PRODUK DARI HALAMAN DETAIL
  const name = params.get("name") || "Produk Mangga";
  const price = Number(params.get("price")) || 0;
  const supplier = params.get("supplier") || "-";
  const supplierAddress = params.get("address") || "-";
  const image = params.get("image") || "/images/manggaHarumManis.png";
  const label = params.get("label") || "1kg";

  const [quantity, setQuantity] = useState(
    Number(params.get("quantity")) || 1
  );

  const [customerName, setCustomerName] = useState("");
  const [address, setAddress] = useState("");
  const [editingAddress, setEditingAddress] = useState(false);
  const [payment, setPayment] = useState("");

  const total = quantity * price;

  const formatRupiah = (value: number) =>
    new Intl.NumberFormat("id-ID", {
      style: "currency",
      currency: "IDR",
      maximumFractionDigits: 0,
    }).format(value);

  const handleCheckout = () => {
    if (!customerName.trim()) {
      alert("Masukkan nama konsumen!");
      return;
    }

    if (!address.trim()) {
      alert("Masukkan alamat pengantaran!");
      return;
    }

    if (!payment) {
      alert("Pilih metode pembayaran!");
      return;
    }

    alert(
      `Pesanan berhasil dibuat!\n\nProduk: ${name}\nSupplier: ${supplier}\nJumlah: ${quantity} Kg\nTotal: ${formatRupiah(total)}\nPembayaran: ${payment}`
    );
  };

  return (
    <main className={styles.checkoutPage}>

      {/* HEADER */}
      <header className={styles.header}>
        <div className={styles.brand}>
          <div className={styles.brandTitle}>
            JURAGAN MANGGA
          </div>

          <div className={styles.brandName}>
            REANG
          </div>

          <div className={styles.brandLine}></div>
        </div>

        <div className={styles.heading}>
          <h1>CHECKOUT</h1>
          <p>PRODUCT</p>
        </div>

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
            <img
              src={image}
              alt={name}
              className={styles.productImage}
            />
          </div>

          <div className={styles.productInformation}>
            <h2>{name}</h2>

            <p className={styles.productPrice}>
              {formatRupiah(price)}/Kg
            </p>

            <p className={styles.supplier}>
              {supplier}
            </p>

            <p className={styles.supplier}>
              {supplierAddress}
            </p>
          </div>

          {/* QUANTITY */}
          <div className={styles.quantityControl}>
            <button
              onClick={() => setQuantity((q) => q + 1)}
              className={styles.quantityButton}
            >
              +
            </button>

            <input
              type="number"
              min={1}
              value={quantity}
              onChange={(e) =>
                setQuantity(Math.max(1, Number(e.target.value) || 1))
              }
              className={styles.quantityInput}
            />

            <button
              onClick={() => setQuantity((q) => Math.max(1, q - 1))}
              className={styles.quantityButton}
            >
              -
            </button>
          </div>

          <div className={styles.unit}>
            Kg
          </div>

          <div className={styles.itemTotal}>
            {formatRupiah(total)}
          </div>
        </div>

        {/* ADDRESS */}
        <section className={styles.addressSection}>
          <h3>ALAMAT PENGANTARAN</h3>

          <div className={styles.addressRow}>
            <label>NAMA KONSUMEN</label>

            <input
              type="text"
              value={customerName}
              onChange={(e) => setCustomerName(e.target.value)}
              className={styles.customerInput}
              placeholder="MASUKKAN NAMA KONSUMEN"
            />
          </div>

          <div className={styles.addressRow}>
            <label>ALAMAT KONSUMEN</label>

            {editingAddress ? (
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                className={styles.addressInput}
                placeholder="MASUKKAN ALAMAT LENGKAP"
                autoFocus
              />
            ) : (
              <div className={styles.addressDisplay}>
                {address || "ALAMAT KONSUMEN"}
              </div>
            )}

            <button
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
            {["TRANSFER", "COD", "QRIS", "E-WALLET"].map((method) => (
              <button
                key={method}
                onClick={() => setPayment(method)}
                className={`${styles.paymentButton} ${
                  payment === method ? styles.paymentActive : ""
                }`}
              >
                {method}
              </button>
            ))}
          </div>
        </section>

        {/* TOTAL */}
        <div className={styles.totalSection}>
          <div className={styles.totalInformation}>
            <span>TOTAL PEMBAYARAN</span>
            <strong>{formatRupiah(total)}</strong>
          </div>

          <button
            className={styles.checkoutButton}
            onClick={handleCheckout}
          >
            CHECKOUT
          </button>
        </div>

      </section>
    </main>
  );
}
