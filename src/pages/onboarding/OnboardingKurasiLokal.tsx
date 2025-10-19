import React from "react";
import OnboardingStep from "./OnboardingStep";

export default function OnboardingKurasiLokal() {
  return (
    <OnboardingStep
      step={2}
      totalSteps={4}
      eyebrow="Kurasi Lokal"
      title="Seller lokal terpercaya"
      description="Kurator daerah menyeleksi pelaku UMKM aktif dan transparan."
      featurePoints={[
        {
          title: "Kurator daerah",
          description: "Komunitas lokal memberi rekomendasi resmi.",
        },
        {
          title: "Profil transparan",
          description: "Lihat testimoni, stok, dan aktivitas sosial sekilas.",
        },
      ]}
      image="https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=900&q=80"
      imageAlt="Kurator lokal memilih produk handmade terbaik"
      back={{ to: "/onboarding/welcome", label: "Kembali" }}
      next={{ to: "/onboarding/handmade-otentik", label: "Lanjut" }}
    />
  );
}
