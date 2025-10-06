import React from "react";
import { Link } from "react-router-dom";
import { Store, Star, MapPin } from "lucide-react";
import type { Product } from "../types/product";
import { primaryImageOf } from "../services/products";

const money = (n: number) => n.toLocaleString("id-ID");

export default function ProductCard({ product }: { product: Product }) {
  const img = primaryImageOf(product);

  return (
    <Link to={`/product/${product.id}`} className="p-3 rounded-xl bg-white/70 border border-black/10 hover:bg-white">
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
        <h4 className="font-medium text-sm line-clamp-2">{product.name}</h4>
        
        {/* Shop name with icon */}
        {product.sellerName && (
          <div className="flex items-center gap-1 mt-1">
            <Store className="h-3 w-3 text-blue-600" />
            <span className="text-xs text-blue-600 font-medium truncate">{product.sellerName}</span>
          </div>
        )}
        
        {/* Rating and sold info */}
        {(product.rating || (product as any).sold) && (
          <div className="flex items-center gap-1 mt-1">
            {product.rating && (
              <>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-600">{product.rating}</span>
              </>
            )}
            {(product as any).sold && (
              <>
                {product.rating && <span className="text-xs text-slate-400">•</span>}
                <span className="text-xs text-slate-600">{(product as any).sold} terjual</span>
              </>
            )}
          </div>
        )}
        
        <p className="font-semibold text-blue-600 mt-1">Rp {money(product.price)}</p>
        
        {/* Seller location */}
        {product.location && (
          <div className="flex items-center gap-1 mt-1">
            <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate">{product.location}</span>
          </div>
        )}
      </div>
    </Link>
  );
}
