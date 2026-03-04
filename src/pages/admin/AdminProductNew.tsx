import React, { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Plus, Trash2, Upload, Check, X, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { generateSlug } from "../../lib/utils";
import ImageCropperModal from "../../components/ImageCropperModal";

const C = { blue: "#0071DC", navy: "#041E42" };
const MAX_IMAGES = 3;

interface Category { id: string; name: string; }
interface Variant { variant_name: string; price_override: string; stock: string; }
const EMPTY_VARIANT: Variant = { variant_name: "", price_override: "", stock: "" };

export default function AdminProductNew() {
    const navigate = useNavigate();
    const { seller_id } = useParams<{ seller_id: string }>();

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

    // Cropper state
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [pendingFiles, setPendingFiles] = useState<File[]>([]);

    useEffect(() => {
        (async () => {
            const { data } = await supabase.from("categories").select("*").order("name");
            setCategories((data as Category[]) || []);
        })();
    }, []);

    useEffect(() => {
        const urls = imageFiles.map((f) => URL.createObjectURL(f));
        setImagePreviews(urls);
        return () => urls.forEach((u) => URL.revokeObjectURL(u));
    }, [imageFiles]);

    const addImageFiles = (files: FileList | null) => {
        if (!files) return;
        const newFiles = Array.from(files).slice(0, MAX_IMAGES - imageFiles.length);
        if (newFiles.length === 0) return;
        // Queue files for cropping one at a time
        setPendingFiles(newFiles.slice(1));
        const url = URL.createObjectURL(newFiles[0]);
        setCropSrc(url);
    };

    const handleCropComplete = (croppedFile: File) => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        setImageFiles((prev) => [...prev, croppedFile]);

        // Process next pending file if any
        if (pendingFiles.length > 0) {
            const [next, ...rest] = pendingFiles;
            setPendingFiles(rest);
            const url = URL.createObjectURL(next);
            setCropSrc(url);
        }
    };

    const handleCropCancel = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        // Skip remaining pending files too
        pendingFiles.forEach((f) => {/* no object URLs to revoke for pending files */ });
        setPendingFiles([]);
    };

    const removeImageFile = (index: number) => setImageFiles((prev) => prev.filter((_, i) => i !== index));
    const slug = generateSlug(name);

    const addVariant = () => setVariants((v) => [...v, { ...EMPTY_VARIANT }]);
    const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));
    const updateVariant = (i: number, field: keyof Variant, value: string) =>
        setVariants((v) => v.map((row, idx) => (idx === i ? { ...row, [field]: value } : row)));

    const toggleCategory = (id: string) =>
        setSelectedCategories((prev) => prev.includes(id) ? prev.filter((c) => c !== id) : [...prev, id]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        const trimmedName = name.trim();
        const numPrice = Number(price);
        if (!trimmedName) { setFormError("Nama produk wajib diisi."); return; }
        if (!numPrice || numPrice <= 0) { setFormError("Harga harus lebih dari 0."); return; }

        setSubmitting(true);
        try {
            const uploadedUrls: string[] = [];
            for (let i = 0; i < imageFiles.length; i++) {
                const file = imageFiles[i];
                const ext = file.name.split(".").pop() || "webp";
                const filePath = `products/${slug}-${Date.now()}-${i}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("product-images")
                    .upload(filePath, file, { cacheControl: "3600", contentType: file.type, upsert: true });
                if (uploadErr) { setFormError(`Gagal upload gambar ${i + 1}: ${uploadErr.message}`); setSubmitting(false); return; }
                const { data: urlData } = supabase.storage.from("product-images").getPublicUrl(filePath);
                uploadedUrls.push(urlData.publicUrl);
            }

            const { data: productData, error: productErr } = await supabase
                .from("products")
                .insert({ name: trimmedName, description: description.trim() || null, price: numPrice, image_url: uploadedUrls[0] || null, images: uploadedUrls.length > 0 ? uploadedUrls : null, slug, seller_id, is_active: true })
                .select("id").single();
            if (productErr) { setFormError(`Gagal simpan produk: ${productErr.message}`); setSubmitting(false); return; }

            if (selectedCategories.length > 0) {
                await supabase.from("product_categories").insert(selectedCategories.map((cid) => ({ product_id: productData.id, category_id: cid })));
            }
            const validVariants = variants.filter((v) => v.variant_name.trim());
            if (validVariants.length > 0) {
                await supabase.from("product_variants").insert(validVariants.map((v) => ({ product_id: productData.id, variant_name: v.variant_name.trim(), price_override: v.price_override ? Number(v.price_override) : null, stock: v.stock ? Number(v.stock) : null })));
            }

            navigate(`/admin/shops/${seller_id}/products`);
        } catch (err) {
            console.error("[AdminProductNew] Unexpected error:", err);
            setFormError("Terjadi kesalahan tak terduga.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-600 mb-1";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 md:mb-8">
                <Link to={`/admin/shops/${seller_id}/products`} className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Produk
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>Tambah Produk</h1>
                <p className="text-sm text-slate-500 mt-1">Isi detail produk baru</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Basic Info */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3 className="font-semibold" style={{ color: C.navy }}>Informasi Produk</h3>
                    <div>
                        <label className={labelCls}>Nama Produk *</label>
                        <input type="text" value={name} onChange={(e) => setName(e.target.value)} placeholder="Contoh: Kopi Semendo Robusta" className={inputCls} required />
                        {name.trim() && <p className="mt-1 text-xs text-slate-500">Slug: <span className="font-mono">{slug}</span></p>}
                    </div>
                    <div>
                        <label className={labelCls}>Deskripsi</label>
                        <textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Deskripsi produk…" rows={3} className={inputCls} />
                    </div>
                    <div>
                        <label className={labelCls}>Harga Dasar (Rp) *</label>
                        <input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="45000" className={inputCls} required />
                    </div>
                </div>

                {/* Images */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold" style={{ color: C.navy }}>Gambar Produk</h3>
                        <span className="text-xs text-slate-500">{imageFiles.length}/{MAX_IMAGES}</span>
                    </div>
                    <div className="grid grid-cols-3 gap-3">
                        {imagePreviews.map((src, i) => (
                            <div key={i} className="relative aspect-square rounded-lg border border-slate-200 overflow-hidden bg-slate-50 group">
                                <img src={src} alt={`Preview ${i + 1}`} className="w-full h-full object-cover" />
                                {i === 0 && <span className="absolute top-1 left-1 text-white text-[10px] font-semibold px-1.5 py-0.5 rounded" style={{ backgroundColor: C.blue }}>Utama</span>}
                                <button type="button" onClick={() => removeImageFile(i)} className="absolute top-1 right-1 h-6 w-6 rounded-full bg-red-500 text-white grid place-items-center opacity-0 group-hover:opacity-100 transition-opacity">
                                    <X className="h-3.5 w-3.5" />
                                </button>
                            </div>
                        ))}
                        {imageFiles.length < MAX_IMAGES && (
                            <label className="aspect-square rounded-lg border-2 border-dashed border-slate-200 hover:border-blue-400 cursor-pointer flex flex-col items-center justify-center gap-1 transition-colors bg-white">
                                <Upload className="h-6 w-6 text-slate-400" />
                                <span className="text-[11px] text-slate-500 text-center leading-tight">Tambah<br />Foto</span>
                                <input type="file" accept="image/*" className="hidden" multiple onChange={(e) => { addImageFiles(e.target.files); e.target.value = ""; }} />
                            </label>
                        )}
                    </div>
                    <p className="text-xs text-slate-500 mt-2">PNG, JPG, WebP (maks 5MB per foto). Foto pertama jadi gambar utama.</p>
                </div>

                {/* Categories */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6">
                    <h3 className="font-semibold mb-3" style={{ color: C.navy }}>Kategori</h3>
                    {categories.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada kategori di database.</p>
                    ) : (
                        <div className="flex flex-wrap gap-2">
                            {categories.map((cat) => {
                                const active = selectedCategories.includes(cat.id);
                                return (
                                    <button key={cat.id} type="button" onClick={() => toggleCategory(cat.id)}
                                        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${active ? "border-blue-300 text-white" : "bg-white border-slate-200 text-slate-600 hover:border-blue-300"}`}
                                        style={active ? { backgroundColor: C.blue, borderColor: C.blue } : undefined}
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
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6">
                    <div className="flex items-center justify-between mb-3">
                        <h3 className="font-semibold" style={{ color: C.navy }}>Varian (Opsional)</h3>
                        <button type="button" onClick={addVariant} className="flex items-center gap-1 text-xs font-medium hover:opacity-80" style={{ color: C.blue }}>
                            <Plus className="h-3.5 w-3.5" /> Tambah Varian
                        </button>
                    </div>
                    {variants.length === 0 ? (
                        <p className="text-sm text-slate-500">Belum ada varian. Klik tombol di atas untuk menambahkan.</p>
                    ) : (
                        <div className="space-y-3">
                            {variants.map((v, i) => (
                                <div key={i} className="flex items-start gap-2">
                                    <div className="flex-1 grid grid-cols-1 md:grid-cols-3 gap-2">
                                        <input type="text" placeholder="Nama varian" value={v.variant_name} onChange={(e) => updateVariant(i, "variant_name", e.target.value)} className={inputCls} />
                                        <input type="number" placeholder="Harga (opsional)" value={v.price_override} onChange={(e) => updateVariant(i, "price_override", e.target.value)} className={inputCls} />
                                        <input type="number" placeholder="Stok (opsional)" value={v.stock} onChange={(e) => updateVariant(i, "stock", e.target.value)} className={inputCls} />
                                    </div>
                                    <button type="button" onClick={() => removeVariant(i)} className="p-2 rounded-lg text-red-500 hover:bg-red-50 transition-colors">
                                        <Trash2 className="h-4 w-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {formError && <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{formError}</div>}

                <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: C.blue }}
                >
                    {submitting ? "Menyimpan…" : "Simpan Produk"}
                </button>
            </form>

            {/* Crop Modal */}
            {cropSrc && (
                <ImageCropperModal
                    imageSrc={cropSrc}
                    aspect={1}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
