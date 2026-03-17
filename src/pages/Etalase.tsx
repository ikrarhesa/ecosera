import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import { useProducts } from "../context/ProductsContext";
import { getSoughtAfterItems, getCachedSoughtAfterItems, SoughtAfterItem } from "../services/soughtAfter";
import { getCategories, getCachedCategories } from "../services/categories";
import { SORT_OPTIONS } from "../hooks/useProductSearch";
import { UI } from "../config/ui";
import { ChevronDown } from "lucide-react";

export default function Etalase() {
  const { products: all, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [sortBy, setSortBy] = useState("default");

  const cachedCats = useMemo(() => getCachedCategories(), []);
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>(cachedCats || []);

  const cachedSoughtAfter = useMemo(() => getCachedSoughtAfterItems(), []);
  const [soughtAfterItems, setSoughtAfterItems] = useState<SoughtAfterItem[]>(cachedSoughtAfter || []);
  const [loadingSoughtAfter, setLoadingSoughtAfter] = useState(!cachedSoughtAfter);
  const [minLoading, setMinLoading] = useState(!cachedSoughtAfter);

  useEffect(() => {
    let timer: any;
    if (minLoading) {
      timer = setTimeout(() => setMinLoading(false), 800);
    }
    return () => timer && clearTimeout(timer);
  }, []);

  useEffect(() => {
    async function fetchSoughtAfter() {
      try {
        if (!cachedSoughtAfter) setLoadingSoughtAfter(true);
        const data = await getSoughtAfterItems();
        setSoughtAfterItems(data);
      } catch (err) {
        console.error("Failed to load sought after items:", err);
      } finally {
        setLoadingSoughtAfter(false);
      }
    }
    fetchSoughtAfter();
  }, []);

  useEffect(() => {
    getCategories().then(data => {
      setDbCategories(data);
    });
  }, []);

  // Filter and sort products based on selected category and sort algorithm
  const filteredProducts = useMemo(() => {
    let filtered = [...all];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.categories?.includes(selectedCategory)
      );
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
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        break;
    }

    return filtered;
  }, [all, selectedCategory, sortBy]);

  return (
    <>
      <div className="min-h-screen bg-[white] pb-28">

        {/* Top Category Strip - Fixed Sort, Scrolling Categories */}
        <div className="bg-white border-b border-slate-200 sticky z-20" style={{ top: 'calc(82px + env(safe-area-inset-top))' }}>
          <div className="flex items-center py-3 pl-5 pr-5 gap-3">
            
            {/* Sort Dropdown (Fixed left) */}
            <div className="shrink-0 relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="appearance-none pl-4 pr-10 py-2 rounded-full text-[13px] font-semibold transition-colors border border-slate-200/50 bg-slate-100/80 text-slate-700 focus:outline-none focus:ring-2 focus:ring-opacity-50"
                style={sortBy !== "default" ? { backgroundColor: `${UI.BRAND.PRIMARY}15`, color: UI.BRAND.PRIMARY, borderColor: UI.BRAND.PRIMARY } : {}}
              >
                {SORT_OPTIONS.map(opt => (
                  <option key={opt.id} value={opt.id} className="text-slate-900 bg-white">{opt.name === "Default" ? "Urutkan" : opt.name}</option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none h-4 w-4 text-slate-500" />
            </div>

            <div className="w-[1px] h-6 bg-slate-200 shrink-0" />

            {/* Scrollable Category Buttons */}
            <div className="flex-1 overflow-x-auto no-scrollbar flex items-center gap-3">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-semibold transition-colors border ${selectedCategory === "all"
                  ? "text-white shadow-sm"
                  : "bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50"
                  }`}
                style={selectedCategory === "all" ? { backgroundColor: UI.BRAND.PRIMARY, borderColor: UI.BRAND.PRIMARY } : {}}
              >
                Semua
              </button>
              {dbCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-[13px] font-semibold transition-colors border ${selectedCategory === cat.id
                    ? "text-white shadow-sm"
                    : "bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50"
                    }`}
                  style={selectedCategory === cat.id ? { backgroundColor: UI.BRAND.PRIMARY, borderColor: UI.BRAND.PRIMARY } : {}}
                >
                  {cat.name}
                </button>
              ))}
              {/* Right padding spacer inside scroll area */}
              <div className="w-1 shrink-0" />
            </div>
          </div>
        </div>

        <main className="px-5 pt-4">
          {/* Sought After Grid - Always visible */}
          {(loadingSoughtAfter || minLoading || soughtAfterItems.filter(item => 
            item.image_url && 
            !item.image_url.includes(UI.PLACEHOLDER) && 
            !item.image_url.includes('placeholder.svg')
          ).length > 0) && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-3 text-lg">Lagi Tren di Ecosera</h3>
              {(loadingSoughtAfter || minLoading) ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] bg-slate-200 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {soughtAfterItems
                    .filter(item => 
                      item.image_url && 
                      !item.image_url.includes(UI.PLACEHOLDER) && 
                      !item.image_url.includes('placeholder.svg')
                    )
                    .slice(0, 6)
                    .map((item) => {
                      const content = (
                        <div className="relative aspect-[4/3] w-20 sm:w-24 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 group shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).style.display = 'none';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent flex items-end">
                            {(item.show_title !== false) && (
                              <span className="text-white font-medium text-[10px] sm:text-xs p-2 truncate w-full tracking-wide">
                                {item.title}
                              </span>
                            )}
                          </div>
                        </div>
                      );

                      return item.link_url ? (
                        <Link key={item.position} to={item.link_url} className="block">
                          {content}
                        </Link>
                      ) : (
                        <div key={item.position}>
                          {content}
                        </div>
                      );
                    })}
                </div>
              )}
            </div>
          )}


          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {loading ? (
                <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              ) : (
                selectedCategory !== "all"
                  ? `${dbCategories.find(c => c.id === selectedCategory)?.name || "Kategori"}`
                  : "Semua Produk"
              )}
            </h3>
            {loading ? (
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            ) : (
              <span className="text-xs text-slate-600">{filteredProducts.length} item</span>
            )}
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
            <div className="grid grid-cols-2 gap-3">
              {filteredProducts.map((p: Product) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}