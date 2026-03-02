<<<<<<< HEAD
import React from "react";
import { Link } from "react-router-dom";
import { Store, Star } from "lucide-react";
=======
import { Link } from "react-router-dom";
import { Store, Star, MapPin } from "lucide-react";
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
import type { Product } from "../types/product";
import { primaryImageOf } from "../services/products";

const money = (n: number) => n.toLocaleString("id-ID");

export default function ProductCard({ product }: { product: Product }) {
  const img = primaryImageOf(product);

  return (
<<<<<<< HEAD
    <Link to={`/product/${product.id}`} className="p-3 rounded-xl bg-white/70 border border-black/10 hover:bg-white">
=======
    <Link to={`/product/${product.slug || product.id}`} className="p-3 rounded-xl bg-white/70 border border-black/10 hover:bg-white">
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
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
<<<<<<< HEAD
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
=======
        <h4 className="font-medium text-sm truncate">{product.name}</h4>

        {/* Shop name with icon */}
        {product.sellerName && (
          <div className="flex items-center gap-1 mt-1 w-full">
            <Store className="h-3 w-3 text-blue-600 flex-shrink-0" />
            <span className="text-xs text-blue-600 font-medium truncate min-w-0 flex-1">{product.sellerName}</span>
          </div>
        )}

        {/* Rating and sold info */}
        {(product.rating || product.sold != null) && (
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
          <div className="flex items-center gap-1 mt-1">
            {product.rating && (
              <>
                <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
                <span className="text-xs text-slate-600">{product.rating}</span>
              </>
            )}
<<<<<<< HEAD
            {(product as any).sold && (
              <>
                {product.rating && <span className="text-xs text-slate-400">•</span>}
                <span className="text-xs text-slate-600">{(product as any).sold} terjual</span>
=======
            {product.sold != null && (
              <>
                {product.rating && <span className="text-xs text-slate-400">•</span>}
                <span className="text-xs text-slate-600">{product.sold} tertarik</span>
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
              </>
            )}
          </div>
        )}
<<<<<<< HEAD
        
        <p className="font-semibold text-blue-600 mt-1">Rp {money(product.price)}</p>
=======

        <p className="font-semibold text-blue-600 mt-1">Rp {money(product.price)}</p>

        {/* Seller location */}
        {product.location && (
          <div className="flex items-center gap-1 mt-1 w-full">
            <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
            <span className="text-xs text-slate-500 truncate min-w-0 flex-1">{product.location}</span>
          </div>
        )}
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
      </div>
    </Link>
  );
}
