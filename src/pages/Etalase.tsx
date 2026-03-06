import { useState, useMemo, useEffect } from "react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import type { Product } from "../types/product";
import { useProducts } from "../context/ProductsContext";
import { getSoughtAfterItems, getCachedSoughtAfterItems, SoughtAfterItem } from "../services/soughtAfter";
import { getCategories, getCachedCategories } from "../services/categories";

export default function Etalase() {
  const { products: all, loading } = useProducts();
  const [selectedCategory, setSelectedCategory] = useState("all");

  const cachedCats = useMemo(() => getCachedCategories(), []);
  const [dbCategories, setDbCategories] = useState<{ id: string, name: string }[]>(cachedCats || []);

  const cachedSoughtAfter = useMemo(() => getCachedSoughtAfterItems(), []);
  const [soughtAfterItems, setSoughtAfterItems] = useState<SoughtAfterItem[]>(cachedSoughtAfter || []);
  const [loadingSoughtAfter, setLoadingSoughtAfter] = useState(!cachedSoughtAfter);

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

  // Filter and sort products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = [...all];

    // Filter by category
    if (selectedCategory !== "all") {
      filtered = filtered.filter(product =>
        product.category?.toLowerCase() === selectedCategory.toLowerCase()
      );
    }

    return filtered;
  }, [all, selectedCategory]);

  return (
    <>
      <div className="min-h-screen bg-[#F6F8FC] pb-28">

        {/* Top Category Strip - Always visible */}
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

        <main className="px-4 pt-4">
          {/* Sought After Grid - Always visible */}
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