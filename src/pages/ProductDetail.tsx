// src/pages/ProductDetail.tsx
import React, { useMemo, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
  ChevronLeft,
  ShoppingCart,
  Star,
  MessageCircle,
  Minus,
  Plus,
} from "lucide-react";
import type { Product } from "../types/product";
import { getFeaturedProducts } from "../services/products";

/** ===== Utils: data loader (replace with your real getProductById) ===== */
function getProductById(id: string): Product | undefined {
  // if you already have a real service, import & use it instead
  const all = getFeaturedProducts ? getFeaturedProducts() : [];
  return all.find((p: any) => String(p.id) === String(id));
}

/** ===== Replace with your real cart action ===== */
function addToCart(product: Product, qty: number) {
  // Wire this to your Cart Context/Redux/Supabase as needed.
  // Fallback: simple localStorage cart so the UI works immediately.
  const key = "ecosera_cart";
  const raw = localStorage.getItem(key);
  const items: Array<{ id: string | number; qty: number; product: Product }> =
    raw ? JSON.parse(raw) : [];
  const idx = items.findIndex((it) => String(it.id) === String(product.id));
  if (idx >= 0) items[idx].qty += qty;
  else items.push({ id: product.id!, qty, product });
  localStorage.setItem(key, JSON.stringify(items));
}

const ProductDetail: React.FC = () => {
  const { id = "" } = useParams();
  const navigate = useNavigate();
  const product: Product | undefined = useMemo(
    () => getProductById(id),
    [id]
  );

  const [qty, setQty] = useState(1);
  const [descOpen, setDescOpen] = useState(false);

  if (!product) {
    return (
      <div className="min-h-screen bg-white text-gray-900">
        {/* Top Bar */}
        <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
          <div className="mx-auto max-w-md px-4 h-14 flex items-center gap-3">
            <button
              onClick={() => navigate(-1)}
              aria-label="Kembali"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <div className="font-semibold">Produk tidak ditemukan</div>
          </div>
        </div>
        <div className="mx-auto max-w-md px-4 py-10">
          Maaf, produk ini gak ketemu. Coba kembali ke beranda.
          <div className="mt-4">
            <Link
              to="/"
              className="inline-flex items-center px-4 py-2 rounded-xl bg-blue-600 text-white font-medium"
            >
              Ke Beranda
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const {
    name = "Produk",
    price = 0,
    image,
    rating = 4.7 as any,
    sold = 150 as any,
    description = "Belum ada deskripsi produk. Tanyakan detail ke penjual ya!",
  } = product as any;

  const waText = encodeURIComponent(
    `Halo, saya tertarik dengan ${name}.\n\nLink produk: ${window.location.href}\nJumlah: ${qty}\nApakah tersedia?`
  );
  const waHref = `https://wa.me/?text=${waText}`;

  return (
    <div className="min-h-screen bg-white text-gray-900">
      {/* ===== Top Navbar ===== */}
      <div className="sticky top-0 z-20 bg-white/90 backdrop-blur border-b">
        <div className="mx-auto max-w-md px-4 h-14 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button
              onClick={() => navigate(-1)}
              aria-label="Kembali"
              className="p-2 -ml-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            >
              <ChevronLeft className="h-6 w-6" />
            </button>
            <span className="font-semibold truncate max-w-[12ch]">
              {name}
            </span>
          </div>
          <Link
            to="/cart"
            className="p-2 rounded-xl hover:bg-gray-100 active:scale-95 transition"
            aria-label="Buka Keranjang"
          >
            <ShoppingCart className="h-6 w-6" />
          </Link>
        </div>
      </div>

      {/* ===== Media ===== */}
      <div className="mx-auto max-w-md">
        <div className="aspect-[4/3] bg-gray-100">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={
              image ||
              "https://images.unsplash.com/photo-1509042239860-f550ce710b93?auto=format&fit=crop&w=1200&q=60"
            }
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>
      </div>

      {/* ===== Body ===== */}
      <div className="mx-auto max-w-md px-4 py-4">
        {/* Title & meta */}
        <h1 className="text-xl font-semibold">{name}</h1>

        <div className="mt-1 flex items-center gap-3 text-sm text-gray-600">
          <span className="inline-flex items-center gap-1">
            <Star className="h-4 w-4 fill-amber-400 stroke-amber-400" />
            {Number(rating).toFixed(1)}
          </span>
          <span className="w-1 h-1 rounded-full bg-gray-300" />
          <span>{sold}+ terjual</span>
        </div>

        {/* Price */}
        <div className="mt-3 text-2xl font-bold tracking-tight">
          {new Intl.NumberFormat("id-ID", {
            style: "currency",
            currency: "IDR",
            maximumFractionDigits: 0,
          }).format(Number(price) || 0)}
        </div>

        {/* Quantity stepper */}
        <div className="mt-4">
          <div className="text-sm font-medium mb-2">Jumlah</div>
          <div className="inline-flex items-center rounded-xl border overflow-hidden">
            <button
              className="px-3 py-2 active:scale-95 disabled:opacity-40"
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              disabled={qty <= 1}
              aria-label="Kurangi jumlah"
            >
              <Minus className="h-5 w-5" />
            </button>
            <div className="min-w-12 text-center font-semibold select-none">
              {qty}
            </div>
            <button
              className="px-3 py-2 active:scale-95"
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              aria-label="Tambah jumlah"
            >
              <Plus className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-6 border rounded-2xl overflow-hidden">
          <button
            className="w-full text-left px-4 py-3 font-semibold flex items-center justify-between"
            onClick={() => setDescOpen((v) => !v)}
          >
            Deskripsi
            <span className="text-sm text-gray-500">
              {descOpen ? "Sembunyikan" : "Lihat"}
            </span>
          </button>
          <div
            className={`px-4 pb-4 text-gray-700 text-sm transition-all ${
              descOpen ? "block" : "hidden"
            }`}
          >
            {description}
          </div>
        </div>

        {/* (Opsional) Info pengiriman / catatan */}
        <div className="mt-4 text-xs text-gray-500">
          Estimasi kirim 1–2 hari kerja. Tersedia COD/transfer sesuai toko.
        </div>
      </div>

      {/* ===== Sticky Action Bar ===== */}
      <div className="sticky bottom-0 z-20 bg-white/90 backdrop-blur border-t">
        <div className="mx-auto max-w-md px-4 py-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => {
                addToCart(product, qty);
                // feedback ringan
                if (navigator?.vibrate) navigator.vibrate(10);
              }}
              className="h-12 rounded-xl bg-blue-600 text-white font-semibold active:scale-[0.98] transition"
            >
              Tambah ke Keranjang
            </button>
            <a
              href={waHref}
              target="_blank"
              rel="noreferrer"
              className="h-12 rounded-xl border font-semibold inline-flex items-center justify-center gap-2 active:scale-[0.98] transition"
            >
              <MessageCircle className="h-5 w-5" />
              Tanya via WhatsApp
            </a>
          </div>
          <div className="h-2" />
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
