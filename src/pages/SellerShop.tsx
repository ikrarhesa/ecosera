import { useState, useEffect } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import { ArrowLeft, MapPin, Phone, Mail, Instagram, Facebook, Store, ExternalLink } from "lucide-react";
import { supabase } from "../lib/supabase";

interface Seller {
    id: string;
    name: string;
    description: string | null;
    logo_url: string | null;
    banner_url: string | null;
    phone: string | null;
    email: string | null;
    address: string | null;
    social_media: { whatsapp?: string; instagram?: string; facebook?: string; tiktok?: string } | null;
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
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function SellerShop() {
    const { seller_id } = useParams<{ seller_id: string }>();
    const navigate = useNavigate();

    const [seller, setSeller] = useState<Seller | null>(null);
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [loading, setLoading] = useState(true);

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
            if (prodErr) console.error("[SellerShop] products error:", prodErr);
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

    const social = seller?.social_media;

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600">Memuat toko…</p>
                </div>
            </div>
        );
    }

    if (!seller) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-50 to-blue-50">
                <div className="text-center">
                    <p className="text-lg font-medium text-slate-700">Toko tidak ditemukan</p>
                    <button onClick={() => navigate("/")} className="mt-3 text-sm text-blue-600 hover:underline">
                        Kembali ke beranda
                    </button>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 pb-24">
            {/* Back button */}
            <div className="fixed top-4 left-4 z-30">
                <button
                    onClick={() => navigate(-1)}
                    className="p-2 rounded-full bg-white/80 backdrop-blur-md shadow-lg border border-white/30 hover:bg-white transition-all"
                >
                    <ArrowLeft className="h-5 w-5 text-slate-700" />
                </button>
            </div>

            {/* Banner */}
            <div className="relative h-48 sm:h-56 bg-gradient-to-br from-blue-500 to-blue-700 overflow-hidden">
                {seller.banner_url ? (
                    <img src={seller.banner_url} alt="Banner" className="absolute inset-0 w-full h-full object-cover" />
                ) : (
                    <div className="absolute inset-0 bg-gradient-to-br from-blue-500 via-blue-600 to-indigo-700">
                        <div className="absolute inset-0 opacity-10" style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg width='40' height='40' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M0 20h40M20 0v40' stroke='%23fff' stroke-width='1' fill='none'/%3E%3C/svg%3E\")" }} />
                    </div>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
            </div>

            {/* Profile Card */}
            <div className="max-w-2xl mx-auto px-4 -mt-16 relative z-10">
                <div className="bg-white rounded-2xl shadow-xl border border-slate-100 p-5">
                    <div className="flex items-start gap-4">
                        {/* Logo */}
                        <div className="h-20 w-20 -mt-12 rounded-2xl bg-white shadow-lg border-4 border-white grid place-items-center overflow-hidden flex-shrink-0">
                            {seller.logo_url ? (
                                <img src={seller.logo_url} alt={seller.name} className="h-full w-full object-cover" />
                            ) : (
                                <Store className="h-8 w-8 text-blue-500" />
                            )}
                        </div>

                        <div className="flex-1 min-w-0 pt-1">
                            <h1 className="text-xl font-bold text-slate-900 truncate">{seller.name}</h1>
                            {seller.address && (
                                <p className="flex items-center gap-1 text-sm text-slate-500 mt-0.5">
                                    <MapPin className="h-3.5 w-3.5 flex-shrink-0" />
                                    <span className="truncate">{seller.address}</span>
                                </p>
                            )}
                        </div>
                    </div>

                    {/* Description */}
                    {seller.description && (
                        <p className="text-sm text-slate-600 mt-4 leading-relaxed">{seller.description}</p>
                    )}

                    {/* Contact & Social */}
                    <div className="flex flex-wrap gap-2 mt-4">
                        {seller.phone && (
                            <a href={`tel:${seller.phone}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors">
                                <Phone className="h-3.5 w-3.5" /> {seller.phone}
                            </a>
                        )}
                        {seller.email && (
                            <a href={`mailto:${seller.email}`} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors">
                                <Mail className="h-3.5 w-3.5" /> {seller.email}
                            </a>
                        )}
                        {social?.whatsapp && (
                            <a href={`https://wa.me/${social.whatsapp.replace(/\D/g, "")}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-green-50 text-green-700 text-xs font-medium hover:bg-green-100 transition-colors"
                            >
                                <Phone className="h-3.5 w-3.5" /> WhatsApp
                            </a>
                        )}
                        {social?.instagram && (
                            <a href={`https://instagram.com/${social.instagram.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-pink-50 text-pink-700 text-xs font-medium hover:bg-pink-100 transition-colors"
                            >
                                <Instagram className="h-3.5 w-3.5" /> {social.instagram}
                            </a>
                        )}
                        {social?.facebook && (
                            <a href={social.facebook.startsWith("http") ? social.facebook : `https://facebook.com/${social.facebook}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-blue-50 text-blue-700 text-xs font-medium hover:bg-blue-100 transition-colors"
                            >
                                <Facebook className="h-3.5 w-3.5" /> Facebook
                            </a>
                        )}
                        {social?.tiktok && (
                            <a href={`https://tiktok.com/@${social.tiktok.replace("@", "")}`} target="_blank" rel="noopener noreferrer"
                                className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-slate-100 text-slate-700 text-xs font-medium hover:bg-slate-200 transition-colors"
                            >
                                <ExternalLink className="h-3.5 w-3.5" /> TikTok
                            </a>
                        )}
                    </div>
                </div>
            </div>

            {/* Products Section */}
            <div className="max-w-2xl mx-auto px-4 mt-6">
                <h2 className="text-lg font-bold text-slate-900 mb-4">
                    Produk <span className="text-sm font-normal text-slate-500">({products.length})</span>
                </h2>

                {products.length === 0 ? (
                    <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 text-center">
                        <Store className="h-10 w-10 text-slate-300 mx-auto mb-2" />
                        <p className="text-sm text-slate-500">Belum ada produk yang tersedia.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-2 gap-3">
                        {products.map((p) => (
                            <Link
                                key={p.id}
                                to={`/product/${p.slug}`}
                                className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden hover:shadow-md transition-all group"
                            >
                                <div className="aspect-square bg-slate-100 overflow-hidden">
                                    <img
                                        src={getProductImage(p)}
                                        alt={p.name}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                                    />
                                </div>
                                <div className="p-3">
                                    <p className="text-sm font-medium text-slate-900 line-clamp-2 leading-tight">{p.name}</p>
                                    <p className="text-sm font-bold text-blue-600 mt-1.5">{fmtIDR(p.price)}</p>
                                </div>
                            </Link>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
