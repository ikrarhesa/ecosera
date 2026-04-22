import React, { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Upload, Save, Store, Phone, Mail, MapPin, Navigation, ArrowLeft } from "lucide-react";
import { supabase } from "../../lib/supabase";
import { compressImage } from "../../lib/imageCompression";
import LocationPickerModal from "../../components/LocationPickerModal";

const C = { blue: "#0071DC", navy: "#041E42" };

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
    const [showMap, setShowMap] = useState(false);

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

            if (logoFile && seller) {
                const compressedLogo = await compressImage(logoFile);
                const ext = compressedLogo.name.split(".").pop() || "webp";
                const filePath = `logos/${seller.id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, compressedLogo, { cacheControl: "3600", contentType: compressedLogo.type, upsert: true });
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

    const inputCls = "w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-600 mb-1";

    return (
        <div className="max-w-3xl mx-auto">
            <div className="mb-6 md:mb-8">
                <Link to="/admin/shops" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kelola Toko
                </Link>
                <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>Tambah Toko Baru</h1>
                <p className="text-sm text-slate-500 mt-1">Daftarkan penjual baru</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identity */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2" style={{ color: C.navy }}>
                        <Store className="h-4 w-4" style={{ color: C.blue }} /> Identitas Toko
                    </h3>

                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer group">
                            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors grid place-items-center overflow-hidden bg-white">
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

                    <div>
                        <label className={labelCls}>Koordinat Lokasi</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input type="number" step="any" value={latitude} onChange={(e) => setLatitude(e.target.value)} className={inputCls} placeholder="Latitude" />
                            <input type="number" step="any" value={longitude} onChange={(e) => setLongitude(e.target.value)} className={inputCls} placeholder="Longitude" />
                        </div>
                        <div className="flex items-center gap-3">
                            <button type="button" onClick={() => setShowMap(true)} className="inline-flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 bg-slate-100 text-slate-700 rounded-lg hover:bg-slate-200 transition-colors">
                                <MapPin className="h-3.5 w-3.5 text-blue-600" /> Pilih di Peta
                            </button>
                            <button type="button" onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => { setLatitude(pos.coords.latitude.toFixed(6)); setLongitude(pos.coords.longitude.toFixed(6)); },
                                        () => alert("Gagal mendapatkan lokasi.")
                                    );
                                }
                            }} className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-500 hover:text-slate-700 transition-colors">
                                <Navigation className="h-3.5 w-3.5" /> Gunakan GPS
                            </button>
                        </div>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3 className="font-semibold flex items-center gap-2" style={{ color: C.navy }}>
                        <Phone className="h-4 w-4" style={{ color: C.blue }} /> Kontak
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                </div>

                {formError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{formError}</div>
                )}

                <button type="submit" disabled={submitting}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: C.blue }}
                >
                    <Save className="h-4 w-4" />
                    {submitting ? "Menyimpan…" : "Buat Toko"}
                </button>
            </form>

            {showMap && (
                <LocationPickerModal
                    initialLat={latitude ? parseFloat(latitude) : null}
                    initialLng={longitude ? parseFloat(longitude) : null}
                    onSelect={(lat, lng) => {
                        setLatitude(lat.toFixed(6));
                        setLongitude(lng.toFixed(6));
                        setShowMap(false);
                    }}
                    onClose={() => setShowMap(false)}
                />
            )}
        </div>

    );
}
