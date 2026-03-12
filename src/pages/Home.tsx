// src/pages/Home.tsx
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  ChevronRight as ArrowRight
} from "lucide-react";
import { getActiveBanners, getCachedActiveBanners, type Banner } from "../services/banners";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";
import PilihanDaerahStripSimple from '../components/PilihanDaerahStripSimple';
import { calculateDistance, requestUserLocation } from "../utils/distance";
import { getCategories, getCachedCategories } from "../services/categories";

/* ===== Helpers ===== */

/* ===== Categories will be loaded dynamically ===== */

/* ===== Products will be loaded from service ===== */



/* ===== Carousel Banner ===== */
function BannerCarousel() {
  const [banners, setBanners] = useState<Banner[]>(() => getCachedActiveBanners() || []);
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
      <div className="relative overflow-hidden rounded-lg h-48 border border-slate-100 bg-white">
        <div
          className="whitespace-nowrap h-full transition-transform duration-500 ease-out"
          style={{ transform: `translateX(-${i * 100}%)` }}
          onTouchStart={onTouchStart}
          onTouchEnd={onTouchEnd}
        >
          {banners.map((b) => (
            <div key={b.id} className="inline-block w-full h-full relative align-top">
              <img src={b.image_url} alt={b.title} className="w-full h-full object-cover" />
              <div
                className="absolute inset-x-0 bottom-0 h-[40%]"
                style={{
                  background: `linear-gradient(to top, ${b.overlay_color || (b.text_color === 'navy' ? '#ffffff' : '#000000')}${Math.round((b.overlay_opacity !== undefined ? b.overlay_opacity : 60) * 2.55).toString(16).padStart(2, '0')}, transparent)`
                }}
              />
              <div className={`absolute left-4 right-4 bottom-4 ${b.text_color === 'navy' ? 'text-[#041E42]' : 'text-white'}`}>
                <h3 className="text-lg font-bold leading-tight">{b.title}</h3>
                {b.link_url && (
                  <a
                    href={b.link_url}
                    target={b.link_url.startsWith('http') ? "_blank" : "_self"}
                    rel="noreferrer"
                    className={`mt-2 inline-flex items-center gap-1 rounded-full px-3 py-1.5 text-xs font-semibold transition-colors
                      ${b.text_color === 'navy'
                        ? 'bg-white text-[#041E42] border border-[#041E42] hover:bg-slate-50'
                        : 'bg-white text-slate-900 border border-transparent hover:bg-slate-100'}`}
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
  const [distance, setDistance] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const cachedCats = useMemo(() => getCachedCategories(), []);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>(() => {
    if (cachedCats) return [{ id: "all", name: "Semua" }, ...cachedCats];
    return [{ id: "all", name: "Semua" }];
  });
  const { products, loading } = useProducts();

  useEffect(() => {
    getCategories().then(data => {
      setCategories([{ id: "all", name: "Semua" }, ...data]);
    });
  }, []);

  React.useEffect(() => {
    if (distance !== "all" && !userLocation) {
      requestUserLocation().then(loc => {
        if (loc) setUserLocation(loc);
        else {
          alert("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
          setDistance("all");
        }
      });
    }
  }, [distance, userLocation]);

  // Cart integration
  // (Removed since we don't have handleAddToCart here anymore)

  // Calculate category counts
  const categoriesWithCounts = useMemo(() => {
    return categories.map(category => {
      if (category.id === "all") {
        return { ...category, count: products.length };
      }
      const count = products.filter(product => product.categories?.includes(category.id)).length;
      return { ...category, count };
    });
  }, [products, categories]);
  // Filter and sort products
  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product => product.categories?.includes(selectedCategory));
    }

    // Filter by distance
    if (distance !== "all" && userLocation) {
      let maxDist = Infinity;
      let minDist = 0;
      if (distance === "0-5") { maxDist = 5; }
      else if (distance === "5-10") { minDist = 5; maxDist = 10; }
      else if (distance === "10-20") { minDist = 10; maxDist = 20; }
      else if (distance === "20+") { minDist = 20; }

      filtered = filtered.filter(product => {
        if (product.sellerLat == null || product.sellerLng == null) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, product.sellerLat, product.sellerLng);
        return dist >= minDist && dist <= maxDist;
      });
    }

    return filtered;
  }, [products, selectedCategory, distance, userLocation]);

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
      <div className="min-h-screen bg-[white] pb-28">
        <main className="px-5 pt-1">
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
                  {category.count > 0 && !loading && (
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

          {/* Produk */}
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">
              {loading ? (
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              ) : (
                selectedCategory === "all"
                  ? "Rekomendasi"
                  : categoriesWithCounts.find(c => c.id === selectedCategory)?.name
              )}
            </h3>
          </div>

          {loading ? (
            <div className="grid grid-cols-2 gap-3">
              {[1, 2, 3, 4, 5, 6].map((i) => (
                <div key={i} className="flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-slate-100 animate-pulse">
                  <div className="w-full aspect-square bg-slate-200"></div>
                  <div className="p-3">
                    <div className="h-4 bg-slate-200 rounded w-full mb-2"></div>
                    <div className="h-4 bg-slate-200 rounded w-2/3 mb-3"></div>
                    <div className="h-5 bg-slate-200 rounded w-1/2"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <>
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
            </>
          )}
        </main>
      </div>
    </>
  );
}