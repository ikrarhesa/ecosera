// src/pages/Home.tsx
import React, { useState, useRef } from "react";
import {
  Store, Search, Bell, Star,
  ChevronLeft, ChevronRight, ChevronRight as ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";

/* ===== Helpers ===== */
const money = (n: number) => n.toLocaleString("id-ID");
const img = (q: string, w = 1400, h = 560) =>
  // ukuran fix biar stabil
  `https://images.unsplash.com/photo-155${Math.floor(Math.random()*9)}?auto=format&fit=crop&w=${w}&h=${h}&q=70&ixlib=rb-4.0.3&${encodeURIComponent(q)}`;

/* ===== Produk (Muara Enim) ===== */
export type Product = {
  id: string; name: string; price: number; rating: number; sold: number; thumb?: string;
};
export const PRODUCTS: Product[] = [
  { id: "kopi-semendo",  name: "Kopi Semendo Robusta 250g", price: 45000, rating: 4.9, sold: 320, thumb: "https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&h=800&q=70" },
  { id: "gula-aren",     name: "Gula Aren Semende 500g",    price: 38000, rating: 4.8, sold: 210, thumb: "https://images.unsplash.com/photo-1560807707-8cc77767d783?auto=format&fit=crop&w=800&h=800&q=70" },
  { id: "kemplang",      name: "Kemplang Panggang 200g",    price: 29000, rating: 4.7, sold: 150, thumb: "https://images.unsplash.com/photo-1504754524776-8f4f37790ca0?auto=format&fit=crop&w=800&h=800&q=70" },
  { id: "anyaman-purun", name: "Keranjang Anyaman Purun",   price: 69000, rating: 4.6, sold: 95,  thumb: "https://images.unsplash.com/photo-1594633313593-bab3825d0caf?auto=format&fit=crop&w=800&h=800&q=70" },
  { id: "dodol-kelapa",  name: "Dodol Kelapa Semende 250g", price: 27000, rating: 4.6, sold: 130, thumb: "https://images.unsplash.com/photo-1534423861386-85a16f5d13fd?auto=format&fit=crop&w=800&h=800&q=70" },
];

/* ===== Banner data (full-width slider) ===== */
type Banner = { id: string; title: string; subtitle: string; cta: string; href?: string; image: string };
const BANNERS: Banner[] = [
  { id: "kopi",    title: "Festival Kopi Semende",    subtitle: "Diskon 20% minggu ini", cta: "Belanja Kopi",    href: "/product/kopi-semendo-250g",  image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "kemplang",title: "Paket Kemplang Hemat",     subtitle: "Bundling khas Sumsel",  cta: "Lihat Paket",     image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "purun",   title: "Anyaman Purun Lokal",      subtitle: "Edisi UMKM Muara Enim", cta: "Cek Kerajinan",   image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "gula",    title: "Gula Aren Semende",        subtitle: "Manis alami tanpa pengawet", cta: "Coba Sekarang", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "serai",   title: "Minyak Serai Wangi",       subtitle: "Aromaterapi & segar",   cta: "Beli Serai",      image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1400&h=560&q=70" },
];

/* ===== UI kecil ===== */
function ProductCard({ p }: { p: Product }) {
  return (
    <Link to={`/product/${p.id}`} className="p-3 rounded-xl bg-white/70 border border-black/10 hover:bg-white">
      <div className="aspect-square rounded-lg overflow-hidden">
        <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" loading="lazy"/>
      </div>
      <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
      <div className="flex items-center gap-1 text-[11px] text-slate-600">
        <Star className="h-3.5 w-3.5 text-amber-500" /> {p.rating} • {p.sold}+ terjual
      </div>
      <div className="mt-1 font-semibold">Rp {money(p.price)}</div>
    </Link>
  );
}

/* ===== Carousel Banner ===== */
function BannerCarousel() {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);

  const goto = (n: number) => setI((prev) => (n + BANNERS.length) % BANNERS.length);
  const prev = () => goto(i - 1);
  const next = () => goto(i + 1);

  // swipe gesture (mobile)
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchX.current = null;
  };

  return (
    <section className="-mx-4 px-4 mb-6">
      <div className="relative overflow-hidden rounded-2xl h-40 md:h-44">
        {/* Track */}
        <div
          className="whitespace-nowrap h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {BANNERS.map((b) => (
            <div key={b.id} className="inline-block align-top w-full h-full relative">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/45" />
              <div className="absolute left-4 right-4 bottom-3 text-white">
                <p className="text-xs opacity-90">{b.subtitle}</p>
                <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                <div className="mt-2 inline-flex items-center gap-1 rounded-lg bg-white/95 text-ink px-3 py-1.5 text-xs font-semibold">
                  {b.cta} <ArrowRight className="h-3.5 w-3.5" />
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Arrows */}
        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white/90 text-ink shadow border border-black/10"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white/90 text-ink shadow border border-black/10"
          aria-label="Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        {/* Dots */}
        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {BANNERS.map((_, idx) => (
            <button
              key={idx}
              onClick={() => goto(idx)}
              aria-label={`Slide ${idx + 1}`}
              className={`h-1.5 rounded-full transition-all ${i === idx ? "w-5 bg-white" : "w-2 bg-white/60"}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}

/* ===== Page ===== */
export default function Home() {
  return (
    <>
      {/* NAVBAR */}
      <header className="sticky top-0 z-20 bg-white/70 backdrop-blur border-b border-black/5">
        <div className="px-4 py-3 flex items-center justify-between max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-primary/15">
              <Store className="h-5 w-5 text-primary" />
            </div>
            <div className="leading-tight">
              <p className="text-xs text-slate-600">Ecosera</p>
              <p className="font-semibold">Etalase UMKM Muara Enim</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="rounded-xl p-2 border border-black/10 bg-white/70 hover:bg-white">
              <Search className="h-5 w-5" />
            </button>
            <button className="rounded-xl p-2 border border-black/10 bg-white/70 hover:bg-white">
              <Bell className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* CONTENT */}
      <main className="px-4 pb-24 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Banner carousel */}
        <BannerCarousel />

        {/* Produk */}
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Rekomendasi</h3>
          <button className="text-sm text-primary">Lihat Semua</button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          {PRODUCTS.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </main>
    </>
  );
}
