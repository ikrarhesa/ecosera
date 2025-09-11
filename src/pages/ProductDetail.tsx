// src/pages/ProductDetail.tsx
import { useMemo, useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star, Package, Minus, Plus } from "lucide-react";
import { PRODUCTS } from "./Home";
import { useCart } from "../context/CartContext";
import { useToast } from "../context/ToastContext";

const money = (n: number) => n.toLocaleString("id-ID");

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const product = useMemo(() => PRODUCTS.find((p) => p.id === id), [id]);
  const [qty, setQty] = useState(1);
  const { addToCart } = useCart();
  const price = (product?.price ?? 0) * qty;
  const { show } = useToast();

  useEffect(() => {
    const prev = document.body.style.overflow; document.body.style.overflow = "auto";
    return () => { document.body.style.overflow = prev; };
  }, []);

  if (!product) return (
    <div className="min-h-screen flex items-center justify-center px-4">
      <div className="text-center">
        <p className="text-sm text-slate-600 mb-3">Produk tidak ditemukan.</p>
        <button onClick={() => nav(-1)} className="px-4 py-2 rounded-lg bg-primary text-white">Kembali</button>
      </div>
    </div>
  );

  return (
    <div className="pb-[15rem]">
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b border-black/5">
        <div className="px-4 py-3 flex items-center justify-between">
          <button onClick={() => nav(-1)} className="rounded-xl p-2 border border-black/10 bg-white hover:bg-white" aria-label="Kembali">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="font-semibold truncate max-w-[55%] text-center">{product.name}</div>
          <div className="flex gap-2">
            <button className="rounded-xl p-2 border border-black/10 bg-white hover:bg-white" aria-label="Bagikan"><Share2 className="h-5 w-5" /></button>
            <button className="rounded-xl p-2 border border-black/10 bg-white hover:bg-white" aria-label="Favorit"><Heart className="h-5 w-5" /></button>
          </div>
        </div>
      </header>

      <div className="p-4">
        <div className="aspect-square rounded-2xl bg-gradient-to-br from-primary/15 to-accent/10 grid place-items-center text-primary">
          <Package className="h-16 w-16" />
        </div>
      </div>

      <section id="info" className="px-4 scroll-mt-16">
        <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-4">
          <h1 className="text-lg font-bold leading-snug">{product.name}</h1>
          <div className="mt-1 flex items-center gap-2 text-sm text-slate-600">
            <Star className="h-4 w-4 text-amber-500" /> {product.rating} <span>•</span> <span>{product.sold}+ terjual</span>
          </div>

          <div className="mt-3 flex items-end justify-between">
            <div>
              <p className="text-xs text-slate-600">Harga</p>
              <p className="text-2xl font-extrabold text-ink">Rp {money(product.price)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))} className="h-9 w-9 grid place-items-center rounded-lg border border-black/10 bg-white" aria-label="Kurangi jumlah"><Minus className="h-4 w-4" /></button>
              <div className="min-w-10 text-center font-semibold">{qty}</div>
              <button onClick={() => setQty((q) => q + 1)} className="h-9 w-9 grid place-items-center rounded-lg border border-black/10 bg-white" aria-label="Tambah jumlah"><Plus className="h-4 w-4" /></button>
            </div>
          </div>

          <div className="mt-4">
            <h2 className="font-semibold">Deskripsi</h2>
            <p className="mt-1 text-sm text-slate-700">
              Produk UMKM Muara Enim. Bahan pilihan, produksi lokal, cocok untuk oleh-oleh dan kebutuhan harian.
              Kemasan rapi, siap kirim. (Placeholder — akan di-bind dari data sebenarnya.)
            </p>
          </div>
        </div>
      </section>

      <div
        className="fixed inset-x-0 z-40 pointer-events-none"
        style={{ bottom: "calc(env(safe-area-inset-bottom) + 88px)" }}
      >
        <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
          <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/40 shadow-[0_6px_24px_rgba(15,23,42,0.18)] p-3 pointer-events-auto">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-xs text-slate-600">Total</p>
                <p className="text-xl font-bold">Rp {money(price)}</p>
              </div>
              <button
                      onClick={() => {
                    addToCart(product, qty);
                     show("Ditambahkan ke keranjang ✅");
                      }}
              className="px-5 py-3 rounded-xl bg-primary text-white font-semibold"
                    >
                Tambah ke Keranjang
</button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
