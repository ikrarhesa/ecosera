import { useState, useEffect, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import {
    ArrowLeft,
    MapPin,
    Phone,
    Mail,
    Instagram,
    Facebook,
    Store,
    ExternalLink,
    Package,
    MessageCircle,
    Search,
} from "lucide-react";
import { supabase } from "../lib/supabase";

/* ── Walmart brand tokens ── */
const C = {
    blue: "#0071DC",
    navy: "#041E42",
    yellow: "#FFC220",
    bg: "#F5F6F8",
};

interface Seller {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    social_media: {
        whatsapp?: string;
        instagram?: string;
        facebook?: string;
        tiktok?: string;
    } | null;
}

interface ProductRow {
    id: string;
    name: string;
    slug: string;
    price: number;
    image_url: string | null;
    images: string[] | null;
    thumb: string | null;
}

const PLACEHOLDER = "https://placehold.co/400x400/png?text=Ecosera";

const fmtIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", {
        style: "currency",
        currency: "IDR",
        maximumFractionDigits: 0,
    }).format(n);

export default function SellerShop() {
    const { seller_id } = useParams<{ seller_id: string }>();
    const navigate = useNavigate();

    const [seller, setSeller] = useState<Seller | null>(null);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearchFocused, setIsSearchFocused] = useState(false);
    const [loading, setLoading] = useState(true);
    const searchContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (searchContainerRef.current && !searchContainerRef.current.contains(event.target as Node)) {
                setIsSearchFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    useEffect(() => {
        if (!seller_id) return;
        (async () => {
            setLoading(true);

            const { data: sellerData } = await supabase
                .from("sellers")
                .select("*")
                .eq("id", seller_id)
                .single();
            setSeller(sellerData as Seller | null);

            const { data: prodData, error: prodErr } = await supabase
                .from("products")
                .select("*")
                .eq("seller_id", seller_id)
                .eq("is_active", true)
                .order("created_at", { ascending: false });
            if (prodErr)
                console.error("[SellerShop] products error:", prodErr);
            setProducts((prodData as ProductRow[]) || []);

            setLoading(false);
        })();
    }, [seller_id]);

    const getProductImage = (p: ProductRow) => {
        if (p.images && p.images.length > 0) return p.images[0];
        if (p.image_url) return p.image_url;
        if (p.thumb) return p.thumb;
        return PLACEHOLDER;
    };

    const filteredProducts = products.filter(p =>
        p.name.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const social = seller?.social_media;

    /* ── Loading ── */
    if (loading) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: C.bg }}
            >
                <div className="flex flex-col items-center gap-3">
                    <div
                        className="h-8 w-8 border-[3px] border-t-transparent rounded-full animate-spin"
                        style={{
                            borderColor: C.blue,
                            borderTopColor: "transparent",
                        }}
                    />
                    <p className="text-sm text-slate-500">Memuat toko…</p>
                </div>
            </div>
        );
    }

    /* ── Not found ── */
    if (!seller) {
        return (
            <div
                className="min-h-screen flex items-center justify-center"
                style={{ background: C.bg }}
            >
                <div className="text-center">
                    <Store className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                    <p
                        className="text-lg font-semibold"
                        style={{ color: C.navy }}
                    >
                        Toko tidak ditemukan
                    </p>
                    <button
                        onClick={() => navigate("/")}
                        className="mt-3 text-sm font-medium hover:underline"
                        style={{ color: C.blue }}
                    >
                        Kembali ke beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen pb-24" style={{ background: C.bg }}>
            {/* ── Header / Search ── */}
            <div className="sticky top-0 z-40 bg-white shadow-sm border-b border-slate-200 w-full">
                <div className="max-w-3xl mx-auto px-4 pb-3 flex items-center gap-3 pt-[calc(12px+env(safe-area-inset-top))]">
                    <button
                        onClick={() => navigate(-1)}
                        className="p-2 sm:p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 transition-all active:scale-95 shrink-0"
                    >
                        <ArrowLeft className="h-5 w-5" style={{ color: C.navy }} />
                    </button>

                    <div className="flex-1 relative" ref={searchContainerRef}>
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                            <Search className="h-4 w-4 text-slate-400" />
                        </div>
                        <input
                            type="text"
                            placeholder="Cari di toko ini..."
                            value={searchQuery}
                            onFocus={() => setIsSearchFocused(true)}
                            onChange={(e) => {
                                setSearchQuery(e.target.value);
                                setIsSearchFocused(true);
                            }}
                            className="block w-full pl-9 pr-3 py-2 border border-slate-300 rounded-full leading-5 bg-slate-50 placeholder-slate-400 focus:bg-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm transition-all"
                        />

                        {/* Suggestions Dropdown */}
                        {isSearchFocused && searchQuery.trim().length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[100]">
                                <button
                                    onClick={() => setIsSearchFocused(false)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors border-b border-slate-50"
                                >
                                    <Store className="h-4 w-4 text-slate-400" />
                                    <span className="text-sm text-slate-700 line-clamp-1">
                                        Cari <strong>"{searchQuery}"</strong> di toko ini
                                    </span>
                                </button>
                                <button
                                    onClick={() => navigate(`/search?q=${encodeURIComponent(searchQuery)}`)}
                                    className="w-full text-left flex items-center gap-3 px-4 py-3 hover:bg-slate-50 transition-colors"
                                >
                                    <Search className="h-4 w-4 text-blue-500" />
                                    <span className="text-sm text-blue-600 line-clamp-1">
                                        Cari <strong>"{searchQuery}"</strong> di Ecosera
                                    </span>
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* ── Banner ── */}
            <div className="relative h-44 sm:h-56 md:h-64 overflow-hidden">
                {seller.banner_url ? (
                    <img
                        src={seller.banner_url}
                        alt="Banner"
                        className="absolute inset-0 w-full h-full object-cover"
                    />
                ) : (
                    <div
                        className="absolute inset-0"
                        style={{
                            background: `linear-gradient(135deg, ${C.navy} 0%, ${C.blue} 100%)`,
                        }}
                    >
                        {/* Subtle pattern overlay */}
                        <div
                            className="absolute inset-0 opacity-[0.06]"
                            style={{
                                backgroundImage: `url("data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E")`,
                            }}
                        />
                    </div>
                )}
                {/* Gradient overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent" />
            </div>

            {/* ── Profile Card ── */}
            <div className="max-w-3xl mx-auto px-4 -mt-14 relative z-10">
                <div className="bg-white rounded-2xl shadow-lg border border-slate-200/60">
                    <div className="p-5 sm:p-6">
                        <div className="flex items-start gap-4">
                            {/* Logo */}
                            <div
                                className="h-20 w-20 sm:h-24 sm:w-24 -mt-14 rounded-2xl bg-white shadow-lg border-4 border-white grid place-items-center overflow-hidden flex-shrink-0"
                            >
                                {seller.logo_url ? (
                                    <img
                                        src={seller.logo_url}
                                        alt={seller.name}
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Store
                                        className="h-8 w-8"
                                        style={{ color: C.blue }}
                                    />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pt-1">
                                <h1
                                    className="text-xl sm:text-2xl font-bold truncate"
                                    style={{ color: C.navy }}
                                >
                                    {seller.name}
                                </h1>
                                {seller.address && (
                                    <p className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                                        <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                        <span className="truncate">
                                            {seller.address}
                                        </span>
                                    </p>
                                )}
                            </div>
                        </div>

                        {/* Description */}
                        {seller.description && (
                            <p className="text-sm text-slate-600 mt-4 leading-relaxed">
                                {seller.description}
                            </p>
                        )}

                        {/* Contact & Social pills */}
                        {(seller.phone ||
                            seller.email ||
                            social?.whatsapp ||
                            social?.instagram ||
                            social?.facebook ||
                            social?.tiktok) && (
                                <div className="flex flex-wrap gap-2 mt-4 pt-4 border-t border-slate-100">
                                    {social?.whatsapp && (
                                        <a
                                            href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-green-50 text-green-700 hover:bg-green-100"
                                        >
                                            <MessageCircle className="h-3.5 w-3.5" />{" "}
                                            WhatsApp
                                        </a>
                                    )}
                                    {seller.phone && (
                                        <a
                                            href={`tel:${seller.phone}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors bg-slate-100 text-slate-700 hover:bg-slate-200"
                                        >
                                            <Phone className="h-3.5 w-3.5" />{" "}
                                            {seller.phone}
                                        </a>
                                    )}
                                    {seller.email && (
                                        <a
                                            href={`mailto:${seller.email}`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: C.blue + "10",
                                                color: C.blue,
                                            }}
                                        >
                                            <Mail className="h-3.5 w-3.5" />{" "}
                                            {seller.email}
                                        </a>
                                    )}
                                    {social?.instagram && (
                                        <a
                                            href={`https://instagram.com/${social.instagram.replace("@", "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors"
                                        >
                                            <Instagram className="h-3.5 w-3.5" />{" "}
                                            {social.instagram}
                                        </a>
                                    )}
                                    {social?.facebook && (
                                        <a
                                            href={
                                                social.facebook.startsWith("http")
                                                    ? social.facebook
                                                    : `https://facebook.com/${social.facebook}`
                                            }
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-colors"
                                            style={{
                                                backgroundColor: C.blue + "10",
                                                color: C.blue,
                                            }}
                                        >
                                            <Facebook className="h-3.5 w-3.5" />{" "}
                                            Facebook
                                        </a>
                                    )}
                                    {social?.tiktok && (
                                        <a
                                            href={`https://tiktok.com/@${social.tiktok.replace("@", "")}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                                        >
                                            <ExternalLink className="h-3.5 w-3.5" />{" "}
                                            TikTok
                                        </a>
                                    )}
                                </div>
                            )}
                    </div>
                </div>
            </div>

            {/* ── Products Section ── */}
            <div className="max-w-3xl mx-auto px-4 mt-8">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-4">
                    <h2
                        className="text-lg font-bold flex items-center gap-2"
                        style={{ color: C.navy }}
                    >
                        <Package
                            className="h-5 w-5"
                            style={{ color: C.blue }}
                        />
                        Produk{" "}
                        <span className="text-sm font-normal text-slate-500">
                            ({products.length})
                        </span>
                    </h2>
                </div>

                {products.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/60 p-10 text-center">
                        <Store className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                            Belum ada produk yang tersedia.
                        </p>
                    </div>
                ) : filteredProducts.length === 0 ? (
                    <div className="bg-white rounded-xl border border-slate-200/60 p-10 text-center">
                        <Search className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">
                            Tidak ada produk yang cocok dengan pencarian "{searchQuery}".
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 md:gap-4">
                        {filteredProducts.map((p) => (
                            <Link
                                key={p.id}
                                to={`/product/${p.slug}`}
                                className="bg-white rounded-xl border border-slate-200/60 overflow-hidden hover:shadow-xl transition-all duration-300 group flex flex-col"
                            >
                                <div className="aspect-square bg-slate-100 overflow-hidden">
                                    <img
                                        src={getProductImage(p)}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3 md:p-4 flex flex-col flex-1">
                                    <p
                                        className="text-sm md:text-base font-medium line-clamp-2 leading-snug mb-2"
                                        style={{ color: C.navy }}
                                    >
                                        {p.name}
                                    </p>
                                    <p
                                        className="text-sm md:text-base font-bold mt-auto"
                                        style={{ color: C.blue }}
                                    >
                                        {fmtIDR(p.price)}
                                    </p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
