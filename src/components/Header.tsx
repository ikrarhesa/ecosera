<<<<<<< HEAD
import React from "react";
import { Search, MessageCircle, Filter } from "lucide-react";
=======
import { FormEvent, useState, useRef, useEffect } from "react";
import { Search, Filter, Store } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { money } from "../utils/money";
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a

interface HeaderProps {
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

<<<<<<< HEAD
export default function Header({ 
  searchQuery = "", 
  onSearchChange,
  showFilter = false,
  onFilterClick 
}: HeaderProps) {
  return (
    <div className="sticky top-0 z-20">
      <header 
        className="w-full relative overflow-hidden" 
=======
export default function Header({
  searchQuery = "",
  onSearchChange,
  showFilter = false,
  onFilterClick
}: HeaderProps) {
  const navigate = useNavigate();
  const { products } = useProducts();
  const [isFocused, setIsFocused] = useState(false);
  const containerRef = useRef<HTMLFormElement>(null);

  // Close suggestions when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsFocused(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchSubmit = (e: FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      setIsFocused(false);
      navigate(`/search?q=${encodeURIComponent(searchQuery)}`);
    }
  };

  // Compute suggestions
  const suggestions = searchQuery.trim()
    ? products.filter(p =>
      p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.category || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
      (p.sellerName && p.sellerName.toLowerCase().includes(searchQuery.toLowerCase()))
    ).slice(0, 5) // Show top 5 suggestions
    : [];

  return (
    <div className="sticky top-0 z-20">
      <header
        className="w-full relative overflow-hidden"
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
        style={{
          background: 'linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)'
        }}
      >
        {/* Pattern Background */}
<<<<<<< HEAD
        <div 
=======
        <div
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
          className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url("/images/header-pattern.svg")',
            backgroundSize: '50%'
          }}
        />
        {/* Content Layer */}
        <div className="relative z-10">
          <div className="px-4 pt-3 pb-2 flex items-center justify-between">
            <div className="flex items-center gap-3">
<<<<<<< HEAD
              <img 
                src="/images/ecosera-logo.svg" 
                alt="Ecosera Logo" 
=======
              <img
                src="/images/ecosera-logo.svg"
                alt="Ecosera Logo"
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
                className="h-10 w-auto"
              />
            </div>
          </div>
<<<<<<< HEAD
          
          {/* Search Bar and Chat Icon Row */}
          <div className="px-4 pb-3 flex items-center gap-3">
=======

          {/* Search Bar Row */}
          <form ref={containerRef} onSubmit={handleSearchSubmit} className="px-4 pb-3 flex items-center gap-3 relative">
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
            <div className="relative flex-1">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Cari produk, kategori, atau merek..."
                value={searchQuery}
<<<<<<< HEAD
                onChange={(e) => onSearchChange?.(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent relative z-0"
              />
            </div>
            
            {/* Filter Icon - only show when searching */}
            {showFilter && (
              <button 
=======
                onFocus={() => setIsFocused(true)}
                onChange={(e) => {
                  onSearchChange?.(e.target.value);
                  setIsFocused(true);
                }}
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent relative z-0"
              />

              {/* Suggestions Dropdown */}
              {isFocused && searchQuery.trim().length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-xl border border-slate-100 overflow-hidden z-[100] max-h-[60vh] overflow-y-auto">
                  {suggestions.length > 0 ? (
                    <div className="py-2">
                      <div className="px-4 py-1.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                        Saran Pencarian
                      </div>
                      {suggestions.map(product => (
                        <Link
                          key={product.id}
                          to={`/product/${product.slug || product.id}`}
                          onClick={() => {
                            setIsFocused(false);
                            onSearchChange?.(product.name);
                          }}
                          className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                        >
                          <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                            <img
                              src={product.image || "https://placehold.co/800x800/png?text=Ecosera"}
                              alt={product.name}
                              className="w-full h-full object-cover"
                            />
                          </div>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-slate-900 truncate">{product.name}</h4>
                            <div className="flex items-center gap-2 mt-0.5">
                              <span className="text-xs font-semibold text-blue-600">Rp {money(product.price)}</span>
                              {product.sellerName && (
                                <span className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate border-l border-slate-300 pl-2">
                                  <Store className="h-3 w-3 shrink-0" /> {product.sellerName}
                                </span>
                              )}
                            </div>
                          </div>
                        </Link>
                      ))}

                      <button
                        type="submit"
                        className="w-full text-center py-2.5 text-sm text-blue-600 font-medium hover:bg-blue-50 border-t border-slate-100 mt-1"
                      >
                        Lihat semua hasil untuk "{searchQuery}"
                      </button>
                    </div>
                  ) : (
                    <div className="p-4 text-center text-sm text-slate-500">
                      Tidak ditemukan hasil untuk "{searchQuery}"
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Filter Icon - only show when searching */}
            {showFilter && (
              <button
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
                onClick={onFilterClick}
                className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
              >
                <Filter className="h-5 w-5 text-white" />
              </button>
            )}
<<<<<<< HEAD
            
            {/* Chat Icon */}
            <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
              <MessageCircle className="h-5 w-5 text-white" />
            </button>
          </div>
=======
          </form>
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
        </div>
      </header>
    </div>
  );
}
