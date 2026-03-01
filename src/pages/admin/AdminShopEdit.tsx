import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Upload, Save, Store, Phone, Mail, MapPin, Instagram, Facebook } from "lucide-react";
import { supabase } from "../../lib/supabase";

interface SocialMedia {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
}

export default function AdminShopEdit() {
    const navigate = useNavigate();
    const { seller_id } = useParams<{ seller_id: string }>();

    const [pageLoading, setPageLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [social, setSocial] = useState<SocialMedia>({});
    const [currentLogo, setCurrentLogo] = useState<string | null>(null);
    const [logoFile, setLogoFile] = useState<File | null>(null);
    const [logoPreview, setLogoPreview] = useState<string | null>(null);
    const [currentBanner, setCurrentBanner] = useState<string | null>(null);
    const [bannerFile, setBannerFile] = useState<File | null>(null);
    const [bannerPreview, setBannerPreview] = useState<string | null>(null);

    const [submitting, setSubmitting] = useState(false);
    const [formError, setFormError] = useState<string | null>(null);
    const [success, setSuccess] = useState(false);

    // Load seller data
    useEffect(() => {
        if (!seller_id) return;
        (async () => {
            setPageLoading(true);
            const { data, error } = await supabase
                .from("sellers")
                .select("*")
                .eq("id", seller_id)
                .single();
            if (error) {
                console.error("[AdminShopEdit] fetch error:", error);
            } else if (data) {
                setName(data.name || "");
                setDescription(data.description || "");
                setPhone(data.phone || "");
                setEmail(data.email || "");
                setAddress(data.address || "");
                setCurrentLogo(data.logo_url || null);
                setCurrentBanner(data.banner_url || null);
                setSocial((data.social_media as SocialMedia) || {});
            }
            setPageLoading(false);
        })();
    }, [seller_id]);

    // Logo preview
    useEffect(() => {
        if (!logoFile) { setLogoPreview(null); return; }
        const url = URL.createObjectURL(logoFile);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [logoFile]);

    // Banner preview
    useEffect(() => {
        if (!bannerFile) { setBannerPreview(null); return; }
        const url = URL.createObjectURL(bannerFile);
        setBannerPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [bannerFile]);

    const updateSocial = (key: keyof SocialMedia, value: string) =>
        setSocial((prev) => ({ ...prev, [key]: value || undefined }));

    // Submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSuccess(false);

        if (!name.trim()) { setFormError("Nama toko wajib diisi."); return; }

        setSubmitting(true);
        try {
            // 1. Upload logo if changed
            let logoUrl = currentLogo;
            if (logoFile) {
                const ext = logoFile.name.split(".").pop() || "png";
                const filePath = `logos/${seller_id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, logoFile, { cacheControl: "3600", contentType: logoFile.type, upsert: true });
                if (uploadErr) {
                    setFormError(`Gagal upload logo: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("shop-logos").getPublicUrl(filePath);
                logoUrl = urlData.publicUrl;
            }

            // 1b. Upload banner if changed
            let bannerUrl = currentBanner;
            if (bannerFile) {
                const ext = bannerFile.name.split(".").pop() || "png";
                const filePath = `banners/${seller_id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, bannerFile, { cacheControl: "3600", contentType: bannerFile.type, upsert: true });
                if (uploadErr) {
                    setFormError(`Gagal upload banner: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage.from("shop-logos").getPublicUrl(filePath);
                bannerUrl = urlData.publicUrl;
            }

            // 2. Clean social media (remove empty strings)
            const cleanSocial: SocialMedia = {};
            if (social.whatsapp?.trim()) cleanSocial.whatsapp = social.whatsapp.trim();
            if (social.instagram?.trim()) cleanSocial.instagram = social.instagram.trim();
            if (social.facebook?.trim()) cleanSocial.facebook = social.facebook.trim();
            if (social.tiktok?.trim()) cleanSocial.tiktok = social.tiktok.trim();

            // 3. Update seller
            const { error: updateErr } = await supabase
                .from("sellers")
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                    address: address.trim() || null,
                    logo_url: logoUrl,
                    banner_url: bannerUrl,
                    social_media: cleanSocial,
                })
                .eq("id", seller_id);

            if (updateErr) {
                setFormError(`Gagal update toko: ${updateErr.message}`);
            } else {
                setSuccess(true);
                setCurrentLogo(logoUrl);
                setCurrentBanner(bannerUrl);
                setLogoFile(null);
                setBannerFile(null);
                setTimeout(() => setSuccess(false), 3000);
            }
        } catch (err) {
            console.error("[AdminShopEdit] Unexpected error:", err);
            setFormError("Terjadi kesalahan tak terduga.");
        } finally {
            setSubmitting(false);
        }
    };

    const inputCls = "w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-700 mb-1";

    if (pageLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
                <div className="flex flex-col items-center gap-3">
                    <div className="h-8 w-8 border-3 border-blue-500 border-t-transparent rounded-full animate-spin" />
                    <p className="text-sm text-slate-600">Memuat data toko…</p>
                </div>
            </div>
        );
    }

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
                        <h1 className="text-xl font-bold text-slate-900">Profil Toko</h1>
                        <p className="text-sm text-slate-600">Edit informasi toko</p>
                    </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Logo & Name */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-4">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Store className="h-4 w-4 text-blue-600" /> Identitas Toko
                        </h3>

                        {/* Banner Upload */}
                        <div>
                            <label className={labelCls}>Banner Toko</label>
                            <label className="block cursor-pointer group">
                                <div className="h-32 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-400 transition-colors overflow-hidden bg-slate-50">
                                    {(bannerPreview || currentBanner) ? (
                                        <img src={bannerPreview || currentBanner!} alt="Banner" className="w-full h-full object-cover" />
                                    ) : (
                                        <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                            <Upload className="h-6 w-6" />
                                            <span className="text-xs">Upload banner (rekomendasi 1200×400)</span>
                                        </div>
                                    )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setBannerFile(e.target.files?.[0] || null)} />
                            </label>
                        </div>

                        {/* Logo Upload */}
                        <div className="flex items-center gap-4">
                            <label className="cursor-pointer group">
                                <div className="h-20 w-20 rounded-xl border-2 border-dashed border-slate-300 group-hover:border-blue-400 transition-colors grid place-items-center overflow-hidden bg-white">
                                    {(logoPreview || currentLogo) ? (
                                        <img src={logoPreview || currentLogo!} alt="Logo" className="h-full w-full object-cover" />
                                    ) : (
                                        <Upload className="h-6 w-6 text-slate-400" />
                                    )}
                                </div>
                                <input type="file" accept="image/*" className="hidden" onChange={(e) => setLogoFile(e.target.files?.[0] || null)} />
                            </label>
                            <div className="flex-1">
                                <label className={labelCls}>Nama Toko *</label>
                                <input type="text" value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Deskripsi Toko</label>
                            <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} className={inputCls} placeholder="Ceritakan tentang toko ini…" />
                        </div>

                        <div>
                            <label className={labelCls}>Alamat</label>
                            <div className="relative">
                                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input type="text" value={address} onChange={(e) => setAddress(e.target.value)} className={`${inputCls} pl-9`} placeholder="Muara Enim, Sumatera Selatan" />
                            </div>
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

                    {/* Social Media */}
                    <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-5 space-y-3">
                        <h3 className="font-semibold text-slate-900 flex items-center gap-2">
                            <Instagram className="h-4 w-4 text-blue-600" /> Media Sosial
                        </h3>

                        <div>
                            <label className={labelCls}>WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                <input type="text" value={social.whatsapp || ""} onChange={(e) => updateSocial("whatsapp", e.target.value)} className={`${inputCls} pl-9`} placeholder="08123456789" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                                <input type="text" value={social.instagram || ""} onChange={(e) => updateSocial("instagram", e.target.value)} className={`${inputCls} pl-9`} placeholder="@username" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>Facebook</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                                <input type="text" value={social.facebook || ""} onChange={(e) => updateSocial("facebook", e.target.value)} className={`${inputCls} pl-9`} placeholder="Nama halaman atau URL" />
                            </div>
                        </div>

                        <div>
                            <label className={labelCls}>TikTok</label>
                            <div className="relative">
                                <svg className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700" viewBox="0 0 24 24" fill="currentColor">
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.81.12v-3.49a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.65a6.34 6.34 0 006.34-6.34V8.78a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.21z" />
                                </svg>
                                <input type="text" value={social.tiktok || ""} onChange={(e) => updateSocial("tiktok", e.target.value)} className={`${inputCls} pl-9`} placeholder="@username" />
                            </div>
                        </div>
                    </div>

                    {/* Error / Success */}
                    {formError && (
                        <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">{formError}</div>
                    )}
                    {success && (
                        <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
                            ✅ Profil toko berhasil diperbarui!
                        </div>
                    )}

                    {/* Submit */}
                    <button type="submit" disabled={submitting}
                        className={`w-full py-3 rounded-xl text-white font-medium transition-all shadow-md flex items-center justify-center gap-2 ${submitting ? "bg-blue-400 cursor-not-allowed" : "bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700"
                            }`}
                    >
                        <Save className="h-4 w-4" />
                        {submitting ? "Menyimpan…" : "Simpan Profil"}
                    </button>
                </form>
            </div>
        </div>
    );
}
