import React from "react";
import { useParams } from "react-router-dom";
import type { Product } from "../types/product";
import { getProductById } from "../services/products";
import { money } from "../utils/money";
import { SHOP_WA, SHOP_NAME } from "../utils/env";

const buildWaMessage = (p: Product) =>
  encodeURIComponent(
    [
      `*${SHOP_NAME}*`,
      "————————————",
      `${p.name}`,
      `Harga: Rp ${money(p.price)}`,
      "————————————",
      "Saya tertarik. Mohon info ketersediaan & ongkir.",
      "Nama:",
      "Alamat:",
      "Nomor HP:",
    ].join("\n")
  );

export default function ProductDetail() {
  const { id } = useParams();
  const [p, setP] = React.useState<Product | null>(null);

  React.useEffect(() => {
    if (!id) return;
    getProductById(id).then((res) => setP(res ?? null));
  }, [id]);

  if (!p) return <div className="p-4">Memuat…</div>;

  const wa = `https://wa.me/${SHOP_WA}?text=${buildWaMessage(p)}`;

  return (
    <main className="max-w-md md:max-w-lg lg:max-w-xl mx-auto px-4 pb-24">
      <div className="aspect-square rounded-2xl overflow-hidden border border-slate-100 bg-white">
        <img src={p.thumb} alt={p.name} className="w-full h-full object-cover" />
      </div>
      <h1 className="mt-3 text-lg font-semibold">{p.name}</h1>
      <div className="text-slate-600 text-sm">{p.sold}+ terjual • {p.rating}★</div>
      <div className="mt-2 text-2xl font-bold">Rp {money(p.price)}</div>

      <a href={wa} target="_blank" rel="noopener noreferrer"
         className="mt-6 inline-flex w-full items-center justify-center rounded-2xl bg-blue-600 text-white font-semibold py-3 shadow-sm hover:bg-blue-700">
        Tanya via WhatsApp
      </a>
    </main>
  );
}
