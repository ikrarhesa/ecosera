
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ShoppingCart, Minus, Plus, ArrowLeft, Heart } from "lucide-react";
import { getProductById } from "../services/products";
import { money } from "../utils/money";
import { useCart } from "../context/CartContext";

export default function ProductDetail() {
  const { id } = useParams();
  const nav = useNavigate();
  const { addToCart } = useCart();
  const [product, setProduct] = useState(null);
  const [qty, setQty] = useState(1);

  useEffect(() => {
    async function fetchProduct() {
      if (id) {
        const data = await getProductById(id);
        setProduct(data);
      }
    }
    fetchProduct();
  }, [id]);

  if (!product) return <div>Loading...</div>;

  const total = product.price * qty;

  return (
    <div className="min-h-screen bg-white">
      {/* Back Button */}
      <header className="sticky top-0 z-30 bg-white/80 backdrop-blur border-b">
        <div className="flex justify-between items-center px-4 py-3">
          <button onClick={() => nav(-1)} className="p-2 bg-white border rounded">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-semibold text-center flex-1">{product.name}</h1>
          <div className="flex gap-2">
            <button className="p-2 bg-white border rounded">
              <Heart className="h-5 w-5 text-rose-500" />
            </button>
            <button className="p-2 bg-white border rounded">
              <span className="h-5 w-5">🔗</span> {/* Share Icon */}
            </button>
          </div>
        </div>
      </header>

      {/* Product Image */}
      <div className="px-4 py-2">
        <div className="aspect-square rounded-2xl overflow-hidden border bg-white">
          <img src={product.thumb} alt={product.name} className="w-full h-full object-cover" />
        </div>
      </div>

      {/* Product Information */}
      <div className="px-4 py-2">
        <h2 className="font-semibold text-lg">{product.name}</h2>
        <div className="flex items-center gap-2 text-sm text-gray-600">
          <span>⭐ {product.rating}</span>
          <span>{product.sold} terjual</span>
        </div>
        <div className="mt-3 flex justify-between items-center">
          <div>
            <p className="text-xs text-gray-600">Harga</p>
            <p className="text-xl font-bold">Rp {money(product.price)}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setQty((q) => Math.max(1, q - 1))}
              className="p-2 bg-white border rounded"
            >
              <Minus className="h-4 w-4" />
            </button>
            <span>{qty}</span>
            <button
              onClick={() => setQty((q) => Math.min(99, q + 1))}
              className="p-2 bg-white border rounded"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Description */}
        <div className="mt-3">
          <h3 className="font-semibold">Deskripsi</h3>
          <p className="text-sm text-gray-700">{product.description}</p>
        </div>

        {/* Total Calculation */}
        <div className="mt-4 flex justify-between items-center text-sm text-gray-700">
          <span>Total</span>
          <span className="font-semibold">Rp {money(total)}</span>
        </div>
      </div>

      {/* Add to Cart Button */}
      <div className="fixed bottom-0 left-0 right-0 bg-white py-4 px-4 shadow-md">
        <div className="flex justify-between items-center">
          <p className="text-lg font-semibold">Jumlah: {qty}</p>
          <button
            onClick={() => {
              addToCart(product, qty);
              alert("Ditambahkan ke Keranjang ✅");
            }}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg"
          >
            Tambah ke Keranjang
          </button>
        </div>
      </div>
    </div>
  );
}
