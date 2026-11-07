import Keranjang, { type CartItem } from "@/components/Keranjang";

/* Data contoh. Ganti dengan data keranjang asli kalau sudah ada. */
const items: CartItem[] = [
  {
    id: "harum-manis",
    name: "Mangga Harum-Manis",
    price: 20000,
    supplier: "Supplier Mangga A",
    address: "Indramayu, Jawa Barat",
    image: "/images/manggaHarumManis.png",
    qty: 10,
    unit: "Kg",
  },
  {
    id: "manalagi",
    name: "Mangga Manalagi",
    price: 22000,
    supplier: "Supplier Mangga B",
    address: "Majalengka, Jawa Barat",
    image: "/images/manggaManalagi.png",
    qty: 5,
    unit: "Kg",
  },
  {
    id: "gedong-gincu",
    name: "Mangga Gedong-Gincu",
    price: 52000,
    supplier: "Supplier Mangga C",
    address: "Cirebon, Jawa Barat",
    image: "/images/manggaGedongGincu.png",
    qty: 3,
    unit: "Kg",
  },
];

export default function KeranjangPage() {
  return (
    <main>
      <Keranjang initialItems={items} />
    </main>
  );
}