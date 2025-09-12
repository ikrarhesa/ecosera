// src/pages/Cart.tsx
import { useCart } from "../context/CartContext";
import { Trash2, Minus, Plus, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useRef, useState } from "react";
import { useToast } from "../context/ToastContext";
import { money } from "../utils/money";
import { SHOP_NAME, SHOP_WA } from "../utils/env";
import Navbar from "../components/Navbar";

const fallbackImg =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=70";

function buildWaMessage(
  items: { name: string; qty: number; price: number; sellerName?: string }[],
  subtotal: number
) {
  const lines = [
    `*${SHOP_NAME}*`,
    "————————————",
    ...items.map(
      (i, idx) => `${idx + 1}) ${i.name}${i.sellerName ? ` (${i.sellerName})` : ''} x${i.qty} = Rp ${money(i.price * i.qty)}`
    ),
    "————————————",
    `Subtotal: Rp ${money(subtotal)}`,
    `Ongkir: (admin akan konfirmasi)`,
    `Total: Rp ${money(subtotal)} *estimasi tanpa ongkir*`,
    "————————————",
    "Mohon isi data pemesanan:",
    "Nama:",
    "Alamat:",
    "Nomor HP:",
    "Catatan:",
  ];
  return encodeURIComponent(lines.join("\n"));
}

/** Modal konfirmasi sederhana */
function ConfirmModal({
  open,
  text,
  onCancel,
  onConfirm,
}: {
  open: boolean;
  text: string;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[55] bg-black/40 backdrop-blur-[1px] flex items-end sm:items-center sm:justify-center">
      <div className="w-full sm:max-w-sm bg-white rounded-t-2xl sm:rounded-2xl p-4 shadow-xl">
        <p className="text-sm text-slate-700">{text}</p>
        <div className="mt-4 flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 rounded-xl bg-slate-100 text-slate-800 py-2 font-medium"
          >
            Batal
          </button>
          <button
            onClick={onConfirm}
            className="flex-1 rounded-xl bg-red-600 text-white py-2 font-semibold"
          >
            Hapus
          </button>
        </div>
      </div>
    </div>
  );
}

/** Satu baris item keranjang dengan swipe-to-delete & qty stepper */
function CartItemRow({
  name,
  qty,
  price,
  thumb,
  sellerName,
  onRemoveConfirmed,
  onChangeQty,
}: {
  name: string;
  qty: number;
  price: number;
  thumb?: string;
  sellerName?: string;
  onRemoveConfirmed: () => void;
  onChangeQty: (q: number) => void;
}) {
  const startX = useRef<number | null>(null);
  const [offset, setOffset] = useState(0); // px; negatif ke kiri
  const [ask, setAsk] = useState(false);
  const MAX = 80; // lebar area tombol hapus
  const THRESH_SHOW = 40; // ambang tampil tombol
  const THRESH_DELETE = 120; // swipe panjang langsung minta konfirmasi

  const onTouchStart = (e: React.TouchEvent) => {
    startX.current = e.touches[0].clientX;
  };
  const onTouchMove = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.touches[0].clientX - startX.current;
    const next = Math.max(-MAX, Math.min(0, dx)); // hanya ke kiri
    setOffset(next);
  };
  const onTouchEnd = (e: React.TouchEvent) => {
    if (startX.current == null) return;
    const dx = e.changedTouches[0].clientX - startX.current;
    if (Math.abs(dx) > THRESH_DELETE && dx < 0) {
      setAsk(true); // swipe jauh: minta konfirmasi
    } else if (dx < -THRESH_SHOW) {
      setOffset(-MAX); // tampilkan tombol
    } else {
      setOffset(0); // balik
    }
    startX.current = null;
  };

  return (
    <div className="relative">
      {/* Tombol Hapus di belakang kartu */}
      <div className="absolute inset-y-0 right-0 flex items-center pr-2">
        <button
          onClick={() => setAsk(true)}
          className="h-10 px-3 rounded-lg bg-red-500 text-white text-sm shadow"
        >
          Hapus
        </button>
      </div>

      {/* Kartu yang bisa diswipe */}
      <div
        className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-3 relative transition-transform duration-200 will-change-transform"
        style={{ transform: `translateX(${offset}px)` }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
      >
        {/* Thumbnail */}
        <div className="h-16 w-16 rounded-xl overflow-hidden shrink-0 border border-black/10 bg-slate-100">
          <img
            src={thumb || fallbackImg}
            alt={name}
            className="h-full w-full object-cover"
            loading="lazy"
          />
        </div>

        {/* Info + Stepper */}
        <div className="flex-1 min-w-0">
          <p className="font-medium line-clamp-2">{name}</p>
          {sellerName && (
            <div className="flex items-center gap-1">
              <Store className="h-3 w-3 text-blue-600" />
              <p className="text-[12px] text-blue-600 font-medium">{sellerName}</p>
            </div>
          )}
          <p className="text-[13px] text-slate-600">Rp {money(price)} / item</p>

          <div className="mt-2 flex items-center gap-2">
            <button
              onClick={() => onChangeQty(qty - 1)}
              className="h-8 w-8 grid place-items-center rounded-lg border border-black/10 bg-white"
              aria-label="Kurangi"
            >
              <Minus className="h-4 w-4" />
            </button>
            <div className="min-w-8 text-center font-semibold">{qty}</div>
            <button
              onClick={() => onChangeQty(qty + 1)}
              className="h-8 w-8 grid place-items-center rounded-lg border border-black/10 bg-white"
              aria-label="Tambah"
            >
              <Plus className="h-4 w-4" />
            </button>
          </div>
        </div>

        {/* Total per item */}
        <div className="text-right">
          <p className="text-xs text-slate-600">Total</p>
          <p className="font-semibold">Rp {money(price * qty)}</p>
        </div>
      </div>

      {/* Modal Konfirmasi */}
      <ConfirmModal
        open={ask}
        text={`Hapus "${name}" dari keranjang?`}
        onCancel={() => setAsk(false)}
        onConfirm={() => {
          setAsk(false);
          onRemoveConfirmed();
        }}
      />
    </div>
  );
}

