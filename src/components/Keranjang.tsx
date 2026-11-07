"use client";

import Image from "next/image";
import Link from "next/link";
import { useCart, type CartItem } from "@/lib/cart";
import {
  Montserrat,
  Cormorant_Garamond,
  Chakra_Petch,
} from "next/font/google";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
});

const chakra = Chakra_Petch({
  subsets: ["latin"],
  weight: ["600", "700"],
});

export type { CartItem };

const rupiah = (n: number) => `Rp.${n.toLocaleString("id-ID")}`;
const subtotal = (i: CartItem) =>
  i.price * i.qty * (i.unit === "Ton" ? 1000 : 1);

/* Kolom desktop (dipakai bersama oleh judul kolom dan kartu supaya sejajar):
   pad | gambar | jarak | info | "+" | jarak | JUMLAH | "-" | SATUAN | HARGA */
const COLS =
  "md:grid-cols-[3.2vw_19.2vw_2.9vw_23.4vw_1.9vw_1vw_8.5vw_4.1vw_5.6vw_1fr]";

const signBtn =
  "grid place-items-center text-3xl font-bold leading-none text-white transition hover:scale-125 hover:text-black focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-black md:text-[3vw]";

const pill =
  "h-9 rounded-full bg-white text-center text-sm font-extrabold text-black outline-none focus-visible:ring-4 focus-visible:ring-black/40 md:h-[3.3vw] md:text-[1.5vw]";

