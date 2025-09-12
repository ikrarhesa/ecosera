import React, { useEffect, useMemo, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Search } from "lucide-react";
import ProductCard from "../components/ProductCard";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/products";

export default function Etalase() {
  const nav = useNavigate();
  const [q, setQ] = useState("");
  const [all, setAll] = useState<Product[]>([]);

  React.useEffect(() => { getAllProducts().then(setAll); }, []);

  const list = useMemo(() => {
    if (!q.trim()) return all;
    const s = q.toLowerCase();
    return all.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.id.toLowerCase().includes(s) ||
        (p.tags?.some((t) => t.toLowerCase().includes(s)) ?? false)
    );
  }, [q, all]);

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
          <Link to="/" className="text-sm text-blue-600 font-medium">Home</Link>
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
