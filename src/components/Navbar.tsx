import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Store, Home as HomeIcon, Grid2X2, ShoppingCart, User, Plus } from "lucide-react";

interface NavbarProps {
  showSearchBar?: boolean;
  children?: React.ReactNode;
}

export default function Navbar({ showSearchBar = false, children }: NavbarProps) {
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
      <header className="sticky top-0 z-20 bg-[#F6F8FC] bg-gradient-to-b from-white to-[#F6F8FC]">
        <div className="px-4 pt-3 pb-2 flex items-center justify-between max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-xl grid place-items-center bg-blue-50 border border-blue-100">
              <Store className="h-5 w-5 text-blue-700" />
            </div>
            <div className="leading-tight">
              <p className="text-[11px] text-slate-500">Ecosera</p>
              <p className="font-semibold text-slate-900">Jelajahi produk lokal</p>
            </div>
          </div>
        </div>
        
        {/* Optional Search Bar */}
        {showSearchBar && children && (
          <div className="px-4 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
            {children}
          </div>
        )}
      </header>

      {/* Bottom Navigation */}
      <div className="fixed bottom-0 inset-x-0 z-40">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 pb-3">
          <div className="relative bg-white/95 backdrop-blur border border-slate-100 rounded-3xl shadow-[0_6px_24px_rgba(15,23,42,0.12)] px-5 py-2">
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
                <Grid2X2 className="h-5 w-5" />
                <span>Explore</span>
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
                <span>Cart</span>
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
