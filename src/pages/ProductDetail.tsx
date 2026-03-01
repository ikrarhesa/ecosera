import { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Heart, Share2, Star, MapPin, ChevronLeft, ChevronRight,
  MessageCircle, ShoppingCart, ShieldCheck, Truck, PackageOpen, Check
} from "lucide-react";
import type { Product } from "../types/product";
import { getProductBySlug, getRelatedProducts, allImagesOf, getProductReviews, submitProductReview, type ProductReview } from "../services/products";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { supabase } from "../lib/supabase";

const ACCENT = "#2254c5";
const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera";

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { addToCart } = useCart();
  const { toggleWishlist, isInWishlist } = useWishlist();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const liked = product ? isInWishlist(product.id) : false;
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const p = await getProductBySlug(String(slug));
      if (!mounted) return;
      setProduct(p);

      // Fire and forget 'product_view' analytics log
      if (p) {
        (async () => {
          try {
            const { error } = await supabase.from("event_logs").insert({
              event_type: "product_view",
              product_id: p.id,
              seller_id: p.seller_id
            });
            if (error) console.error("[EventLog] product_view insert error:", error);
          } catch (err) {
            console.error("[EventLog] Unexpected product_view error:", err);
          }
        })();
      }

      const revs = p ? await getProductReviews(p.id) : [];
      if (!mounted) return;
      setReviews(revs);

      setQty(1);
      setIdx(0);
      if (p) setRelated(await getRelatedProducts(p.category || "default", p.id, 10));
      else setRelated([]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [slug]);

  const outOfStock = useMemo(() => {
    if (!product) return false;
    if (typeof (product as any).available === "boolean" && (product as any).available === false) return true;
    if (product.stock == null) return false;
    const n = Number(product.stock);
    return Number.isFinite(n) ? n <= 0 : false;
  }, [product]);

  const clampQty = (n: number) => {
    const max = product?.stock == null ? 999 : Number(product.stock);
    if (n < 1) return 1;
    if (n > max) return max;
    return n;
  };

  const total = useMemo(() => (product ? product.price * qty : 0), [product, qty]);

  const onShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const text = `Cek ${product.name} di Ecosera (${fmtIDR(product.price)}/${product.unit})`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch { }
    } else {
      try { await navigator.clipboard.writeText(url); alert("Link disalin ke clipboard ✅"); } catch { }
    }
  };

  const onChatWA = async () => {
    if (!product) return;

    const phone = (product.sellerPhone || "").replace(/\D/g, "");
    const text = encodeURIComponent(
      `Halo ${product.sellerName ?? "Seller"}, saya ingin pesan:\n` +
      `• Produk: ${product.name}\n` +
      `• Jumlah: ${qty} ${product.unit}\n` +
      `• Total: ${fmtIDR(total)}\n\n` +
      `Link produk: ${window.location.href}`
    );

    // 🔹 Log event BEFORE redirect
    console.log("[EventLog] Attempting insert for product:", product.id);
    try {
      const { data, error } = await supabase
        .from("event_logs")
        .insert({
          event_type: "wa_click",
          product_id: product.id,
          seller_id: product.seller_id,
        })
        .select();

      if (error) {
        console.error("[EventLog] Insert error:", error.message, error.details, error.code);
      } else {
        console.log("[EventLog] Insert success:", data);
      }
    } catch (err) {
      console.error("[EventLog] Unexpected error:", err);
    }

    // 🔹 Then redirect
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const onAddToCart = () => {
    if (!product) return;
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      thumb: product.image,
      sellerName: product.sellerName
    }, qty);
    show("Produk berhasil ditambahkan ke keranjang! 🛒");
  };

  const onSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !reviewerName.trim() || !contactInfo.trim()) return;
    setSubmittingReview(true);

    const success = await submitProductReview({
      product_id: product.id,
      reviewer_name: reviewerName.trim(),
      contact_info: contactInfo.trim(),
      rating: reviewRating,
      comment: reviewComment.trim()
    });

    if (success) {
      show("Terima kasih! Ulasan berhasil dikirim.");
      setReviewerName("");
      setContactInfo("");
      setReviewComment("");
      setReviewRating(5);
      // Refresh reviews
      const revs = await getProductReviews(product.id);
      setReviews(revs);
    } else {
      show("Gagal mengirim ulasan. Silakan coba lagi.");
    }
    setSubmittingReview(false);
  };

  const displayRating = useMemo(() => {
    if (reviews.length === 0) return product?.rating?.toFixed(1) ?? "4.8";
    const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
    return (sum / reviews.length).toFixed(1);
  }, [reviews, product]);

  const images = useMemo(() => allImagesOf(product), [product]);

  const goTo = (i: number) => {
    const el = galleryRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, images.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIdx(clamped);
  };
  const prev = () => goTo(idx - 1);
  const next = () => goTo(idx + 1);
  const onScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== idx) setIdx(current);
  };

  if (loading) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-white">
        <div className="p-4">Memuat produk…</div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="mx-auto w-full max-w-md min-h-screen bg-white">
        <div className="p-4">
          <Link to="/" className="inline-flex items-center gap-2 text-sm" style={{ color: ACCENT }}>
            <ArrowLeft size={18} /> Kembali
          </Link>
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-600">
            <PackageOpen className="inline -mt-1 mr-2" /> Produk tidak ditemukan.
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full min-h-screen bg-white text-gray-900">
      {/* Header */}
      <div className="sticky top-0 z-20 flex items-center justify-between bg-white/90 backdrop-blur px-3 py-3 border-b">
        <button onClick={() => navigate(-1)} className="p-2 rounded-full" aria-label="Back" style={{ color: ACCENT }}>
          <ArrowLeft />
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              if (product) {
                toggleWishlist(product);
                show(liked ? "Dihapus dari wishlist" : "Disimpan ke wishlist 💖");
              }
            }}
            className={`p-2 rounded-full border ${liked ? "bg-red-50 border-red-200" : "bg-white"}`}
            aria-label="Like"
          >
            <Heart className={liked ? "fill-red-500 stroke-red-500" : ""} />
          </button>
          <button onClick={onShare} className="p-2 rounded-full border bg-white" aria-label="Share">
            <Share2 />
          </button>
        </div>
      </div>

      {/* Gallery Slider */}
      <div className="relative w-full bg-gray-50">
        <div
          ref={galleryRef}
          onScroll={onScroll}
          className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex w-full">
            {images.map((src, i) => (
              <div key={i} className="snap-center shrink-0 w-full aspect-square overflow-hidden bg-gray-100">
                <img
                  src={src}
                  alt={`${product.name} - gambar ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={prev}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 border grid place-items-center"
              aria-label="Sebelumnya"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={next}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 border grid place-items-center"
              aria-label="Selanjutnya"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full ${i === idx ? "w-5" : "w-2.5"} transition-all`}
                style={{ backgroundColor: i === idx ? ACCENT : "rgba(255,255,255,0.9)" }}
                aria-label={`Ke gambar ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-2 px-3">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-16 w-16 rounded-lg overflow-hidden border ${i === idx ? "" : ""}`}
                style={i === idx ? { outline: `2px solid ${ACCENT}`, outlineOffset: 0 } : undefined}
                aria-label={`Pilih gambar ${i + 1}`}
              >
                <img src={src} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }}
                />
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Content */}
      <div className="px-4 pb-32">
        <h1 className="mt-4 text-lg font-semibold">{product.name}</h1>

        <div className="mt-2 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-2xl font-bold" style={{ color: ACCENT }}>{fmtIDR(product.price)}</span>
            <span className="text-sm text-gray-500">/ {product.unit}</span>
          </div>
        </div>

        <div className="mt-1 flex items-center gap-1 text-sm text-gray-700">
          <Star className="fill-amber-400 stroke-amber-400" size={16} />
          <span>{displayRating}</span>
          <span className="text-gray-400">•</span>
          <span>{reviews.length > 0 ? `${reviews.length} ulasan` : (product.stock == null ? "Stok tersedia" : `Stok ${product.stock}`)}</span>
        </div>

        {/* Seller / Lokasi */}
        <div className="mt-3 flex items-center justify-between rounded-2xl border p-3">
          <Link to={product.seller_id ? `/shop/${product.seller_id}` : "#"} className="flex items-center gap-2 hover:opacity-80 transition-opacity">
            <div className="h-9 w-9 rounded-full bg-gray-100 grid place-items-center font-medium">
              {(product.sellerName ?? "UMKM")[0]}
            </div>
            <div>
              <p className="text-sm font-semibold">{product.sellerName ?? "UMKM Lokal"}</p>
              <p className="text-xs text-gray-500 flex items-center gap-1">
                <MapPin size={14} /> {product.location || "Lokasi belum diatur"}
              </p>
            </div>
          </Link>
          <div className="flex items-center gap-2 text-[11px] text-gray-600">
            <span className="inline-flex items-center gap-1"><ShieldCheck size={14} /> Terverifikasi</span>
            <span className="inline-flex items-center gap-1"><Truck size={14} /> COD/Antar</span>
          </div>
        </div>

        {/* Deskripsi */}
        <div className="mt-4">
          <h2 className="text-sm font-semibold mb-1">Deskripsi</h2>
          <p className="text-sm text-gray-700 leading-relaxed">
            {product.description || "Produk lokal berkualitas dari UMKM Ecosera."}
          </p>
        </div>

        {/* Quantity */}
        <div className="mt-5 rounded-2xl border p-3">
          <div className="flex items-center justify-between">
            <span className="text-sm font-semibold">Jumlah</span>
            <div className="flex items-center gap-2">
              <button onClick={() => setQty(q => clampQty(q - 1))} className="h-9 w-9 rounded-full border grid place-items-center text-lg" aria-label="Kurangi">-</button>
              <input
                type="number" inputMode="numeric" value={qty}
                onChange={(e) => setQty(clampQty(parseInt(e.target.value || "1", 10)))}
                className="w-14 text-center border rounded-lg py-1"
                min={1} max={product.stock == null ? undefined : Number(product.stock)}
              />
              <button onClick={() => setQty(q => clampQty(q + 1))} className="h-9 w-9 rounded-full border grid place-items-center text-lg" aria-label="Tambah">+</button>
            </div>
          </div>

          <div className="mt-3 flex items-center justify-between">
            <span className="text-sm text-gray-600">Total</span>
            <span className="text-xl font-bold" style={{ color: ACCENT }}>{fmtIDR(total)}</span>
          </div>

          {outOfStock && (
            <div className="mt-3 rounded-xl bg-amber-50 border border-amber-200 p-2 text-amber-700 text-sm">
              Stok habis untuk saat ini.
            </div>
          )}
        </div>

        {/* Keunggulan */}
        <ul className="mt-4 grid grid-cols-2 gap-3 text-xs text-gray-700">
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> UMKM lokal</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Kualitas terjamin</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Harga bersaing</li>
          <li className="flex items-center gap-2"><Check size={16} style={{ color: ACCENT }} /> Dukungan Ecosera</li>
        </ul>

        {/* Reviews Section */}
        <div className="mt-6 border-t pt-5">
          <h2 className="text-sm font-semibold mb-4">Ulasan Pembeli ({reviews.length})</h2>

          {/* Review List */}
          <div className="space-y-4 mb-6">
            {reviews.length === 0 ? (
              <p className="text-sm text-gray-500 italic">Belum ada ulasan untuk produk ini. Jadilah yang pertama!</p>
            ) : (
              reviews.map((rev, i) => (
                <div key={rev.id || i} className="border-b pb-3 last:border-b-0 last:pb-0">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-medium">{rev.reviewer_name}</span>
                    <div className="flex text-amber-400">
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <Star key={idx} size={12} className={idx < rev.rating ? "fill-amber-400" : "fill-gray-200 text-gray-200"} />
                      ))}
                    </div>
                  </div>
                  {rev.comment && <p className="text-sm text-gray-600 mt-1">{rev.comment}</p>}
                </div>
              ))
            )}
          </div>

          {/* Write Review Form */}
          <div className="bg-gray-50 p-4 rounded-xl border">
            <h3 className="text-sm font-medium mb-3">Tulis Ulasan Baru</h3>
            <form onSubmit={onSubmitReview} className="space-y-3">
              <div>
                <label className="block text-xs text-gray-600 mb-1">Nama (Tampil Publik)</label>
                <input required type="text" value={reviewerName} onChange={(e) => setReviewerName(e.target.value)} placeholder="Nama Anda" className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">No HP / Email (Privasi Terjamin)</label>
                <input required type="text" value={contactInfo} onChange={(e) => setContactInfo(e.target.value)} placeholder="Untuk mencegah spam" className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Penilaian</label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button key={star} type="button" onClick={() => setReviewRating(star)} className="p-1">
                      <Star size={24} className={star <= reviewRating ? "fill-amber-400 stroke-amber-400" : "stroke-gray-300"} />
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs text-gray-600 mb-1">Komentar (Opsional)</label>
                <textarea value={reviewComment} onChange={(e) => setReviewComment(e.target.value)} placeholder="Bagaimana produk ini?" rows={2} className="w-full text-sm rounded-lg border p-2 focus:ring-1 focus:ring-blue-500" />
              </div>
              <button disabled={submittingReview} type="submit" className="w-full py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors">
                {submittingReview ? "Mengirim..." : "Kirim Ulasan"}
              </button>
            </form>
          </div>
        </div>

        {/* Related */}
        {related.length > 0 && (
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Produk Terkait</h3>
            <div className="flex gap-3 overflow-x-auto pb-1">
              {related.map(r => (
                <Link key={r.id} to={`/product/${r.slug || r.id}`} className="min-w-[160px] rounded-xl border overflow-hidden">
                  <img src={r.image || PLACEHOLDER} alt={r.name} className="h-28 w-full object-cover" loading="lazy"
                    onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }} />
                  <div className="p-2">
                    <p className="text-xs line-clamp-2">{r.name}</p>
                    <p className="text-sm font-semibold mt-1" style={{ color: ACCENT }}>{fmtIDR(r.price)}</p>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Sticky Actions */}
      <div className="fixed bottom-0 left-1/2 -translate-x-1/2 z-30 w-full max-w-md md:max-w-lg lg:max-w-xl">
        <div className="w-full border-t bg-white px-3 py-3">
          <div className="flex items-center gap-2">
            <button onClick={onAddToCart} disabled={outOfStock}
              className={`flex-1 h-11 rounded-xl border border-slate-300 inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors ${outOfStock ? "opacity-50" : ""}`}
              aria-label="Tambahkan ke Keranjang">
              <ShoppingCart size={18} /> Keranjang
            </button>
            <button onClick={onChatWA}
              className="flex-[2] h-11 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-semibold text-white transition-colors"
              style={{ backgroundColor: ACCENT }}
              aria-label="Pesan lewat WhatsApp">
              <MessageCircle size={18} /> Pesan lewat WA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
