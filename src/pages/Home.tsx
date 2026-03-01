// src/pages/Home.tsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  ChevronRight as ArrowRight
} from "lucide-react";
import { getActiveBanners, type Banner } from "../services/banners";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";
import PilihanDaerahStripSimple from '../components/PilihanDaerahStripSimple';

/* ===== Helpers ===== */

/* ===== Categories ===== */
const CATEGORIES = [
  { id: "all", name: "Semua", count: 0 },
  { id: "makanan", name: "Makanan", count: 0 },
  { id: "minuman", name: "Minuman", count: 0 },
  { id: "kerajinan", name: "Kerajinan", count: 0 },
  { id: "fashion", name: "Fashion", count: 0 },
  { id: "kopi", name: "Kopi", count: 0 },
  { id: "snack", name: "Snack", count: 0 },
  { id: "sembako", name: "Sembako", count: 0 }
];

/* ===== Sort Options ===== */
const SORT_OPTIONS = [
  { id: "default", name: "Default" },
  { id: "price-low", name: "Harga Terendah" },
  { id: "price-high", name: "Harga Tertinggi" },
  { id: "rating", name: "Rating Tertinggi" },
  { id: "newest", name: "Terbaru" }
];

const DISTANCE_OPTIONS = [
  { id: "all", name: "Semua Jarak" },
  { id: "0-5", name: "0-5 km" },
  { id: "5-10", name: "5-10 km" },
  { id: "10-20", name: "10-20 km" },
  { id: "20+", name: "20+ km" }
];

const PRICE_RANGES = [
  { id: "all", name: "Semua Harga", min: 0, max: Infinity },
  { id: "0-50k", name: "Rp 0 - 50k", min: 0, max: 50000 },
  { id: "50k-100k", name: "Rp 50k - 100k", min: 50000, max: 100000 },
  { id: "100k-200k", name: "Rp 100k - 200k", min: 100000, max: 200000 },
  { id: "200k+", name: "Rp 200k+", min: 200000, max: Infinity }
];

/* ===== Products will be loaded from service ===== */



