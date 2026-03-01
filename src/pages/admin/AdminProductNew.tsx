import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Plus, Trash2, Upload, Check, X } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { generateSlug } from "../../lib/utils";

const MAX_IMAGES = 3;

// ── Types ─────────────────────────────────────────────────────────────
interface Category {
    id: string;
    name: string;
}

interface Variant {
    variant_name: string;
    price_override: string;
    stock: string;
}

const EMPTY_VARIANT: Variant = { variant_name: "", price_override: "", stock: "" };

// ── Component ─────────────────────────────────────────────────────────
export default function AdminProductNew() {
    const navigate = useNavigate();
    const { seller_id } = useParams<{ seller_id: string }>();

    // Product form state
    const [categories, setCategories] = useState<Category[]>([]);
    const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
    const [variants, setVariants] = useState<Variant[]>([]);

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [price, setPrice] = useState("");
    const [imageFiles, setImageFiles] = useState<File[]>([]);
    const [imagePreviews, setImagePreviews] = useState<string[]>([]);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [categoriesError, setCategoriesError] = useState<string | null>(null);

    // Fetch categories on mount
    useEffect(() => {
        (async () => {
            const { data, error } = await supabase.from("categories").select("*").order("name");
            if (error) {
                console.error("[AdminProductNew] categories fetch:", error);
                setCategoriesError(error.message);
            } else {
                console.log("[AdminProductNew] categories loaded:", data?.length, "items");
                setCategories((data as Category[]) || []);
            }
        })();
    }, []);

    // Image previews
    useEffect(() => {
        const urls = imageFiles.map((f) => URL.createObjectURL(f));
        setImagePreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [imageFiles]);

    const addImageFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, MAX_IMAGES - imageFiles.length);
        if (newFiles.length > 0) setImageFiles((prev) => [...prev, ...newFiles]);
    };

    const removeImageFile = (index: number) => {
        setImageFiles((prev) => prev.filter((_, i) => i !== index));
    };

    const slug = generateSlug(name);

    // ── Variant helpers ─────────────────────────────────────────────────
    const addVariant = () => setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
    const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
    const updateVariant = (i: number, field: keyof Variant, value: string) =>
        setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

    // ── Category toggle ─────────────────────────────────────────────────
    const toggleCategory = (id: string) =>
        setSelectedCategories((prev) =>
            prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]
        );

    // ── Submit ──────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        const trimmedName = name.trim();
        const numPrice = Number(price);
        if (!trimmedName) { setFormError("Nama produk wajib diisi."); return; }
        if (!numPrice || numPrice <= 0) { setFormError("Harga harus lebih dari 0."); return; }

        setSubmitting(true);
        try {
            // 1. Upload images (up to 3)
            const uploadedUrls: string[] = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const ext = file.name.split(".").pop() || "png";
                const filePath = `products/${slug}-${Date.now()}-${i}.${ext}`;
                console.log(`[AdminProductNew] Uploading image ${i + 1}/${imageFiles.length}:`, filePath);
                const { error: uploadErr } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, file, {
                        cacheControl: "3600",
                        contentType: file.type,
                        upsert: true
                    });
                if (uploadErr) {
                    console.error("[AdminProductNew] Upload error:", JSON.stringify(uploadErr));
                    setFormError(`Gagal upload gambar ${i + 1}: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage
                    .from("product-images")
                    .getPublicUrl(filePath);
                uploadedUrls.push(urlData.publicUrl);
            }
            const primaryUrl = uploadedUrls[0] || null;

            // 2. Insert product
            const { data: productData, error: productErr } = await supabase
                .from("products")
                .insert({
                    name: trimmedName,
                    description: description.trim() || null,
                    price: numPrice,
                    image_url: primaryUrl,
                    images: uploadedUrls.length > 0 ? uploadedUrls : null,
                    slug,
                    seller_id,
                    is_active: true
                })
                .select("id")
                .single();

            if (productErr) {
                setFormError(`Gagal simpan produk: ${productErr.message}`);
                setSubmitting(false);
                return;
            }

            const productId = productData.id;

            // 3. Insert product_categories
            if (selectedCategories.length > 0) {
                const catRows = selectedCategories.map((cid) => ({
                    product_id: productId,
                    category_id: cid
                }));
                const { error: catErr } = await supabase.from("product_categories").insert(catRows);
                if (catErr) console.error("[AdminProductNew] product_categories insert:", catErr);
            }

            // 4. Insert product_variants
            const validVariants = variants.filter((v) => v.variant_name.trim());
            if (validVariants.length > 0) {
                const varRows = validVariants.map((v) => ({
                    product_id: productId,
                    variant_name: v.variant_name.trim(),
                    price_override: v.price_override ? Number(v.price_override) : null,
                    stock: v.stock ? Number(v.stock) : null
                }));
                const { error: varErr } = await supabase.from("product_variants").insert(varRows);
                if (varErr) console.error("[AdminProductNew] product_variants insert:", varErr);
            }

            // Success → redirect back to shop products
            navigate(`/admin/shops/${seller_id}/products`);
        } catch (err) {
            console.error("[AdminProductNew] Unexpected error:", err);
            setFormError("Terjadi kesalahan tak terduga.");
        } finally {
            setSubmitting(false);
        }
    };

    // ── Shared styles ───────────────────────────────────────────────────
    const inputCls =
        "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-700 mb-1";

    return (
        <div className="min-h-screen relative overflow-hidden pb-8">
            {/* Background */}
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
                        <h1 className="text-xl font-bold text-slate-900">Tambah Produk</h1>
                        <p className="text-sm text-slate-600">Isi detail produk baru</p>
                    </div>
                </div>

                {/* Product Form */}
                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Basic Info */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900">Informasi Produk</h3>

                        <div>
                            <label className={labelCls}>Nama Produk *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                placeholder="Contoh: Kopi Semendo Robusta"
                                className={inputCls}
                                required
                            />
                            {name.trim() && (
                                <p className="mt-1 text-xs text-slate-500">
                                    Slug: <span className="font-mono">{slug}</span>
                                </p>
                            )}
                        </div>

                        <div>
                            <label className={labelCls}>Deskripsi</label>
                            <textarea
                                value={description}
                                onChange={(e) => setDescription(e.target.value)}
                                placeholder="Deskripsi produk…"
                                rows={3}
                                className={inputCls}
                            />
                        </div>

                        <div>
                            <label className={labelCls}>Harga Dasar (Rp) *</label>
                            <input
                                type="number"
                                value={price}
                                onChange={(e) => setPrice(e.target.value)}
                                placeholder="45000"
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>

                    {/* Image Upload (up to 3) */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5">
                        <div className="flex items-center justify-between mb-3">
                            <h3 className="font-semibold text-slate-900">Gambar Produk</h3>
                            <span className="text-xs text-slate-500">{imageFiles.length}/{MAX_IMAGES}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-3">
                            {/* Existing previews */}
                            {imagePreviews.map((src, i) => (
                                <div key={i} className="relative aspect-square rounded-xl border border-slate-200 overflow-hidden bg-slate-50 group">
                                    <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                    {i === 0 && (
                                        <span className="absolute top-1 left-1 bg-blue-600 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded">Utama</span>
                                    )}
                                    <button
                                        type="button"
                                        onClick={() => removeImageFile(i)}
                                        className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity shadow"
                                    >
                                        <X className="h-3.5 w-3.5" />
                                    </button>
                                </div>
                            ))}

                            {/* Add slot (shown if < MAX_IMAGES) */}
                            {imageFiles.length < MAX_IMAGES && (
                                <label className="aspect-square rounded-xl border-2 border-dashed border-slate-300 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors bg-white/60">
                                    <Upload className="h-6 w-6 text-slate-400" />
                                    <span className="text-[11px] text-slate-500 text-center leading-tight">Tambah<br />Foto</span>
                                    <input
                                        type="file"
                                        accept="image/*"
                                        className="hidden"
                                        multiple
                                        onChange={(e) => addImageFiles(e.target.files)}
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
                            <p className="text-sm text-slate-500">Belum ada kategori di database.</p>
                        ) : (
                            <div className="flex flex-wrap gap-2">
                                {categories.map((cat) => {
                                    const active = selectedCategories.includes(cat.id);
                                    return (
                                        <button
                                            key={cat.id}
                                            type="button"
                                            onClick={() => toggleCategory(cat.id)}
                                            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active
                                                ? "bg-blue-100 border-blue-300 text-blue-700"
                                                : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"
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
                            <h3 className="font-semibold text-slate-900">Varian (Opsional)</h3>
                            <button
                                type="button"
                                onClick={addVariant}
                                className="flex items-center gap-1 text-xs text-blue-600 hover:text-blue-700 font-medium"
                            >
                                <Plus className="h-3.5 w-3.5" />
                                Tambah Varian
                            </button>
                        </div>

                        {variants.length === 0 ? (
                            <p className="text-sm text-slate-500">
                                Belum ada varian. Klik tombol di atas untuk menambahkan.
                            </p>
                        ) : (
                            <div className="space-y-3">
                                {variants.map((v, i) => (
                                    <div key={i} className="flex items-start gap-2">
                                        <div className="flex-1 grid grid-cols-3 gap-2">
                                            <input
                                                type="text"
                                                placeholder="Nama varian"
                                                value={v.variant_name}
                                                onChange={(e) => updateVariant(i, "variant_name", e.target.value)}
                                                className={inputCls}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Harga (opsional)"
                                                value={v.price_override}
                                                onChange={(e) => updateVariant(i, "price_override", e.target.value)}
                                                className={inputCls}
                                            />
                                            <input
                                                type="number"
                                                placeholder="Stok (opsional)"
                                                value={v.stock}
                                                onChange={(e) => updateVariant(i, "stock", e.target.value)}
                                                className={inputCls}
                                            />
                                        </div>
                                        <button
                                            type="button"
                                            onClick={() => removeVariant(i)}
                                            className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Error */}
                    {formError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
                            {formError}
                        </div>
                    )}

                    {/* Submit */}
                    <button
                        type="submit"
                        disabled={submitting}
                        className={`w-full py-3 rounded-xl text-white font-medium transition-all shadow-md ${submitting
                            ? "bg-blue-400 cursor-not-allowed"
                            : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            }`}
                    >
                        {submitting ? "Menyimpan…" : "Simpan Produk"}
                    </button>
                </form>
            </div>
        </div>
    );
}
