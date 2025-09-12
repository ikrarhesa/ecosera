import React, { useEffect, useMemo, useRef, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import {
  ArrowLeft, Heart, Share2, Star, MapPin, ChevronLeft, ChevronRight,
  MessageCircle, ShoppingCart, ShieldCheck, Truck, PackageOpen, Check
} from "lucide-react";
import type { Product } from "../types/product";
import { getProductById, getRelatedProducts, allImagesOf } from "../services/products";
import { addToCart } from "../services/cart";

const ACCENT = "#2254c5";
const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera";

const fmtIDR = (n: number) =>
  new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const [product, setProduct] = useState<Product | null>(null);
  const [loading, setLoading] = useState(true);
  const [liked, setLiked] = useState(false);
  const [qty, setQty] = useState(1);
  const [related, setRelated] = useState<Product[]>([]);

  const galleryRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    let mounted = true;
    (async () => {
      setLoading(true);
      const p = await getProductById(String(id));
      if (!mounted) return;
      setProduct(p);
      setQty(1);
      setIdx(0);
      if (p) setRelated(await getRelatedProducts(p.category, p.id, 10));
      else setRelated([]);
      setLoading(false);
    })();
    return () => { mounted = false; };
  }, [id]);

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
      try { await navigator.share({ title: product.name, text, url }); } catch {}
    } else {
      try { await navigator.clipboard.writeText(url); alert("Link disalin ke clipboard ✅"); } catch {}
    }
  };

  const onChatWA = () => {
    if (!product) return;
    const phone = (product.sellerPhone || "").replace(/\D/g, "");
    const text = encodeURIComponent(
      `Halo ${product.sellerName ?? "Seller"}, saya ingin pesan:\n` +
      `• Produk: ${product.name}\n` +
      `• Jumlah: ${qty} ${product.unit}\n` +
      `• Total: ${fmtIDR(total)}\n\n` +
      `Link produk: ${window.location.href}`
    );
    window.open(`https://wa.me/${phone}?text=${text}`, "_blank");
  };

  const onAddToCart = () => {
    if (!product) return;
    addToCart({ product, quantity: qty });
    navigate("/cart");
  };

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
    <div className="mx-auto w-full max-w-md min-h
