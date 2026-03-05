import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Package, Heart } from "lucide-react";

export default function BottomNavbar() {
  const location = useLocation();

  const isActive = (path: string) => {
    if (path === "/" && location.pathname === "/") return true;
    if (path !== "/" && location.pathname.startsWith(path)) return true;
    return false;
  };

  return (
    <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-40 w-full max-w-md md:max-w-lg lg:max-w-xl pb-[env(safe-area-inset-bottom)]">
      <div className="px-4 pb-3 pt-2">
        <div className="relative bg-white/80 backdrop-blur-md border border-white/20 rounded-full shadow-[0_8px_32px_rgba(15,23,42,0.15)] px-6 py-1.5">
          <div className="flex items-center justify-around text-slate-700 text-xs">
            <Link
              to="/"
              className={`flex flex-col items-center gap-1 py-2 transition-colors ${isActive("/") ? "text-blue-600" : "text-slate-700"
                }`}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <Link
              to="/etalase"
              className={`flex flex-col items-center gap-1 py-2 transition-colors ${isActive("/etalase") ? "text-blue-600" : "text-slate-700"
                }`}
            >
              <Package className="h-5 w-5" />
              <span>Etalase</span>
            </Link>

            <Link
              to="/wishlist"
              className={`flex flex-col items-center gap-1 py-2 transition-colors ${isActive("/wishlist") ? "text-blue-600" : "text-slate-700"
                }`}
            >
              <Heart className="h-5 w-5" />
              <span>Favorit</span>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
