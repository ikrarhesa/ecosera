import React from "react";
import { Search as SearchIcon, ArrowLeft, Store } from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import type { Product } from "../../types/product";
import { UI } from "../../config/ui";

interface SearchHeaderProps {
  localQuery: string;
  setLocalQuery: (q: string) => void;
  isFocused: boolean;
  setIsFocused: (f: boolean) => void;
  handleSearchSubmit: (e: React.FormEvent) => void;
  suggestions: Product[];
  setShowFilters: (s: boolean) => void;
}

export const SearchHeader: React.FC<SearchHeaderProps> = ({
  localQuery,
  setLocalQuery,
  isFocused,
  setIsFocused,
  handleSearchSubmit,
  suggestions,
  setShowFilters,
}) => {
  const navigate = useNavigate();
  const containerRef = React.useRef<HTMLFormElement>(null);

  // Close suggestions when clicking outside
  React.useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setIsFocused]);

  return (
    <div className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl z-50 bg-white border-b border-slate-200 shadow-sm">
      <div className="px-4 pb-2 flex items-center gap-3 pt-[calc(12px+env(safe-area-inset-top))]">
        <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100">
          <ArrowLeft className="h-5 w-5" />
        </button>

        <form ref={containerRef} onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
          <div className="relative flex-1">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
              <SearchIcon className="h-4 w-4 text-slate-400" />
            </div>
            <input
              type="text"
              placeholder="Cari produk..."
              value={localQuery}
              onFocus={() => setIsFocused(true)}
              onChange={(e) => {
                setLocalQuery(e.target.value);
                setIsFocused(true);
              }}
              autoFocus
              className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-base placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-0"
              style={{ caretColor: UI.BRAND.PRIMARY }}
            />

            {/* Suggestions Dropdown */}
            {isFocused && localQuery.trim().length > 0 && suggestions.length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[100]">
                <div className="py-2">
                  {suggestions.map(product => (
                    <Link
                      key={product.id}
                      to={`/product/${product.slug || product.id}`}
                      className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                      onClick={() => setIsFocused(false)}
                    >
                      <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                        <img
                          src={product.image || UI.PLACEHOLDER}
                          alt={product.name}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-medium text-slate-900 truncate">{product.name}</h4>
                        <div className="flex items-center gap-2 mt-0.5">
                          <span className="text-xs font-semibold" style={{ color: UI.BRAND.PRIMARY }}>
                            Rp {product.price.toLocaleString("id-ID")}
                          </span>
                          {product.sellerName && (
                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate border-l border-slate-300 pl-2">
                              <Store className="h-3 w-3 shrink-0" /> {product.sellerName}
                            </span>
                          )}
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              </div>
            )}
          </div>
        </form>

        <button
          onClick={() => setShowFilters(true)}
          className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
        >
          <svg className="h-5 w-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="4" y1="21" x2="4" y2="14" />
            <line x1="4" y1="10" x2="4" y2="3" />
            <line x1="12" y1="21" x2="12" y2="12" />
            <line x1="12" y1="8" x2="12" y2="3" />
            <line x1="20" y1="21" x2="20" y2="16" />
            <line x1="20" y1="12" x2="20" y2="3" />
            <line x1="1" y1="14" x2="7" y2="14" />
            <line x1="9" y1="8" x2="15" y2="8" />
            <line x1="17" y1="16" x2="23" y2="16" />
          </svg>
        </button>
      </div>
    </div>
  );
};
