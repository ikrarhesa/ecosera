import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/products";

export default function Etalase() {
  const nav = useNavigate();
  const [all, setAll] = useState<Product[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [sortBy, setSortBy] = useState("default");
  const [priceRange, setPriceRange] = useState("all");
  const [showFilters, setShowFilters] = useState(false);

  useEffect(() => {
    getAllProducts().then(setAll);
  }, []);

  // Filter and sort products based on search and filters
  const filteredProducts = useMemo(() => {
    let filtered = [...all];

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
  }, [all, searchQuery, sortBy, priceRange]);

  return (
    <>
      <Navbar 
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        showFilter={searchQuery.trim().length > 0}
        onFilterClick={() => setShowFilters(!showFilters)}
      />
      
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <main className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
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