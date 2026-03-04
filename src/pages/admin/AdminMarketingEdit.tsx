import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { Image as ImageIcon, Upload, Loader2, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getBannerById, updateBanner, uploadBannerImage, type Banner } from "../../services/banners";
import ImageCropperModal from "../../components/ImageCropperModal";

const C = { blue: "#0071DC", navy: "#041E42" };

export default function AdminMarketingEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { show } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [textColor, setTextColor] = useState<'white' | 'navy'>('white');
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");

    // Cropper state
    const [cropSrc, setCropSrc] = useState<string | null>(null);

    useEffect(() => {
        if (!id) return;
        const fetchBanner = async () => {
            try {
                const banner = await getBannerById(id);
                if (!banner) { show("Banner tidak ditemukan."); navigate("/admin/marketing"); return; }
                setTitle(banner.title); setLinkUrl(banner.link_url || ""); setCtaText(banner.cta_text || "");
                setTextColor(banner.text_color || "white");
                setExistingImageUrl(banner.image_url); setPreviewUrl(banner.image_url); setIsActive(banner.is_active);
                if (banner.start_date) { const sd = new Date(banner.start_date); setStartDate(new Date(sd.getTime() - sd.getTimezoneOffset() * 60000).toISOString().slice(0, 16)); }
                if (banner.end_date) { const ed = new Date(banner.end_date); setEndDate(new Date(ed.getTime() - ed.getTimezoneOffset() * 60000).toISOString().slice(0, 16)); }
            } catch (err: any) { show("Gagal memanggil data banner."); } finally { setLoading(false); }
        };
        fetchBanner();
    }, [id, navigate, show]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { show("Ukuran gambar maksimal 2MB"); return; }
        const url = URL.createObjectURL(file);
        setCropSrc(url);
        e.target.value = "";
    };

    const handleCropComplete = (croppedFile: File) => {
        setImageFile(croppedFile);
        setPreviewUrl(URL.createObjectURL(croppedFile));
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
    };

    const handleCropCancel = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!title.trim()) { show("Judul wajib diisi"); return; }

        setSaving(true);
        try {
            let finalImageUrl = existingImageUrl;
            if (imageFile) { show("Mengunggah gambar baru..."); finalImageUrl = await uploadBannerImage(imageFile); }
            show("Menyimpan perubahan...");
            await updateBanner(id, {
                title: title.trim(), link_url: linkUrl.trim() || null, cta_text: ctaText.trim() || null,
                text_color: textColor,
                image_url: finalImageUrl, start_date: startDate ? new Date(startDate).toISOString() : null,
                end_date: endDate ? new Date(endDate).toISOString() : null, is_active: isActive,
            } as Partial<Banner>);
            show("Banner berhasil diperbarui! 🎉");
            navigate("/admin/marketing");
        } catch (error: any) { show(`Gagal menyimpan banner: ${error.message}`); } finally { setSaving(false); }
    };

    const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-600 mb-1.5";

    if (loading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin" style={{ borderColor: C.blue, borderTopColor: "transparent" }} />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 md:mb-8">
                <Link to="/admin/marketing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kelola Promo
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>Edit Banner</h1>
                <p className="text-sm text-slate-500 mt-1">Perbarui detail banner promo</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-5 md:p-6 flex flex-col gap-5">
                    {/* Status Toggle */}
                    <div className="flex items-center justify-between bg-slate-50 p-4 rounded-lg border border-slate-200">
                        <div>
                            <p className="font-medium text-sm" style={{ color: C.navy }}>Status Tayang</p>
                            <p className="text-xs text-slate-500">Apakah banner ini aktif?</p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input type="checkbox" className="sr-only peer" checked={isActive} onChange={(e) => setIsActive(e.target.checked)} />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* Image Upload */}
                    <div>
                        <label className={labelCls}>Gambar Promo <span className="text-red-500">*</span></label>
                        <div className="relative group rounded-lg overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 transition-colors hover:border-blue-400 aspect-[21/9]">
                            {previewUrl ? (
                                <img src={previewUrl} alt="Preview" className="w-full h-full object-cover" />
                            ) : (
                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                    <ImageIcon className="h-10 w-10 mb-2 text-slate-300" />
                                    <p className="font-medium text-sm">Ketuk untuk unggah</p>
                                    <p className="text-xs mt-1 text-slate-500">Rasio 21:9 atau horisontal (Max 2MB)</p>
                                </div>
                            )}
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100`}>
                                <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                    <Upload className="h-4 w-4" /> Ganti Gambar
                                </div>
                            </div>
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={saving} />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Judul Banner <span className="text-red-500">*</span></label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} className={inputCls} disabled={saving} />
                        </div>

                        <div>
                            <label className={labelCls}>Tautan / Link (Opsional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-4 w-4 text-slate-400" />
                                </div>
                                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} className={`${inputCls} pl-9`} disabled={saving} />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Teks Tombol CTA (Opsional)</label>
                            <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Cth: Beli Sekarang..." className={inputCls} disabled={saving} />
                        </div>

                        <div>
                            <label className={labelCls}>Warna Teks Banner</label>
                            <select value={textColor} onChange={(e) => setTextColor(e.target.value as 'white' | 'navy')} className={inputCls} disabled={saving}>
                                <option value="white">Putih (Untuk Background Gelap)</option>
                                <option value="navy">Navy (Untuk Background Terang)</option>
                            </select>
                            <p className="text-[11px] text-slate-500 mt-1.5">Pilih warna teks dan tombol agar kontras dengan gambar banner.</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className={labelCls}>Mulai Tayang (Opsional)</label>
                                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} disabled={saving} />
                            </div>
                            <div>
                                <label className={labelCls}>Selesai Tayang (Opsional)</label>
                                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} disabled={saving} min={startDate || undefined} />
                            </div>
                        </div>
                    </div>

                    <hr className="border-slate-100" />

                    <button type="submit" disabled={saving || !title.trim()}
                        className="w-full h-11 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ backgroundColor: C.blue }}
                    >
                        {saving ? (<><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</>) : "Simpan Perubahan"}
                    </button>
                </form>
            </div>

            {/* Crop Modal */}
            {cropSrc && (
                <ImageCropperModal
                    imageSrc={cropSrc}
                    aspect={21 / 9}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
