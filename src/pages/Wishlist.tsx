import { useState, useEffect } from "react";
import { useWishlist } from "../context/WishlistContext";
import { Heart, Trash2 } from "lucide-react";
import { useNavigate, Link } from "react-router-dom";
import { useToast } from "../context/ToastContext";
import { primaryImageOf } from "../services/products";
import { formatCurrencyIDR } from "../utils/format";
import { UI } from "../config/ui";


export default function Wishlist() {
    const { wishlist, toggleWishlist } = useWishlist();
    const navigate = useNavigate();
    const { show } = useToast();
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set());
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        // Simulate network loading state for smoother UX
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 800);
        return () => clearTimeout(timer);
    }, []);

    const toggleSelect = (id: string, e: React.MouseEvent) => {
        e.preventDefault();
        e.stopPropagation();
        const newSelected = new Set(selectedItems);
        if (newSelected.has(id)) {
            newSelected.delete(id);
        } else {
            newSelected.add(id);
        }
        setSelectedItems(newSelected);
    };

    const handleBatchDelete = () => {
        if (selectedItems.size === 0) return;

        // Items to delete
        const itemsToDelete = wishlist.filter(p => selectedItems.has(p.id));

        // Remove from wishlist context
        itemsToDelete.forEach(p => {
            toggleWishlist(p);
        });

        show(`${selectedItems.size} produk dihapus`);
        setSelectedItems(new Set());
    };

    return (
        <div className="min-h-screen bg-[white] pb-28">
            {/* Title Strip - Matches Etalase Category Strip profile */}
            <div className="bg-white px-5 py-3 flex items-center justify-between border-b border-slate-200 mb-3">
                <div>
                    <h1 className="font-semibold text-slate-900 text-lg">Tersimpan</h1>
                    <p className="text-xs text-slate-500 mt-0.5">{wishlist.length} produk</p>
                </div>
                {selectedItems.size > 0 && !isLoading && (
                    <button
                        onClick={handleBatchDelete}
                        className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 text-red-600 rounded-lg text-xs font-medium border border-red-100 hover:bg-red-100 transition-colors"
                    >
                        <Trash2 className="h-3.5 w-3.5" />
                        <span>Hapus ({selectedItems.size})</span>
                    </button>
                )}
            </div>

            <main className="px-5">
                {isLoading ? (
                    <div className="flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="flex items-center p-4 border-b border-slate-100 last:border-b-0 animate-pulse">
                                <div className="pr-3">
                                    <div className="w-5 h-5 rounded border-[1.5px] border-slate-200 bg-slate-200"></div>
                                </div>
                                <div className="w-20 h-20 flex-shrink-0 bg-slate-200 rounded-xl mr-3"></div>
                                <div className="flex-1 pr-3 flex flex-col justify-center gap-3">
                                    <div className="h-4 bg-slate-200 rounded w-full"></div>
                                    <div className="h-4 bg-slate-200 rounded w-2/3"></div>
                                </div>
                                <div>
                                    <div className="h-5 bg-slate-200 rounded w-20"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                ) : wishlist.length === 0 ? (
                    <div className="text-center mt-20">
                        <Heart className="h-16 w-16 text-slate-200 mx-auto mb-4" />
                        <p className="text-slate-800 font-semibold text-lg">Belum ada yang disimpan</p>
                        <p className="text-slate-500 mt-1 max-w-[250px] mx-auto text-sm leading-relaxed">Cari produk yang kamu suka dan simpan untuk nanti!</p>
                        <button
                            onClick={() => navigate("/")}
                            className="mt-6 px-6 py-2.5 rounded-full text-white font-medium hover:opacity-90 transition-colors shadow-sm text-sm"
                            style={{ backgroundColor: UI.BRAND.PRIMARY }}
                        >
                            Mulai Belanja
                        </button>
                    </div>
                ) : (
                    <div className="flex flex-col bg-white rounded-xl border border-slate-100 overflow-hidden shadow-sm">
                        {wishlist.map((p) => {
                            const isSelected = selectedItems.has(p.id);
                            return (
                                <Link to={`/product/${p.slug || p.id}`} key={p.id} className="flex items-center p-4 border-b border-slate-100 last:border-b-0 hover:bg-slate-50 transition-colors">
                                    <div
                                        className="pr-3 cursor-pointer"
                                        onClick={(e) => toggleSelect(p.id, e)}
                                    >
                                        {isSelected ? (
                                            <div 
                                                className="w-5 h-5 rounded flex items-center justify-center text-white shadow-sm"
                                                style={{ backgroundColor: UI.BRAND.PRIMARY, borderColor: UI.BRAND.PRIMARY }}
                                            >
                                                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        ) : (
                                            <div className="w-5 h-5 rounded border-[1.5px] border-slate-300 bg-white hover:border-slate-400 transition-colors"></div>
                                        )}
                                    </div>
                                    <div className="w-20 h-20 flex-shrink-0 bg-slate-50 rounded-lg overflow-hidden mr-3 border border-slate-100">
                                        <img
                                            src={primaryImageOf(p)}
                                            alt={p.name}
                                            className="w-full h-full object-cover"
                                            loading="lazy"
                                            onError={(e) => { (e.currentTarget as HTMLImageElement).src = UI.PLACEHOLDER; }}
                                        />
                                    </div>
                                    <div className="flex-1 min-w-0 pr-2 flex flex-col justify-center">
                                        <h4 className="text-sm font-medium text-slate-800 leading-snug line-clamp-2 mb-1">{p.name}</h4>
                                        <div className="text-[13px] text-slate-500 truncate">{p.sellerName || 'Toko Ecosera'}</div>
                                    </div>
                                    <div className="text-right whitespace-nowrap pointer-events-none">
                                        <div className="text-sm font-bold text-slate-900 tracking-tight">{formatCurrencyIDR(p.price)}</div>
                                    </div>
                                </Link>
                            );
                        })}
                    </div>
                )}
            </main>
        </div>
    );
}
