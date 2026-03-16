import React from "react";
import { UI } from "../../config/ui";
import { SORT_OPTIONS, DISTANCE_OPTIONS, PRICE_RANGES } from "../../hooks/useProductSearch";

interface FilterBottomSheetProps {
  showFilters: boolean;
  setShowFilters: (s: boolean) => void;
  sortBy: string;
  setSortBy: (s: string) => void;
  distance: string;
  setDistance: (d: string) => void;
  priceRange: string;
  setPriceRange: (p: string) => void;
  resetFilters: () => void;
}

export const FilterBottomSheet: React.FC<FilterBottomSheetProps> = ({
  showFilters,
  setShowFilters,
  sortBy,
  setSortBy,
  distance,
  setDistance,
  priceRange,
  setPriceRange,
  resetFilters,
}) => {
  return (
    <>
      {/* Advanced Filters Modal Overlay */}
      <div
        className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
        onClick={() => setShowFilters(false)}
      />

      {/* Advanced Filters Bottom Sheet */}
      <div
        className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "translate-y-0" : "translate-y-full"}`}
      >
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
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                      }`}
                    style={sortBy === option.id ? { borderColor: UI.BRAND.PRIMARY, color: UI.BRAND.PRIMARY, backgroundColor: `${UI.BRAND.PRIMARY}10` } : {}}
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
                        ? "bg-blue-50 text-blue-700 font-medium"
                        : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                      }`}
                    style={distance === option.id ? { borderColor: UI.BRAND.PRIMARY, color: UI.BRAND.PRIMARY, backgroundColor: `${UI.BRAND.PRIMARY}10` } : {}}
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
                        ? "bg-blue-50"
                        : "border-slate-200 bg-white hover:border-blue-200"
                      }`}
                    style={priceRange === option.id ? { borderColor: UI.BRAND.PRIMARY, backgroundColor: `${UI.BRAND.PRIMARY}10` } : {}}
                  >
                    <input
                      type="radio"
                      name="priceRange"
                      value={option.id}
                      checked={priceRange === option.id}
                      onChange={(e) => setPriceRange(e.target.value)}
                      className="w-4 h-4 focus:ring-blue-500"
                      style={{ color: UI.BRAND.PRIMARY }}
                    />
                    <span className={`ml-3 text-sm ${priceRange === option.id ? "font-medium" : "text-slate-700"}`} style={priceRange === option.id ? { color: UI.BRAND.PRIMARY } : {}}>
                      {option.name}
                    </span>
                  </label>
                ))}
              </div>
            </div>
          </div>

          <div className="mt-8 mb-2 gap-3 flex">
            <button
              onClick={resetFilters}
              className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Reset
            </button>
            <button
              onClick={() => setShowFilters(false)}
              className="flex-1 py-3 text-white font-medium rounded-xl transition-colors shadow-sm"
              style={{ backgroundColor: UI.BRAND.PRIMARY }}
            >
              Terapkan Filter
            </button>
          </div>
        </div>
      </div>
    </>
  );
};
