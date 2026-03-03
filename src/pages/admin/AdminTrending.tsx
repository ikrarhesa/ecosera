import { useState, useEffect } from "react";
import {
    Image as ImageIcon,
    Upload,
    Loader2,
    Link as LinkIcon,
    Save,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
    getSoughtAfterItems,
    upsertSoughtAfterItem,
    uploadSoughtAfterImage,
    SoughtAfterItem,
} from "../../services/soughtAfter";

const C = {
    blue: "#0071DC",
    navy: "#041E42",
};

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
            const slots: SoughtAfterItem[] = Array.from(
                { length: 6 },
                (_, i) => {
                    const position = i + 1;
                    const existingItem = data.find(
                        (item) => item.position === position
                    );
                    return (
                        existingItem || {
                            position,
                            title: "",
                            image_url: "",
                            link_url: "",
                        }
                    );
                }
            );
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
            setItems((prev) =>
                prev.map((item) =>
                    item.position === position
                        ? { ...item, image_url: imageUrl }
                        : item
                )
            );
            show("Gambar berhasil diunggah");
        } catch (error: any) {
            show(`Gagal mengunggah: ${error.message}`);
        } finally {
            setSaving(null);
        }
    };

    const handleSave = async (position: number) => {
        const item = items.find((i) => i.position === position);
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
                link_url: item.link_url,
            });
            show(`Slot ${position} berhasil disimpan`);
        } catch (error: any) {
            show(`Gagal menyimpan: ${error.message}`);
        } finally {
            setSaving(null);
        }
    };

    return (
        <div className="max-w-7xl mx-auto">
            {/* Page heading */}
            <div className="mb-6 md:mb-8">
                <h1
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: C.navy }}
                >
                    Kelola Trending
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Kelola 6 item yang sedang tren atau paling dicari di halaman
                    Etalase
                </p>
            </div>

            {loading ? (
                <div className="flex justify-center items-center py-24">
                    <div
                        className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
                        style={{
                            borderColor: C.blue,
                            borderTopColor: "transparent",
                        }}
                    />
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {items.map((item) => (
                        <div
                            key={item.position}
                            className="bg-white rounded-xl border border-slate-200/80 overflow-hidden hover:shadow-md transition-shadow duration-200 flex flex-col"
                        >
                            {/* Header */}
                            <div
                                className="px-4 py-3 border-b border-slate-100 flex items-center justify-between"
                                style={{ backgroundColor: C.blue + "06" }}
                            >
                                <h3
                                    className="font-semibold text-sm"
                                    style={{ color: C.navy }}
                                >
                                    Slot #{item.position}
                                </h3>
                                {item.title && item.image_url && (
                                    <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-green-50 text-green-600">
                                        Terisi
                                    </span>
                                )}
                            </div>

                            <div className="p-4 flex flex-col gap-4 flex-1">
                                {/* Image Upload */}
                                <div className="relative group rounded-lg overflow-hidden bg-slate-50 border-2 border-dashed border-slate-200 transition-colors hover:border-blue-300 aspect-[4/3] w-full max-w-[200px] mx-auto">
                                    {item.image_url ? (
                                        <img
                                            src={item.image_url}
                                            alt={`Slot ${item.position}`}
                                            className="w-full h-full object-cover"
                                        />
                                    ) : (
                                        <div className="absolute inset-0 flex flex-col items-center justify-center text-slate-400">
                                            <ImageIcon className="h-8 w-8 mb-2 text-slate-300" />
                                            <p className="font-medium text-xs">
                                                Ketuk untuk unggah
                                            </p>
                                        </div>
                                    )}

                                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity opacity-0 group-hover:opacity-100">
                                        <div className="flex items-center gap-1 text-white bg-black/50 px-3 py-1.5 rounded-full text-xs font-medium backdrop-blur-sm">
                                            <Upload className="h-3 w-3" />{" "}
                                            Ganti
                                        </div>
                                    </div>

                                    <input
                                        type="file"
                                        accept="image/jpeg,image/png,image/webp"
                                        onChange={(e) => {
                                            const file = e.target.files?.[0];
                                            if (file)
                                                handleImageChange(
                                                    item.position,
                                                    file
                                                );
                                        }}
                                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                        disabled={saving === item.position}
                                    />

                                    {saving === item.position && (
                                        <div className="absolute inset-0 bg-white/80 flex items-center justify-center backdrop-blur-sm z-10">
                                            <Loader2
                                                className="h-6 w-6 animate-spin"
                                                style={{ color: C.blue }}
                                            />
                                        </div>
                                    )}
                                </div>

                                {/* Inputs */}
                                <div className="space-y-3 flex-1 flex flex-col justify-end">
                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Judul{" "}
                                            <span className="text-red-500">
                                                *
                                            </span>
                                        </label>
                                        <input
                                            type="text"
                                            value={item.title}
                                            onChange={(e) =>
                                                setItems((prev) =>
                                                    prev.map((i) =>
                                                        i.position ===
                                                            item.position
                                                            ? {
                                                                ...i,
                                                                title: e
                                                                    .target
                                                                    .value,
                                                            }
                                                            : i
                                                    )
                                                )
                                            }
                                            placeholder="Cth: Kopi Kenangan"
                                            className="w-full rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                            disabled={
                                                saving === item.position
                                            }
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-xs font-medium text-slate-600 mb-1">
                                            Tautan (Opsional)
                                        </label>
                                        <div className="relative">
                                            <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none">
                                                <LinkIcon className="h-3.5 w-3.5 text-slate-400" />
                                            </div>
                                            <input
                                                type="url"
                                                value={item.link_url || ""}
                                                onChange={(e) =>
                                                    setItems((prev) =>
                                                        prev.map((i) =>
                                                            i.position ===
                                                                item.position
                                                                ? {
                                                                    ...i,
                                                                    link_url:
                                                                        e
                                                                            .target
                                                                            .value,
                                                                }
                                                                : i
                                                        )
                                                    )
                                                }
                                                placeholder="/search?q=kopi"
                                                className="w-full pl-8 rounded-lg border-slate-200 focus:border-blue-500 focus:ring-blue-500 text-sm py-2"
                                                disabled={
                                                    saving === item.position
                                                }
                                            />
                                        </div>
                                    </div>

                                    <button
                                        onClick={() =>
                                            handleSave(item.position)
                                        }
                                        disabled={
                                            saving === item.position ||
                                            !item.title.trim() ||
                                            !item.image_url
                                        }
                                        className="w-full mt-2 h-9 text-white rounded-lg font-medium text-sm transition-colors flex items-center justify-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed hover:opacity-90"
                                        style={{ backgroundColor: C.blue }}
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
    );
}