export default function Cart() {
  const { items, removeFromCart, clearCart, updateQty } = useCart();
  const { show } = useToast();
  const nav = useNavigate();

  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const waMsg = buildWaMessage(
    items.map((i) => ({ name: i.name, qty: i.qty, price: i.price, sellerName: i.sellerName })),
    subtotal
  );
  const waLink = `https://wa.me/${SHOP_WA}?text=${waMsg}`;

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div className="font-semibold text-slate-900">Keranjang</div>
            <button
              onClick={() => {
                if (items.length === 0) return;
                if (confirm("Kosongkan seluruh keranjang?")) {
                  clearCart();
                  show("Keranjang dikosongkan 🗑️");
                }
              }}
              className="rounded-xl p-2 border border-slate-200 bg-white hover:bg-slate-50"
              title="Hapus semua"
            >
              <Trash2 className="h-5 w-5 text-red-500" />
            </button>
          </div>
        </div>

        {/* Items */}
        <main className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {items.length === 0 ? (
            <p className="text-slate-600 text-center mt-10">Keranjang kosong.</p>
          ) : (
            <div className="grid gap-3">
              {items.map((i) => (
                <CartItemRow
                  key={i.id}
                  name={i.name}
                  qty={i.qty}
                  price={i.price}
                  thumb={i.thumb}
                  sellerName={i.sellerName}
                  onRemoveConfirmed={() => {
                    removeFromCart(i.id);
                    show("Item dihapus dari keranjang");
                  }}
                  onChangeQty={(q) => {
                    updateQty(i.id, q);
                    if (q <= 0) show("Item dihapus dari keranjang");
                  }}
                />
              ))}
            </div>
          )}
        </main>

        {/* Sticky checkout */}
        {items.length > 0 && (
          <div className="fixed bottom-20 inset-x-0 z-40 pointer-events-none">
            <div className="mx-auto w-full max-w-md md:max-w-lg lg:max-w-xl px-4">
              <div className="rounded-2xl bg-white/95 backdrop-blur border border-white/40 shadow-[0_6px_24px_rgba(15,23,42,0.18)] p-3 pointer-events-auto">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-slate-600">Subtotal</p>
                    <p className="text-xl font-bold">Rp {money(subtotal)}</p>
                  </div>
                  <a
                    href={waLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="px-5 py-3 rounded-xl bg-blue-600 text-white font-semibold"
                  >
                    Checkout WA
                  </a>
                </div>
                <p className="mt-2 text-[11px] text-slate-600">
                  *Catatan:* Total belum termasuk ongkir. Admin akan konfirmasi via WhatsApp.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  );
}
