import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { formatCurrencyIDR } from "../utils/format";
import { UI } from "../config/ui";

interface RecentlyViewedStripProps {
  productIds: string[];
  productsData: Product[];
  title?: string;
}

export const RecentlyViewedStrip: React.FC<RecentlyViewedStripProps> = ({ 
  productIds, 
  productsData,
  title = "Terakhir Dilihat"
}) => {
  if (productIds.length === 0) return null;

  // Map IDs back to full product objects, preserving the order of recently viewed
  const recentProducts = productIds
    .map(id => productsData.find(p => p.id === id))
    .filter((p): p is Product => Boolean(p));

  if (recentProducts.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex justify-between items-end mb-4 px-5">
        <h2 className="text-lg font-bold text-slate-900">{title}</h2>
      </div>

      <div className="overflow-x-auto no-scrollbar pb-3">
        <div className="flex gap-3 px-5">
          {recentProducts.map((p) => (
            <Link 
              key={p.id} 
              to={`/product/${p.slug || p.id}`}
              className="w-32 sm:w-36 shrink-0 flex flex-col bg-white rounded-xl shadow-sm border border-slate-100/60 overflow-hidden group"
            >
              {/* Product Image */}
              <div className="w-full aspect-square relative bg-slate-100 overflow-hidden">
                <img
                  src={p.image || p.images?.[0] || UI.PLACEHOLDER}
                  alt={p.name}
                  className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                  onError={(e) => { (e.target as HTMLImageElement).src = UI.PLACEHOLDER; }}
                />
                
                {/* Out of Stock Overlay */}
                {(p.stock ?? 0) <= 0 && (
                  <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
                    <span className="bg-slate-900/80 text-white text-[10px] font-medium px-2 py-0.5 rounded uppercase tracking-wider">
                      Habis
                    </span>
                  </div>
                )}
              </div>

              {/* Info Area */}
              <div className="p-2.5 flex flex-col flex-grow">
                {/* Name */}
                <h3 className="text-xs font-medium text-slate-800 line-clamp-2 leading-tight group-hover:text-brand-primary transition-colors">
                  {p.name}
                </h3>

                {/* Rating */}
                {(p.rating ?? 0) > 0 && (
                  <div className="flex items-center gap-0.5 mt-1">
                    <svg className="w-2.5 h-2.5 text-amber-400 fill-current" viewBox="0 0 20 20">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span className="text-[10px] font-medium text-slate-600">
                      {p.rating}
                    </span>
                  </div>
                )}

                {/* Price */}
                <div className="mt-auto pt-1 font-semibold text-brand-primary text-sm">
                  {p.price ? formatCurrencyIDR(p.price) : "Rp 0"}
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};
