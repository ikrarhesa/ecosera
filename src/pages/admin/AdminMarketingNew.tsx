import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Image as ImageIcon, Upload, Loader2, Link as LinkIcon, ArrowLeft } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { createBanner, uploadBannerImage } from "../../services/banners";

const C = { blue: "#0071DC", navy: "#041E42" };

export default function AdminMarketingNew() {
    const navigate = useNavigate();
    const { show } = useToast();

    const [loading, setLoading] = useState(false);
    const [title, setTitle] = useState("");
    const [linkUrl, setLinkUrl] = useState("");
    const [ctaText, setCtaText] = useState("");
    const [startDate, setStartDate] = useState("");
    const [endDate, setEndDate] = useState("");
    const [imageFile, setImageFile] = useState<File | null>(null);
    const [previewUrl, setPreviewUrl] = useState<string | null>(null);

    const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        if (file.size > 2 * 1024 * 1024) { show("Ukuran gambar maksimal 2MB"); return; }
        setImageFile(file);
        setPreviewUrl(URL.createObjectURL(file));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!title.trim() || !imageFile) { show("Judul dan gambar wajib diisi"); return; }

        setLoading(true);
        try {
            show("Mengunggah gambar...");
            const imageUrl = await uploadBannerImage(imageFile);
            show("Menyimpan banner...");
            await createBanner({
                title: title.trim(),
                link_url: linkUrl.trim() || undefined,
                cta_text: ctaText.trim() || undefined,
                image_url: imageUrl,
                start_date: startDate ? new Date(startDate).toISOString() : undefined,
                end_date: endDate ? new Date(endDate).toISOString() : undefined,
                is_active: true,
                sort_order: 0,
            });
            show("Banner berhasil ditambahkan! 🎉");
            navigate("/admin/marketing");
        } catch (error: any) {
            show(`Gagal menyimpan banner: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-600 mb-1.5";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 md:mb-8">
                <Link to="/admin/marketing" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kelola Promo
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>Tambah Banner</h1>
                <p className="text-sm text-slate-500 mt-1">Buat banner promo baru</p>
            </div>

            <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
                <form onSubmit={handleSubmit} className="p-5 md:p-6 flex flex-col gap-5">
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
                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${previewUrl ? "opacity-0 group-hover:opacity-100" : "opacity-0"}`}>
                                <div className="flex items-center gap-2 text-white bg-black/50 px-4 py-2 rounded-full text-sm font-medium backdrop-blur-sm">
                                    <Upload className="h-4 w-4" /> Ganti Gambar
                                </div>
                            </div>
                            <input type="file" accept="image/jpeg,image/png,image/webp" onChange={handleImageChange} className="absolute inset-0 w-full h-full opacity-0 cursor-pointer" disabled={loading} required />
                        </div>
                    </div>

                    {/* Inputs */}
                    <div className="space-y-4">
                        <div>
                            <label className={labelCls}>Judul Banner <span className="text-red-500">*</span></label>
                            <input type="text" required value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Promo Diskon Akhir Tahun..." className={inputCls} disabled={loading} />
                            <p className="text-[11px] text-slate-500 mt-1.5">Digunakan untuk identifikasi di admin (tidak tampil ke pelanggan).</p>
                        </div>

                        <div>
                            <label className={labelCls}>Tautan / Link (Opsional)</label>
                            <div className="relative">
                                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                    <LinkIcon className="h-4 w-4 text-slate-400" />
                                </div>
                                <input type="url" value={linkUrl} onChange={(e) => setLinkUrl(e.target.value)} placeholder="https://... atau /category/..." className={`${inputCls} pl-9`} disabled={loading} />
                            </div>
                            <p className="text-[11px] text-slate-500 mt-1.5">Ke mana pelanggan diarahkan saat banner diketuk.</p>
                        </div>

                        <div>
                            <label className={labelCls}>Teks Tombol CTA (Opsional)</label>
                            <input type="text" value={ctaText} onChange={(e) => setCtaText(e.target.value)} placeholder="Cth: Beli Sekarang, Lihat Promo..." className={inputCls} disabled={loading} />
                            <p className="text-[11px] text-slate-500 mt-1.5">Teks pada tombol tautan. Default: "Lihat Promo"</p>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                            <div>
                                <label className={labelCls}>Mulai Tayang (Opsional)</label>
                                <input type="datetime-local" value={startDate} onChange={(e) => setStartDate(e.target.value)} className={inputCls} disabled={loading} />
                            </div>
                            <div>
                                <label className={labelCls}>Selesai Tayang (Opsional)</label>
                                <input type="datetime-local" value={endDate} onChange={(e) => setEndDate(e.target.value)} className={inputCls} disabled={loading} min={startDate || undefined} />
                            </div>
                        </div>
                        <p className="text-[11px] text-slate-500">Kosongkan jadwal jika ingin banner tampil terus-menerus.</p>
                    </div>

                    <hr className="border-slate-100" />

                    <button type="submit" disabled={loading || !title.trim() || !imageFile}
                        className="w-full h-11 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                        style={{ backgroundColor: C.blue }}
                    >
                        {loading ? (<><Loader2 className="h-5 w-5 animate-spin" /> Menyimpan...</>) : "Simpan Banner"}
                    </button>
                </form>
            </div>
        </div>
    );
}
