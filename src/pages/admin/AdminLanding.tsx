import { useState, useEffect } from "react";
import {
    Plus,
    Trash2,
    RefreshCw,
    GripVertical,
    Eye,
    EyeOff,
    Layout,
    Save,
    Smartphone,
    Monitor,
    Tablet,
    Upload,
    ChevronLeft,
    Type,
} from "lucide-react";
import { useToast } from "../../context/ToastContext";
import {
    getAllLandingSections,
    deleteLandingSection,
    updateLandingSection,
    createLandingSection,
    uploadLandingImage,
} from "../../services/landing";
import type { LandingSection } from "../../types/landing";
import Landing from "../Landing";

const SECTION_LABELS: Record<string, string> = {
    hero: "Hero / Banner Utama",
    challenge: "Tantangan / Masalah",
    solution: "Solusi Ecosera",
    impact: "Dampak & Bukti Sosial",
    cta: "Ajakan Bertindak (CTA)",
};

const SECTION_KEY_OPTIONS = [
    { value: "hero", label: "Hero / Banner Utama" },
    { value: "challenge", label: "Tantangan / Masalah" },
    { value: "solution", label: "Solusi Ecosera" },
    { value: "impact", label: "Dampak & Bukti Sosial" },
    { value: "cta", label: "Ajakan Bertindak (CTA)" },
    { value: "custom", label: "Custom (Lainnya)" },
];

