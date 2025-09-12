import React, { useEffect, useRef, useState } from "react";
import {
  Store, Search, MapPin,
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
type CategoryKey = "Kopi" | "Snack" | "Minuman" | "Kerajinan";
const CATEGORY_LIST: CategoryKey[] = ["Kopi", "Snack", "Minuman", "Kerajinan"];

function CategoryTabs({
  value,
  onChange,
}: {
  value: CategoryKey | null;
  onChange: (v: CategoryKey | null) => void;
}) {
  return (
    <div className="mt-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
      {CATEGORY_LIST.map((t) => {
        const active = value === t;
        return (
          <button
            key={t}
            onClick={() => onChange(active ? null : t)}
            className={[
              "shrink-0 rounded-full px-3.5 py-1.5 text-[12px] font-medium border transition",
              active
                ? "bg-blue-50 text-blue-700 border-blue-200"
                : "bg-white text-slate-700 border-slate-200 hover:bg-slate-50"
            ].join(" ")}
            aria-pressed={active}
          >
            {t}
          </button>
        );
      })}
    </div>
  );
}

function SearchBar({
  query,
  onQuery,
  category,
  onCategory,
}: {
  query: string;
  onQuery: (v: string) => void;
  category: CategoryKey | null;
  onCategory: (v: CategoryKey | null) => void;
}) {
  return (
    <div className="rounded-3xl bg-white border border-slate-100 p-3">
      <div className="flex items-center gap-2">
        <span className="inline-flex items-center gap-1.5 text-[12px] px-2.5 py-1 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
          <MapPin className="h-3.5 w-3.5" /> Muara Enim
        </span>
        <label className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
          <input
            value={query}
            onChange={(e) => onQuery(e.target.value)}
            placeholder="Cari produk…"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-slate-50 border border-slate-200 text-[13px] outline-none focus:bg-white"
            aria-label="Cari produk"
          />
        </label>
        {/* 🔔 Notification icon DIHAPUS */}
      </div>
      <CategoryTabs value={category} onChange={onCategory} />
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

/* ===== Utils ===== */
const rupiah = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

function slugify(s: string) {
  return s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

/* ProductCard kadang butuh fields tertentu → pastikan ada */
function normalizeProduct(p: any): any {
  const out: any = { ...p };
  if (!out.slug && out.name) out.slug = slugify(out.name);
  if (!out.images) out.images = out.image ? [out.image] : [];
  if (typeof out.price === "string") {
    // coba parse "Rp 25.000" -> 25000
    const parsed = Number(out.price.replace(/[^\d]/g, ""));
    if (!Number.isNaN(parsed)) out.price = parsed;
  }
  if (typeof out.price === "number" && !out.priceText) out.priceText = rupiah(out.price);
  if (!out.thumbnail && out.image) out.thumbnail = out.image;
  if (!out.location) out.location = "Muara Enim";
  return out;
}

/* ===== Helper: filter by query & category (case-insensitive) ===== */
function matches(p: Product, query: string, cat: CategoryKey | null) {
  const q = query.trim().toLowerCase();
  const name = (p as any).name?.toLowerCase?.() || "";
  const category = ((p as any).category || (p as any)?.tags?.[0] || "").toLowerCase();

  const passQuery = q ? name.includes(q) || category.includes(q) : true;
  const passCat = cat ? category === cat.toLowerCase() : true;
  return passQuery && passCat;
}

/* ===== 12 Dummy fallback products (lengkap) ===== */
const FALLBACK_PRODUCTS: Product[] = [
  { id: "d-1",  name: "Kopi Robusta Semende 200g", category: "Kopi",     price: 25000, image: "https://images.unsplash.com/photo-1504630083234-14187a9df0f5?auto=format&fit=crop&w=800&q=70" },
  { id: "d-2",  name: "Kopi Arabica Pagaralam 250g", category: "Kopi",   price: 38000, image: "https://images.unsplash.com/photo-1494314671902-399b18174975?auto=format&fit=crop&w=800&q=70" },
  { id: "d-3",  name: "Keripik Pisang Coklat",       category: "Snack",   price: 16000, image: "https://images.unsplash.com/photo-1589308078053-832e8322b3f1?auto=format&fit=crop&w=800&q=70" },
  { id: "d-4",  name: "Pempek Kapal Selam (isi 5)",  category: "Snack",   price: 45000, image: "https://images.unsplash.com/photo-1589302168068-964664d93dc0?auto=format&fit=crop&w=800&q=70" },
  { id: "d-5",  name: "Es Teh Manis Botan",          category: "Minuman", price: 10000, image: "https://images.unsplash.com/photo-1556679343-c7306c72bcf0?auto=format&fit=crop&w=800&q=70" },
  { id: "d-6",  name: "Jus Jeruk Segar 350ml",       category: "Minuman", price: 14000, image: "https://images.unsplash.com/photo-1488477181946-6428a0291777?auto=format&fit=crop&w=800&q=70" },
  { id: "d-7",  name: "Anyaman Purun Tas Mini",      category: "Kerajinan",price: 75000, image: "https://images.unsplash.com/photo-1612178537255-7b6c7b5f8e4d?auto=format&fit=crop&w=800&q=70" },
  { id: "d-8",  name: "Topi Anyaman Purun",          category: "Kerajinan",price: 60000, image: "https://images.unsplash.com/photo-1542060748-10c28b62716a?auto=format&fit=crop&w=800&q=70" },
  { id: "d-9",  name: "Kemplang Ikan Asli (200g)",   category: "Snack",   price: 28000, image: "https://images.unsplash.com/photo-1565557623262-b51c2513a641?auto=format&fit=crop&w=800&q=70" },
  { id: "d-10", name: "Kopi House Blend 250g",       category: "Kopi",    price: 35000, image: "https://images.unsplash.com/photo-1507133750040-4a8f57021524?auto=format&fit=crop&w=800&q=70" },
  { id: "d-11", name: "Sirup Markisa Lokal",         category: "Minuman", price: 22000, image: "https://images.unsplash.com/photo-1517686469429-8bdb88b9f907?auto=format&fit=crop&w=800&q=70" },
  { id: "d-12", name: "Dompet Anyaman Purun",        category: "Kerajinan",price: 52000, image: "https://images.unsplash.com/photo-1582582429416-7530e7f3d20e?auto=format&fit=crop&w=800&q=70" },
];

/* ===== Build displayed list with fallback (min 6) ===== */
function buildDisplayed(
  real: Product[],
  query: string,
  cat: CategoryKey | null,
  minCount = 6
) {
  const filteredReal = real.filter((p) => matches(p, query, cat));
  if (filteredReal.length >= minCount) return filteredReal;

  const names = new Set(filteredReal.map((p: any) => p.name?.toLowerCase?.()));
  const filteredFallback = FALLBACK_PRODUCTS.filter(
    (p: any) => matches(p, query, cat) && !names.has(p.name?.toLowerCase?.())
  );

  const need = Math.max(0, minCount - filteredReal.length);
  return [...filteredReal, ...filteredFallback.slice(0, need)];
}

export default function Home() {
  const [products, setProducts] = useState<Product[]>([]);
  const [query, setQuery] = useState("");
  const [category, setCategory] = useState<CategoryKey | null>(null);

  useEffect(() => { getFeaturedProducts().then(setProducts); }, []);

  const displayedRaw = buildDisplayed(products, query, category, 6);
  const displayed = displayedRaw.slice(0, 12).map(normalizeProduct);

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
          {/* 🔔 Notification icon DIHAPUS dari header */}
        </div>
      </header>

      <main className="px-4 pb-28 pt-3 max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-[#F6F8FC]">
        <SearchBar
          query={query}
          onQuery={setQuery}
          category={category}
          onCategory={setCategory}
        />

        <BannerCarousel />

        <div className="flex items-center justify-between mt-5 mb-2">
          <h3 className="font-semibold text-slate-900">Most Popular</h3>
          <Link to="/Etalase" className="text-sm text-blue-600 font-medium">See All</Link>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {displayed.map((p: any) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>
      </main>

      <BottomDock />
    </>
  );
}
