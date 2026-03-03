import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Store, Package, Plus } from "lucide-react";
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
        <div className="max-w-4xl mx-auto">
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
                <div className="space-y-3">
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
                    ) : (
                        sellers.map((s) => (
                            <div
                                key={s.id}
                                className="flex items-center justify-between bg-white rounded-xl border border-slate-200/80 p-4 hover:shadow-md transition-shadow duration-200"
                            >
                                {/* Shop Info */}
                                <div className="flex items-center gap-3">
                                    <div
                                        className="h-11 w-11 rounded-lg grid place-items-center overflow-hidden flex-shrink-0"
                                        style={{
                                            backgroundColor: C.blue + "15",
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
                                                className="h-5 w-5"
                                                style={{ color: C.blue }}
                                            />
                                        )}
                                    </div>
                                    <div>
                                        <p
                                            className="font-medium text-[15px]"
                                            style={{ color: C.navy }}
                                        >
                                            {s.name}
                                        </p>
                                        <p className="text-xs text-slate-500">
                                            {s.phone || "Belum ada kontak"}
                                        </p>
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2">
                                    <Link
                                        to={`/admin/shops/${s.id}/edit`}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 transition-colors text-xs font-medium"
                                    >
                                        Edit Profil
                                    </Link>
                                    <Link
                                        to={`/admin/shops/${s.id}/products`}
                                        className="flex items-center gap-1.5 px-3 py-2 rounded-lg text-white text-xs font-medium transition-colors hover:opacity-90"
                                        style={{ backgroundColor: C.blue }}
                                    >
                                        <Package className="h-3.5 w-3.5" />
                                        Produk
                                    </Link>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}
        </div>
    );
}
