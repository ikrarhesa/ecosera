import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, Check, Save, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { generateSlug } from "../../lib/utils";

const MAX_IMAGES = 3;

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
    // Multi-image state: existing URLs from DB + newly picked files
    const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);
    const [newImageFiles, setNewImageFiles] = useState<File[]>([]);
    const [newImagePreviews, setNewImagePreviews] = useState<string[]>([]);

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
                // Load existing images: prefer images array, fall back to image_url
                const imgs: string[] = Array.isArray(prod.images) && prod.images.length > 0
                    ? prod.images
                    : prod.image_url ? [prod.image_url] : [];
                setExistingImageUrls(imgs);
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

    // New-file previews
    useEffect(() => {
        const urls = newImageFiles.map((f) => URL.createObjectURL(f));
        setNewImagePreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [newImageFiles]);

    const totalImages = existingImageUrls.length + newImageFiles.length;

    const addNewFiles = (files: FileList | null) => {
        if (!files) return;
        const room = MAX_IMAGES - totalImages;
        const picked = Array.from(files).slice(0, room);
        if (picked.length > 0) setNewImageFiles((prev) => [...prev, ...picked]);
    };

    const removeExistingImage = (index: number) => {
        setExistingImageUrls((prev) => prev.filter((_, i) => i !== index));
    };

    const removeNewImage = (index: number) => {
        setNewImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

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
            // 1. Upload any new image files
            const newUploadedUrls: string[] = [];
            for (let i = 0; i < newImageFiles.length; i++) {
                const file = newImageFiles[i];
                const ext = file.name.split(".").pop() || "png";
                const filePath = `products/${slug}-${Date.now()}-${i}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, file, { cacheControl: "3600", contentType: file.type, upsert: true });
                if (uploadErr) {
                    setFormError(`Gagal upload gambar ${i + 1}: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
                newUploadedUrls.push(urlData.publicUrl);
            }

            // 2. Merge existing (kept) + newly uploaded
            const allImages = [...existingImageUrls, ...newUploadedUrls];
            const primaryUrl = allImages[0] || null;

            // 3. Update product
            const { error: updateErr } = await supabase
                .from("products")
                .update({
                    name: trimmedName,
                    description: description.trim() || null,
                    price: numPrice,
                    image_url: primaryUrl,
                    images: allImages.length > 0 ? allImages : null,
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

                    {/* Image Upload (up to 3) */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">Gambar Produk</h3>
                            <span className="text-xs text-slate-500">{totalImages}/{MAX_IMAGES}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Existing images from DB */}
                            {existingImageUrls.map((src, i) => (
                                <div key={`ex-${i}`} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                    <img src={src} alt={`Existing ${i + 1}`} className="w-full h-full object-cover" />
                                    {i === 0 && newImageFiles.length === 0 && (
                                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Utama</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeExistingImage(i)}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Newly added file previews */}
                            {newImagePreviews.map((src, i) => (
                                <div key={`new-${i}`} className="relative aspect-square rounded-xl border border-blue-200 overflow-hidden bg-blue-50 group">
                                    <img src={src} alt={`New ${i + 1}`} className="w-full h-full object-cover" />
                                    <span className="absolute bottom-1 left-1 bg-green-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Baru</span>
                                    <button
                                        type="button"
                                        onClick={() => removeNewImage(i)}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Add slot */}
                            {totalImages < MAX_IMAGES && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors bg-white/60">
                                    <Upload className="h-6 w-6 text-slate-400" />
                                    <span className="text-[11px] text-slate-500 text-center leading-tight">Tambah<br />Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => addNewFiles(e.target.files)}
                                    />
                                </label>
                            )}
                        </div>
                        <p className="text-xs text-slate-500 mt-2">PNG, JPG, WebP (maks 5MB per foto). Foto pertama jadi gambar utama.</p>
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