export default function Keranjang() {
  const { items, update, remove } = useCart();

  const clamp = (n: number) => Math.min(9999, Math.max(1, n || 1));

  const total = items.reduce((sum, i) => sum + subtotal(i), 0);

  return (
    <section
      aria-label="Keranjang"
      className={`${montserrat.className} relative min-h-screen overflow-x-clip bg-white pb-10`}
    >
      <h1 className="sr-only">Keranjang</h1>

      {/* ===================== HEADER ===================== */}
      <div className="relative flex flex-col items-center gap-3 px-4 pb-6 pt-28 md:block md:h-[17.1vw] md:p-0">
        {/* JURAGAN MANGGA REANG */}
        <svg
          viewBox="0 0 500 200"
          className="block h-auto w-[85vw] max-w-[420px] overflow-visible md:absolute md:left-[2vw] md:top-[1vw] md:w-[34vw] md:max-w-none"
          role="img"
          aria-label="Juragan Mangga Reang"
        >
          <defs>
            <filter
              id="krReangShadow"
              x="-10%"
              y="-10%"
              width="120%"
              height="130%"
            >
              <feDropShadow
                dx="0"
                dy="4"
                stdDeviation="4"
                floodColor="#000"
                floodOpacity="0.22"
              />
            </filter>
          </defs>

          <text
            x="0"
            y="64"
            fill="#000"
            fontSize="54"
            fontWeight="500"
            textLength="500"
            lengthAdjust="spacing"
            style={{ fontFamily: cormorant.style.fontFamily }}
          >
            JURAGAN MANGGA
          </text>

          <text
            x="0"
            y="168"
            fill="#FFA800"
            fontSize="112"
            fontWeight="900"
            textLength="496"
            lengthAdjust="spacing"
            filter="url(#krReangShadow)"
            style={{ fontFamily: montserrat.style.fontFamily }}
          >
            REANG
          </text>

          <rect x="0" y="184" width="500" height="7" fill="#FFA800" />
        </svg>

        {/* Garis pemisah */}
        <div
          className="hidden bg-black md:absolute md:left-[37.9vw] md:top-[3.3vw] md:block md:h-[7.5vw] md:w-[0.22vw]"
          aria-hidden="true"
        />

        {/* KERANJANG PRODUCT */}
        <svg
          viewBox="0 0 510 130"
          className="block h-auto w-[80vw] max-w-[380px] overflow-visible md:absolute md:left-[39.4vw] md:top-[3.2vw] md:w-[35.4vw] md:max-w-none"
          role="img"
          aria-label="Keranjang Product"
        >
          <text
            x="0"
            y="60"
            fill="#000"
            fontSize="80"
            fontWeight="900"
            textLength="507"
            lengthAdjust="spacing"
            style={{
              fontFamily: montserrat.style.fontFamily,
              filter: "drop-shadow(0 4px 5px rgba(0,0,0,0.22))",
            }}
          >
            KERANJANG
          </text>

          <text
            x="37"
            y="122"
            fill="#111"
            fontSize="52"
            fontWeight="500"
            textLength="400"
            lengthAdjust="spacing"
            style={{ fontFamily: cormorant.style.fontFamily }}
          >
            PRODUCT
          </text>
        </svg>

        {/* Mangga dekorasi (menimpa panel) */}
        <Image
          src="/images/manggaLandingP.png"
          alt=""
          aria-hidden="true"
          width={512}
          height={512}
          priority
          className="pointer-events-none hidden h-auto md:absolute md:left-[73.5vw] md:top-[0.4vw] md:z-20 md:block md:w-[17.5vw]"
          style={{ filter: "drop-shadow(0 1vw 1.2vw rgba(80,40,0,0.2))" }}
        />
      </div>

      {/* ===================== PANEL ORANYE ===================== */}
      <div
        className="relative z-10 mx-3 rounded-[2rem] px-3 pb-4 pt-3 md:mx-[1.9vw] md:rounded-[4vw] md:px-0 md:pb-[1.8vw] md:pt-[0.8vw]"
        style={{
          background: "#FFA800",
          boxShadow:
            "0 -0.4vw 3.6vw 0.8vw rgba(255,214,74,0.85), inset 0 0 1.6vw rgba(255,224,120,0.6)",
        }}
      >
        {/* Judul kolom (desktop) */}
        <div
          className={`mb-[0.3vw] ml-[0.7vw] mr-[5.7vw] hidden h-[2.6vw] items-center pr-[3.2vw] text-[1.55vw] font-semibold uppercase tracking-[0.14em] text-white md:grid ${COLS}`}
          aria-hidden="true"
        >
          <span className="col-start-7 text-center">Jumlah</span>
          <span className="col-start-9 text-center">Satuan</span>
          <span className="col-start-10 text-center">Harga</span>
        </div>

        {/* Daftar produk (bisa di-scroll) */}
        <div
          className="max-h-[70vh] overflow-y-auto md:ml-[0.7vw] md:mr-[5.7vw] md:h-[37vw] md:max-h-none [&::-webkit-scrollbar]:w-[clamp(8px,1.4vw,22px)] [&::-webkit-scrollbar-thumb]:rounded-full [&::-webkit-scrollbar-thumb]:bg-[#FFD04A] [&::-webkit-scrollbar-track]:rounded-full [&::-webkit-scrollbar-track]:bg-[#D78F00]"
          style={{ scrollbarColor: "#FFD04A #D78F00" }}
        >
          {items.length === 0 ? (
            <div className="grid h-full min-h-[40vh] place-items-center text-center text-white">
              <div>
                <p className="text-lg font-extrabold uppercase tracking-wider md:text-[2.2vw]">
                  Keranjang masih kosong
                </p>

                <Link
                  href="/shop"
                  className="mt-4 inline-block rounded-full bg-black px-6 py-2 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 md:mt-[1.2vw] md:px-[2vw] md:py-[0.6vw] md:text-[1.3vw]"
                >
                  Belanja mangga
                </Link>
              </div>
            </div>
          ) : (
            <ul className="space-y-3 pr-1 md:space-y-[2.4vw] md:pr-[1.8vw]">
              {items.map((item) => (
                <li key={item.id}>
                  <article
                    className={`grid grid-cols-[34%_1fr] items-center gap-x-3 gap-y-3 rounded-[2rem] border-[5px] border-[#D98B00] p-3 md:h-[18.5vw] md:gap-0 md:rounded-[3.8vw] md:border-[0.45vw] md:p-0 ${COLS}`}
                    style={{
                      background: "#FFA800",
                      boxShadow: "inset 0 0 1.2vw rgba(150,80,0,0.45)",
                    }}
                  >
                    {/* Gambar */}
                    <div className="relative aspect-[4/3] w-full overflow-hidden rounded-[1.4rem] bg-white md:col-start-2 md:row-start-1 md:aspect-auto md:h-[16.3vw] md:rounded-[2.8vw]">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="(min-width: 768px) 20vw, 140px"
                        className="object-contain p-1 md:p-[0.6vw]"
                      />
                    </div>

                    {/* Info produk */}
                    <div className="min-w-0 md:col-start-4 md:row-start-1 md:self-start md:pt-[2.3vw]">
                      <h2 className="text-[13px] font-extrabold uppercase leading-tight tracking-[0.06em] text-white md:whitespace-nowrap md:text-[2.4vw] md:leading-[1.1]">
                        {item.name}
                      </h2>

                      <p
                        className={`${chakra.className} text-xl font-bold leading-tight text-black md:mt-[0.5vw] md:whitespace-nowrap md:text-[2.6vw] md:leading-none`}
                      >
                        {rupiah(item.price)}/Kg
                      </p>

                      <p className="mt-1 text-[11px] font-medium uppercase tracking-[0.08em] text-white md:mt-[1vw] md:whitespace-nowrap md:text-[1.7vw]">
                        {item.supplier}
                      </p>

                      <p className="text-[11px] font-medium uppercase tracking-[0.08em] text-white md:mt-[0.7vw] md:whitespace-nowrap md:text-[1.7vw]">
                        {item.address}
                      </p>
                    </div>

                    {/* Kontrol: di desktop tiap elemen menempati kolomnya sendiri */}
                    <div className="col-span-2 flex flex-wrap items-center justify-between gap-2 md:contents">
                      <button
                        type="button"
                        aria-label={`Tambah jumlah ${item.name}`}
                        onClick={() =>
                          update(item.id, { qty: clamp(item.qty + 1) })
                        }
                        className={`${signBtn} md:col-start-5 md:row-start-1 md:self-center md:justify-self-start`}
                      >
                        +
                      </button>

                      <input
                        type="number"
                        inputMode="numeric"
                        min={1}
                        max={9999}
                        value={item.qty}
                        aria-label={`Jumlah ${item.name}`}
                        onChange={(e) =>
                          update(item.id, { qty: clamp(Number(e.target.value)) })
                        }
                        className={`${pill} w-20 md:col-start-7 md:row-start-1 md:w-full md:self-center [appearance:textfield] [&::-webkit-inner-spin-button]:appearance-none [&::-webkit-outer-spin-button]:appearance-none`}
                      />

                      <button
                        type="button"
                        aria-label={`Kurangi jumlah ${item.name}`}
                        onClick={() =>
                          update(item.id, { qty: clamp(item.qty - 1) })
                        }
                        className={`${signBtn} md:col-start-8 md:row-start-1 md:self-center md:justify-self-center`}
                      >
                        −
                      </button>

                      <button
                        type="button"
                        aria-label={`Satuan ${item.unit}, tekan untuk mengganti`}
                        onClick={() =>
                          update(item.id, {
                            unit: item.unit === "Kg" ? "Ton" : "Kg",
                          })
                        }
                        className={`${pill} w-16 transition hover:bg-black hover:text-white md:col-start-9 md:row-start-1 md:w-full md:self-center`}
                      >
                        {item.unit}
                      </button>

                      {/* Harga */}
                      <div className="text-center md:col-start-10 md:row-start-1 md:self-center md:justify-self-center">
                        <p
                          className={`${chakra.className} text-base font-bold text-black md:text-[1.9vw]`}
                        >
                          {rupiah(subtotal(item))}
                        </p>

                        <button
                          type="button"
                          onClick={() => remove(item.id)}
                          aria-label={`Hapus ${item.name} dari keranjang`}
                          className="text-[11px] font-semibold uppercase tracking-wider text-white underline underline-offset-2 transition hover:text-black md:mt-[0.3vw] md:text-[1.1vw]"
                        >
                          Hapus
                        </button>
                      </div>
                    </div>
                  </article>
                </li>
              ))}
            </ul>
          )}
        </div>

        {/* Total dan checkout */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 md:ml-[2vw] md:mr-[5.7vw] md:mt-[1.4vw]">
          <p className="text-sm font-extrabold uppercase tracking-[0.12em] text-white md:text-[1.7vw]">
            Total{" "}
            <span
              className={`${chakra.className} ml-2 text-lg font-bold text-black md:text-[2.4vw]`}
            >
              {rupiah(total)}
            </span>
          </p>

          <Link
            href="/checkout"
            aria-disabled={items.length === 0}
            className={`${chakra.className} rounded-full bg-black px-6 py-2 text-sm font-bold uppercase tracking-widest text-white transition hover:bg-neutral-800 focus-visible:outline focus-visible:outline-[3px] focus-visible:outline-offset-2 focus-visible:outline-white md:px-[2.4vw] md:py-[0.6vw] md:text-[1.5vw] ${
              items.length === 0 ? "pointer-events-none opacity-40" : ""
            }`}
          >
            Checkout
          </Link>
        </div>
      </div>
    </section>
  );
}