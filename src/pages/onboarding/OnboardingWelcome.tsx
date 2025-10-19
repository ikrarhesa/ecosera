import React from "react";
import OnboardingStep from "./OnboardingStep";

export default function OnboardingWelcome() {
  return (
    <OnboardingStep
      step={1}
      totalSteps={4}
      eyebrow="Selamat Datang"
      title="Pasar digital terbaik dari daerahmu"
      description="Ecosera menghadirkan kurasi UMKM dalam format ringan dan cepat dinikmati."
      featurePoints={[
        {
          title: "Kurasi relevan",
          description: "Rekomendasi otomatis berdasar lokasi dan minat.",
        },
        {
          title: "Cerita singkat",
          description: "Highlight visual biar brand terasa dekat.",
        },
      ]}
      image="https://images.unsplash.com/photo-1522199755839-a2bacb67c546?auto=format&fit=crop&w=900&q=80"
      imageAlt="Pengunjung melihat produk kerajinan lokal di sebuah pasar kreatif"
      next={{ to: "/onboarding/kurasi-lokal", label: "Lanjut" }}
    />
  );
}
