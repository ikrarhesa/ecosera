// src/pages/Home.tsx
import React, { useState, useRef, useMemo } from "react";
import {
  Store, Search, Bell, Star, Filter, ChevronDown,
  ChevronRight as ArrowRight
} from "lucide-react";
import { Link } from "react-router-dom";
import Navbar from "../components/Navbar";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/products";

/* ===== Helpers ===== */
const money = (n: number) => n.toLocaleString("id-ID");
const img = (q: string, w = 1400, h = 560) =>
  // ukuran fix biar stabil
  `https://images.unsplash.com/photo-155${Math.floor(Math.random()*9)}?auto=format&fit=crop&w=${w}&h=${h}&q=70&ixlib=rb-4.0.3&${encodeURIComponent(q)}`;

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

/* ===== Banner data (full-width slider) ===== */
type Banner = { id: string; title: string; subtitle: string; cta: string; href?: string; image: string };
const BANNERS: Banner[] = [
  { id: "kopi",    title: "Festival Kopi Semendo",    subtitle: "Diskon 20% minggu ini", cta: "Belanja Kopi",    href: "/product/kopi-semendo-250g",  image: "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "kemplang",title: "Paket Kemplang Hemat",     subtitle: "Bundling khas Sumsel",  cta: "Lihat Paket",     image: "https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "purun",   title: "Anyaman Purun Lokal",      subtitle: "Edisi UMKM Muara Enim", cta: "Cek Kerajinan",   image: "https://images.unsplash.com/photo-1542744173-8e7e53415bb0?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "gula",    title: "Gula Aren Semendo",        subtitle: "Manis alami tanpa pengawet", cta: "Coba Sekarang", image: "https://images.unsplash.com/photo-1519681393784-d120267933ba?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "batik",   title: "Batik Kujur Muara Enim",   subtitle: "Koleksi batik tradisional", cta: "Lihat Koleksi", image: "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&w=1400&h=560&q=70" },
  { id: "serai",   title: "Minyak Serai Wangi",       subtitle: "Aromaterapi & segar",   cta: "Beli Serai",      image: "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=1400&h=560&q=70" },
];


/* ===== Carousel Banner ===== */
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
    <section className="mt-1">
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
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");
  const [distance, setDistance] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);
  const [products, setProducts] = useState<Product[]>([]);

  // Load products from service
  React.useEffect(() => {
    getAllProducts().then(setProducts);
  }, []);

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
        product.description.toLowerCase().includes(query) ||
        product.tags?.some(tag => tag.toLowerCase().includes(query)) ||
        product.sellerName.toLowerCase().includes(query)
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

  return (
    <>
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilter={searchQuery.trim().length > 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />
      
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <main className="px-4 pt-1 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {/* Banner carousel */}
          <BannerCarousel />

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
                  className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition-colors whitespace-nowrap ${
                    selectedCategory === category.id
                      ? "bg-blue-600 text-white"
                      : "bg-white text-slate-600 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {category.name}
                  {category.count > 0 && (
                    <span className={`ml-1 px-1.5 py-0.5 rounded-full text-xs ${
                      selectedCategory === category.id
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

          {/* Advanced Filters - Only show when searching */}
          {searchQuery.trim().length > 0 && showFilters && (
            <div className="mb-4 p-4 bg-white rounded-xl border border-slate-200 space-y-4">
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-slate-900">Filter Hasil Pencarian</h4>
                <button
                  onClick={() => setShowFilters(false)}
                  className="text-slate-400 hover:text-slate-600"
                >
                  ×
                </button>
              </div>
              
              {/* Sort Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Urutkan</label>
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                >
                  {SORT_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Distance Options */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Jarak</label>
                <select
                  value={distance}
                  onChange={(e) => setDistance(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                >
                  {DISTANCE_OPTIONS.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Price Range */}
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">Rentang Harga</label>
                <select
                  value={priceRange}
                  onChange={(e) => setPriceRange(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg text-sm focus:ring-2 focus:ring-blue-200 focus:border-transparent"
                >
                  {PRICE_RANGES.map((option) => (
                    <option key={option.id} value={option.id}>
                      {option.name}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          )}

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