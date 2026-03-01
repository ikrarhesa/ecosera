import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowLeft, Image as ImageIcon, Upload, Loader2, Link as LinkIcon, Save, LayoutGrid } from "lucide-react";
import { useToast } from "../../context/ToastContext";
import { getSoughtAfterItems, upsertSoughtAfterItem, uploadSoughtAfterImage, SoughtAfterItem } from "../../services/soughtAfter";

export default function AdminTrending() {
    const { show } = useToast();
    const [items, setItems] = useState<SoughtAfterItem[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState<number | null>(null);

    useEffect(() => {
        loadItems();
    }, []);

    const loadItems = async () => {
        try {
            setLoading(true);
            const data = await getSoughtAfterItems();

            // Ensure we have exactly 6 slots
            const slots: SoughtAfterItem[] = Array.from({ length: 6 }, (_, i) => {
                const position = i + 1;
                const existingItem = data.find(item => item.position === position);
                return existingItem || {
                    position,
                    title: "",
                    image_url: "",
                    link_url: ""
                };
            });

            setItems(slots);
        } catch (error) {
            show("Gagal memuat data trending");
        } finally {
            setLoading(false);
        }
    };

    const handleImageChange = async (position: number, file: File) => {
        if (file.size > 2 * 1024 * 1024) {
            show("Ukuran gambar maksimal 2MB");
            return;
        }

        try {
            setSaving(position);
            show("Mengunggah gambar...");
            const imageUrl = await uploadSoughtAfterImage(file);

            setItems(prev => prev.map(item =>
                item.position === position ? { ...item, image_url: imageUrl } : item
            ));
            show("Gambar berhasil diunggah");
        } catch (error: any) {
            show(`Gagal mengunggah: ${error.message}`);
        } finally {
            setSaving(null);
        }
    };

    const handleSave = async (position: number) => {
        const item = items.find(i => i.position === position);
        if (!item) return;

        if (!item.title.trim() || !item.image_url) {
            show("Judul dan gambar wajib diisi");
            return;
        }

        try {
            setSaving(position);
            await upsertSoughtAfterItem({
                position: item.position,
                title: item.title,
                image_url: item.image_url,
                link_url: item.link_url
            });
            show(`Slot ${position} berhasil disimpan`);
        } catch (error: any) {
            show(`Gagal menyimpan: ${error.message}`);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="min-h-screen bg-slate-50 pb-20">
            {/* Header */}
            <div className="sticky top-0 z-20 bg-white border-b px-4 py-3 flex items-center justify-between shadow-sm">
                <div className="flex items-center gap-3">
                    <Link to="/admin" className="p-2 -ml-2 rounded-xl hover:bg-slate-100 transition-colors">
                        <ArrowLeft className="h-5 w-5 text-slate-700" />
                    </Link>
                    <div className="flex items-center gap-2">
                        <LayoutGrid className="h-5 w-5 text-blue-600" />
                        <h1 className="font-semibold text-lg text-slate-900">Kelola Trending (Sought After)</h1>
                    </div>
                </div>
            </div>

            <div className="p-4 max-w-7xl mx-auto">
                <p className="text-slate-600 mb-6">
                    Kelola 6 item yang sedang tren atau paling dicari di halaman Etalase.
                </p>

                {loading ? (
                    <div className="flex justify-center items-center py-20">
                        <Loader2 className="h-8 w-8 animate-spin text-blue-500" />
                    </div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {items.map((item) => (
                            <div key={item.position} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                                <div className="bg-slate-100 px-4 py-3 border-b border-slate-200">
                                    <h3 className="font-semibold text-slate-800">Slot #{item.position}</h3>
                                </div>

                                <div className="p-4 flex flex-col gap-4 flex-1">
                                    {/* Image Upload */}
                                    <div>
                                        <div className="relative group rounded-xl overflow-hidden bg-slate-100 border-2 border-dashed border-slate-300 transition-colors hover:border-blue-400 aspect-[4/3] w-full max-w-[200px] mx-auto">
                                            {item.image_url ? (
                                                <img
                                                    src={item.image_url}
                                                    alt={`Slot ${item.position}`}
                                                    className="w-full h-full object-cover"
                                                />
                                            ) : (
                                                <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                                    <ImageIcon className="h-8 w-8 mb-2 text-slate-300" />
                                                    <p className="font-medium text-xs">Ketuk untuk unggah</p>
                                                </div>
                                            )}

                                            <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100`}>
                                                <div className="flex items-center gap-1 text-white bg-black/50 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                                                    <Upload className="h-3 w-3" /> Ganti
                                                </div>
                                            </div>

                                            <input
                                                type="file"
                                                accept="image/jpeg,image/png,image/webp"
                                                onChange={(e) => {
                                                    const file = e.target.files?.[0];
                                                    if (file) handleImageChange(item.position, file);
                                                }}
                                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                                disabled={saving === item.position}
                                            />

                                            {saving === item.position && (
                                                <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-10">
                                                    <Loader2 className="h-6 w-6 animate-spin text-blue-500" />
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {/* Inputs */}
                                    <div className="space-y-3 flex-1 flex flex-col justify-end">
                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Judul <span className="text-red-500">*</span>
                                            </label>
                                            <input
                                                type="text"
                                                value={item.title}
                                                onChange={(e) => setItems(prev => prev.map(i => i.position === item.position ? { ...i, title: e.target.value } : i))}
                                                placeholder="Cth: Kopi Kenangan"
                                                className="w-full rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                                disabled={saving === item.position}
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-xs font-medium text-slate-700 mb-1">
                                                Tautan (Opsional)
                                            </label>
                                            <div className="relative">
                                                <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                    <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                                </div>
                                                <input
                                                    type="url"
                                                    value={item.link_url || ""}
                                                    onChange={(e) => setItems(prev => prev.map(i => i.position === item.position ? { ...i, link_url: e.target.value } : i))}
                                                    placeholder="/search?q=kopi"
                                                    className="w-full pl-8 rounded-lg border-slate-300 focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                                    disabled={saving === item.position}
                                                />
                                            </div>
                                        </div>

                                        <button
                                            onClick={() => handleSave(item.position)}
                                            disabled={saving === item.position || !item.title.trim() || !item.image_url}
                                            className="w-full mt-2 h-9 bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:bg-blue-300 disabled:cursor-not-allowed"
                                        >
                                            {saving === item.position ? (
                                                <Loader2 className="h-4 w-4 animate-spin" />
                                            ) : (
                                                <Save className="h-4 w-4" />
                                            )}
                                            Simpan Slot
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
