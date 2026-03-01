import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import type { Product } from "../types/product";
import { useProducts } from "../context/ProductsContext";
import { getSoughtAfterItems, SoughtAfterItem } from "../services/soughtAfter";
import { supabase } from "../lib/supabase";

export default function Etalase() {
  const { products: all, loading } = useProducts();
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>([]);

  const [soughtAfterItems, setSoughtAfterItems] = useState<SoughtAfterItem[]>([]);
  const [loadingSoughtAfter, setLoadingSoughtAfter] = useState(true);

  useEffect(() => {
    async function fetchSoughtAfter() {
      try {
        setLoadingSoughtAfter(true);
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
    async function fetchCategories() {
      const { data } = await supabase.from("categories").select("*").order("name");
      if (data) {
        setDbCategories(data.map(c => ({ id: c.id, name: c.name })));
      }
    }
    fetchCategories();
  }, []);

  // Filter and sort products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = [...all];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

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

    // Filter by price range
    if (priceRange !== "all") {
      const ranges = {
        "0-50k": { min: 0, max: 50000 },
        "50k-100k": { min: 50000, max: 100000 },
        "100k-200k": { min: 100000, max: 200000 },
        "200k+": { min: 200000, max: Infinity }
      };
      const range = ranges[priceRange as keyof typeof ranges];
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
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        // Keep original order
        break;
    }

    return filtered;
  }, [all, searchQuery, sortBy, priceRange, selectedCategory]);

  if (loading) {
    return (
      <>
        <Navbar
          searchQuery={searchQuery}
          onSearchChange={setSearchQuery}
          showFilter={false}
          onFilterClick={() => { }}
        />
        <div className="min-h-screen bg-[#F6F8FC] pb-28">
          {/* Top Category Strip Skeleton */}
          <div className="bg-white border-b border-slate-200">
            <div className="py-3 px-4 flex gap-3 overflow-hidden">
              <div className="flex-shrink-0 w-20 h-9 bg-slate-200 rounded-full animate-pulse" />
              {[1, 2, 3, 4, 5].map((i) => (
                <div key={i} className="flex-shrink-0 w-24 h-9 bg-slate-200 rounded-full animate-pulse" />
              ))}
            </div>
          </div>

          <main className="px-4 pt-4">
            {/* Sought After Grid Skeleton */}
            <div className="mb-6">
              <div className="h-6 w-48 bg-slate-200 rounded animate-pulse mb-3" />
              <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div key={i} className="aspect-[4/3] bg-slate-200 animate-pulse rounded-xl"></div>
                ))}
              </div>
            </div>

            {/* Grid Header Skeleton */}
            <div className="flex items-center justify-between mb-4">
              <div className="h-5 w-32 bg-slate-200 rounded animate-pulse" />
              <div className="h-4 w-16 bg-slate-200 rounded animate-pulse" />
            </div>

            {/* Grid */}
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
          </main>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilter={searchQuery.trim().length > 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />

      <div className="min-h-screen bg-[#F6F8FC] pb-28">

        {/* Top Category Strip - Hidden when searching */}
        {!searchQuery.trim() && (
          <div className="bg-white border-b border-slate-200">
            <div className="overflow-x-auto no-scrollbar py-3 px-4 flex gap-3 snap-x">
              <button
                onClick={() => setSelectedCategory("all")}
                className={`snap-start shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === "all"
                  ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                  : "bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50"
                  }`}
              >
                Semua
              </button>
              {dbCategories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`snap-start shrink-0 flex items-center justify-center px-4 py-2 rounded-full text-sm font-medium transition-colors border ${selectedCategory === cat.id
                    ? "bg-blue-600 text-white border-blue-600 shadow-sm"
                    : "bg-slate-100/80 hover:bg-blue-50 text-slate-700 hover:text-blue-600 border-slate-200/50"
                    }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        )}

        <main className="px-4 pt-4">
          {/* Sought After Grid - Hidden when searching */}
          {!searchQuery.trim() && (
            <div className="mb-6">
              <h3 className="font-bold text-slate-800 mb-3 text-lg">Lagi Tren di Ecosera</h3>
              {loadingSoughtAfter ? (
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 sm:gap-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="aspect-[4/3] bg-slate-200 animate-pulse rounded-xl"></div>
                  ))}
                </div>
              ) : soughtAfterItems.filter(item => item.image_url && !item.image_url.includes('placeholder.svg')).length > 0 ? (
                <div className="flex flex-wrap gap-2 sm:gap-3">
                  {soughtAfterItems
                    .filter(item => item.image_url && !item.image_url.includes('placeholder.svg'))
                    .slice(0, 6)
                    .map((item) => {
                      const content = (
                        <div className="relative aspect-[4/3] w-20 sm:w-24 rounded-xl overflow-hidden shadow-sm border border-slate-200/60 group shrink-0">
                          <img
                            src={item.image_url}
                            alt={item.title}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                            onError={(e) => {
                              (e.target as HTMLImageElement).src = '/images/placeholder.svg';
                            }}
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/0 to-transparent flex items-end">
                            <span className="text-white font-medium text-[10px] sm:text-xs p-2 truncate w-full tracking-wide">
                              {item.title}
                            </span>
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
              ) : null}
            </div>
          )}

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
                  <option value="default">Default</option>
                  <option value="price-low">Harga Terendah</option>
                  <option value="price-high">Harga Tertinggi</option>
                  <option value="rating">Rating Tertinggi</option>
                  <option value="newest">Terbaru</option>
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
                  <option value="all">Semua Harga</option>
                  <option value="0-50k">Rp 0 - 50k</option>
                  <option value="50k-100k">Rp 50k - 100k</option>
                  <option value="100k-200k">Rp 100k - 200k</option>
                  <option value="200k+">Rp 200k+</option>
                </select>
              </div>
            </div>
          )}

          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">
              {searchQuery.trim()
                ? `Hasil pencarian "${searchQuery}"`
                : selectedCategory !== "all"
                  ? `${dbCategories.find(c => c.id === selectedCategory)?.name || "Kategori"}`
                  : "Semua Produk"
              }
            </h3>
            <span className="text-xs text-slate-600">{filteredProducts.length} item</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {filteredProducts.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>

          {filteredProducts.length === 0 && searchQuery.trim() && (
            <div className="text-center py-8">
              <p className="text-slate-600">Tidak ada hasil untuk "{searchQuery}"</p>
            </div>
          )}
        </main>
      </div>
    </>
  );
}