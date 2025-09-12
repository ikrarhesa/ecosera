// src/pages/ProductDetail.tsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  Star,
  Package,
  Minus,
  Plus,
  MessageCircle,
  ShoppingCart,
} from "lucide-react";

import type { Product } from "../types/product";
import { getProductById } from "../services/products";
import { money } from "../utils/money";
import { SHOP_WA, SHOP_NAME } from "../utils/env";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

/* ---------- Helpers ---------- */
const safeShopWa = (typeof SHOP_WA === "string" ? SHOP_WA : "") || "";
const buildWaMessage = (p: Product, qty: number) =>
  encodeURIComponent(
    [
      `*${SHOP_NAME || "Toko"}*`,
      "————————————",
      `${p.name}`,
      `Harga: Rp ${money(p.price)}`,
      `Jumlah: ${qty}`,
      "————————————",
      "Saya tertarik. Mohon info ketersediaan & ongkir.",
      "Nama:",
      "Alamat:",
      "Nomor HP:",
    ].join("\n")
  );

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addToCart } = useCart();
  const { show } = useToast();

  const [data, setData] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState<string | null>(null);
  const [qty, setQty] = useState(1);

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        Memuat…
      </div>
    );
  }

  if (err || !data) {
    return (
      <div className="min-h-screen flex items-center justify-center px-4">
        <div className="text-center">
          <p className="text-sm text-slate-600 mb-3">
            {err ? `Terjadi kesalahan: ${err}` : "Produk tidak ditemukan."}
          </p>
          <div className="flex gap-2 justify-center">
            <button
              onClick={() => nav(-1)}
              className="px-4 py-2 rounded-lg bg-primary text-white"
            >
              Kembali
            </button>
            <Link
              to="/"
              className="px-4 py-2 rounded-lg border border-slate-200"
            >
              Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const product = data;
  const total = (product.price ?? 0) * qty;
  const wa =
    safeShopWa
      ? `https://wa.me/${safeShopWa}?text=${buildWaMessage(product, qty)}`
      : `https://wa.me/?text=${buildWaMessage(product, qty)}`;

  return (
    <div className="min-h-screen bg-white text-ink pb-40">
      {/* ===== Media ===== */}
      <div className="mx-auto max-w-md md:max-w-lg lg:max-w-xl p-4">
        <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white">
          {product.thumb ? (
            <img
              src={product.thumb}
              alt={product.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="h-full w-full grid place-items-center bg-gradient-to-br from-primary/15 to-accent/10 text-primary">
              <Package className="h-16 w-16" />
            </div>
          )}
        </div>
      </div>

      {/* ===== Info ===== */}
      <main className="max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4">
        <h1 className="text-lg font-bold leading-snug">{product.name}</h1>
        <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
          <Star className="h-4 w-4 text-amber-500" />
          {product.rating} <span>•</span> <span>{product.sold}+ terjual</span>
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
            <div className="min-w-10 text-center font-semibold select-none">
              {qty}
            </div>
            <button
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="h-9 w-9 grid place-items-center rounded-lg border border-black/10 bg-white"
              aria-label="Tambah jumlah"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Deskripsi */}
        <section className="mt-4 rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-4">
          <h2 className="font-semibold">Deskripsi</h2>
          <p className="mt-1 text-sm text-slate-700">
            {product.description ||
              "Produk UMKM Muara Enim. Bahan pilihan, produksi lokal, cocok untuk oleh-oleh dan kebutuhan harian. Kemasan rapi, siap kirim."}
          </p>
        </section>

        {/* Total ringkas */}
        <div className="mt-4 flex items-center justify-between text-sm text-slate-700">
          <span>Total</span>
          <span className="font-semibold">Rp {money(total)}</span>
        </div>
      </main>

      {/* ===== Sticky Action Bar ===== */}
      <div className="fixed inset-x-0 bottom-0 z-[200] bg-white/95 backdrop-blur border-t border-white/60 shadow-[0_-4px_16px_rgba(0,0,0,0.08)]">
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                addToCart(product, qty);
                show("Ditambahkan ke keranjang ✅");
                if (navigator?.vibrate) navigator.vibrate(10);
              }}
              className="h-12 rounded-xl bg-primary text-white font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <ShoppingCart className="h-5 w-5" />
              Tambah
            </button>
            <a
              href={wa}
              target="_blank"
              rel="noopener noreferrer"
              className="h-12 rounded-xl border font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <MessageCircle className="h-5 w-5" />
              WhatsApp
            </a>
          </div>
          <div className="h-[env(safe-area-inset-bottom)]" />
        </div>
      </div>
    </div>
  );
}
