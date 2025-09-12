import React, { useState, useMemo } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search, Star } from "lucide-react";
import { PRODUCTS, type Product } from "./Home";

const money = (n: number) => n.toLocaleString("id-ID");

function ProductCard({ p }: { p: Product }) {
  return (
    <Link
      to={`/product/${p.id}`}
      className="p-3 rounded-2xl bg-white border border-slate-100 hover:shadow-sm"
    >
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={p.thumb}
          alt={p.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-[11px] border border-slate-200">
          <Star className="h-3.5 w-3.5 text-amber-500" /> {p.rating}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">
        {p.name}
      </div>
      <div className="text-[11px] text-slate-600">{p.sold}+ terjual</div>
      <div className="mt-1 font-semibold">Rp {money(p.price)}</div>
    </Link>
  );
}

export default function Etalase() {
  const nav = useNavigate();
  const [q, setQ] = useState("");

  const extra: Product[] = [
    {
      id: "serai-wangi",
      name: "Minyak Serai Wangi 100ml",
      price: 35000,
      rating: 4.7,
      sold: 80,
      thumb:
        "https://images.unsplash.com/photo-1526318472351-c75fcf070305?auto=format&fit=crop&w=800&h=800&q=70",
    },
  ];

  const list = useMemo(() => {
    const base = PRODUCTS.concat(extra);
    if (!q.trim()) return base;
    const s = q.toLowerCase();
    return base.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        String(p.price).includes(s) ||
        p.id.toLowerCase().includes(s)
    );
  }, [q]);

  return (
    <div className="min-h-screen bg-[#F6F8FC]">
      <header className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b border-slate-100">
        <div className="px-4 py-3 flex items-center gap-3 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <button
            onClick={() => nav(-1)}
            className="rounded-xl p-2 bg-white border border-slate-200 hover:bg-slate-50 shrink-0"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="flex-1">
            <div className="text-sm font-semibold">Etalase Produk</div>
            <div className="text-[12px] text-slate-600">Produk lokal Muara Enim</div>
          </div>
        </div>
      </header>

      <div className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <label className="relative block">
          <span className="absolute left-3 top-1/2 -translate-y-1/2">
            <Search className="h-4 w-4 text-slate-400" />
          </span>
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Cari produk: kopi, kemplang, purun…"
            className="w-full pl-9 pr-3 py-2.5 rounded-2xl bg-white border border-slate-200 placeholder:text-slate-400 outline-none focus:ring-2 focus:ring-blue-200"
          />
        </label>
      </div>

      <main className="px-4 pb-24 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold text-slate-900">Semua Produk</h3>
          <span className="text-xs text-slate-600">{list.length} item</span>
        </div>

        <div className="grid grid-cols-2 gap-3">
          {list.map((p) => (
            <ProductCard key={p.id} p={p} />
          ))}
        </div>

        {list.length === 0 && (
          <p className="text-slate-600 text-center mt-10">
            Tidak ada hasil untuk &ldquo;{q}&rdquo;.
          </p>
        )}
      </main>
    </div>
  );
}
