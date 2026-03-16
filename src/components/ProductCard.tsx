import { Link } from "react-router-dom";
import { Store, Star, MapPin } from "lucide-react";
import type { Product } from "../types/product";
import { primaryImageOf } from "../services/products";
import { formatCurrencyIDR } from "../utils/format";
import { UI } from "../config/ui";

export default function ProductCard({ product }: { product: Product }) {
  const img = primaryImageOf(product) || UI.PLACEHOLDER;

  return (
    <Link to={`/product/${product.slug || product.id}`} className="p-3 rounded-xl bg-white/70 border border-black/10 hover:bg-white">
      <div className="aspect-square rounded-lg overflow-hidden">
        <img
          src={img}
          alt={product.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/800x800/png?text=Ecosera"; }}
        />
      </div>
      <div className="mt-2">
        <h4 className="font-medium text-sm truncate">{product.name}</h4>

        {/* Shop name with icon */}
        {product.sellerName && (
          <div className="flex items-center gap-1 mt-1 w-full">
            <Store className="h-3 w-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-600 font-medium truncate min-w-0 flex-1">{product.sellerName}</span>
          </div>
        )}

        {/* Rating / "Produk Baru" badge */}
        {product.rating ? (
          <div className="flex items-center gap-1 mt-1">
            <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
            <span className="text-xs text-slate-600">{product.rating}</span>
            {product.sold != null && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">{product.sold} tertarik</span>
              </>
            )}
          </div>
        ) : (
          <div className="flex items-center gap-1 mt-1">
            <span className="inline-block px-1.5 py-px text-[9px] font-semibold tracking-wide text-white bg-blue-600 rounded-[4px]">Produk Baru</span>
            {product.sold != null && (
              <>
                <span className="text-xs text-slate-400">•</span>
                <span className="text-xs text-slate-600">{product.sold} tertarik</span>
              </>
            )}
          </div>
        )}

        <p className="font-semibold text-blue-600 mt-1">{formatCurrencyIDR(product.price)}</p>

        {/* Seller location */}
        {product.location && (
          <div className="flex items-center gap-1 mt-1 w-full">
            <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate min-w-0 flex-1">{product.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
