
// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  Package,
  Minus,
  Plus,
  ShoppingCart,
  Share2,
  Heart,
  ArrowLeft,
} from "lucide-react";

import type { Product } from "../types/product";
import { getProductById } from "../services/products";
import { money } from "../utils/money";
import { SHOP_NAME } from "../utils/env";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addToCart } = useCart();
  const { show } = useToast();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [qty, setQty] = useState(1);
  const [isFav, setIsFav] = useState(false);

  // Load data
  useEffect(() => {
    let alive = true;
    setLoading(true);
    setErr(null);
    (async () => {
      try {
        if (!id) throw new Error("ID produk tidak valid");
        const p = await getProductById(id);
        if (!alive) return;
        setData(p ?? null);
      } catch (e: any) {
        if (alive) setErr(e?.message || "Gagal memuat produk");
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // Handle favorite state
  useEffect(() => {
    if (!id) return;
    const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
    setIsFav(Boolean(favs[id]));
  }, [id]);

  const product = data;
  const total = (product?.price ?? 0) * qty;

  function toggleFavorite() {
    if (!id || !product) return;
    const favs = JSON.parse(localStorage.getItem("favorites") || "{}");
    const next = !favs[id];
    favs[id] = next;
    if (!next) delete favs[id];
    localStorage.setItem("favorites", JSON.stringify(favs));
    setIsFav(next);
    show(next ? "Ditambahkan ke Favorit ❤️" : "Dihapus dari Favorit 💔");
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat...
      </div>
    );
  }

  if (err || !product) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-3">
            {err ? `Terjadi kesalahan: ${err}` : "Produk tidak ditemukan."}
          </p>
          <div className="flex gap-2 justify-center">
            <button onClick={() => nav(-1)} className="px-4 py-2 rounded-lg bg-primary text-white">
              Kembali
            </button>
            <Link to="/" className="px-4 py-2 rounded-lg border border-slate-200">
              Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-ink pb-40">
      {/* Back Button */}
      <div className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 py-3 flex items-center justify-between">
          <button
            onClick={() => nav(-1)}
            className="rounded-xl p-2 border border-black/10 bg-white"
            aria-label="Kembali"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="font-semibold truncate max-w-[55%] text-center">
            {product.name}
          </div>
          <div className="flex gap-2">
            <button
              onClick={toggleFavorite}
              className={`rounded-xl p-2 border border-black/10 bg-white hover:bg-slate-50 active:scale-95 transition ${isFav ? "text-rose-500" : ""}`}
              aria-label="Favorit"
            >
              <Heart className={`h-5 w-5 ${isFav ? "fill-current" : ""}`} />
            </button>
          </div>
        </div>
      </div>

      {/* Product Media */}
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl p-4">
        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white">
          {product?.thumb ? (
            <img src={product.thumb} alt={product.name} className="w-full h-full object-cover" loading="lazy" />
          ) : (
            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>
      </div>

      {/* Product Info */}
      <main className="max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-bold leading-snug">{product.name}</h1>
            <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
              <Star className="h-4 w-4 text-amber-500" />
              {product.rating} <span>•</span> <span>{product.sold}+ terjual</span>
            </div>
          </div>
        </div>

        <div className="mt-3 flex items-end justify-between">
          <div>
            <p className="text-xs text-slate-600">Harga</p>
            <p className="text-2xl font-extrabold">Rp {money(product.price)}</p>
          </div>

          {/* Stepper */}
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="h-9 w-9 grid place-items-center rounded-lg border border-black/10 bg-white disabled:opacity-40"
              aria-label="Kurangi jumlah"
              disabled={qty <= 1}
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="min-w-10 text-center font-semibold select-none">{qty}</div>
            <button
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="h-9 w-9 grid place-items-center rounded-lg border border-black/10 bg-white"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Product Description */}
        <section className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-4">
          <h2 className="font-semibold">Deskripsi</h2>
          <p className="mt-1 text-sm text-slate-700">{product.description || "Produk UMKM Muara Enim. Bahan pilihan, produksi lokal, cocok untuk oleh-oleh dan kebutuhan harian. Kemasan rapi, siap kirim."}</p>
        </section>

        {/* Total Calculation */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
          <span>Total</span>
          <span className="font-semibold">Rp {money(total)}</span>
        </div>
      </main>

      {/* Sticky Action Bar */}
      <div className="fixed inset-x-0 bottom-0 z-[220] bg-white/90 backdrop-blur-md border-t border-white/60 shadow-[0_-6px_24px_rgba(15,23,42,0.18)]">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 py-3">
          <button
            onClick={() => { addToCart(product, qty); show("Ditambahkan ke keranjang ✅"); }}
            className="h-12 w-full rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
          >
            <ShoppingCart className="h-5 w-5" />
            Tambah ke Keranjang
          </button>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  );
}
