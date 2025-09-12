// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Store, ShoppingCart, User } from "lucide-react";
import { useCart } from "../context/CartContext";

export default function Navbar() {
  const { pathname } = useLocation();
  const { items } = useCart(); // pastikan useCart() expose items atau totalQuantity
  const totalQty = items?.reduce((sum, it) => sum + it.qty, 0) || 0;

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/etalase", icon: Store, label: "Etalase" },
    { to: "/cart", icon: ShoppingCart, label: "Keranjang", badge: totalQty },
    { to: "/account", icon: User, label: "Akun" },
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl flex justify-around">
        {navItems.map(({ to, icon: Icon, label, badge }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`relative flex flex-col items-center justify-center flex-1 py-2 transition ${
                active ? "text-primary font-semibold" : "text-slate-500"
              }`}
            >
              <div className="relative">
                <Icon className={`h-5 w-5 mb-1 ${active ? "stroke-[2.5]" : ""}`} />
                {badge ? (
                  <span className="absolute -top-1.5 -right-2 rounded-full bg-red-500 text-white text-[10px] font-bold px-1.5 min-w-[16px] h-[16px] flex items-center justify-center leading-none">
                    {badge > 99 ? "99+" : badge}
                  </span>
                ) : null}
              </div>
              <span className="text-[11px]">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
