import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Upload, Save, Store, Phone, Mail, MapPin, Navigation } from "lucide-react";
import { supabase } from "../../lib/supabase";

export default function AdminShopNew() {
    const navigate = useNavigate();

    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);

    // Logo preview
    useEffect(() => {
        if (!logoFile) { setLogoPreview(null); return; }
        const url = URL.createObjectURL(logoFile);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [logoFile]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);

        if (!name.trim()) { setFormError("Nama toko wajib diisi."); return; }

        setSubmitting(true);
        try {
            // 1. Insert seller
            const { data: seller, error: insertErr } = await supabase
                .from("sellers")
                .insert({
                    name: name.trim(),
                    description: description.trim() || null,
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                    address: address.trim() || null,
                    latitude: latitude.trim() ? parseFloat(latitude) : null,
                    longitude: longitude.trim() ? parseFloat(longitude) : null,
                    whatsapp_number: phone.trim() || "",
                })
                .select("id")
                .single();

            if (insertErr) {
                setFormError(`Gagal membuat toko: ${insertErr.message}`);
                setSubmitting(false);
                return;
            }

            // 2. Upload logo if provided
            if (logoFile && seller) {
                const ext = logoFile.name.split(".").pop() || "png";
                const filePath = `logos/${seller.id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, logoFile, { cacheControl: "3600", contentType: logoFile.type, upsert: true });

                if (!uploadErr) {
                    const { data: urlData } = supabase.storage.from("shop-logos").getPublicUrl(filePath);
                    await supabase.from("sellers").update({ logo_url: urlData.publicUrl }).eq("id", seller.id);
                }
            }

            navigate("/admin/shops");
        } catch (err) {
            console.error("[AdminShopNew] Unexpected error:", err);
            setFormError("Terjadi kesalahan tak terduga.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-700 mb-1";

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
                        onClick={() => navigate("/admin/shops")}
                        className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50 transition-colors"
                    >
                        <ArrowLeft className="h-5 w-5 text-slate-600" />
                    </button>
                    <div>
                        <h1 className="text-xl font-bold text-slate-900">Tambah Toko Baru</h1>
                        <p className="text-sm text-slate-600">Daftarkan penjual baru</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Identity */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Store className="h-4 w-4 text-blue-600" /> Identitas Toko
                        </h3>

                        {/* Logo */}
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer group">
                                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-400 transition-colors grid place-items-center overflow-hidden bg-white">
                                    {logoPreview ? (
                                        <img src={logoPreview} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-slate-400" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                            </label>
                            <div className="flex-1">
                                <label className={labelCls}>Nama Toko *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} placeholder="Nama toko/UMKM" required />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Deskripsi</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} placeholder="Ceritakan tentang toko ini…" />
                        </div>

                        <div>
                            <label className={labelCls}>Alamat</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputCls} pl-9`} placeholder="Muara Enim, Sumatera Selatan" />
                            </div>
                        </div>

                        {/* Coordinates */}
                        <div>
                            <label className={labelCls}>Koordinat Lokasi</label>
                            <div className="grid grid-cols-2 gap-2 mb-2">
                                <div>
                                    <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={inputCls} placeholder="Latitude (cth: -3.8)" />
                                </div>
                                <div>
                                    <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={inputCls} placeholder="Longitude (cth: 103.8)" />
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={() => {
                                    if (navigator.geolocation) {
                                        navigator.geolocation.getCurrentPosition(
                                            (pos) => {
                                                setLatitude(pos.coords.latitude.toFixed(6));
                                                setLongitude(pos.coords.longitude.toFixed(6));
                                            },
                                            () => alert("Gagal mendapatkan lokasi. Pastikan izin lokasi diaktifkan.")
                                        );
                                    }
                                }}
                                className="inline-flex items-center gap-1.5 text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                                <Navigation className="h-3.5 w-3.5" /> Gunakan Lokasi Saya
                            </button>
                        </div>
                    </div>

                    {/* Contact */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Phone className="h-4 w-4 text-blue-600" /> Kontak
                        </h3>

                        <div>
                            <label className={labelCls}>Nomor Telepon / WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={`${inputCls} pl-9`} placeholder="08123456789" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={`${inputCls} pl-9`} placeholder="toko@email.com" />
                            </div>
                        </div>
                    </div>

                    {formError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{formError}</div>
                    )}

                    <button type="submit" disabled={submitting}
                        className={`w-full py-3 rounded-xl text-white font-medium transition-all shadow-md flex items-center justify-center gap-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            }`}
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? "Menyimpan…" : "Buat Toko"}
                    </button>
                </form>
            </div>
        </div>
    );
}
