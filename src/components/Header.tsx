import { Search } from "lucide-react";
import { useNavigate, useSearchParams } from "react-router-dom";

export default function Header() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const initialQuery = searchParams.get("q") || "";

  return (
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

          {/* Search Bar Row */}
          <div className="px-4 pb-3 flex items-center gap-3 relative">
            <div
              className="relative flex-1 cursor-text"
              onClick={() => navigate('/search')}
            >
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                <Search className="h-4 w-4 text-slate-500" />
              </div>
              <input
                type="text"
                placeholder="Cari produk, kategori, atau merek..."
                defaultValue={initialQuery}
                readOnly
                className="w-full pl-10 pr-4 py-2.5 bg-white/90 backdrop-blur-sm border border-white/20 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-white/30 focus:border-transparent relative z-0 cursor-text pointer-events-none"
              />
            </div>
          </div>
        </div>
      </header>
    </div>
  );
}
