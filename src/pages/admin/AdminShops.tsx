import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Store, ChevronRight, Pencil, Package, Plus } from "lucide-react";
import { supabase } from "../../lib/supabase";

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
        <div className="min-h-screen relative overflow-hidden pb-8">
            {/* Background */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
            </div>

            <div className="relative z-10 px-4 pt-4 max-w-4xl mx-auto">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center gap-3">
                        <Link
                            to="/admin"
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                        <div className="flex items-center gap-2">
                            <Store className="h-6 w-6 text-blue-600" />
                            <h1 className="text-xl font-bold text-slate-900">Kelola Toko</h1>
                        </div>
                    </div>

                    <Link
                        to="/admin/shops/new"
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium transition-all shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Toko
                    </Link>
                </div>

                {/* Content */}
                {loading && <div className="text-center py-12 text-slate-600">Memuat toko…</div>}
                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">{error}</div>
                )}

                {!loading && !error && (
                    <div className="space-y-3">
                        {sellers.length === 0 ? (
                            <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-8 text-center">
                                <p className="text-sm text-slate-500">
                                    Belum ada toko/penjual terdaftar. Tambahkan di Supabase terlebih dahulu.
                                </p>
                            </div>
                        ) : (
                            sellers.map((s) => (
                                <div
                                    key={s.id}
                                    className="flex items-center justify-between bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4"
                                >
                                    {/* Shop Info */}
                                    <div className="flex items-center gap-3">
                                        <div className="h-12 w-12 rounded-xl bg-blue-100 grid place-items-center overflow-hidden flex-shrink-0">
                                            {s.logo_url ? (
                                                <img src={s.logo_url} alt={s.name} className="h-full w-full object-cover" />
                                            ) : (
                                                <Store className="h-5 w-5 text-blue-600" />
                                            )}
                                        </div>
                                        <div>
                                            <p className="font-medium text-slate-900">{s.name}</p>
                                            <p className="text-xs text-slate-500">
                                                {s.phone || "Belum ada kontak"}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Actions */}
                                    <div className="flex items-center gap-2">
                                        <Link
                                            to={`/admin/shops/${s.id}/edit`}
                                            className="p-2 rounded-lg text-slate-500 hover:bg-slate-100 transition-colors"
                                            title="Edit Profil"
                                        >
                                            <Pencil className="h-4 w-4" />
                                        </Link>
                                        <Link
                                            to={`/admin/shops/${s.id}/products`}
                                            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-blue-50 text-blue-600 hover:bg-blue-100 transition-colors text-xs font-medium"
                                        >
                                            <Package className="h-3.5 w-3.5" />
                                            Produk
                                        </Link>
                                        <Link
                                            to={`/admin/shops/${s.id}/products`}
                                            className="text-slate-400 hover:text-blue-500 transition-colors"
                                        >
                                            <ChevronRight className="h-5 w-5" />
                                        </Link>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