export default function AdminLanding() {
    const [sections, setSections] = useState<LandingSection[]>([]);
    const [draftSections, setDraftSections] = useState<LandingSection[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [selectedSectionId, setSelectedSectionId] = useState<string | null>(null);
    const [previewMode, setPreviewMode] = useState<"mobile" | "tablet" | "desktop">("desktop");
    const { show } = useToast();

    const loadSections = async () => {
        try {
            setLoading(true);
            const data = await getAllLandingSections();
            setSections(data);
            setDraftSections(JSON.parse(JSON.stringify(data)));
        } catch (error: any) {
            show(`Gagal memuat data: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        loadSections();
    }, []);

    const handleUpdateDraft = (id: string, updates: Partial<LandingSection>) => {
        setDraftSections((prev) =>
            prev.map((s) => (s.id === id ? { ...s, ...updates } : s))
        );
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            // In a real builder, we'd compare and only update changed ones, 
            // but for simplicity, let's update them all or the ones that changed.
            for (const section of draftSections) {
                const original = sections.find((s) => s.id === section.id);
                if (JSON.stringify(original) !== JSON.stringify(section)) {
                    // Only send editable fields, not id/created_at/updated_at
                    const { id, created_at, updated_at, ...editableFields } = section;
                    await updateLandingSection(section.id, editableFields);
                }
            }
            show("Perubahan disimpan ke server! 🎉");
            setSections(JSON.parse(JSON.stringify(draftSections)));
        } catch (error: any) {
            show(`Gagal menyimpan: ${error.message}`);
        } finally {
            setSaving(false);
        }
    };

    const handleAddSection = async () => {
        try {
            const newSection: Omit<LandingSection, "id" | "created_at" | "updated_at"> = {
                section_key: `custom_${Date.now()}`,
                title: "Seksi Baru",
                subtitle: "",
                content: "",
                image_url: null,
                cta_text: null,
                cta_link: null,
                is_active: true,
                sort_order: draftSections.length,
            };
            const created = await createLandingSection(newSection);
            setDraftSections([...draftSections, created]);
            setSections([...sections, created]);
            setSelectedSectionId(created.id);
            show("Seksi baru ditambahkan");
        } catch (error: any) {
            show(`Gagal menambah seksi: ${error.message}`);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Hapus seksi ini secara permanen?")) return;
        try {
            await deleteLandingSection(id);
            setDraftSections(draftSections.filter((s) => s.id !== id));
            setSections(sections.filter((s) => s.id !== id));
            if (selectedSectionId === id) setSelectedSectionId(null);
            show("Seksi dihapus");
        } catch (error: any) {
            show(`Gagal menghapus: ${error.message}`);
        }
    };

    const handleImageUpload = async (id: string, file: File) => {
        try {
            show("Mengunggah gambar...");
            const url = await uploadLandingImage(file);
            handleUpdateDraft(id, { image_url: url });
            show("Gambar berhasil diunggah");
        } catch (error: any) {
            show(`Gagal unggah: ${error.message}`);
        }
    };

    const selectedSection = draftSections.find((s) => s.id === selectedSectionId);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] gap-4">
                <RefreshCw className="h-8 w-8 animate-spin text-blue-600" />
                <p className="text-slate-500 font-medium">Menyiapkan Builder...</p>
            </div>
        );
    }

    return (
        <div className="fixed inset-0 lg:pl-[260px] flex flex-col bg-slate-50 z-20">
            {/* Toolbar */}
            <div className="h-16 bg-white border-b border-slate-200 px-6 flex items-center justify-between shrink-0">
                <div className="flex items-center gap-4">
                    <h1 className="font-bold text-slate-800 flex items-center gap-2">
                        <Layout className="h-5 w-5 text-blue-600" />
                        Ecosera Visual Builder
                    </h1>
                    <div className="h-6 w-px bg-slate-200" />
                    <div className="flex bg-slate-100 p-1 rounded-lg">
                        <button 
                            onClick={() => setPreviewMode("desktop")}
                            className={`p-1.5 rounded-md transition-all ${previewMode === "desktop" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <Monitor className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => setPreviewMode("tablet")}
                            className={`p-1.5 rounded-md transition-all ${previewMode === "tablet" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <Tablet className="h-4 w-4" />
                        </button>
                        <button 
                            onClick={() => setPreviewMode("mobile")}
                            className={`p-1.5 rounded-md transition-all ${previewMode === "mobile" ? "bg-white shadow-sm text-blue-600" : "text-slate-400 hover:text-slate-600"}`}
                        >
                            <Smartphone className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <button 
                        onClick={handleSave}
                        disabled={saving}
                        className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-700 transition-all disabled:opacity-50"
                    >
                        {saving ? <RefreshCw className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
                        Publikasikan
                    </button>
                </div>
            </div>

            <div className="flex-1 flex overflow-hidden">
                {/* Sidebar Controls */}
                <div className="w-[380px] bg-white border-r border-slate-200 flex flex-col shrink-0 overflow-y-auto no-scrollbar">
                    {selectedSection ? (
                        <div className="p-6 animate-in slide-in-from-left duration-200">
                            <button 
                                onClick={() => setSelectedSectionId(null)}
                                className="flex items-center gap-1.5 text-blue-600 font-bold text-xs uppercase tracking-wider mb-6 hover:gap-2 transition-all"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                Kembali ke Navigator
                            </button>

                            <h2 className="text-xl font-extrabold text-slate-800 mb-6">
                                Edit {SECTION_LABELS[selectedSection.section_key] || "Seksi"}
                            </h2>

                            <div className="space-y-6">
                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Tipe Seksi</label>
                                    <select 
                                        value={selectedSection.section_key}
                                        onChange={(e) => handleUpdateDraft(selectedSection.id, { section_key: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                    >
                                        {SECTION_KEY_OPTIONS.map(opt => (
                                            <option key={opt.value} value={opt.value}>{opt.label}</option>
                                        ))}
                                    </select>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Judul Utama</label>
                                    <div className="relative">
                                        <Type className="absolute left-4 top-3.5 h-4 w-4 text-slate-300" />
                                        <input 
                                            type="text"
                                            value={selectedSection.title || ""}
                                            onChange={(e) => handleUpdateDraft(selectedSection.id, { title: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl pl-11 pr-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="Masukkan judul..."
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Subjudul</label>
                                    <textarea 
                                        value={selectedSection.subtitle || ""}
                                        onChange={(e) => handleUpdateDraft(selectedSection.id, { subtitle: e.target.value })}
                                        className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[80px]"
                                        placeholder="Deskripsi singkat..."
                                    />
                                </div>

                                {selectedSection.section_key !== 'hero' && (
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Konten Detail</label>
                                        <textarea 
                                            value={selectedSection.content || ""}
                                            onChange={(e) => handleUpdateDraft(selectedSection.id, { content: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all min-h-[120px]"
                                            placeholder="Teks isi seksi..."
                                        />
                                    </div>
                                )}

                                <div>
                                    <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Media Visual</label>
                                    <div className="group relative aspect-video bg-slate-100 rounded-2xl border-2 border-dashed border-slate-200 overflow-hidden flex flex-col items-center justify-center hover:border-blue-400 transition-all">
                                        {selectedSection.image_url ? (
                                            <>
                                                <img src={selectedSection.image_url} className="w-full h-full object-cover" />
                                                <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                                    <div className="bg-white px-4 py-2 rounded-full text-xs font-bold text-slate-800 flex items-center gap-2">
                                                        <Upload className="h-3 w-3" /> Ganti Media
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <div className="flex flex-col items-center gap-2 text-slate-400">
                                                <Upload className="h-6 w-6" />
                                                <span className="text-xs font-bold">Pilih Gambar</span>
                                            </div>
                                        )}
                                        <input 
                                            type="file" 
                                            className="absolute inset-0 opacity-0 cursor-pointer" 
                                            accept="image/*"
                                            onChange={(e) => e.target.files?.[0] && handleImageUpload(selectedSection.id, e.target.files[0])}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Teks Tombol</label>
                                        <input 
                                            type="text"
                                            value={selectedSection.cta_text || ""}
                                            onChange={(e) => handleUpdateDraft(selectedSection.id, { cta_text: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="CTA..."
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-widest mb-2">Link Tujuan</label>
                                        <input 
                                            type="text"
                                            value={selectedSection.cta_link || ""}
                                            onChange={(e) => handleUpdateDraft(selectedSection.id, { cta_link: e.target.value })}
                                            className="w-full bg-slate-50 border border-slate-200 rounded-xl px-4 py-3 text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all"
                                            placeholder="/etalase..."
                                        />
                                    </div>
                                </div>

                                <button 
                                    onClick={() => handleDelete(selectedSection.id)}
                                    className="w-full py-4 rounded-xl text-red-500 font-bold text-sm hover:bg-red-50 transition-all flex items-center justify-center gap-2 mt-4"
                                >
                                    <Trash2 className="h-4 w-4" />
                                    Hapus Seksi Ini
                                </button>
                            </div>
                        </div>
                    ) : (
                        <div className="flex flex-col h-full">
                            <div className="p-6 border-b border-slate-100">
                                <h2 className="text-xl font-extrabold text-slate-800 mb-1">Navigator</h2>
                                <p className="text-xs text-slate-400 font-medium">Susun struktur landing page Anda</p>
                            </div>
                            
                            <div className="flex-1 p-4 space-y-3 overflow-y-auto no-scrollbar">
                                {draftSections.map((s) => (
                                    <div 
                                        key={s.id}
                                        onClick={() => setSelectedSectionId(s.id)}
                                        className="group flex items-center gap-4 bg-white border border-slate-200 p-4 rounded-2xl hover:border-blue-500 hover:shadow-lg hover:shadow-blue-500/10 cursor-pointer transition-all"
                                    >
                                        <div className="flex flex-col items-center text-slate-300">
                                            <GripVertical className="h-4 w-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-[10px] font-black text-blue-600 uppercase tracking-wider mb-1">{s.section_key}</p>
                                            <p className="text-sm font-bold text-slate-700 truncate">{s.title || "Tanpa Judul"}</p>
                                        </div>
                                        <button 
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                handleUpdateDraft(s.id, { is_active: !s.is_active });
                                            }}
                                            className={`p-2 rounded-lg transition-all ${s.is_active ? "text-blue-600 bg-blue-50" : "text-slate-300 bg-slate-50"}`}
                                        >
                                            {s.is_active ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                        </button>
                                    </div>
                                ))}

                                <button 
                                    onClick={handleAddSection}
                                    className="w-full py-4 border-2 border-dashed border-slate-200 rounded-2xl text-slate-400 font-bold text-sm flex items-center justify-center gap-2 hover:border-blue-400 hover:text-blue-500 hover:bg-blue-50/50 transition-all mt-4"
                                >
                                    <Plus className="h-4 w-4" />
                                    Tambah Seksi Baru
                                </button>
                            </div>
                        </div>
                    )}
                </div>

                {/* Live Preview Canvas */}
                <div className="flex-1 bg-slate-200 overflow-y-auto p-4 lg:p-12 flex justify-center items-start scroll-smooth">
                    <div 
                        className={`bg-white shadow-2xl transition-all duration-500 overflow-y-auto no-scrollbar rounded-[2rem] border-[12px] border-slate-900 ${
                            previewMode === 'mobile' ? 'w-[375px] h-[667px]' : 
                            previewMode === 'tablet' ? 'w-[768px] h-[1024px]' : 'w-full h-fit min-h-full rounded-none border-0'
                        }`}
                    >
                        <div className={`${previewMode === 'desktop' ? '' : 'pointer-events-none scale-[1] origin-top'}`}>
                            <Landing previewSections={draftSections.filter(s => s.is_active)} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
