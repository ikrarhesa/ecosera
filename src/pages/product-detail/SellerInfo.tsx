import React from "react";
import { Link } from "react-router-dom";
import { MapPin, ShieldCheck, Truck } from "lucide-react";
import type { Product } from "../../types/product";

interface SellerInfoProps {
  product: Product;
}

export const SellerInfo: React.FC<SellerInfoProps> = ({ product }) => {
  return (
    <div className="mt-3 flex items-center justify-between rounded-2xl border p-3 gap-2">
      <Link 
        to={product.seller_id ? `/shop/${product.seller_id}` : "#"} 
        className="flex items-center gap-2 hover:opacity-80 transition-opacity min-w-0"
      >
        <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center font-medium shrink-0">
          {(product.sellerName ?? "UMKM")[0]}
        </div>
        <div className="min-w-0">
          <p className="text-sm font-semibold truncate">{product.sellerName ?? "UMKM Lokal"}</p>
          <p className="text-xs text-gray-500 flex items-center gap-1 truncate">
            <MapPin size={14} className="shrink-0" /> 
            <span className="truncate">{product.location || "Lokasi belum diatur"}</span>
          </p>
        </div>
      </Link>
      <div className="flex flex-col items-end gap-1 text-[11px] text-gray-600 shrink-0">
        <span className="inline-flex items-center gap-1">
          <ShieldCheck size={14} /> Terverifikasi
        </span>
        <span className="inline-flex items-center gap-1">
          <Truck size={14} /> COD/Antar
        </span>
      </div>
    </div>
  );
};
