import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Trash2, ArrowLeft, Image as ImageIcon, ExternalLink, RefreshCw, Edit, Calendar } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getAllBanners, deleteBanner, updateBanner, type Banner } from "../../services/banners";

export default function AdminMarketing() {
    const [banners, setBanners] = useState<Banner[]>([]);
    const [loading, setLoading] = useState(true);
    const { show } = useToast();

    const loadBanners = async () => {
        try {
            setLoading(true);
            const data = await getAllBanners();
            setBanners(data);
        } catch (error: any) {
            show(`Gagal memuat banner: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadBanners();
    }, []);

    const handleToggleActive = async (banner: Banner) => {
        try {
            const updated = await updateBanner(banner.id, { is_active: !banner.is_active });
            setBanners(banners.map(b => b.id === banner.id ? updated : b));
            show(`Banner ${updated.is_active ? 'diaktifkan' : 'dinonaktifkan'}`);
        } catch (error: any) {
            show(`Gagal mengubah status: ${error.message}`);
        }
    };

    const handleDelete = async (banner: Banner) => {
        if (!confirm(`Hapus banner "${banner.title}"?`)) return;

        try {
            await deleteBanner(banner.id);
            setBanners(banners.filter(b => b.id !== banner.id));
            show("Banner dihapus");
        } catch (error: any) {
            show(`Gagal menghapus: ${error.message}`);
        }
    };

    const activeCount = banners.filter(b => b.is_active).length;

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between">
                <div className="flex items-center gap-3">
                    <Link to="/admin" className="p-2 -ml-2 rounded-xl hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Link>
                    <div>
                        <h1 className="font-semibold text-lg text-slate-900">Kelola Marketing</h1>
                        <p className="text-xs text-slate-500">
                            {banners.length} banner ({activeCount} aktif)
                        </p>
                    </div>
                </div>
                <Link
                    to="/admin/marketing/new"
                    className="h-9 px-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg flex items-center gap-2 text-sm font-medium transition-colors"
                >
                    <Plus className="h-4 w-4" />
                    <span className="hidden sm:inline">Tambah Banner</span>
                </Link>
            </div>

            <div className="p-4 max-w-3xl mx-auto">
                {/* Info Banner */}
                <div className="mb-6 p-4 bg-blue-50 border border-blue-100 rounded-xl text-sm text-blue-800 flex gap-3">
                    <ImageIcon className="h-5 w-5 flex-shrink-0 text-blue-600" />
                    <div>
                        <p className="font-medium mb-1">Tampilan Beranda (Home)</p>
                        <p className="text-blue-700/80">
                            Hanya <strong>4 banner aktif terbaru</strong> yang akan ditampilkan secara bergiliran (carousel) di halaman utama. Jika lebih dari 4 yang aktif, banner yang paling lama tidak akan muncul.
                        </p>
                    </div>
                </div>

                {/* List */}
                {loading ? (
                    <div className="flex flex-col items-center justify-center py-12 text-slate-400 gap-2">
                        <RefreshCw className="h-6 w-6 animate-spin" />
                        <p className="text-sm">Memuat data...</p>
                    </div>
                ) : banners.length === 0 ? (
                    <div className="text-center py-16 bg-white border border-dashed rounded-2xl">
                        <ImageIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Belum ada banner</p>
                        <p className="text-slate-400 text-sm mt-1 mb-4">Tambahkan banner promo pertama Anda</p>
                        <Link
                            to="/admin/marketing/new"
                            className="inline-flex items-center gap-2 h-9 px-4 rounded-lg bg-blue-600 text-white text-sm font-medium"
                        >
                            <Plus className="h-4 w-4" /> Tambah Banner
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {banners.map((banner, index) => {
                            const now = new Date();
                            const isScheduled = banner.start_date && new Date(banner.start_date) > now;
                            const isExpired = banner.end_date && new Date(banner.end_date) < now;

                            const isActiveAndShown = banner.is_active && !isScheduled && !isExpired && index < 4;
                            const isActiveButHidden = banner.is_active && !isScheduled && !isExpired && index >= 4;

                            return (
                                <div
                                    key={banner.id}
                                    className={`bg-white rounded-xl border p-4 shadow-sm transition-opacity ${!banner.is_active ? 'opacity-60' : ''}`}
                                >
                                    <div className="flex flex-col sm:flex-row gap-4">
                                        {/* Image Preview */}
                                        <div className="w-full sm:w-48 aspect-[21/9] sm:aspect-video rounded-lg overflow-hidden bg-slate-100 border flex-shrink-0 relative">
                                            <img
                                                src={banner.image_url}
                                                alt={banner.title}
                                                className="w-full h-full object-cover"
                                            />
                                            {isActiveAndShown && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-green-500 text-white uppercase tracking-wider shadow">
                                                    Tayang
                                                </div>
                                            )}
                                            {isActiveButHidden && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-amber-500 text-white uppercase tracking-wider shadow">
                                                    Tersembunyi (Limit)
                                                </div>
                                            )}
                                            {isScheduled && banner.is_active && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-blue-500 text-white uppercase tracking-wider shadow">
                                                    Dijadwalkan
                                                </div>
                                            )}
                                            {isExpired && banner.is_active && (
                                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded text-[10px] font-bold bg-slate-500 text-white uppercase tracking-wider shadow">
                                                    Kadaluarsa
                                                </div>
                                            )}
                                        </div>

                                        {/* Details */}
                                        <div className="flex-1 flex flex-col min-w-0">
                                            <h3 className="font-semibold text-slate-900 truncate">{banner.title}</h3>

                                            {banner.link_url ? (
                                                <a
                                                    href={banner.link_url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="text-xs text-blue-600 hover:underline flex items-center gap-1 mt-1 truncate"
                                                >
                                                    <ExternalLink className="h-3 w-3" />
                                                    {banner.link_url}
                                                </a>
                                            ) : (
                                                <span className="text-xs text-slate-400 mt-1">Tidak ada link tautan</span>
                                            )}

                                            {banner.cta_text && (
                                                <p className="text-xs text-slate-500 mt-1">CTA: "{banner.cta_text}"</p>
                                            )}

                                            {(banner.start_date || banner.end_date) && (
                                                <div className="text-[11px] text-slate-500 flex items-center gap-1 mt-2 bg-slate-50 w-fit px-2 py-1 rounded">
                                                    <Calendar className="h-3 w-3" />
                                                    {banner.start_date ? new Date(banner.start_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Sekarang'}
                                                    {' '} - {' '}
                                                    {banner.end_date ? new Date(banner.end_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' }) : 'Seterusnya'}
                                                </div>
                                            )}

                                            <div className="mt-auto pt-4 flex items-center justify-between gap-3">
                                                {/* Toggle active */}
                                                <label className="flex items-center gap-2 cursor-pointer">
                                                    <div className="relative">
                                                        <input
                                                            type="checkbox"
                                                            className="sr-only"
                                                            checked={banner.is_active}
                                                            onChange={() => handleToggleActive(banner)}
                                                        />
                                                        <div className={`block w-10 h-6 rounded-full transition-colors ${banner.is_active ? 'bg-blue-500' : 'bg-slate-300'}`}></div>
                                                        <div className={`dot absolute left-1 top-1 bg-white w-4 h-4 rounded-full transition-transform ${banner.is_active ? 'transform translate-x-4' : ''}`}></div>
                                                    </div>
                                                    <span className={`text-sm font-medium ${banner.is_active ? 'text-blue-700' : 'text-slate-500'}`}>
                                                        {banner.is_active ? 'Aktif' : 'Nonaktif'}
                                                    </span>
                                                </label>

                                                {/* Actions */}
                                                <div className="flex gap-2">
                                                    <Link
                                                        to={`/admin/marketing/${banner.id}/edit`}
                                                        className="p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                        title="Edit"
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Link>
                                                    <button
                                                        onClick={() => handleDelete(banner)}
                                                        className="p-2 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                        title="Hapus"
                                                    >
                                                        <Trash2 className="h-4 w-4" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>
        </div>
    );
}
