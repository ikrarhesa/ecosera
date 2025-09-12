import React, { useEffect, useMemo, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, Heart, Share2, Star, MapPin, MessageCircle, ShoppingCart, ShieldCheck, Truck, PackageOpen, Check } from "lucide-react";
import type { Product } from "../types/product";
import { getProductById, getRelatedProducts } from "../services/products";
import { addToCart } from "../services/cart";

const ACCENT = "#2254c5";
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const p = await getProductById(String(id));
      if (!mounted) return;
      setProduct(p);
      setQty(1);
      if (p) {
        const rel = await getRelatedProducts(p.category, p.id, 10);
        setRelated(rel);
      } else {
        setRelated([]);
      }
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

  const outOfStock = useMemo(() => (product?.stock ?? 0) <= 0, [product]);
  const total = useMemo(() => (product ? product.price * qty : 0), [product, qty]);

  const clampQty = (n: number) => {
    const max = product?.stock ?? 1;
    if (n < 1) return 1;
    if (n > max) return max;
    return n;
  };

  const onShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const text = `Cek ${product.name} di Ecosera (${fmtIDR(product.price)}/${product.unit})`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    } else {
      await navigator.clipboard.writeText(url);
      alert("Link disalin ke clipboard ✅");
    }
  };

  const onChatWA = () => {
    if (!product) return;
    const phone = (product.sellerPhone || "").replace(/\D/g, "");
    const text = encodeURIComponent(
      `Halo ${product.sellerName ?? "Seller"}, saya ingin pesan:\n` +
      `• Produk: ${product.name}\n` +
      `• Jumlah: ${qty} ${product.unit}\n` +
      `• Total: ${fmtIDR(total)}\n\n` +
      `Link produk: ${window.location.href}`
    );
    const wa = `https://wa.me/${phone}?text=${text}`;
    window.open(wa, "_blank");
  };

  const onAddToCart = () => {
    if (!product) return;
    addToCart({ product, quantity: qty });
    // Opsional: langsung ke cart
    navigate("/cart");
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-white">
        <div className="p-4">Memuat produk…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-white">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm" style={{ color: ACCENT }}>
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-600">
            <PackageOpen className="inline -mt-1 mr-2" /> Produk tidak ditemukan.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-md min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur px-3 py-3 border-b">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full" aria-label="Back" style={{ color: ACCENT }}>
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => setLiked(v => !v)}
            className={`p-2 rounded-full border ${liked ? "bg-red-50 border-red-200" : "bg-white"}`}
            aria-label="Like"
          >
            <Heart className={liked ? "fill-red-500 stroke-red-500" : ""} />
          </button>
          <button onClick={onShare} className="p-2 rounded-full border bg-white" aria-label="Share">
            <Share2 />
          </button>
        </div>
      </div>

      {/* Gallery */}
      <div className="relative aspect-square w-full overflow-hidden bg-gray-50">
        <img
          src={product.images?.[0] || product.image}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="eager"
        />
        {product.tags?.length ? (
          <div className="absolute left-3 top-3 flex flex-wrap gap-2">
            {product.tags.slice(0, 3).map(t => (
              <span key={t} className="rounded-full bg-white/90 px-2 py-1 text-xs border">
                {t}
              </span>
            ))}
          </div>
        ) : null}
      </div>

      {/* Content */}
      <div className="px-4 pb-32">
        <h1 className="mt-4 text-lg font-semibold">{product.name}</h1>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>{fmtIDR(product.price)}</span>
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>
          <div className="flex items-center gap-1 text-sm text-gray-700">
            <Star className="fill-amber-400 stroke-amber-400" size={16} />
            <span>{product.rating?.toFixed(1) ?? "4.8"}</span>
            <span className="text-gray-400">•</span>
            <span>Stok {product.stock}</span>
          </div>
        </div>

        {/* Seller / Lokasi */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border p-3">
          <div className="flex items-center gap-2">
            <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center font-medium">
              {(product.sellerName ?? "UMKM")[0]}
            </div>
            <div>
              <p className="text-sm font-semibold">{product.sellerName ?? "UMKM Lokal"}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {product.location ?? "Muara Enim, Sumsel"}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Terverifikasi</span>
            <span className="inline-flex items-center gap-1"><Truck size={14} /> COD/Antar</span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="mt-4">
          <h2 className="text-sm font-semibold mb-1">Deskripsi</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description || "Produk lokal berkualitas dari UMKM Ecosera."}
          </p>
        </div>

        {/* Quantity */}
        <div className="mt-5 rounded-2xl border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Jumlah</span>
            <div className="flex items-center gap-2">
              <button
                onClick={() => setQty(q => clampQty(q - 1))}
                className="h-9 w-9 rounded-full border grid place-items-center text-lg"
                aria-label="Kurangi"
              >-</button>
              <input
                type="number"
                inputMode="numeric"
                value={qty}
                onChange={(e) => setQty(clampQty(parseInt(e.target.value || "1", 10)))}
                className="w-14 text-center border rounded-lg py-1"
                min={1}
                max={product.stock}
              />
              <button
                onClick={() => setQty(q => clampQty(q + 1))}
                className="h-9 w-9 rounded-full border grid place-items-center text-lg"
                aria-label="Tambah"
              >+</button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold" style={{ color: ACCENT }}>{fmtIDR(total)}</span>
          </div>

          {outOfStock && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-2 text-amber-700 text-sm">
              Stok habis untuk saat ini.
            </div>
          )}
        </div>

        {/* Keunggulan */}
        <ul className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-700">
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> UMKM lokal</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Kualitas terjamin</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Harga bersaing</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Dukungan Ecosera</li>
        </ul>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Produk Terkait</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {related.map(r => (
                <Link
                  key={r.id}
                  to={`/product/${r.id}`}
                  className="min-w-[160px] rounded-xl border overflow-hidden"
                >
                  <img src={r.image} alt={r.name} className="h-28 w-full object-cover" loading="lazy" />
                  <div className="p-2">
                    <p className="text-xs line-clamp-2">{r.name}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: ACCENT }}>{fmtIDR(r.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Actions */}
      <div className="fixed bottom-0 left-0 right-0 z-30">
        <div className="mx-auto w-full max-w-md border-t bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <button
              onClick={onChatWA}
              className="flex-1 h-11 rounded-xl border inline-flex items-center justify-center gap-2 text-sm font-medium"
              aria-label="Chat via WhatsApp"
            >
              <MessageCircle size={18} /> Chat
            </button>
            <button
              onClick={onAddToCart}
              disabled={outOfStock}
              className={`flex-[2] h-11 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-semibold text-white ${outOfStock ? "opacity-50" : ""}`}
              style={{ backgroundColor: ACCENT }}
              aria-label="Tambahkan ke Keranjang"
            >
              <ShoppingCart size={18} /> Tambah ke Keranjang
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
