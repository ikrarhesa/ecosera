import React from "react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { primaryImageOf } from "../services/products";

const ACCENT = "#2254c5";
const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ProductCard({ product }: { product: Product }) {
  const img = primaryImageOf(product);

  return (
    <Link to={`/product/${product.id}`} className="rounded-2xl border overflow-hidden bg-white">
      <div className="aspect-square w-full bg-gray-100">
        <img
          src={img}
          alt={product.name}
          className="h-full w-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = "https://placehold.co/800x800/png?text=Ecosera"; }}
        />
      </div>
      <div className="p-3">
        <h3 className="text-sm font-medium line-clamp-2">{product.name}</h3>
        <div className="mt-1 text-[13px] text-gray-600">{product.location ?? "Muara Enim"}</div>
        <div className="mt-1 text-base font-semibold" style={{ color: ACCENT }}>
          {fmtIDR(product.price)} <span className="text-xs text-gray-500">/ {product.unit}</span>
        </div>
      </div>
    </Link>
  );
}
