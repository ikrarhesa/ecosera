// src/pages/Cart.tsx
import { useCart } from "../context/CartContext";
import { Trash2, Minus, Plus, Store, MessageCircle } from "lucide-react";
import { useState, useMemo } from "react";
import { useToast } from "../context/ToastContext";
import { money } from "../utils/money";
import { SHOP_WA } from "../utils/env";
import BottomNavbar from "../components/BottomNavbar";

const fallbackImg =
  "https://images.unsplash.com/photo-1542291026-7eec264c27ff?auto=format&fit=crop&w=300&h=300&q=70";

function buildWaMessage(
  sellerName: string,
  items: { name: string; qty: number; price: number }[],
  subtotal: number
) {
  const lines = [
    `*Pesanan dari ${sellerName}*`,
    "————————————",
    ...items.map(
      (i, idx) => `${idx + 1}) ${i.name} x${i.qty} = Rp ${money(i.price * i.qty)}`
    ),
    "————————————",
    `Subtotal: Rp ${money(subtotal)}`,
    `Ongkir: (akan dikonfirmasi)`,
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

/** Satu baris item keranjang dengan delete button di dalam kartu */
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
  const [ask, setAsk] = useState(false);

  return (
    <div className="relative">
      {/* Kartu item */}
      <div className="flex items-center gap-3 rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-3">
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
          <div className="flex items-start justify-between">
            <div className="flex-1 min-w-0">
              <p className="font-medium line-clamp-2">{name}</p>
              {sellerName && (
                <div className="flex items-center gap-1 mt-1">
                  <Store className="h-3 w-3 text-blue-600" />
                  <p className="text-[12px] text-blue-600 font-medium">{sellerName}</p>
                </div>
              )}
              <p className="text-[13px] text-slate-600">Rp {money(price)} / item</p>
            </div>
            
            {/* Delete button in top-right */}
            <button
              onClick={() => setAsk(true)}
              className="ml-2 p-1.5 rounded-lg hover:bg-red-50 transition-colors group"
              title="Hapus item"
            >
              <Trash2 className="h-4 w-4 text-red-500 group-hover:text-red-600" />
            </button>
          </div>

          <div className="mt-2 flex items-center justify-between">
            {/* Quantity stepper */}
            <div className="flex items-center gap-2">
              <button
                onClick={() => onChangeQty(qty - 1)}
                className="h-8 w-8 grid place-items-center rounded-lg border border-black/10 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Kurangi"
              >
                <Minus className="h-4 w-4" />
              </button>
              <div className="min-w-8 text-center font-semibold">{qty}</div>
              <button
                onClick={() => onChangeQty(qty + 1)}
                className="h-8 w-8 grid place-items-center rounded-lg border border-black/10 bg-white hover:bg-slate-50 transition-colors"
                aria-label="Tambah"
              >
                <Plus className="h-4 w-4" />
              </button>
            </div>

            {/* Total per item */}
            <div className="text-right">
              <p className="text-xs text-slate-600">Total</p>
              <p className="font-semibold">Rp {money(price * qty)}</p>
            </div>
          </div>
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

/** Komponen untuk kelompok seller */
function SellerGroup({ 
  sellerName, 
  items, 
  removeFromCart, 
  updateQty, 
  show 
}: { 
  sellerName: string; 
  items: any[]; 
  removeFromCart: (id: string) => void;
  updateQty: (id: string, qty: number) => void;
  show: (msg: string) => void;
}) {
  const subtotal = items.reduce((sum, i) => sum + i.price * i.qty, 0);
  const waMsg = buildWaMessage(
    sellerName,
    items.map((i) => ({ name: i.name, qty: i.qty, price: i.price })),
    subtotal
  );
  const waLink = `https://wa.me/${SHOP_WA}?text=${waMsg}`;

  return (
    <div className="rounded-2xl bg-white/80 backdrop-blur border border-black/10 p-4 mb-4">
      {/* Seller Header */}
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          <Store className="h-4 w-4 text-blue-600" />
          <h3 className="font-semibold text-blue-600">{sellerName}</h3>
        </div>
        <div className="text-sm text-slate-600">
          {items.length} item{items.length > 1 ? 's' : ''}
        </div>
      </div>

      {/* Items */}
      <div className="space-y-3 mb-4">
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

      {/* Checkout for this seller */}
      <div className="border-t border-slate-200 pt-3">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-600">Subtotal</p>
            <p className="text-lg font-bold text-blue-600">Rp {money(subtotal)}</p>
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-green-600 text-white font-semibold text-sm hover:bg-green-700 transition-colors"
          >
            <MessageCircle className="h-4 w-4" />
            Pesan via WA
          </a>
        </div>
        <p className="mt-2 text-[10px] text-slate-500">
          *Ongkir akan dikonfirmasi oleh {sellerName}
        </p>
      </div>
    </div>
  );
}

export default function Cart() {
  const { items, removeFromCart, clearCart, updateQty } = useCart();
  const { show } = useToast();

  // Group items by seller
  const groupedBySeller = useMemo(() => {
    const groups: { [key: string]: any[] } = {};
    items.forEach(item => {
      const seller = item.sellerName || "Toko Umum";
      if (!groups[seller]) {
        groups[seller] = [];
      }
      groups[seller].push(item);
    });
    return groups;
  }, [items]);

  const totalItems = items.length;

  return (
    <>
      <BottomNavbar />
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center justify-between">
            <div>
              <div className="font-semibold text-slate-900">Keranjang</div>
              {totalItems > 0 && (
                <div className="text-xs text-slate-600">{totalItems} item dari {Object.keys(groupedBySeller).length} toko</div>
              )}
            </div>
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

        {/* Items grouped by seller */}
        <main className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          {totalItems === 0 ? (
            <p className="text-slate-600 text-center mt-10">Keranjang kosong.</p>
          ) : (
            <div className="space-y-4">
              {Object.entries(groupedBySeller).map(([sellerName, sellerItems]) => (
                <SellerGroup
                  key={sellerName}
                  sellerName={sellerName}
                  items={sellerItems}
                  removeFromCart={removeFromCart}
                  updateQty={updateQty}
                  show={show}
                />
              ))}
            </div>
          )}
        </main>
      </div>
    </>
  );
}
