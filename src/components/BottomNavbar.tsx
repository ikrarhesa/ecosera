import React from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Home as HomeIcon, Package, ShoppingCart, User, Plus } from "lucide-react";

export default function BottomNavbar() {
  const location = useLocation();
  const navigate = useNavigate();
  
  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
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
  );
}
