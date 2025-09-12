import { Star } from "lucide-react";
import { Link } from "react-router-dom";
import type { Product } from "../types/product";
import { money } from "../utils/money";

export default function ProductCard({ p }: { p: Product }) {
  const href = `/product/${p.slug || p.id}`;  // <-- pakai slug kalau ada
  const FALLBACK_THUMB = "https://picsum.photos/seed/ecosera/600/600";
  const imgSrc = p.thumb || FALLBACK_THUMB;

  return (
    <Link to={href} className="p-3 rounded-2xl bg-white border border-slate-100 hover:shadow-sm">
      <div className="relative aspect-square rounded-xl overflow-hidden">
        <img
          src={imgSrc}
          alt={p.name}
          className="w-full h-full object-cover"
          loading="lazy"
          onError={(e) => { (e.currentTarget as HTMLImageElement).src = FALLBACK_THUMB; }}
        />
        <span className="absolute top-2 right-2 inline-flex items-center gap-1 px-2 py-1 rounded-full bg-white/90 text-[11px] border border-slate-200">
          <Star className="h-3.5 w-3.5 text-amber-500" /> {p.rating}
        </span>
      </div>
      <div className="mt-2 text-sm font-medium leading-tight line-clamp-2">{p.name}</div>
      <div className="text-[11px] text-slate-600">{p.sold}+ terjual</div>
      <div className="mt-1 font-semibold">Rp {money(p.price)}</div>
    </Link>
  );
}
