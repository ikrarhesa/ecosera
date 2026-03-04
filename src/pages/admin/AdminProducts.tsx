import { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import { Plus, Package, Pencil, Trash2, ToggleLeft, ToggleRight, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";

const C = { blue: "#0071DC", navy: "#041E42" };
const BUCKET = "product-images";

/** Extract the storage path from a Supabase public URL */
const extractStoragePath = (publicUrl: string): string | null => {
    const marker = `/object/public/${BUCKET}/`;
    const idx = publicUrl.indexOf(marker);
    if (idx === -1) return null;
    return decodeURIComponent(publicUrl.slice(idx + marker.length));
};

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

    const toggleActive = async (p: ProductRow) => {
        const newVal = !p.is_active;
        setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: newVal } : x)));
        const { error: err } = await supabase.from("products").update({ is_active: newVal }).eq("id", p.id);
        if (err) {
            console.error("[AdminProducts] toggle error:", err);
            setProducts((prev) => prev.map((x) => (x.id === p.id ? { ...x, is_active: !newVal } : x)));
        }
    };

    const deleteProduct = async (p: ProductRow) => {
        if (!confirm(`Hapus "${p.name}"? Tindakan ini tidak bisa dibatalkan.`)) return;

        // Fetch product images to clean up storage
        const { data: prodData } = await supabase.from("products").select("images, image_url").eq("id", p.id).single();
        if (prodData) {
            const imageUrls: string[] = Array.isArray(prodData.images) && prodData.images.length > 0
                ? prodData.images
                : prodData.image_url ? [prodData.image_url] : [];
            const pathsToRemove = imageUrls.map(extractStoragePath).filter(Boolean) as string[];
            if (pathsToRemove.length > 0) {
                await supabase.storage.from(BUCKET).remove(pathsToRemove);
            }
        }

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
        <div className="max-w-5xl mx-auto">
            {/* Back link + heading */}
            <div className="mb-6 md:mb-8">
                <Link to="/admin/shops" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kelola Toko
                </Link>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>Produk</h1>
                        {shopName && <p className="text-sm text-slate-500 mt-1">{shopName} · {products.length} produk</p>}
                    </div>
                    <Link
                        to={`/admin/shops/${seller_id}/products/new`}
                        className="flex items-center gap-2 px-4 py-2.5 rounded-lg text-white text-sm font-medium transition-colors hover:opacity-90"
                        style={{ backgroundColor: C.blue }}
                    >
                        <Plus className="h-4 w-4" />
                        Tambah Produk
                    </Link>
                </div>
            </div>

            {loading && (
                <div className="flex items-center justify-center py-24">
                    <div className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: C.blue, borderTopColor: "transparent" }} />
                </div>
            )}

            {error && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">{error}</div>
            )}

            {!loading && !error && (
                <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                    {products.length === 0 ? (
                        <div className="py-16 text-center">
                            <Package className="h-10 w-10 text-slate-300 mx-auto mb-3" />
                            <p className="text-slate-600 font-medium">Belum ada produk</p>
                            <p className="text-sm text-slate-400 mt-1">Klik "Tambah Produk" untuk memulai</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-sm">
                                <thead>
                                    <tr className="border-b border-slate-100 text-left text-xs uppercase tracking-wider text-slate-500" style={{ backgroundColor: C.blue + "06" }}>
                                        <th className="px-4 py-3 font-medium">Nama</th>
                                        <th className="px-4 py-3 font-medium hidden md:table-cell">Slug</th>
                                        <th className="px-4 py-3 font-medium text-right">Harga</th>
                                        <th className="px-4 py-3 font-medium text-center">Status</th>
                                        <th className="px-4 py-3 font-medium text-center">Aksi</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {products.map((p) => (
                                        <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50/50 transition-colors">
                                            <td className="px-4 py-3 font-medium" style={{ color: C.navy }}>{p.name}</td>
                                            <td className="px-4 py-3 font-mono text-xs text-slate-500 hidden md:table-cell">{p.slug}</td>
                                            <td className="px-4 py-3 text-right tabular-nums">{fmtIDR(p.price)}</td>
                                            <td className="px-4 py-3 text-center">
                                                <button onClick={() => toggleActive(p)} className="inline-flex items-center gap-1 group" title={p.is_active ? "Nonaktifkan" : "Aktifkan"}>
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
                                            <td className="px-4 py-3 text-center">
                                                <div className="flex items-center justify-center gap-1">
                                                    <Link to={`/admin/shops/${seller_id}/products/${p.id}/edit`} className="p-1.5 rounded-lg hover:bg-slate-100 transition-colors" style={{ color: C.blue }} title="Edit">
                                                        <Pencil className="h-4 w-4" />
                                                    </Link>
                                                    <button onClick={() => deleteProduct(p)} className="p-1.5 rounded-lg text-red-500 hover:bg-red-50 transition-colors" title="Hapus">
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
    );
}
