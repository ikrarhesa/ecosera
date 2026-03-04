import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import {
    Upload,
    Save,
    Store,
    Phone,
    Mail,
    MapPin,
    Instagram,
    ArrowLeft,
    Facebook,
    Navigation,
} from "lucide-react";
import { supabase } from "../../lib/supabase";
import ImageCropperModal from "../../components/ImageCropperModal";

const C = { blue: "#0071DC", navy: "#041E42" };

interface SocialMedia {
    whatsapp?: string;
    instagram?: string;
    facebook?: string;
    tiktok?: string;
}

export default function AdminShopEdit() {
    const { seller_id } = useParams<{ seller_id: string }>();

    const [pageLoading, setPageLoading] = useState(true);
    const [name, setName] = useState("");
    const [description, setDescription] = useState("");
    const [phone, setPhone] = useState("");
    const [email, setEmail] = useState("");
    const [address, setAddress] = useState("");
    const [latitude, setLatitude] = useState("");
    const [longitude, setLongitude] = useState("");
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

    // Cropper state
    const [cropSrc, setCropSrc] = useState<string | null>(null);
    const [cropAspect, setCropAspect] = useState<number>(1);
    const [cropTarget, setCropTarget] = useState<"logo" | "banner" | null>(null);

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
                setLatitude(
                    data.latitude != null ? String(data.latitude) : ""
                );
                setLongitude(
                    data.longitude != null ? String(data.longitude) : ""
                );
                setCurrentLogo(data.logo_url || null);
                setCurrentBanner(data.banner_url || null);
                setSocial((data.social_media as SocialMedia) || {});
            }
            setPageLoading(false);
        })();
    }, [seller_id]);

    useEffect(() => {
        if (!logoFile) {
            setLogoPreview(null);
            return;
        }
        const url = URL.createObjectURL(logoFile);
        setLogoPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [logoFile]);

    useEffect(() => {
        if (!bannerFile) {
            setBannerPreview(null);
            return;
        }
        const url = URL.createObjectURL(bannerFile);
        setBannerPreview(url);
        return () => URL.revokeObjectURL(url);
    }, [bannerFile]);

    const updateSocial = (key: keyof SocialMedia, value: string) =>
        setSocial((prev) => ({ ...prev, [key]: value || undefined }));

    const handleLogoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropSrc(url);
        setCropAspect(1);
        setCropTarget("logo");
        e.target.value = "";
    };

    const handleBannerSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const url = URL.createObjectURL(file);
        setCropSrc(url);
        setCropAspect(3);
        setCropTarget("banner");
        e.target.value = "";
    };

    const handleCropComplete = (croppedFile: File) => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        if (cropTarget === "logo") {
            setLogoFile(croppedFile);
        } else if (cropTarget === "banner") {
            setBannerFile(croppedFile);
        }
        setCropSrc(null);
        setCropTarget(null);
    };

    const handleCropCancel = () => {
        if (cropSrc) URL.revokeObjectURL(cropSrc);
        setCropSrc(null);
        setCropTarget(null);
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setFormError(null);
        setSuccess(false);
        if (!name.trim()) {
            setFormError("Nama toko wajib diisi.");
            return;
        }
        setSubmitting(true);
        try {
            let logoUrl = currentLogo;
            if (logoFile) {
                const ext = logoFile.name.split(".").pop() || "webp";
                const filePath = `logos/${seller_id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, logoFile, {
                        cacheControl: "3600",
                        contentType: logoFile.type,
                        upsert: true,
                    });
                if (uploadErr) {
                    setFormError(`Gagal upload logo: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage
                    .from("shop-logos")
                    .getPublicUrl(filePath);
                logoUrl = urlData.publicUrl;
            }

            let bannerUrl = currentBanner;
            if (bannerFile) {
                const ext = bannerFile.name.split(".").pop() || "webp";
                const filePath = `banners/${seller_id}-${Date.now()}.${ext}`;
                const { error: uploadErr } = await supabase.storage
                    .from("shop-logos")
                    .upload(filePath, bannerFile, {
                        cacheControl: "3600",
                        contentType: bannerFile.type,
                        upsert: true,
                    });
                if (uploadErr) {
                    setFormError(`Gagal upload banner: ${uploadErr.message}`);
                    setSubmitting(false);
                    return;
                }
                const { data: urlData } = supabase.storage
                    .from("shop-logos")
                    .getPublicUrl(filePath);
                bannerUrl = urlData.publicUrl;
            }

            const cleanSocial: SocialMedia = {};
            if (social.whatsapp?.trim())
                cleanSocial.whatsapp = social.whatsapp.trim();
            if (social.instagram?.trim())
                cleanSocial.instagram = social.instagram.trim();
            if (social.facebook?.trim())
                cleanSocial.facebook = social.facebook.trim();
            if (social.tiktok?.trim())
                cleanSocial.tiktok = social.tiktok.trim();

            const { error: updateErr } = await supabase
                .from("sellers")
                .update({
                    name: name.trim(),
                    description: description.trim() || null,
                    phone: phone.trim() || null,
                    email: email.trim() || null,
                    address: address.trim() || null,
                    latitude: latitude.trim() ? parseFloat(latitude) : null,
                    longitude: longitude.trim() ? parseFloat(longitude) : null,
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

    const inputCls =
        "w-full px-3 py-2.5 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500 text-sm bg-white";
    const labelCls = "block text-sm font-medium text-slate-600 mb-1";

    if (pageLoading) {
        return (
            <div className="flex items-center justify-center py-24">
                <div
                    className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
                    style={{
                        borderColor: C.blue,
                        borderTopColor: "transparent",
                    }}
                />
            </div>
        );
    }

    return (
        <div className="max-w-3xl mx-auto">
            {/* Back link + heading */}
            <div className="mb-6 md:mb-8">
                <Link to="/admin/shops" className="inline-flex items-center gap-1.5 text-sm text-slate-500 hover:text-slate-700 mb-3 transition-colors">
                    <ArrowLeft className="h-4 w-4" /> Kelola Toko
                </Link>
                <h1
                    className="text-2xl md:text-3xl font-bold"
                    style={{ color: C.navy }}
                >
                    Profil Toko
                </h1>
                <p className="text-sm text-slate-500 mt-1">
                    Edit informasi toko
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
                {/* Identity */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3
                        className="font-semibold flex items-center gap-2"
                        style={{ color: C.navy }}
                    >
                        <Store className="h-4 w-4" style={{ color: C.blue }} />{" "}
                        Identitas Toko
                    </h3>

                    {/* Banner */}
                    <div>
                        <label className={labelCls}>Banner Toko</label>
                        <label className="block cursor-pointer group">
                            <div className="h-32 md:h-40 rounded-lg border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors overflow-hidden bg-slate-50">
                                {bannerPreview || currentBanner ? (
                                    <img
                                        src={
                                            bannerPreview || currentBanner!
                                        }
                                        alt="Banner"
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    <div className="h-full flex flex-col items-center justify-center gap-2 text-slate-400">
                                        <Upload className="h-6 w-6" />
                                        <span className="text-xs">
                                            Upload banner (rekomendasi
                                            1200×400)
                                        </span>
                                    </div>
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleBannerSelect}
                            />
                        </label>
                    </div>

                    {/* Logo + Name */}
                    <div className="flex items-center gap-4">
                        <label className="cursor-pointer group">
                            <div className="h-20 w-20 rounded-lg border-2 border-dashed border-slate-200 group-hover:border-blue-400 transition-colors grid place-items-center overflow-hidden bg-white">
                                {logoPreview || currentLogo ? (
                                    <img
                                        src={
                                            logoPreview || currentLogo!
                                        }
                                        alt="Logo"
                                        className="h-full w-full object-cover"
                                    />
                                ) : (
                                    <Upload className="h-6 w-6 text-slate-400" />
                                )}
                            </div>
                            <input
                                type="file"
                                accept="image/*"
                                className="hidden"
                                onChange={handleLogoSelect}
                            />
                        </label>
                        <div className="flex-1">
                            <label className={labelCls}>Nama Toko *</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                className={inputCls}
                                required
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Deskripsi Toko</label>
                        <textarea
                            value={description}
                            onChange={(e) =>
                                setDescription(e.target.value)
                            }
                            rows={2}
                            className={inputCls}
                            placeholder="Ceritakan tentang toko ini…"
                        />
                    </div>

                    <div>
                        <label className={labelCls}>Alamat</label>
                        <div className="relative">
                            <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <input
                                type="text"
                                value={address}
                                onChange={(e) =>
                                    setAddress(e.target.value)
                                }
                                className={`${inputCls} pl-9`}
                                placeholder="Muara Enim, Sumatera Selatan"
                            />
                        </div>
                    </div>

                    <div>
                        <label className={labelCls}>Koordinat Lokasi</label>
                        <div className="grid grid-cols-2 gap-2 mb-2">
                            <input
                                type="number"
                                step="any"
                                value={latitude}
                                onChange={(e) =>
                                    setLatitude(e.target.value)
                                }
                                className={inputCls}
                                placeholder="Latitude"
                            />
                            <input
                                type="number"
                                step="any"
                                value={longitude}
                                onChange={(e) =>
                                    setLongitude(e.target.value)
                                }
                                className={inputCls}
                                placeholder="Longitude"
                            />
                        </div>
                        <button
                            type="button"
                            onClick={() => {
                                if (navigator.geolocation) {
                                    navigator.geolocation.getCurrentPosition(
                                        (pos) => {
                                            setLatitude(
                                                pos.coords.latitude.toFixed(6)
                                            );
                                            setLongitude(
                                                pos.coords.longitude.toFixed(6)
                                            );
                                        },
                                        () =>
                                            alert(
                                                "Gagal mendapatkan lokasi."
                                            )
                                    );
                                }
                            }}
                            className="inline-flex items-center gap-1.5 text-xs font-medium hover:opacity-80 transition-opacity"
                            style={{ color: C.blue }}
                        >
                            <Navigation className="h-3.5 w-3.5" /> Gunakan
                            Lokasi Saya
                        </button>
                    </div>
                </div>

                {/* Contact */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3
                        className="font-semibold flex items-center gap-2"
                        style={{ color: C.navy }}
                    >
                        <Phone
                            className="h-4 w-4"
                            style={{ color: C.blue }}
                        />{" "}
                        Kontak
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>
                                Nomor Telepon / WhatsApp
                            </label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="tel"
                                    value={phone}
                                    onChange={(e) =>
                                        setPhone(e.target.value)
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="08123456789"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Email</label>
                            <div className="relative">
                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                                <input
                                    type="email"
                                    value={email}
                                    onChange={(e) =>
                                        setEmail(e.target.value)
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="toko@email.com"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Social Media */}
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 md:p-6 space-y-4">
                    <h3
                        className="font-semibold flex items-center gap-2"
                        style={{ color: C.navy }}
                    >
                        <Instagram
                            className="h-4 w-4"
                            style={{ color: C.blue }}
                        />{" "}
                        Media Sosial
                    </h3>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className={labelCls}>WhatsApp</label>
                            <div className="relative">
                                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-green-500" />
                                <input
                                    type="text"
                                    value={social.whatsapp || ""}
                                    onChange={(e) =>
                                        updateSocial(
                                            "whatsapp",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="08123456789"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Instagram</label>
                            <div className="relative">
                                <Instagram className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-pink-500" />
                                <input
                                    type="text"
                                    value={social.instagram || ""}
                                    onChange={(e) =>
                                        updateSocial(
                                            "instagram",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="@username"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>Facebook</label>
                            <div className="relative">
                                <Facebook className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-blue-600" />
                                <input
                                    type="text"
                                    value={social.facebook || ""}
                                    onChange={(e) =>
                                        updateSocial(
                                            "facebook",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="Nama halaman atau URL"
                                />
                            </div>
                        </div>
                        <div>
                            <label className={labelCls}>TikTok</label>
                            <div className="relative">
                                <svg
                                    className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-700"
                                    viewBox="0 0 24 24"
                                    fill="currentColor"
                                >
                                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.88-2.88 2.89 2.89 0 012.88-2.88c.28 0 .56.04.81.12v-3.49a6.37 6.37 0 00-.81-.05A6.34 6.34 0 003.15 15.3 6.34 6.34 0 009.49 21.65a6.34 6.34 0 006.34-6.34V8.78a8.18 8.18 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.21z" />
                                </svg>
                                <input
                                    type="text"
                                    value={social.tiktok || ""}
                                    onChange={(e) =>
                                        updateSocial(
                                            "tiktok",
                                            e.target.value
                                        )
                                    }
                                    className={`${inputCls} pl-9`}
                                    placeholder="@username"
                                />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Messages */}
                {formError && (
                    <div className="rounded-lg bg-red-50 border border-red-200 p-3 text-red-700 text-sm">
                        {formError}
                    </div>
                )}
                {success && (
                    <div className="rounded-lg bg-green-50 border border-green-200 p-3 text-green-700 text-sm">
                        ✅ Profil toko berhasil diperbarui!
                    </div>
                )}

                {/* Submit */}
                <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 rounded-lg text-white font-medium transition-colors flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-90"
                    style={{ backgroundColor: C.blue }}
                >
                    <Save className="h-4 w-4" />
                    {submitting ? "Menyimpan…" : "Simpan Profil"}
                </button>
            </form>

            {/* Crop Modal */}
            {cropSrc && (
                <ImageCropperModal
                    imageSrc={cropSrc}
                    aspect={cropAspect}
                    onCropComplete={handleCropComplete}
                    onCancel={handleCropCancel}
                />
            )}
        </div>
    );
}
