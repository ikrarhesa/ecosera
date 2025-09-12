// src/components/ProductCard.tsx
import React from "react";
import { Link } from "react-router-dom";
import { Product } from "../types/product";
import { Star, Store } from "lucide-react";

interface ProductCardProps {
  product: Product;
}

const ProductCard: React.FC<ProductCardProps> = ({ product }) => {
  const imageUrl = product?.image || "https://placehold.co/800x800/png?text=No+Image";
  const productName = product?.name || "Unknown Product";
  const productPrice = product?.price ? `Rp ${product.price.toLocaleString("id-ID")}` : "Price not available";
  const rating = product?.rating || 0;

  return (
    <Link 
      to={`/product/${product.id}`}
      className="block bg-white rounded-2xl border border-slate-100 overflow-hidden shadow-sm hover:shadow-md transition-shadow"
    >
      <div className="aspect-square relative">
        <img 
          src={imageUrl} 
          alt={productName}
          className="w-full h-full object-cover"
        />
        {product?.featured && (
          <div className="absolute top-2 left-2 bg-blue-600 text-white text-xs px-2 py-1 rounded-full font-medium">
            Featured
          </div>
        )}
      </div>
      
      <div className="p-3">
        <h3 className="font-semibold text-slate-900 text-sm leading-tight mb-1 line-clamp-2">
          {productName}
        </h3>
        
        <div className="flex items-center gap-1 mb-1">
          <Star className="h-3.5 w-3.5 text-yellow-400 fill-current" />
          <span className="text-xs text-slate-600">{rating.toFixed(1)}</span>
        </div>
        
        {product?.sellerName && (
          <div className="flex items-center gap-1 mb-1">
            <Store className="h-3 w-3 text-blue-600" />
            <p className="text-[11px] text-blue-600 font-medium">{product.sellerName}</p>
          </div>
        )}
        
        <div className="flex items-center justify-between">
          <span className="font-bold text-blue-600 text-sm">{productPrice}</span>
          <span className="text-xs text-slate-500">{product?.unit || 'pcs'}</span>
        </div>
      </div>
    </Link>
  );
};

export default ProductCard;
