import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import Navbar from "../components/Navbar";
import type { Product } from "../types/product";
import { getAllProducts } from "../services/products";

export default function Etalase() {
  const nav = useNavigate();
  const [all, setAll] = useState<Product[]>([]);

  useEffect(() => {
    getAllProducts().then(setAll);
  }, []);

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <main className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-slate-900">Semua Produk</h3>
            <span className="text-xs text-slate-600">{all.length} item</span>
          </div>

          <div className="grid grid-cols-2 gap-3">
            {all.map((p: Product) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </main>
      </div>
    </>
  );
}