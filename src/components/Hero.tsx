import type { CSSProperties } from "react";
import Image from "next/image";
import Link from "next/link";
import { Montserrat, Cormorant_Garamond } from "next/font/google";
import styles from "./Hero.module.css";
import anim from "./Animation.module.css";
import ScrollFx from "./ScrollFx";

const montserrat = Montserrat({
  subsets: ["latin"],
  weight: ["500", "600", "800", "900"],
});

const cormorant = Cormorant_Garamond({
  subsets: ["latin"],
  weight: ["500", "600"],
})

const steps = [
  "Buka website Juragan Mangga.",
  "Cek jenis dan stok mangga Indramayu.",
  "Masuk sebagai pembeli.",
  "Tentukan jenis dan jumlah mangga (kg/ton).",
  "Checkout, Pilih kota tujuan dan lihat ongkos kirim.",
  "Pilih metode transfer atau COD.",
  "Pesanan dikirim",
  "Pesanan Selesai",
];

/* Gabungkan class dengan aman */
const cx = (...c: (string | false | undefined)[]) =>
  c.filter(Boolean).join(" ");

/* Jeda animasi (stagger) lewat CSS variable */
const d = (ms: number) => ({ "--d": `${ms}ms` }) as CSSProperties;

export default function HomePage() {
  return (
    <>
      <ScrollFx />

      {/* ===================== HERO ===================== */}
      <section className={styles.hero} aria-label="Juragan Mangga Reang">
        {/* Latar belakang gradasi */}
        <div className={styles.sky} aria-hidden="true" />

        {/* Landmark Bundaran Mangga */}
        <Image
          src="/images/bundaranMangga.png"
          alt="Bundaran Mangga"
          width={395}
          height={388}
          priority
          className={styles.landmark}
        />

        {/* Mangga dekorasi di sisi kiri */}
        <Image
          src="/images/manggaElement.png"
          alt=""
          aria-hidden="true"
          width={388}
          height={388}
          priority
          className={cx(cx(styles.sideMangoLeft, "hx-deco"), anim.spinLeft)}
        />

        {/* Mangga dekorasi di sisi kanan */}
        <Image
          src="/images/manggaElement.png"
          alt=""
          aria-hidden="true"
          width={388}
          height={388}
          className={cx(cx(styles.sideMangoRight, "hx-deco"), anim.spinRight)}
        />

        {/* Judul sambutan */}
        <div className={`flex flex-col text-white mt-32 md:mt-0 ${styles.welcomeMobile} hx-welcome`}>
  <p>HALLO.....</p>
        <h1>SELAMAT DATANG</h1>
</div>

        {/* Kartu oranye di belakang gambar mangga */}
        <div
          className={cx(cx(styles.orangeCard, "hx-orange"), anim.cardIn)}
          aria-hidden="true"
        />

        {/* Panel putih judul brand */}
        <div className={cx(cx(styles.whitePanel, "hx-panel"), anim.panelIn)}>
          <p className={cx(styles.brandName, anim.nameIn)}>JURAGAN MANGGA</p>

          <h2 className={cx(styles.brandReang, anim.reangIn)}>REANG</h2>

          <div
            className={cx(styles.brandUnderline, anim.underlineIn)}
            aria-hidden="true"
          />

          <p className={cx(styles.description, anim.descIn)}>
            TEMUKAN DAN NIKMATI RASA MANGGA{" "}
            <br className={styles.desktopBreak} />
            KHAS DARI BERBAGAI WILAYAH NUSANTARA
          </p>

          <Link
            href="/shop"
            className={cx(styles.mobileShopLink, anim.shopLinkPulse)}
          >
            Jelajahi mangga →
          </Link>
        </div>

        {/* Dua mangga blur di belakang mangga utama */}
        <Image
          src="/images/manggaElement.png"
          alt=""
          aria-hidden="true"
          width={388}
          height={388}
          className={cx(cx(styles.backMangoTop, "hx-deco"), anim.mangoBackTop)}
        />

        <Image
          src="/images/manggaElement.png"
          alt=""
          aria-hidden="true"
          width={388}
          height={388}
          className={cx(cx(styles.backMangoBottom, "hx-deco"), anim.mangoBackBottom)}
        />

        {/* Gambar utama mangga Gedong Gincu */}
        <Image
          src="/images/manggaLandingP.png"
          alt="Mangga Gedong Gincu dan potongan mangga segar"
          width={512}
          height={512}
          priority
          className={cx(cx(styles.heroMango, "hx-mango"), anim.mangoMain)}
        />

        {/* Bagian bawah landing page */}
        <div className={styles.bottomStrip} aria-hidden="true">
          <p className={cx(styles.tagline, anim.taglineIn)}>
            PLATFORM BERBAGAI SUPPLIER BUAH MANGGA DENGAN
            <br />
            CITA RASA MANGGA DARI SELURUH NUSANTARA
          </p>
        </div>
      </section>

      {/* ===================== ALUR ===================== */}
      <section
        id="alur"
        aria-label="Alur pemesanan"
        className={`${montserrat.className} relative min-h-screen w-full overflow-hidden ${styles.alurSection} hx-alur`}
        style={{
          background:
            "linear-gradient(to bottom, #FFA000 0%, #FFA800 28%, #FFF4DC 52%, #FFFFFF 62%, #FFFFFF 100%)",
        }}
      >
        {/* Gambar mangga (kanan atas, menimpa kartu putih) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/manggaLandingP.png"
          alt="Ilustrasi Mangga"
          data-fx="right"
          className={cx(
            anim.fx,
            anim.alurMango, cx(styles.alurMangoImg, "hx-alur-mango"),
            "pointer-events-none absolute right-0 top-0 z-20 h-auto w-[40vw] max-w-[620px] object-contain"
          )}
          style={{
            ...d(200),
            filter: "drop-shadow(0 18px 22px rgba(0,0,0,0.25))",
          }}
        />

        <div className={`relative z-10 pl-[1.5vw] pt-[3vw] ${styles.alurInner} hx-alur-inner`}>
          {/* ===== Header: Judul ===== */}
          <div className={`flex items-center ${styles.alurTitleRow} hx-alur-row`}>
            {/* Kiri: JURAGAN MANGGA + REANG (SVG textLength → selalu pas lebar) */}
            <div
              data-fx="left"
              className={cx(anim.fx, "w-[34.5vw] shrink-0", cx(styles.alurLogo, "hx-alur-logo"))}
            >
              <svg
                viewBox="0 0 500 200"
                className="block h-auto w-full overflow-visible"
                role="img"
                aria-label="Juragan Mangga Reang"
              >
                <defs>
                  <filter
                    id="reangShadow"
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
                  fill="#FFFFFF"
                  fontSize="112"
                  fontWeight="900"
                  textLength="496"
                  lengthAdjust="spacing"
                  filter="url(#reangShadow)"
                  style={{ fontFamily: montserrat.style.fontFamily }}
                >
                  REANG
                </text>

                <rect x="0" y="184" width="500" height="7" fill="#FFA800" />
              </svg>
            </div>

            {/* Garis pemisah vertikal */}
            <div
              data-fx="fade"
              className={cx(anim.fx, "mx-[0.5vw] h-[7.4vw] w-[0.22vw] bg-black", cx(styles.alurDivider, "hx-alur-div"))}
              style={d(150)}
            />

            {/* ALUR */}
            <h2
              data-fx="right"
              className={cx(anim.fx, "font-black uppercase text-black", cx(styles.alurTitle, "hx-alur-title"))}
              style={{
                ...d(150),
                fontSize: "10.4vw",
                lineHeight: 1,
                letterSpacing: "0.01em",
                textShadow: "0 0.5vw 1vw rgba(0,0,0,0.22)",
              }}
            >
              ALUR
            </h2>
          </div>

          {/* ===== Subtitle ===== */}
          <p
            data-fx="up"
            className={cx(
              anim.fx,
              "mt-[1.3vw] w-[68vw] text-center font-semibold uppercase text-black", cx(styles.alurSub, "hx-alur-sub")
            )}
            style={{
              ...d(100),
              fontSize: "1.7vw",
              letterSpacing: "0.26em",
              lineHeight: 1.25,
            }}
          >
            Platform berbagai supplier buah mangga dengan cita rasa mangga dari
            seluruh nusantara
          </p>

          {/* ===== Heading pertanyaan ===== */}
          <h3
            data-fx="up"
            className={cx(
              anim.fx,
              "mt-[1.8vw] font-extrabold uppercase text-black", cx(styles.alurAsk, "hx-alur-ask")
            )}
            style={{
              ...d(100),
              fontSize: "4.6vw",
              letterSpacing: "0.14em",
              lineHeight: 1.45,
              textShadow: "0 0.5vw 1.1vw rgba(0,0,0,0.28)",
            }}
          >
            Gimana sih cara
            <br />
            ordernya??
          </h3>

          {/* ===== Kartu putih alur ===== */}
          <div
            data-fx="up"
            className={cx(anim.fx, "mt-[1.4vw] w-[93%] bg-white", cx(styles.alurCard, "hx-alur-card"))}
            style={{
              borderRadius: "3vw",
              padding: "2.8vw 1.8vw 4.5vw 1.8vw",
              boxShadow:
                "inset 0 0 1.4vw rgba(0,0,0,0.28), 0 1vw 2vw rgba(0,0,0,0.12)",
            }}
          >
            <ol
              className={`font-semibold text-black ${styles.alurList} hx-alur-list`}
              style={{
                fontSize: "1.4vw",
                letterSpacing: "0.22em",
                lineHeight: "1.75vw",
              }}
            >
              {steps.map((step, index) => (
                <li
                  key={index}
                  data-fx="left"
                  className={cx(anim.fx, "flex items-start", cx(styles.alurItem, "hx-alur-item"))}
                  style={d(index * 80)}
                >
                  <span className="mr-[0.4vw] shrink-0 tracking-normal">
                    {index + 1}.
                  </span>
                  <span>{step}</span>
                </li>
              ))}
            </ol>
          </div>
        </div>
      </section>
    </>
  );
}