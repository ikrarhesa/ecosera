import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store, Home as HomeIcon, Package, ShoppingCart, User, Plus, Search, MessageCircle, Filter } from "lucide-react";

interface NavbarProps {
  showSearchBar?: boolean;
  children?: React.ReactNode;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  showFilter?: boolean;
  onFilterClick?: () => void;
}

export default function Navbar({ 
  showSearchBar = false, 
  children, 
  searchQuery = "", 
  onSearchChange,
  showFilter = false,
  onFilterClick 
}: NavbarProps) {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <>
      {/* Top Header */}
      <div className="sticky top-0 z-20">
        <header 
          className="w-full relative overflow-hidden" 
          style={{
            background: 'linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)'
          }}
        >
            {/* Pattern Background */}
            <div 
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
                  <img 
                    src="/images/ecosera-logo.svg" 
                    alt="Ecosera Logo" 
                    className="h-10 w-auto"
                  />
                </div>
              </div>
              
              {/* Search Bar and Chat Icon Row */}
              <div className="px-4 pb-3 flex items-center gap-3">
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                    <Search className="h-4 w-4 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    placeholder="Cari produk, kategori, atau merek..."
                    value={searchQuery}
                    onChange={(e) => onSearchChange?.(e.target.value)}
                    className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent relative z-0"
                  />
                </div>
                
                {/* Filter Icon - only show when searching */}
                {showFilter && (
                  <button 
                    onClick={onFilterClick}
                    className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0"
                  >
                    <Filter className="h-5 w-5 text-white" />
                  </button>
                )}
                
                {/* Chat Icon */}
                <button className="p-2 rounded-lg bg-white/20 hover:bg-white/30 transition-colors flex-shrink-0">
                  <MessageCircle className="h-5 w-5 text-white" />
                </button>
              </div>
            </div>
        </header>
      </div>
        
      {/* Optional Additional Content */}
      {showSearchBar && children && (
        <div className="px-4 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {children}
        </div>
      )}

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 pb-3">
          <div className="relative bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-[0_8px_32px_rgba(15,23,42,0.15)] px-6 py-3">
            <div className="flex items-center justify-between text-slate-700 text-xs">
              <Link 
                to="/" 
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  isActive("/") ? "text-blue-600" : "text-slate-700"
                }`}
              >
                <HomeIcon className="h-5 w-5" />
                <span>Home</span>
              </Link>
              
              <Link 
                to="/etalase" 
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  isActive("/etalase") ? "text-blue-600" : "text-slate-700"
                }`}
              >
                <Package className="h-5 w-5" />
                <span>Etalase</span>
              </Link>

              {/* Central Add Product Button - Inside navbar */}
              <button
                className="h-12 w-12 rounded-full grid place-items-center text-white shadow-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 transition-all duration-200 hover:scale-110"
                aria-label="Tambah Produk"
                onClick={() => navigate("/add-product")}
              >
                <Plus className="h-5 w-5" />
              </button>

              <Link 
                to="/cart" 
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  isActive("/cart") ? "text-blue-600" : "text-slate-700"
                }`}
              >
                <ShoppingCart className="h-5 w-5" />
                <span>Keranjang</span>
              </Link>
              
              <Link 
                to="/profile" 
                className={`flex flex-col items-center gap-1 py-2 transition-colors ${
                  isActive("/profile") ? "text-blue-600" : "text-slate-700"
                }`}
              >
                <User className="h-5 w-5" />
                <span>Profile</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

