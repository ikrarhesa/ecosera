import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { ArrowLeft, MessageCircle, Plus, Search, ShoppingCart, PackageOpen } from "lucide-react";
import type { Product, ProductVariant } from "../types/product";
import { getProductBySlug, getCachedProductBySlug, getRelatedProducts, allImagesOf, getProductReviews, submitProductReview, type ProductReview } from "../services/products";
import { useToast } from "../context/ToastContext";
import { useCart } from "../context/CartContext";
import { useWishlist } from "../context/WishlistContext";
import { analytics } from "../services/analytics";

import { ProductGallery } from "./product-detail/ProductGallery";
import { SellerInfo } from "./product-detail/SellerInfo";
import { ProductMainInfo } from "./product-detail/ProductMainInfo";
import { ReviewSection } from "./product-detail/ReviewSection";
import { RecentlyViewedStrip } from "../components/RecentlyViewedStrip";

import { useRecentlyViewed } from "../hooks/useRecentlyViewed";
import { useProducts } from "../context/ProductsContext";

import { formatCurrencyIDR } from "../utils/format";
import { UI } from "../config/ui";

const ACCENT = UI.BRAND.PRIMARY;
const PLACEHOLDER = UI.PLACEHOLDER;

export default function ProductDetail() {
  const { slug } = useParams<{ slug: string }>();
  const navigate = useNavigate();
  const { show } = useToast();
  const { items, addToCart } = useCart();
  const cartCount = items.reduce((sum, item) => sum + item.qty, 0);
  const { toggleWishlist, isInWishlist } = useWishlist();
  const { addRecentlyViewed, recentlyViewedIds } = useRecentlyViewed();
  const { products: allProducts } = useProducts();

  const cachedProduct = useMemo(() => getCachedProductBySlug(String(slug)), [slug]);
  const [product, setProduct] = useState<Product | null>(cachedProduct);
  const [loading, setLoading] = useState(!cachedProduct);
  const liked = product ? isInWishlist(product.id) : false;
  const [qty, setQty] = useState(0);
  const [related, setRelated] = useState<Product[]>([]);
  const [selectedVariant, setSelectedVariant] = useState<ProductVariant | null>(null);

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [reviewerName, setReviewerName] = useState("");
  const [contactInfo, setContactInfo] = useState("");
  const [reviewRating, setReviewRating] = useState(5);
  const [reviewComment, setReviewComment] = useState("");
  const [submittingReview, setSubmittingReview] = useState(false);

  const goBack = useCallback(() => navigate(-1), [navigate]);

  useEffect(() => {
    setProduct(cachedProduct);
    // Initialize variant from cache if available
    if (cachedProduct?.variants?.length) {
      setSelectedVariant(cachedProduct.variants[0]);
    } else {
      setSelectedVariant(null);
    }

    setLoading(!cachedProduct);
    setQty(0);

    let mounted = true;
    (async () => {
      const p = await getProductBySlug(String(slug));
      if (!mounted) return;

      setProduct(p);

      // Robust variant sync
      if (p?.variants?.length) {
        setSelectedVariant(current => {
          // If we already have a selection that exists in the new data, keep it
          const stillExists = current && p.variants!.find(v => v.id === current.id);
          return stillExists || p.variants![0];
        });
      } else {
        setSelectedVariant(null);
      }

      // Log product view
      if (p) {
        analytics.product.view(p.id, p.seller_id);
        addRecentlyViewed(p.id);
      }

      const revs = p ? await getProductReviews(p.id) : [];
      if (!mounted) return;
      setReviews(revs);

      setQty(0);
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
    const maxStock = selectedVariant?.stock ?? product?.stock;
    const max = maxStock == null ? 999 : Number(maxStock);
    if (n < 0) return 0;
    if (n > max) return max;
    return n;
  };

  const currentPrice = useMemo(() => selectedVariant?.price_override ?? product?.price ?? 0, [selectedVariant, product]);
  const total = useMemo(() => currentPrice * qty, [currentPrice, qty]);

  const onShare = async () => {
    if (!product) return;
    const url = window.location.href;
    const text = `Cek ${product.name} di Ecosera (${formatCurrencyIDR(product.price)}/${product.unit})`;
    if (navigator.share) {
      try { await navigator.share({ title: product.name, text, url }); } catch { }
    } else {
      try { await navigator.clipboard.writeText(url); alert("Link disalin ke clipboard ✅"); } catch { }
    }
  };

  const onChatWA = () => {
    if (!product) return;

    const phone = (product.sellerPhone || "").replace(/\D/g, "");
    const variantText = selectedVariant ? ` (${selectedVariant.variant_name})` : "";
    const text = encodeURIComponent(
      `Halo ${product.sellerName ?? "Seller"}, saya ingin pesan:\n` +
      `• Produk: ${product.name}${variantText}\n` +
      `• Jumlah: ${qty} ${product.unit}\n` +
      `• Total: ${formatCurrencyIDR(total)}\n\n` +
      `Link produk: ${window.location.href}`
    );

    // 🔹 Redirect immediately to prevent popup blockers
    const waUrl = `https://wa.me/${phone}?text=${text}`;
    window.open(waUrl, "_blank", "noopener,noreferrer");

    // Log WhatsApp click
    analytics.product.waClick(product.id, product.seller_id);
  };

  const onAddToCart = () => {
    if (!product) return;
    const cartId = selectedVariant ? `${product.id}-${selectedVariant.id}` : product.id;
    addToCart({
      id: cartId,
      name: product.name,
      price: currentPrice,
      thumb: product.image,
      sellerName: product.sellerName,
      variantName: selectedVariant?.variant_name
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
    if (reviews.length > 0) {
      const sum = reviews.reduce((acc, r) => acc + r.rating, 0);
      return (sum / reviews.length).toFixed(1);
    }
    // No reviews – only show rating if the product has a real one (> 0)
    if (product?.rating && product.rating > 0) return product.rating.toFixed(1);
    return null; // no rating to display
  }, [reviews, product]);

  const images = useMemo(() => allImagesOf(product), [product]);


  if (loading) {
    return (
      <>
        <div className="w-full min-h-screen bg-white">
          {/* Header Skeleton — fixed like the Home Header to avoid blink during route transition */}
          <div
            className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl z-50 pt-[env(safe-area-inset-top)]"
            style={{ backgroundColor: UI.BRAND.PRIMARY }}
          >
            <div className="flex items-center justify-between px-5 pb-5 pt-[18px]">
              <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
              <div className="flex gap-2">
                <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
                <div className="w-9 h-9 rounded-full bg-white/20 animate-pulse" />
              </div>
            </div>
          </div>
          {/* Spacer to compensate for fixed header — matched to actual header height to avoid white gap */}
          <div style={{ height: 'calc(67px + env(safe-area-inset-top))' }} />

          {/* Gallery Image Skeleton */}
          <div className="w-full aspect-square bg-slate-200 animate-pulse" />

          {/* Content Skeleton */}
          <div className="px-4 mt-5 space-y-4">
            <div className="h-6 bg-slate-200 rounded-md w-3/4 animate-pulse" />
            <div className="h-8 bg-slate-200 rounded-md w-1/3 animate-pulse mt-3" />
            <div className="flex gap-2 mt-3">
              <div className="w-20 h-5 bg-slate-200 rounded-md animate-pulse" />
              <div className="w-24 h-5 bg-slate-200 rounded-md animate-pulse" />
            </div>

            {/* Seller Skeleton */}
            <div className="mt-6 flex items-center justify-between rounded-2xl border p-3">
              <div className="flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-slate-200 animate-pulse" />
                <div className="space-y-2">
                  <div className="h-4 bg-slate-200 rounded-md w-24 animate-pulse" />
                  <div className="h-3 bg-slate-200 rounded-md w-32 animate-pulse" />
                </div>
              </div>
              <div className="flex gap-2">
                <div className="w-8 h-4 bg-slate-200 rounded-md animate-pulse" />
                <div className="w-8 h-4 bg-slate-200 rounded-md animate-pulse" />
              </div>
            </div>

            {/* Description Skeleton */}
            <div className="mt-6 space-y-3">
              <div className="h-4 bg-slate-200 rounded-md w-1/4 animate-pulse mb-4" />
              <div className="h-4 bg-slate-200 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-md w-full animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-md w-5/6 animate-pulse" />
              <div className="h-4 bg-slate-200 rounded-md w-2/3 animate-pulse" />
            </div>
          </div>

          {/* Bottom Bar Skeleton */}
          <div className="sticky bottom-0 z-30 w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto bg-white border-t px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            <div className="flex gap-2">
              <div className="flex-1 h-11 bg-slate-200 rounded-xl animate-pulse" />
              <div className="flex-[2] h-11 bg-slate-200 rounded-xl animate-pulse" />
            </div>
          </div>
        </div>
      </>
    );
  }

  if (!product) {
    return (
      <>
        <div className="mx-auto w-full max-w-md min-h-screen bg-white">
          <div className="p-4">
            <button onClick={goBack} className="inline-flex items-center gap-2 text-sm" style={{ color: ACCENT }}>
              <ArrowLeft size={18} /> Kembali
            </button>
            <div className="mt-6 rounded-2xl bg-red-50 p-4 text-red-600">
              <PackageOpen className="inline -mt-1 mr-2" /> Produk tidak ditemukan.
            </div>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <div className="w-full min-h-screen bg-white text-gray-900">
        {/* Header — fixed like the Home Header so there's no blink during route transitions */}
        <div
          className="fixed top-0 left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl z-50 pt-[env(safe-area-inset-top)]"
          style={{ backgroundColor: UI.BRAND.PRIMARY }}
        >
          <div className="flex items-center justify-between px-5 pb-5 pt-[18px]">
            <button onClick={goBack} className="p-1.5 rounded-full text-white" aria-label="Back">
              <ArrowLeft size={22} strokeWidth={2} />
            </button>
            <div className="flex items-center gap-2">
              <button onClick={() => navigate('/search')} className="p-1.5 rounded-full bg-white/20 text-white" aria-label="Search">
                <Search size={20} strokeWidth={2} />
              </button>
              <button onClick={onShare} className="p-1.5 rounded-full bg-white/20 text-white" aria-label="Share">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2v6c-6.5 0-10 4.5-10 12 2.5-4 6-6 10-6v6l10-9-10-9z" />
                </svg>
              </button>
              <button onClick={() => navigate('/cart')} className="relative p-1.5 rounded-full bg-white/20 text-white" aria-label="Cart">
                <ShoppingCart size={20} strokeWidth={2} />
                {cartCount > 0 && (
                  <span className="absolute -top-1 -right-1 flex h-4 min-w-[16px] items-center justify-center rounded-full bg-[#FFC220] px-1 text-[10px] font-bold text-brand-navy shadow-sm border border-[#FFC220]">
                    {cartCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>
        {/* Spacer to compensate for fixed header — matched to actual header height to avoid white gap */}
        <div style={{ height: 'calc(67px + env(safe-area-inset-top))' }} />

        <ProductGallery
          images={images}
          productName={product.name}
          accentColor={ACCENT}
          placeholder={PLACEHOLDER}
        />

        {/* Content */}
        <div className="px-4 pb-32">
          <ProductMainInfo
            product={product}
            liked={liked}
            toggleWishlist={toggleWishlist}
            showToast={show}
            accentColor={ACCENT}
            displayRating={displayRating}
            reviewsCount={reviews.length}
            selectedVariant={selectedVariant}
            setSelectedVariant={setSelectedVariant}
            qty={qty}
            setQty={setQty}
            clampQty={clampQty}
            currentPrice={currentPrice}
            total={total}
            outOfStock={outOfStock}
          />

          <SellerInfo product={product} />

          <ReviewSection
            reviews={reviews}
            reviewerName={reviewerName}
            setReviewerName={setReviewerName}
            contactInfo={contactInfo}
            setContactInfo={setContactInfo}
            reviewRating={reviewRating}
            setReviewRating={setReviewRating}
            reviewComment={reviewComment}
            setReviewComment={setReviewComment}
            submittingReview={submittingReview}
            onSubmitReview={onSubmitReview}
          />


          {/* Related */}
          <div className="mt-6">
            <h3 className="text-sm font-semibold mb-2">Produk Terkait</h3>
            
            {loading ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {[1, 2, 3].map(i => (
                  <div key={i} className="min-w-[160px] rounded-xl border overflow-hidden animate-pulse">
                    <div className="h-28 w-full bg-slate-200" />
                    <div className="p-2 space-y-2">
                      <div className="h-3 bg-slate-200 rounded w-full" />
                      <div className="h-4 bg-slate-200 rounded w-1/2" />
                    </div>
                  </div>
                ))}
              </div>
            ) : related.length > 0 ? (
              <div className="flex gap-3 overflow-x-auto pb-1">
                {related.map(r => (
                  <Link key={r.id} to={`/product/${r.slug || r.id}`} className="min-w-[160px] rounded-xl border overflow-hidden">
                    <img src={r.image || PLACEHOLDER} alt={r.name} className="h-28 w-full object-cover" loading="lazy"
                      onError={(e) => { (e.currentTarget as HTMLImageElement).src = PLACEHOLDER; }} />
                    <div className="p-2">
                      <p className="text-xs line-clamp-2">{r.name}</p>
                      <p className="text-sm font-semibold mt-1" style={{ color: ACCENT }}>{formatCurrencyIDR(r.price)}</p>
                    </div>
                  </Link>
                ))}
              </div>
            ) : (
              <p className="text-xs text-slate-400">Tidak ada produk terkait.</p>
            )}
          </div>
          
          {/* Recently Viewed Strip */}
          <div className="-mx-4 mt-8">
            <RecentlyViewedStrip 
              productIds={recentlyViewedIds.filter(id => id !== product?.id)} 
              productsData={allProducts} 
            />
          </div>
        </div>

        {/* Sticky Actions */}
        <div className="sticky bottom-0 z-30 w-full max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="w-full border-t bg-white px-3 pb-[calc(12px+env(safe-area-inset-bottom))] pt-3">
            <div className="flex items-center gap-2">
              <button onClick={onAddToCart} disabled={outOfStock || qty === 0}
                className={`flex-1 h-11 rounded-xl border border-slate-300 inline-flex items-center justify-center gap-2 text-sm font-medium text-slate-700 bg-white hover:bg-slate-50 transition-colors ${(outOfStock || qty === 0) ? "opacity-50 cursor-not-allowed" : ""}`}
                aria-label="Tambahkan ke Keranjang">
                <Plus size={18} /> Keranjang
              </button>
              <button onClick={onChatWA} disabled={outOfStock || qty === 0}
                className={`flex-[2] h-11 rounded-xl inline-flex items-center justify-center gap-2 text-sm font-semibold text-white transition-colors ${outOfStock ? "opacity-50 cursor-not-allowed" : ""}`}
                style={{ backgroundColor: outOfStock ? "#9ca3af" : (qty === 0 ? "#cbd5e1" : ACCENT), color: qty === 0 ? "#64748b" : "white" }}
                aria-label="Pesan lewat WhatsApp">
                <MessageCircle size={18} /> {qty === 0 ? "Masukkan Jumlah Produk" : "Pesan lewat WA"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
