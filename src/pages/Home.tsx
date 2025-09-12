import React, { useEffect, useRef, useState } from "react";
import {
  Store, Search, Bell, MapPin,
  ChevronLeft, ChevronRight, ChevronRight as ArrowRight,
  Home as HomeIcon, Grid2X2, ShoppingCart, User, Plus
} from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import { getFeaturedProducts } from "../services/products";

/* ===== Banner data ===== */
type Banner = { id: string; title: string; subtitle: string; cta: string; href?: string; image: string; date?: string };
const BANNERS: Banner[] = [
  { id: "kopi",    title: "Festival Kopi Semende",    subtitle: "Diskon 20% minggu ini", cta: "Belanja Kopi",    href: "/product/kopi-semendo",  image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&h=560&q=70", date: "Minggu ini" },
  { id: "kemplang",title: "Paket Kemplang Hemat",     subtitle: "Bundling khas Sumsel",  cta: "Lihat Paket",     image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&h=560&q=70", date: "Terbatas" },
  { id: "purun",   title: "Anyaman Purun Lokal",      subtitle: "Edisi UMKM Muara Enim", cta: "Cek Kerajinan",   image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&h=560&q=70", date: "Edisi Lokal" },
];

/* ===== Tiny UI pieces ===== */
function CategoryTabs() {
  const tabs = ["Kopi", "Snack", "Minuman", "Kerajinan"];
  const [active] = useState(0);
  return (
    <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
      {tabs.map((t, i) => (
        <button
          key={t}
          className={[
            "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium border",
            i === active
              ? "bg-blue-50 text-blue-700 border-blue-200"
              : "bg-white text-slate-700 border-slate-200"
          ].join(" ")}
        >
          {t}
        </button>
      ))}
    </div>
  );
}

function SearchBar() {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <MapPin className="h-3.5 w-3.5" /> Muara Enim
        </span>
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            placeholder="Search products…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[13px] outline-none focus:bg-white"
          />
        </div>
        <button className="rounded-xl p-2 bg-white border border-slate-200 hover:bg-slate-50">
          <Bell className="h-5 w-5 text-slate-700" />
        </button>
      </div>
      <CategoryTabs />
    </div>
  );
}

function BannerCarousel() {
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);
  const goto = (n: number) => setI((n + BANNERS.length) % BANNERS.length);
  const prev = () => goto(i - 1);
  const next = () => goto(i + 1);
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchX.current = null;
  };

  return (
    <section className="mt-4">
      <div className="relative overflow-hidden rounded-3xl h-48 border border-slate-100 bg-white">
        <div
          className="whitespace-nowrap h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {BANNERS.map((b) => (
            <div key={b.id} className="inline-block w-full h-full relative align-top">
              <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute left-4 right-4 bottom-4 text-white">
                <div className="text-[11px] opacity-90">{b.date}</div>
                <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                <p className="text-xs opacity-90">{b.subtitle}</p>
                <Link
                  to={b.href || "#"}
                  className="mt-2 inline-flex items-center gap-1 rounded-full bg-white text-slate-900 px-3 py-1.5 text-xs font-semibold"
                >
                  {b.cta} <ArrowRight className="h-3.5 w-3.5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        <button
          onClick={prev}
          className="absolute left-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white text-slate-900 shadow border border-slate-200"
          aria-label="Sebelumnya"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          onClick={next}
          className="absolute right-2 top-1/2 -translate-y-1/2 h-8 w-8 grid place-items-center rounded-full bg-white text-slate-900 shadow border border-slate-200"
          aria-label="Berikutnya"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

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

function BottomDock() {
  return (
    <div className="fixed bottom-0 inset-x-0 z-40">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 pb-3">
        <div className="relative bg-white/95 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_6px_24px_rgba(15,23,42,0.12)] px-5 py-2">
          <div className="flex items-center justify-between text-slate-700 text-xs">
            <Link to="/" className="flex flex-col items-center gap-1 py-2">
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>
            <Link to="/Etalase" className="flex flex-col items-center gap-1 py-2">
              <Grid2X2 className="h-5 w-5" />
              <span>Explore</span>
            </Link>

            <div className="w-14" />

            <Link to="/cart" className="flex flex-col items-center gap-1 py-2">
              <ShoppingCart className="h-5 w-5" />
              <span>Cart</span>
            </Link>
            <Link to="/profile" className="flex flex-col items-center gap-1 py-2">
              <User className="h-5 w-5" />
              <span>Profile</span>
            </Link>
          </div>

          <button
            className="absolute left-1/2 -translate-x-1/2 -top-6 h-12 w-12 rounded-full grid place-items-center text-white shadow-lg bg-blue-600"
            aria-label="Tambah"
          >
            <Plus className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>
  );
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  useEffect(() => { getFeaturedProducts().then(setProducts); }, []);

  return (
    <>
      <header className="sticky top-0 z-20 bg-[#F6F8FC] bg-gradient-to-b from-white to-[#F6F8FC]">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-blue-50 border border-blue-100">
              <Store className="h-5 w-5 text-blue-700" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] text-slate-500">Ecosera</p>
              <p className="font-semibold text-slate-900">Jelajahi produk lokal</p>
            </div>
          </div>
          <button className="rounded-xl p-2 bg-white border border-slate-200 hover:bg-slate-50">
            <Bell className="h-5 w-5 text-slate-700" />
          </button>
        </div>
      </header>

      <main className="px-4 pb-28 pt-3 max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-[#F6F8FC]">
        <SearchBar />
        <BannerCarousel />

        <div className="flex items-center justify-between mt-5 mb-2">
          <h3 className="font-semibold text-slate-900">Most Popular</h3>
          <Link to="/Etalase" className="text-sm text-blue-600 font-medium">See All</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {products.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </main>

      <BottomDock />
    </>
  );
}
