import { useState, useEffect } from "react";
import { useNavigate, useParams, Link } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Upload, Loader2, Link as LinkIcon } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getBannerById, updateBanner, uploadBannerImage, type Banner } from "../../services/banners";

export default function AdminMarketingEdit() {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const { show } = useToast();

    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [isActive, setIsActive] = useState(true);

    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);
    const [existingImageUrl, setExistingImageUrl] = useState("");

    useEffect(() => {
        if (!id) return;

        const fetchBanner = async () => {
            try {
                const banner = await getBannerById(id);
                if (!banner) {
                    show("Banner tidak ditemukan.");
                    navigate("/admin/marketing");
                    return;
                }

                setTitle(banner.title);
                setLinkUrl(banner.link_url || "");
                setCtaText(banner.cta_text || "");
                setExistingImageUrl(banner.image_url);
                setPreviewUrl(banner.image_url);
                setIsActive(banner.is_active);

                // Format dates for datetime-local input
                if (banner.start_date) {
                    const sd = new Date(banner.start_date);
                    setStartDate(new Date(sd.getTime() - sd.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                }
                if (banner.end_date) {
                    const ed = new Date(banner.end_date);
                    setEndDate(new Date(ed.getTime() - ed.getTimezoneOffset() * 60000).toISOString().slice(0, 16));
                }
            } catch (err: any) {
                show("Gagal memanggil data banner.");
            } finally {
                setLoading(false);
            }
        };

        fetchBanner();
    }, [id, navigate, show]);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        if (file.size > 2 * 1024 * 1024) {
            show("Ukuran gambar maksimal 2MB");
            return;
        }

        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!id) return;
        if (!title.trim()) {
            show("Judul wajib diisi");
            return;
        }

        setSaving(true);
        try {
            let finalImageUrl = existingImageUrl;

            if (imageFile) {
                show("Mengunggah gambar baru...");
                finalImageUrl = await uploadBannerImage(imageFile);
            }

            show("Menyimpan perubahan...");
            await updateBanner(id, {
                title: title.trim(),
                link_url: linkUrl.trim() || null,
                cta_text: ctaText.trim() || null,
                image_url: finalImageUrl,
                start_date: startDate ? new Date(startDate).toISOString() : null,
                end_date: endDate ? new Date(endDate).toISOString() : null,
                is_active: isActive,
            } as Partial<Banner>);

            show("Banner berhasil diperbarui! 🎉");
            navigate("/admin/marketing");
        } catch (error: any) {
            show(`Gagal menyimpan banner: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center">
                <Loader2 className="h-8 w-8 text-blue-500 animate-spin" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/admin/marketing" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Link>
                    <h1 className="font-semibold text-lg text-slate-900">Edit Banner</h1>
                </div>
            </div>

            <div className="p-4 max-w-2xl mx-auto mt-2">
                <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                    <form onSubmit={handleSubmit} className="p-5 flex flex-col gap-5">

                        {/* Status Toggle */}
                        <div className="flex items-center justify-between bg-slate-50 p-4 rounded-xl border border-slate-200">
                            <div>
                                <p className="font-medium text-slate-900 text-sm">Status Tayang</p>
                                <p className="text-xs text-slate-500">Apakah banner ini aktif?</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input
                                    type="checkbox"
                                    className="sr-only peer"
                                    checked={isActive}
                                    onChange={(e) => setIsActive(e.target.checked)}
                                />
                                <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {/* Image Upload */}
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-2">
                                Gambar Promo <span className="text-red-500">*</span>
                            </label>

                            <div className="relative group rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 transition-colors hover:border-blue-400 aspect-[21/9]">
                                {previewUrl ? (
                                    <img
                                        src={previewUrl}
                                        alt="Preview"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                        <ImageIcon className="h-10 w-10 mb-2 text-slate-300" />
                                        <p className="font-medium text-sm">Ketuk untuk unggah</p>
                                        <p className="text-xs mt-1 text-slate-500">Rasio 21:9 atau horisontal (Max 2MB)</p>
                                    </div>
                                )}

                                {/* Overlay on hover/preview */}
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100`}>
                                    <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                        <Upload className="h-4 w-4" /> Ganti Gambar
                                    </div>
                                </div>

                                <input
                                    type="file"
                                    accept="image/jpeg,image/png,image/webp"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                    disabled={saving}
                                />
                            </div>
                        </div>

                        {/* Inputs */}
                        <div className="space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Judul Banner <span className="text-red-500">*</span>
                                </label>
                                <input
                                    type="text"
                                    required
                                    value={title}
                                    onChange={(e) => setTitle(e.target.value)}
                                    className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                    disabled={saving}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Tautan / Link (Opsional)
                                </label>
                                <div className="relative">
                                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                        <LinkIcon className="h-4 w-4 text-slate-400" />
                                    </div>
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        className="w-full pl-9 rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                        disabled={saving}
                                    />
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                    Teks Tombol CTA (Opsional)
                                </label>
                                <input
                                    type="text"
                                    value={ctaText}
                                    onChange={(e) => setCtaText(e.target.value)}
                                    placeholder="Cth: Beli Sekarang, Lihat Promo..."
                                    className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                    disabled={saving}
                                />
                            </div>

                            {/* Scheduling */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Mulai Tayang (Opsional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={startDate}
                                        onChange={(e) => setStartDate(e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                        disabled={saving}
                                    />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1.5">
                                        Selesai Tayang (Opsional)
                                    </label>
                                    <input
                                        type="datetime-local"
                                        value={endDate}
                                        onChange={(e) => setEndDate(e.target.value)}
                                        className="w-full rounded-xl border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2.5"
                                        disabled={saving}
                                        min={startDate || undefined}
                                    />
                                </div>
                            </div>
                        </div>

                        <hr className="border-slate-100" />

                        <button
                            type="submit"
                            disabled={saving || !title.trim()}
                            className="w-full h-11 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                        >
                            {saving ? (
                                <>
                                    <Loader2 className="h-5 w-5 animate-spin" />
                                    Menyimpan...
                                </>
                            ) : (
                                "Simpan Perubahan"
                            )}
                        </button>
                    </form>
                </div>
            </div>
        </div>
    );
}