/* ===== Carousel Banner ===== */
function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>([]);
  const [i, setI] = useState(0);
  const touchX = useRef<number | null>(null);

  useEffect(() => {
    getActiveBanners().then(setBanners).catch(console.error);
  }, []);

  // Autoplay
  useEffect(() => {
    if (banners.length <= 1) return;
    const timer = setInterval(() => {
      setI((prev) => (prev + 1) % banners.length);
    }, 5000);
    return () => clearInterval(timer);
  }, [banners.length]);

  const goto = (n: number) => {
    if (banners.length === 0) return;
    setI((n + banners.length) % banners.length);
  };
  const prev = () => goto(i - 1);
  const next = () => goto(i + 1);
  const onTouchStart = (e: React.TouchEvent) => (touchX.current = e.touches[0].clientX);
  const onTouchEnd = (e: React.TouchEvent) => {
    if (touchX.current == null || banners.length <= 1) return;
    const dx = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(dx) > 40) (dx > 0 ? prev() : next());
    touchX.current = null;
  };

  if (banners.length === 0) return null;

  return (
    <section className="mt-1">
      <div className="relative overflow-hidden rounded-3xl h-48 border border-slate-100 bg-white">
        <div
          className="whitespace-nowrap h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {banners.map((b) => (
            <div key={b.id} className="inline-block w-full h-full relative align-top">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-black/25" />
              <div className="absolute left-4 right-4 bottom-4 text-white">
                <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                {b.link_url && (
                  <a
                    href={b.link_url}
                    target={b.link_url.startsWith('http') ? "_blank" : "_self"}
                    rel="noreferrer"
                    className="mt-2 inline-flex items-center gap-1 rounded-full bg-white text-slate-900 px-3 py-1.5 text-xs font-semibold hover:bg-slate-100 transition-colors"
                  >
                    {b.cta_text || "Lihat Promo"} <ArrowRight className="h-3.5 w-3.5" />
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>

        <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-1.5">
          {banners.length > 1 && banners.map((_, idx) => (
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [distance, setDistance] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const { products } = useProducts();

  // Cart integration
  // (Removed since we don't have handleAddToCart here anymore)

  // Calculate category counts
  const categoriesWithCounts = useMemo(() => {
    return CATEGORIES.map(category => {
      if (category.id === "all") {
        return { ...category, count: products.length };
      }
      const count = products.filter(product => product.category === category.id).length;
      return { ...category, count };
    });
  }, [products]);
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by search query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(query) ||
        (product.description && product.description.toLowerCase().includes(query)) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        (product.sellerName && product.sellerName.toLowerCase().includes(query))
      );
    }

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.category === selectedCategory);
    }

    // Filter by price range
    if (priceRange !== "all") {
      const range = PRICE_RANGES.find(r => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(product =>
          product.price >= range.min && product.price <= range.max
        );
      }
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        // Assuming newer products have higher IDs or we can add a date field
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [products, selectedCategory, sortBy, priceRange, searchQuery]);

  // Analytics event logging
  useEffect(() => {
    const log = (name: string) => (e: any) => {
      console.log(`[analytics] ${name}`, e?.detail ?? {});
    };
    const onView = log('pilihan_view');
    const onTab = log('pilihan_tab_switch');
    const onImp = log('pilihan_impression');
    const onAdd = log('pilihan_click_add');
    const onChat = log('pilihan_click_chat');

    window.addEventListener('pilihan_view', onView as EventListener);
    window.addEventListener('pilihan_tab_switch', onTab as EventListener);
    window.addEventListener('pilihan_impression', onImp as EventListener);
    window.addEventListener('pilihan_click_add', onAdd as EventListener);
    window.addEventListener('pilihan_click_chat', onChat as EventListener);

    return () => {
      window.removeEventListener('pilihan_view', onView as EventListener);
      window.removeEventListener('pilihan_tab_switch', onTab as EventListener);
      window.removeEventListener('pilihan_impression', onImp as EventListener);
      window.removeEventListener('pilihan_click_add', onAdd as EventListener);
      window.removeEventListener('pilihan_click_chat', onChat as EventListener);
    };
  }, []);

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilter={searchQuery.trim().length > 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <main className="px-4 pt-1">
          {/* Banner carousel */}
          <BannerCarousel />

          {/* Pilihan Daerah Strip */}
          <PilihanDaerahStripSimple />

          {/* Category Filters - Horizontal Scrollable */}
          <div className="mb-3 mt-3">
            <div className="flex items-center justify-between mb-2">
              <h3 className="font-semibold">Kategori</h3>
            </div>

            {/* Horizontal scrollable categories */}
            <div className="flex gap-2 overflow-x-auto pb-2 scrollbar-hide">
              {categoriesWithCounts.map((category) => (
                <button
                  key={category.id}
                  onClick={() => setSelectedCategory(category.id)}
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${selectedCategory === category.id
                    ? "bg-blue-600 text-white"
                    : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                    }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${selectedCategory === category.id
                      ? "bg-blue-500 text-white"
                      : "bg-slate-100 text-slate-600"
                      }`}>
                      {category.count}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* Advanced Filters Modal Overlay */}
          <div
            className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "opacity-100" : "opacity-0 pointer-events-none"
              }`}
            onClick={() => setShowFilters(false)}
          />

          {/* Advanced Filters Bottom Sheet */}
          <div
            className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "translate-y-0" : "translate-y-full"
              }`}
          >
            {/* Drag Handle */}
            <div className="flex justify-center pt-3 pb-1" onClick={() => setShowFilters(false)}>
              <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
            </div>

            <div className="p-5 overflow-y-auto max-h-[80vh]">
              <div className="flex items-center justify-between mb-6">
                <h4 className="font-bold text-lg text-slate-900">Filter Pencarian</h4>
                <button
                  onClick={() => setShowFilters(false)}
                  className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                >
                  ×
                </button>
              </div>

              <div className="space-y-6">
                {/* Sort Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Urutkan Berdasarkan</label>
                  <div className="grid grid-cols-2 gap-2">
                    {SORT_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setSortBy(option.id)}
                        className={`py-2.5 px-3 text-sm rounded-xl border text-center transition-colors ${sortBy === option.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                          }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Distance Options */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Jarak Lokasi</label>
                  <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                    {DISTANCE_OPTIONS.map((option) => (
                      <button
                        key={option.id}
                        onClick={() => setDistance(option.id)}
                        className={`py-2 px-3 text-sm rounded-xl border text-center transition-colors ${distance === option.id
                          ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                          : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                          }`}
                      >
                        {option.name}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price Range */}
                <div>
                  <label className="block text-sm font-semibold text-slate-900 mb-3">Rentang Harga</label>
                  <div className="flex flex-col gap-2">
                    {PRICE_RANGES.map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${priceRange === option.id
                          ? "border-blue-500 bg-blue-50"
                          : "border-slate-200 bg-white hover:border-blue-200"
                          }`}
                      >
                        <input
                          type="radio"
                          name="priceRange"
                          value={option.id}
                          checked={priceRange === option.id}
                          onChange={(e) => setPriceRange(e.target.value)}
                          className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                        />
                        <span className={`ml-3 text-sm ${priceRange === option.id ? "text-blue-700 font-medium" : "text-slate-700"}`}>
                          {option.name}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-8 mb-2 gap-3 flex">
                <button
                  onClick={() => {
                    setSortBy("recommended");
                    setDistance("all");
                    setPriceRange("all");
                  }}
                  className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                >
                  Reset
                </button>
                <button
                  onClick={() => setShowFilters(false)}
                  className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-200"
                >
                  Terapkan Filter
                </button>
              </div>
            </div>
          </div>

          {/* Produk */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {searchQuery.trim()
                ? `Hasil pencarian "${searchQuery}"`
                : selectedCategory === "all"
                  ? "Rekomendasi"
                  : categoriesWithCounts.find(c => c.id === selectedCategory)?.name
              }
            </h3>
            <span className="text-sm text-slate-600">{filteredProducts.length} produk</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filteredProducts.length === 0 && (
            <div className="text-center py-8">
              <p className="text-slate-600">Tidak ada produk dalam kategori ini</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}