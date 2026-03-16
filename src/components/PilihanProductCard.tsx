import React, { useState } from 'react';
import type { PilihanItem } from '../types/pilihanDaerah';
import { formatCurrencyIDR, km } from '../utils/format';

export interface PilihanProductCardProps {
  item: PilihanItem;
  tab: string;
  onAdd: (item: PilihanItem) => void;
  onChat: (item: PilihanItem) => void;
  cardRef?: (el: Element | null) => void;
  reasonLabel: string;
}

const FALLBACK_IMG =
  'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300"><rect width="100%" height="100%" fill="%23e5e7eb"/></svg>';

export const PilihanProductCard: React.FC<PilihanProductCardProps> = ({
  item,
  onAdd,
  onChat,
  cardRef,
  reasonLabel,
}) => {
  const [imgLoading, setImgLoading] = useState(true);

  return (
    <div
      className="w-[156px] shrink-0 rounded-xl border border-slate-200 bg-white p-2"
      ref={cardRef}
    >
      {/* Image */}
      <div className="w-full aspect-square rounded-lg bg-slate-100 overflow-hidden">
        <img
          src={item.image?.trim() || FALLBACK_IMG}
          srcSet={
            item.image
              ? `${item.image.trim()} 1x, ${item.image.trim()} 2x`
              : undefined
          }
          alt={item.name || 'Produk'}
          width={300}
          height={300}
          loading="lazy"
          decoding="async"
          onLoad={() => setImgLoading(false)}
          onError={(e) => {
            const el = e.currentTarget;
            el.src = FALLBACK_IMG;
            el.removeAttribute('srcset');
            setImgLoading(false);
          }}
          className={[
            'h-full w-full object-cover',
            'transition duration-300',
            imgLoading ? 'blur-[6px] scale-[1.02]' : 'blur-0 scale-100',
          ].join(' ')}
        />
      </div>

      {/* Name */}
      <div className="mt-2 text-sm line-clamp-2 text-slate-900">
        {item.name}
      </div>

      {/* Price and Unit */}
      <div className="mt-1 flex items-baseline">
        <span className="text-sm font-semibold">
          {formatCurrencyIDR(item.price)}
        </span>
        <span className="text-xs text-slate-600 ml-1">
          {item.unit}
        </span>
      </div>

      {/* Stock */}
      <div className="text-[11px] text-slate-600">
        {item.stock === null ? 'Preorder' : `Stok: ${item.stock}`}
      </div>

      {/* Reason Badge */}
      <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700">
        {reasonLabel}
        {item.reason === 'nearby' && item.distance_km && ` ${km(item.distance_km)}`}
      </div>

      {/* Actions */}
      <div className="mt-2 grid grid-cols-2 gap-2">
        <button
          onClick={() => onAdd(item)}
          aria-label={`Tambah ${item.name || 'Produk'}`}
          className="h-8 rounded-lg text-sm font-medium border bg-[#2254C5] text-white border-transparent"
        >
          Tambah
        </button>
        <button
          onClick={() => onChat(item)}
          aria-label={`Chat ${item.seller?.name || 'penjual'}`}
          className="h-8 rounded-lg text-sm font-medium border bg-white text-slate-900 border-slate-200"
        >
          Chat
        </button>
      </div>
    </div>
  );
};
