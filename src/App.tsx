import type { ReactNode } from "react";
import { Routes, Route, Link, useLocation } from "react-router-dom";
import Home from "./pages/Home";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import { Home as HomeIcon, Store, ShoppingCart, User } from "lucide-react";

function Shell({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-mist text-ink">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl">
        {children}
      </div>
    </div>
  );
}

function BottomTab() {
  const { pathname } = useLocation();
  const isHome = pathname === "/";
  const isCart = pathname.startsWith("/cart");

  const baseBtn =
    "flex flex-col items-center justify-center gap-1 py-2 text-[11px] font-medium";

  return (
    <nav className="fixed bottom-0 inset-x-0 z-30 pointer-events-none">
      <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 pb-4">
        <div
          className="rounded-2xl bg-white/70 backdrop-blur border border-white/40 shadow-[0_1px_0_rgba(255,255,255,0.4)_inset,0_8px_24px_rgba(15,23,42,0.12)] p-2 h-[68px] pointer-events-auto"
          style={{ paddingBottom: "calc(env(safe-area-inset-bottom) / 2)" }}
        >
          <div className="grid grid-cols-4 h-full">
            <Link
              to="/"
              className={`${baseBtn} ${
                isHome ? "text-primary" : "text-slate-600 hover:text-primary"
              }`}
              aria-current={isHome ? "page" : undefined}
            >
              <HomeIcon className="h-5 w-5" />
              <span>Home</span>
            </Link>

            <button
              className={`${baseBtn} text-slate-600 hover:text-primary`}
              type="button"
            >
              <Store className="h-5 w-5" />
              <span>Etalase</span>
            </button>

            <Link
              to="/cart"
              className={`${baseBtn} ${
                isCart ? "text-primary" : "text-slate-600 hover:text-primary"
              }`}
              aria-current={isCart ? "page" : undefined}
            >
              <ShoppingCart className="h-5 w-5" />
              <span>Pesanan</span>
            </Link>

            <button
              className={`${baseBtn} text-slate-600 hover:text-primary`}
              type="button"
            >
              <User className="h-5 w-5" />
              <span>Akun</span>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}

export default function App() {
  return (
    <Shell>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/product/:id" element={<ProductDetail />} />
        <Route path="/cart" element={<Cart />} />
      </Routes>
      <BottomTab />
    </Shell>
  );
}
