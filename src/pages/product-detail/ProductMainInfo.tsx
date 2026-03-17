import React from "react";
import { Star, Heart, Check } from "lucide-react";
import type { Product, ProductVariant } from "../../types/product";
import { formatCurrencyIDR } from "../../utils/format";

interface ProductMainInfoProps {
  product: Product;
  liked: boolean;
  toggleWishlist: (p: Product) => void;
  showToast: (m: string) => void;
  accentColor: string;
  displayRating: string | null;
  reviewsCount: number;
  selectedVariant: ProductVariant | null;
  setSelectedVariant: (v: ProductVariant) => void;
  qty: number;
  setQty: (q: number | ((prev: number) => number)) => void;
  clampQty: (n: number) => number;
  currentPrice: number;
  total: number;
  outOfStock: boolean;
}

export const ProductMainInfo: React.FC<ProductMainInfoProps> = ({
  product,
  liked,
  toggleWishlist,
  showToast,
  accentColor,
  displayRating,
  reviewsCount,
  selectedVariant,
  setSelectedVariant,
  qty,
  setQty,
  clampQty,
  currentPrice,
  total,
  outOfStock
}) => {
  return (
    <>
      <h1 className="mt-4 text-lg font-semibold">{product.name}</h1>

      <div className="flex items-end justify-between">
        <div>
          <div className="mt-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold" style={{ color: accentColor }}>{formatCurrencyIDR(currentPrice)}</span>
              <span className="text-sm text-gray-500">/ {product.unit}</span>
            </div>
          </div>

          <div className="mt-1 flex items-center gap-1 text-sm text-gray-700">
            {displayRating ? (
              <>
                <Star className="fill-amber-400 stroke-amber-400" size={16} />
                <span>{displayRating}</span>
                <span className="text-gray-400">•</span>
                <span>{reviewsCount > 0 ? `${reviewsCount} ulasan` : ((selectedVariant?.stock ?? product.stock) == null ? "Stok tersedia" : `Stok ${selectedVariant?.stock ?? product.stock}`)}</span>
              </>
            ) : (
              <>
                <span className="inline-block px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-white bg-brand-primary rounded-full">Produk Baru</span>
                <span className="text-gray-400">•</span>
                <span>{(selectedVariant?.stock ?? product.stock) == null ? "Stok tersedia" : `Stok ${selectedVariant?.stock ?? product.stock}`}</span>
              </>
            )}
          </div>
        </div>

        <button
          onClick={() => {
            toggleWishlist(product);
            showToast(liked ? "Dihapus dari wishlist" : "Disimpan ke wishlist 💖");
          }}
          className="p-2 mb-1"
          aria-label="Like"
        >
          <Heart
            size={20}
            strokeWidth={1.5}
            className={liked ? "fill-red-500 stroke-red-500" : "text-slate-400 hover:text-red-500 hover:scale-110 active:scale-95 transition-all"}
          />
        </button>
      </div>

      {/* Deskripsi */}
      <div className="mt-4">
        <h2 className="text-sm font-semibold mb-1">Deskripsi</h2>
        <p className="text-sm text-gray-700 leading-relaxed">
          {product.description || "Produk lokal berkualitas dari UMKM Ecosera."}
        </p>
      </div>

      {/* Variants */}
      {product.variants && product.variants.length > 0 && (
        <div className="mt-5">
          <h2 className="text-sm font-semibold mb-2">Pilih Varian</h2>
          <div className="flex flex-wrap gap-2">
            {product.variants.map((v: ProductVariant) => (
              <button
                key={v.id}
                onClick={() => setSelectedVariant(v)}
                className={`px-3 py-1.5 rounded-lg border text-sm font-medium transition-colors ${selectedVariant?.id === v.id ? 'border-brand-primary bg-blue-50 text-blue-700' : 'bg-white border-slate-300 text-slate-700 hover:border-slate-400'}`}
              >
                {v.variant_name}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Quantity */}
      <div className="mt-5 rounded-2xl border p-3">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Jumlah</span>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty(q => clampQty(q - 1))} className="h-9 w-9 rounded-full border grid place-items-center text-lg" aria-label="Kurangi">-</button>
            <input
              type="number" inputMode="numeric" value={qty === 0 ? "" : qty}
              onChange={(e) => setQty(clampQty(parseInt(e.target.value || "0", 10)))}
              className="w-14 text-center border rounded-lg py-1 text-sm"
              min={0} max={(selectedVariant?.stock ?? product.stock) == null ? undefined : Number(selectedVariant?.stock ?? product.stock)}
            />
            <button onClick={() => setQty(q => clampQty(q + 1))} className="h-9 w-9 rounded-full border grid place-items-center text-lg" aria-label="Tambah">+</button>
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <span className="text-sm text-gray-600">Total</span>
          <span className="text-xl font-bold" style={{ color: accentColor }}>{formatCurrencyIDR(total)}</span>
        </div>

        {outOfStock && (
          <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-2 text-amber-700 text-sm">
            Stok habis untuk saat ini.
          </div>
        )}
      </div>

      {/* Keunggulan */}
      <ul className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-700">
        <li className="flex items-center gap-2"><Check size={16} style={{ color: accentColor }} /> UMKM lokal</li>
        <li className="flex items-center gap-2"><Check size={16} style={{ color: accentColor }} /> Kualitas terjamin</li>
        <li className="flex items-center gap-2"><Check size={16} style={{ color: accentColor }} /> Harga bersaing</li>
        <li className="flex items-center gap-2"><Check size={16} style={{ color: accentColor }} /> Dukungan Ecosera</li>
      </ul>
    </>
  );
};
