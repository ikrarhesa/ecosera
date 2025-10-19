import React from "react";
import OnboardingStep from "./OnboardingStep";

export default function OnboardingKualitasTerjamin() {
  return (
    <OnboardingStep
      step={4}
      totalSteps={4}
      eyebrow="Kualitas Terjamin"
      title="Pengiriman aman, suport cepat"
      description="Pemeriksaan visual dan proteksi transaksi memastikan pesanan mulus."
      featurePoints={[
        {
          title: "Quality check visual",
          description: "Foto sebelum kirim jadi bukti kondisi produk.",
        },
        {
          title: "Transaksi aman",
          description: "Pembayaran cair setelah pesanan diterima.",
        },
        {
          title: "Support lokal",
          description: "Tim Ecosera bantu retur dan konsultasi lewat chat.",
        },
      ]}
      image="https://images.unsplash.com/photo-1520607162513-77705c0f0d4a?auto=format&fit=crop&w=900&q=80"
      imageAlt="Proses pengecekan kualitas produk sebelum pengiriman"
      back={{ to: "/onboarding/handmade-otentik", label: "Kembali" }}
      next={{ to: "/", label: "Mulai Jelajah Ecosera" }}
    />
  );
}
