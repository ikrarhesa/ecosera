import React, { useState } from "react";
import { Search as SearchIcon } from "lucide-react";
import ProductCard from "../components/ProductCard";
import { useProductSearch } from "../hooks/useProductSearch";
import { SearchHeader } from "./search/SearchHeader";
import { FilterBottomSheet } from "./search/FilterBottomSheet";
import { analytics } from "../services/analytics";

export default function Search() {
  const {
    localQuery,
    setLocalQuery,
    sortBy,
    setSortBy,
    distance,
    setDistance,
    priceRange,
    setPriceRange,
    filteredProducts,
    suggestions,
    resetFilters,
    applyQuery
  } = useProductSearch();

  const [isFocused, setIsFocused] = useState(false);
  const [showFilters, setShowFilters] = useState(false);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (localQuery.trim()) {
      applyQuery(localQuery);
      setIsFocused(false);
      analytics.search.perform(localQuery, filteredProducts.length);
    }
  };

  return (
    <div className="min-h-screen bg-[white] pb-28">
      <SearchHeader
        localQuery={localQuery}
        setLocalQuery={setLocalQuery}
        isFocused={isFocused}
        setIsFocused={setIsFocused}
        handleSearchSubmit={handleSearchSubmit}
        suggestions={suggestions}
        setShowFilters={setShowFilters}
      />

      {/* Spacer to compensate for fixed header */}
      <div style={{ height: 'calc(72px + env(safe-area-inset-top))' }} />

      <main className="px-4 pt-4">
        {/* Results Info */}
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-semibold text-slate-900">
            {localQuery ? `Hasil pencarian "${localQuery}"` : "Ketik untuk mencari"}
          </h3>
          {localQuery && (
            <span className="text-sm text-slate-600">{filteredProducts.length} produk</span>
          )}
        </div>

        {/* Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {filteredProducts.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>

        {localQuery && filteredProducts.length === 0 && (
          <div className="text-center py-16">
            <SearchIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
            <p className="text-slate-600 font-medium">Tidak ada hasil yang ditemukan</p>
            <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci lain</p>
          </div>
        )}
      </main>

      <FilterBottomSheet
        showFilters={showFilters}
        setShowFilters={setShowFilters}
        sortBy={sortBy}
        setSortBy={setSortBy}
        distance={distance}
        setDistance={setDistance}
        priceRange={priceRange}
        setPriceRange={setPriceRange}
        resetFilters={resetFilters}
      />
    </div>
  );
}
