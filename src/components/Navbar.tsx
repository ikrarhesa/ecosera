// src/components/Navbar.tsx
import { Link, useLocation } from "react-router-dom";
import { Home, Store, ShoppingCart, User } from "lucide-react";

export default function Navbar() {
  const { pathname } = useLocation();

  const navItems = [
    { to: "/", icon: Home, label: "Home" },
    { to: "/etalase", icon: Store, label: "Etalase" },
    { to: "/cart", icon: ShoppingCart, label: "Keranjang" },
    { to: "/account", icon: User, label: "Akun" }, // optional, nanti bisa bikin page Account
  ];

  return (
    <nav className="fixed bottom-0 inset-x-0 z-50 bg-white border-t border-slate-200">
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl flex justify-around">
        {navItems.map(({ to, icon: Icon, label }) => {
          const active = pathname === to;
          return (
            <Link
              key={to}
              to={to}
              className={`flex flex-col items-center justify-center flex-1 py-2 transition ${
                active ? "text-primary font-semibold" : "text-slate-500"
              }`}
            >
              <Icon className={`h-5 w-5 mb-1 ${active ? "stroke-[2.5]" : ""}`} />
              <span className="text-[11px]">{label}</span>
            </Link>
          );
        })}
      </div>
      <div className="h-[env(safe-area-inset-bottom)]" />
    </nav>
  );
}
