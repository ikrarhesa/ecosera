import React from "react";
import OnboardingStep from "./OnboardingStep";

export default function OnboardingHandmadeOtentik() {
  return (
    <OnboardingStep
      step={3}
      totalSteps={4}
      eyebrow="Handmade Otentik"
      title="Detail buatan tangan"
      description="Dokumentasi singkat menunjukkan proses kreatif pengrajin."
      featurePoints={[
        {
          title: "Story mini",
          description: "Video pendek dan foto studio tampilkan prosesnya.",
        },
        {
          title: "Batch terbatas",
          description: "Edisi bernomor untuk rasa eksklusif.",
        },
      ]}
      image="https://images.unsplash.com/photo-1523419409543-0c1df022bdd1?auto=format&fit=crop&w=900&q=80"
      imageAlt="Pengrajin sedang membuat kerajinan tangan secara detail"
      back={{ to: "/onboarding/kurasi-lokal", label: "Kembali" }}
      next={{ to: "/onboarding/kualitas-terjamin", label: "Lanjut" }}
    />
  );
}
