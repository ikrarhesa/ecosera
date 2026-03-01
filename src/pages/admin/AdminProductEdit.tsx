import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, Check, Save } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { generateSlug } from "../../lib/utils";

interface Category { id: string; name: string; }
interface Variant { id?: string; variant_name: string; price_override: string; stock: string; }
const EMPTY_VARIANT: Variant = { variant_name: "", price_override: "", stock: "" };

export default function AdminProductEdit() {
    const navigate = useNavigate();
    const { seller_id, product_id } = useParams<{ seller_id: string; product_id: string }>();

    const [pageLoading, setPageLoading] = useState(true);
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [currentImageUrl, setCurrentImageUrl] = useState<string | null>(null);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [imagePreview, setImagePreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // ── Load everything on mount ──────────────────────────────
    useEffect(() => {
        if (!product_id) return;
        (async () => {
            setPageLoading(true);

            // Fetch product
            const { data: prod } = await supabase
                .from("products")
                .select("*")
                .eq("id", product_id)
                .single();

            if (prod) {
                setName(prod.name || "");
                setDescription(prod.description || "");
                setPrice(String(prod.price || ""));
                setCurrentImageUrl(prod.image_url || null);
            }

            // Fetch all categories
            const { data: cats } = await supabase.from("categories").select("*").order("name");
            setCategories((cats as Category[]) || []);

            // Fetch product's selected categories
            const { data: pcRows } = await supabase
                .from("product_categories")
                .select("category_id")
                .eq("product_id", product_id);
            setSelectedCategories((pcRows || []).map((r: any) => r.category_id));

            // Fetch product variants
            const { data: varRows } = await supabase
                .from("product_variants")
                .select("*")
                .eq("product_id", product_id);
            setVariants(
                (varRows || []).map((v: any) => ({
                    id: v.id,
                    variant_name: v.variant_name || "",
                    price_override: v.price_override != null ? String(v.price_override) : "",
                    stock: v.stock != null ? String(v.stock) : "",
                }))
            );

            setPageLoading(false);
        })();
    }, [product_id]);

    // Image preview
    useEffect(() => {
        if (!imageFile) { setImagePreview(null); return; }
        const url = URL.createObjectURL(imageFile);
        setImagePreview(url);
        return () => URL.revokeObjectURL(url);
    }, [imageFile]);

    const slug = generateSlug(name);

    // ── Variant helpers ────────────────────────────────────────
    const addVariant = () => setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
    const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
    const updateVariant = (i: number, field: keyof Variant, value: string) =>
        setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

    const toggleCategory = (id: string) =>
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );

    // ── Submit ─────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedName = name.trim();
        const numPrice = Number(price);
        if (!trimmedName) { setFormError("Nama produk wajib diisi."); return; }
        if (!numPrice || numPrice <= 0) { setFormError("Harga harus lebih dari 0."); return; }

        setSubmitting(true);
        try {
            // 1. Upload new image if changed
            let imageUrl = currentImageUrl;
            if (imageFile) {
                const ext = imageFile.name.split(".").pop() || "png";
                const filePath = `products/${slug}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, imageFile, { cacheControl: "3600", contentType: imageFile.type, upsert: true });
                if (uploadErr) {
                    setFormError(`Gagal upload gambar: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
                imageUrl = urlData.publicUrl;
            }

            // 2. Update product
            const { error: updateErr } = await supabase
                .from("products")
                .update({
                    name: trimmedName,
                    description: description.trim() || null,
                    price: numPrice,
                    image_url: imageUrl,
                    slug,
                })
                .eq("id", product_id);

            if (updateErr) {
                setFormError(`Gagal update produk: ${updateErr.message}`);
                setSubmitting(false);
                return;
            }

            // 3. Sync categories — delete old, insert new
            await supabase.from("product_categories").delete().eq("product_id", product_id!);
            if (selectedCategories.length > 0) {
                await supabase.from("product_categories").insert(
                    selectedCategories.map((cid) => ({ product_id: product_id!, category_id: cid }))
                );
            }

            // 4. Sync variants — delete old, insert new
            await supabase.from("product_variants").delete().eq("product_id", product_id!);
            const validVariants = variants.filter((v) => v.variant_name.trim());
            if (validVariants.length > 0) {
                await supabase.from("product_variants").insert(
                    validVariants.map((v) => ({
                        product_id: product_id!,
                        variant_name: v.variant_name.trim(),
                        price_override: v.price_override ? Number(v.price_override) : null,
                        stock: v.stock ? Number(v.stock) : null,
                    }))
                );
            }

            navigate(`/admin/shops/${seller_id}/products`);
        } catch (err) {
            console.error("[AdminProductEdit] Unexpected error:", err);
            setFormError("Terjadi kesalahan tak terduga.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-700 mb-1";

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600">Memuat data produk…</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen relative overflow-hidden pb-8">
            <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
                <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
            </div>

            <div className="relative z-10 px-4 pt-4 max-w-2xl mx-auto">
                {/* Header */}
                <div className="flex items-center gap-3 mb-6">
                    <button
                        onClick={() => navigate(`/admin/shops/${seller_id}/products`)}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Edit Produk</h1>
                        <p className="text-sm text-slate-600">Perbarui detail produk</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900">Informasi Produk</h3>
                        <div>
                            <label className={labelCls}>Nama Produk *</label>
                            <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
                            {name.trim() && (
                                <p className="mt-1 text-xs text-slate-500">Slug: <span className="font-mono">{slug}</span></p>
                            )}
                        </div>
                        <div>
                            <label className={labelCls}>Deskripsi</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} className={inputCls} />
                        </div>
                        <div>
                            <label className={labelCls}>Harga Dasar (Rp) *</label>
                            <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} className={inputCls} required />
                        </div>
                    </div>

                    {/* Image */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5">
                        <h3 className="font-semibold text-slate-900 mb-3">Gambar Produk</h3>
                        <label className="block cursor-pointer">
                            <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center hover:border-blue-400 transition-colors">
                                {(imagePreview || currentImageUrl) ? (
                                    <img src={imagePreview || currentImageUrl!} alt="Preview" className="mx-auto max-h-40 rounded-lg object-contain mb-2" />
                                ) : (
                                    <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                                )}
                                <p className="text-sm text-slate-600">
                                    {imageFile ? imageFile.name : currentImageUrl ? "Klik untuk ganti gambar" : "Klik untuk upload"}
                                </p>
                            </div>
                            <input type="file" accept="image/*" className="hidden" onChange={(e) => setImageFile(e.target.files?.[0] || null)} />
                        </label>
                    </div>

                    {/* Categories */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5">
                        <h3 className="font-semibold text-slate-900 mb-3">Kategori</h3>
                        {categories.length === 0 ? (
                            <p className="text-sm text-slate-500">Belum ada kategori.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => {
                                    const active = selectedCategories.includes(cat.id);
                                    return (
                                        <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "bg-blue-100 border-blue-300 text-blue-700" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
                                                }`}
                                        >
                                            {active && <Check className="h-3 w-3" />}
                                            {cat.name}
                                        </button>
                                    );
                                })}
                            </div>
                        )}
                    </div>

                    {/* Variants */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">Varian</h3>
                            <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium">
                                <Plus className="h-3.5 w-3.5" /> Tambah Varian
                            </button>
                        </div>
                        {variants.length === 0 ? (
                            <p className="text-sm text-slate-500">Tidak ada varian.</p>
                        ) : (
                            <div className="space-y-3">
                                {variants.map((v, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <input type="text" placeholder="Nama varian" value={v.variant_name} onChange={(e) => updateVariant(i, "variant_name", e.target.value)} className={inputCls} />
                                            <input type="number" placeholder="Harga" value={v.price_override} onChange={(e) => updateVariant(i, "price_override", e.target.value)} className={inputCls} />
                                            <input type="number" placeholder="Stok" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className={inputCls} />
                                        </div>
                                        <button type="button" onClick={() => removeVariant(i)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {formError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{formError}</div>
                    )}

                    <button type="submit" disabled={submitting}
                        className={`w-full py-3 rounded-xl text-white font-medium transition-all shadow-md flex items-center justify-center gap-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            }`}
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? "Menyimpan…" : "Simpan Perubahan"}
                    </button>
                </form>
            </div>
        </div>
    );
}
