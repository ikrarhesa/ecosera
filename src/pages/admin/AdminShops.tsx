import { useState, useEffect, useMemo } from "react";
import { Link } from "react-router-dom";
import { Store, Package, Plus, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { supabase } from "../../lib/supabase";

const C = {
    blue: "#0071DC",
    navy: "#041E42",
};

interface SellerRow {
    id: string;
    name: string;
    logo_url: string | null;
    phone: string | null;
}

export default function AdminShops() {
    const [sellers, setSellers] = useState<SellerRow[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const [searchQuery, setSearchQuery] = useState("");
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 20;

    const filteredSellers = useMemo(() => {
        return sellers.filter((s) => {
            const query = searchQuery.toLowerCase();
            return (
                s.name.toLowerCase().includes(query) ||
                (s.phone && s.phone.includes(query))
            );
        });
    }, [sellers, searchQuery]);

    const totalPages = Math.ceil(filteredSellers.length / itemsPerPage);

    const paginatedSellers = useMemo(() => {
        const startIndex = (currentPage - 1) * itemsPerPage;
        return filteredSellers.slice(startIndex, startIndex + itemsPerPage);
    }, [filteredSellers, currentPage]);

    useEffect(() => {
        setCurrentPage(1);
    }, [searchQuery]);

    useEffect(() => {
        (async () => {
            setLoading(true);
            const { data, error: fetchErr } = await supabase
                .from("sellers")
                .select("id, name, logo_url, phone")
                .order("name");
            if (fetchErr) {
                console.error("[AdminShops]", fetchErr);
                setError(fetchErr.message);
            } else {
                setSellers((data as SellerRow[]) || []);
            }
            setLoading(false);
        })();
    }, []);

    return (
        <div className="max-w-7xl mx-auto w-full">
            {/* Page heading */}
            <div className="flex items-center justify-between mb-6 md:mb-8">
                <div>
                    <h1
                        className="text-2xl md:text-3xl font-bold"
                        style={{ color: C.navy }}
                    >
                        Kelola Toko
                    </h1>
                    <p className="text-sm text-slate-500 mt-1">
                        {sellers.length} toko terdaftar
                    </p>
                </div>
                <Link
                    to="/admin/shops/new"
                    className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                    style={{ backgroundColor: C.blue }}
                >
                    <Plus className="h-4 w-4" />
                    Tambah Toko
                </Link>
            </div>

            {/* Search Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-5 w-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Cari toko berdasarkan nama atau nomor telepon..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-11 pr-4 py-3 bg-white border border-slate-200/80 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#0071DC]/20 focus:border-[#0071DC] transition-all"
                />
            </div>

            {/* Loading */}
            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div
                        className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
                        style={{
                            borderColor: C.blue,
                            borderTopColor: "transparent",
                        }}
                    />
                </div>
            )}

            {/* Error */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
                    {error}
                </div>
            )}

            {/* Content */}
            {!loading && !error && (
                <div className="space-y-4">
                    {sellers.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
                            <Store className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">
                                Belum ada toko terdaftar
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Tambahkan toko pertama Anda
                            </p>
                        </div>
                    ) : filteredSellers.length === 0 ? (
                        <div className="bg-white rounded-xl border border-slate-200/80 p-12 text-center">
                            <Search className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">
                                Toko tidak ditemukan
                            </p>
                            <p className="text-sm text-slate-400 mt-1">
                                Tidak ada toko yang cocok dengan pencarian "{searchQuery}"
                            </p>
                        </div>
                    ) : (
                        <>
                            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                {paginatedSellers.map((s) => (
                                    <div
                                        key={s.id}
                                        className="bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow duration-200 flex flex-col"
                                    >
                                        {/* Shop Info */}
                                        <div className="flex flex-col items-center text-center gap-3 mb-4">
                                            <div
                                                className="h-16 w-16 rounded-full grid place-items-center overflow-hidden flex-shrink-0 border border-slate-100 shadow-sm"
                                                style={{
                                                    backgroundColor: C.blue + "08",
                                                }}
                                            >
                                                {s.logo_url ? (
                                                    <img
                                                        src={s.logo_url}
                                                        alt={s.name}
                                                        className="h-full w-full object-cover"
                                                    />
                                                ) : (
                                                    <Store
                                                        className="h-7 w-7"
                                                        style={{ color: C.blue }}
                                                    />
                                                )}
                                            </div>
                                            <div>
                                                <p
                                                    className="font-semibold text-sm line-clamp-2 leading-snug"
                                                    style={{ color: C.navy }}
                                                >
                                                    {s.name}
                                                </p>
                                                <p className="text-xs text-slate-500 mt-1">
                                                    {s.phone || "Belum ada kontak"}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Actions */}
                                        <div className="mt-auto grid grid-cols-2 gap-2 pt-3 border-t border-slate-100">
                                            <Link
                                                to={`/admin/shops/${s.id}/edit`}
                                                className="flex items-center justify-center py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium"
                                            >
                                                Edit
                                            </Link>
                                            <Link
                                                to={`/admin/shops/${s.id}/products`}
                                                className="flex items-center justify-center py-2 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
                                                style={{ backgroundColor: C.blue }}
                                            >
                                                <Package className="h-3.5 w-3.5 mr-1" />
                                                Produk
                                            </Link>
                                        </div>
                                    </div>
                                ))}
                            </div>
                            
                            {totalPages > 1 && (
                                <div className="flex items-center justify-between bg-white px-4 py-3 border border-slate-200/80 rounded-xl mt-4">
                                    <p className="text-sm text-slate-500">
                                        Menampilkan{" "}
                                        <span className="font-medium text-slate-700">
                                            {(currentPage - 1) * itemsPerPage + 1}
                                        </span>{" "}
                                        sampai{" "}
                                        <span className="font-medium text-slate-700">
                                            {Math.min(currentPage * itemsPerPage, filteredSellers.length)}
                                        </span>{" "}
                                        dari{" "}
                                        <span className="font-medium text-slate-700">
                                            {filteredSellers.length}
                                        </span>{" "}
                                        toko
                                    </p>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                                            disabled={currentPage === 1}
                                            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronLeft className="h-4 w-4" />
                                        </button>
                                        <button
                                            onClick={() => setCurrentPage((p) => Math.min(totalPages, p + 1))}
                                            disabled={currentPage === totalPages}
                                            className="p-2 rounded-lg border border-slate-200 text-slate-600 disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 transition-colors"
                                        >
                                            <ChevronRight className="h-4 w-4" />
                                        </button>
                                    </div>
                                </div>
                            )}
                        </>
                    )}
                </div>
            )}
        </div>
    );
}
