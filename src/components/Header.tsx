import { Search, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { useCart } from "../context/CartContext";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";
  const { items } = useCart();

  const totalItems = items.reduce((sum, item) => sum + item.qty, 0);

  return (
    <div
      className="sticky top-0 z-50 w-full relative pt-[env(safe-area-inset-top)] bg-[rgba(34,84,197,1)]"
    >
      <header className="w-full relative z-10">
        {/* Content Layer */}
        <div className="relative px-5 pb-5 flex items-center justify-between gap-5 pt-[18px]">
          {/* Logo */}
          <img
            src="/images/favicon.svg"
            alt="Ecosera Logo"
            className="h-8 w-auto flex-shrink-0"
          />

          {/* Search Bar - Walmart Style */}
          <div
            className="flex-[0.85] max-w-[260px] mx-auto cursor-text flex items-center bg-white rounded-full p-1 pl-4"
            onClick={() => navigate('/search')}
          >
            <input
              type="text"
              placeholder="Cari di Ecosera"
              defaultValue={initialQuery}
              readOnly
              className="flex-1 outline-none text-[15px] placeholder-slate-400 text-slate-800 bg-transparent py-1.5 cursor-text pointer-events-none min-w-0"
            />
            <div className="bg-[#041E42] h-9 w-9 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="h-5 w-5 text-white" />
            </div>
          </div>

          {/* Cart Icon - Walmart Style */}
          <button
            className="flex flex-col items-center justify-center relative transition-colors flex-shrink-0"
            onClick={() => navigate('/cart')}
            aria-label="Cart"
          >
            <div className="relative">
              <ShoppingCart size={26} strokeWidth={2} className="text-white" />
              <span className="absolute -top-2 -right-2.5 bg-[#FFC220] text-[#041E42] text-[11px] font-bold h-5 min-w-[20px] flex items-center justify-center rounded-full px-1 border border-[#FFC220]">
                {totalItems}
              </span>
            </div>
          </button>
        </div>
      </header>
    </div>
  );
}
