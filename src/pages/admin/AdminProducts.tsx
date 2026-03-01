import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, ArrowLeft, Package, Pencil, Trash2, ToggleLeft, ToggleRight } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface ProductRow {
    id: string;
    name: string;
    slug: string;
    price: number;
    is_active: boolean;
}

const fmtIDR = (n: number) =>
    new Intl.NumberFormat("id-ID", { style: "currency", currency: "IDR", maximumFractionDigits: 0 }).format(n);

export default function AdminProducts() {
    const { seller_id } = useParams<{ seller_id: string }>();
    const [products, setProducts] = useState<ProductRow[]>([]);
    const [shopName, setShopName] = useState("");
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    const fetchProducts = async () => {
        if (!seller_id) return;
        setLoading(true);

        const { data: sellerData } = await supabase
            .from("sellers")
            .select("name")
            .eq("id", seller_id)
            .single();
        if (sellerData) setShopName(sellerData.name);

        const { data, error: fetchErr } = await supabase
            .from("products")
            .select("id, name, slug, price, is_active")
            .eq("seller_id", seller_id)
            .order("created_at", { ascending: false });
        if (fetchErr) {
            console.error("[AdminProducts]", fetchErr);
            setError(fetchErr.message);
        } else {
            setProducts((data as ProductRow[]) || []);
        }
        setLoading(false);
    };

    useEffect(() => { fetchProducts(); }, [seller_id]);

    // ── Toggle active ──────────────────────────────────────
    const toggleActive = async (p: ProductRow) => {
        const newVal = !p.is_active;
        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: newVal } : x)));
        const { error: err } = await supabase
            .from("products")
            .update({ is_active: newVal })
            .eq("id", p.id);
        if (err) {
            console.error("[AdminProducts] toggle error:", err);
            setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !newVal } : x)));
        }
    };

    // ── Delete ─────────────────────────────────────────────
    const deleteProduct = async (p: ProductRow) => {
        if (!confirm(`Hapus "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

        // Delete related rows first
        await supabase.from("product_categories").delete().eq("product_id", p.id);
        await supabase.from("product_variants").delete().eq("product_id", p.id);

        const { error: err } = await supabase.from("products").delete().eq("id", p.id);
        if (err) {
            console.error("[AdminProducts] delete error:", err);
            alert(`Gagal menghapus: ${err.message}`);
        } else {
            setProducts((prev) => prev.filter((x) => x.id !== p.id));
        }
    };

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
                            to="/admin/shops"
                            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                        >
                            <ArrowLeft className="h-5 w-5 text-slate-600" />
                        </Link>
                        <div>
                            <div className="flex items-center gap-2">
                                <Package className="h-6 w-6 text-blue-600" />
                                <h1 className="text-xl font-bold text-slate-900">Produk</h1>
                            </div>
                            {shopName && <p className="text-sm text-slate-600 mt-0.5">{shopName}</p>}
                        </div>
                    </div>

                    <Link
                        to={`/admin/shops/${seller_id}/products/new`}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white text-sm font-medium transition-all shadow-md"
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Produk
                    </Link>
                </div>

                {/* Content */}
                {loading && <div className="text-center py-12 text-slate-600">Memuat produk…</div>}
                {error && (
                    <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">{error}</div>
                )}

                {!loading && !error && (
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
                        {products.length === 0 ? (
                            <p className="text-sm text-slate-500 py-8 text-center">
                                Belum ada produk untuk toko ini. Klik "Tambah Produk" untuk memulai.
                            </p>
                        ) : (
                            <div className="overflow-x-auto">
                                <table className="w-full text-sm">
                                    <thead>
                                        <tr className="border-b border-slate-200 text-left text-slate-600">
                                            <th className="pb-2 pr-4 font-medium">Nama</th>
                                            <th className="pb-2 pr-4 font-medium hidden sm:table-cell">Slug</th>
                                            <th className="pb-2 pr-4 font-medium text-right">Harga</th>
                                            <th className="pb-2 pr-2 font-medium text-center">Status</th>
                                            <th className="pb-2 font-medium text-center">Aksi</th>
                                        </tr>
                                    </thead>
                                    <tbody>
                                        {products.map((p) => (
                                            <tr key={p.id} className="border-b border-slate-100 hover:bg-white/50 transition-colors">
                                                <td className="py-2.5 pr-4 font-medium text-slate-900">{p.name}</td>
                                                <td className="py-2.5 pr-4 font-mono text-xs text-slate-600 hidden sm:table-cell">{p.slug}</td>
                                                <td className="py-2.5 pr-4 text-right tabular-nums">{fmtIDR(p.price)}</td>
                                                <td className="py-2.5 pr-2 text-center">
                                                    <button
                                                        onClick={() => toggleActive(p)}
                                                        className="inline-flex items-center gap-1 group"
                                                        title={p.is_active ? "Nonaktifkan" : "Aktifkan"}
                                                    >
                                                        {p.is_active ? (
                                                            <ToggleRight className="h-5 w-5 text-green-600 group-hover:text-green-700" />
                                                        ) : (
                                                            <ToggleLeft className="h-5 w-5 text-slate-400 group-hover:text-slate-500" />
                                                        )}
                                                        <span className={`text-xs font-medium ${p.is_active ? "text-green-700" : "text-slate-500"}`}>
                                                            {p.is_active ? "Aktif" : "Off"}
                                                        </span>
                                                    </button>
                                                </td>
                                                <td className="py-2.5 text-center">
                                                    <div className="flex items-center justify-center gap-1">
                                                        <Link
                                                            to={`/admin/shops/${seller_id}/products/${p.id}/edit`}
                                                            className="p-1.5 rounded-lg text-blue-600 hover:bg-blue-50 transition-colors"
                                                            title="Edit"
                                                        >
                                                            <Pencil className="h-4 w-4" />
                                                        </Link>
                                                        <button
                                                            onClick={() => deleteProduct(p)}
                                                            className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                                            title="Hapus"
                                                        >
                                                            <Trash2 className="h-4 w-4" />
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
