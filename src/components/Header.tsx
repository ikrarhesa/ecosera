import { Search, ShoppingCart } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
    <div
      className="sticky top-0 z-20 w-full relative overflow-hidden pt-[env(safe-area-inset-top)] bg-[rgba(34,84,197,1)]"
    >
      {/* Pattern Background */}
      <div
        className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat pointer-events-none"
        style={{
          backgroundImage: 'url("/images/header-pattern.svg")',
          backgroundSize: '50%'
        }}
      />
      <header className="w-full relative z-10">
        {/* Content Layer */}
        <div className="relative px-4 pb-[21px] flex items-center gap-3 pt-[17px]">
          {/* Logo */}
          <img
            src="/images/favicon.svg"
            alt="Ecosera Logo"
            className="h-8 w-auto flex-shrink-0"
          />

          {/* Search Bar */}
          <div
            className="flex-1 cursor-text flex items-center bg-white rounded-full p-1 pl-4"
            onClick={() => navigate('/search')}
          >
            <input
              type="text"
              placeholder="Cari di Ecosera"
              defaultValue={initialQuery}
              readOnly
              className="flex-1 outline-none text-sm placeholder-slate-500 bg-transparent py-1.5 cursor-text pointer-events-none"
            />
            <div className="bg-[#0e48a5] p-2 rounded-full flex items-center justify-center flex-shrink-0">
              <Search className="h-4 w-4 text-white" />
            </div>
          </div>

          {/* Cart Icon */}
          <button
            className="p-1.5 rounded-full bg-white/20 text-white flex-shrink-0 relative transition-colors hover:bg-white/30"
            onClick={() => navigate('/cart')}
            aria-label="Cart"
          >
            <ShoppingCart size={20} strokeWidth={2} />
          </button>
        </div>
      </header>
    </div>
  );
}
