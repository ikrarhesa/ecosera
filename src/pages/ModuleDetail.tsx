import React, { useState } from "react";
import { useParams, Link } from "react-router-dom";
import { Play, Pause, ArrowLeft, Clock, BookOpen, CheckCircle, ChevronRight } from "lucide-react";
import Navbar from "../components/Navbar";

// Module content data
const MODULE_CONTENT = {
  "fotografi-produk": {
    title: "Fotografi Produk",
    description: "Pelajari teknik fotografi produk yang menarik untuk meningkatkan penjualan",
    duration: "45 menit",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    transcription: `Selamat datang di modul Fotografi Produk. Dalam modul ini, Anda akan mempelajari teknik-teknik dasar fotografi produk yang dapat meningkatkan daya tarik produk Anda.

Pertama, kita akan membahas tentang pencahayaan. Pencahayaan yang baik adalah kunci utama dalam fotografi produk. Gunakan cahaya alami dari jendela atau lampu LED yang lembut untuk menghindari bayangan yang keras.

Kedua, komposisi foto. Atur produk dengan proporsi yang seimbang, gunakan aturan sepertiga, dan pastikan latar belakang tidak mengganggu fokus pada produk utama.

Ketiga, sudut pengambilan. Coba berbagai sudut pandang - dari atas, samping, atau miring untuk menemukan sudut yang paling menarik untuk produk Anda.

Keempat, editing foto. Gunakan aplikasi editing sederhana untuk menyesuaikan kecerahan, kontras, dan saturasi warna agar foto terlihat lebih profesional.

Terakhir, konsistensi. Pastikan semua foto produk Anda memiliki gaya dan kualitas yang konsisten untuk membangun identitas merek yang kuat.`,
    lessons: [
      { id: 1, title: "Pengenalan Fotografi Produk", duration: "5 menit", completed: false },
      { id: 2, title: "Pencahayaan yang Tepat", duration: "8 menit", completed: false },
      { id: 3, title: "Komposisi dan Framing", duration: "7 menit", completed: false },
      { id: 4, title: "Sudut Pengambilan", duration: "6 menit", completed: false },
      { id: 5, title: "Latar Belakang dan Props", duration: "5 menit", completed: false },
      { id: 6, title: "Editing Dasar", duration: "8 menit", completed: false },
      { id: 7, title: "Konsistensi Visual", duration: "4 menit", completed: false },
      { id: 8, title: "Tips dan Trik", duration: "2 menit", completed: false }
    ]
  },
  "digital-marketing": {
    title: "Digital Marketing",
    description: "Strategi pemasaran digital untuk UMKM dan bisnis online",
    duration: "60 menit",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    transcription: `Selamat datang di modul Digital Marketing. Modul ini akan membahas strategi pemasaran digital yang efektif untuk UMKM.

Pertama, kita akan membahas tentang pemahaman target audience. Identifikasi dengan jelas siapa pelanggan ideal Anda, apa kebutuhan mereka, dan di mana mereka menghabiskan waktu online.

Kedua, platform media sosial. Pilih platform yang sesuai dengan target audience Anda - Instagram untuk visual, Facebook untuk komunitas, TikTok untuk konten kreatif, dan LinkedIn untuk B2B.

Ketiga, konten marketing. Buat konten yang bermanfaat, menarik, dan relevan dengan produk atau layanan Anda. Gunakan storytelling untuk membangun koneksi emosional.

Keempat, SEO dan website. Optimasi website Anda untuk mesin pencari agar mudah ditemukan pelanggan potensial.

Kelima, email marketing. Bangun daftar email pelanggan dan kirim newsletter berkala dengan informasi bermanfaat dan penawaran khusus.

Keenam, analitik dan tracking. Pantau performa kampanye marketing Anda dan sesuaikan strategi berdasarkan data yang ada.`,
    lessons: [
      { id: 1, title: "Pengenalan Digital Marketing", duration: "8 menit", completed: false },
      { id: 2, title: "Target Audience", duration: "7 menit", completed: false },
      { id: 3, title: "Platform Media Sosial", duration: "10 menit", completed: false },
      { id: 4, title: "Konten Marketing", duration: "8 menit", completed: false },
      { id: 5, title: "SEO dan Website", duration: "6 menit", completed: false },
      { id: 6, title: "Email Marketing", duration: "7 menit", completed: false },
      { id: 7, title: "Analitik dan Tracking", duration: "6 menit", completed: false },
      { id: 8, title: "Budget dan ROI", duration: "5 menit", completed: false },
      { id: 9, title: "Influencer Marketing", duration: "4 menit", completed: false },
      { id: 10, title: "Case Study", duration: "5 menit", completed: false }
    ]
  },
  "manajemen-keuangan": {
    title: "Manajemen Keuangan Sederhana",
    description: "Cara mengelola keuangan bisnis dengan baik dan efisien",
    duration: "50 menit",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    transcription: `Selamat datang di modul Manajemen Keuangan Sederhana. Modul ini akan membantu Anda mengelola keuangan bisnis dengan lebih baik.

Pertama, pemisahan keuangan pribadi dan bisnis. Buat rekening terpisah untuk bisnis dan jangan mencampur dengan keuangan pribadi.

Kedua, pencatatan transaksi. Catat semua pemasukan dan pengeluaran bisnis secara detail dan teratur.

Ketiga, budget dan perencanaan. Buat anggaran bulanan untuk operasional bisnis dan stok barang.

Keempat, cash flow management. Pantau arus kas masuk dan keluar untuk menghindari masalah likuiditas.

Kelima, investasi dan pengembangan. Alokasikan sebagian keuntungan untuk pengembangan bisnis dan investasi.

Keenam, pajak dan legalitas. Pahami kewajiban pajak bisnis Anda dan pastikan semua legalitas terpenuhi.

Ketujuh, analisis profitabilitas. Evaluasi produk atau layanan mana yang paling menguntungkan.`,
    lessons: [
      { id: 1, title: "Pemisahan Keuangan", duration: "8 menit", completed: false },
      { id: 2, title: "Pencatatan Transaksi", duration: "7 menit", completed: false },
      { id: 3, title: "Budget dan Perencanaan", duration: "8 menit", completed: false },
      { id: 4, title: "Cash Flow Management", duration: "6 menit", completed: false },
      { id: 5, title: "Investasi Bisnis", duration: "5 menit", completed: false },
      { id: 6, title: "Pajak dan Legalitas", duration: "8 menit", completed: false },
      { id: 7, title: "Analisis Profitabilitas", duration: "8 menit", completed: false }
    ]
  },
  "layanan-pelanggan": {
    title: "Layanan Pelanggan",
    description: "Teknik memberikan layanan pelanggan yang memuaskan",
    duration: "40 menit",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_1mb.mp4",
    transcription: `Selamat datang di modul Layanan Pelanggan. Modul ini akan mengajarkan teknik memberikan layanan pelanggan yang memuaskan.

Pertama, komunikasi yang efektif. Gunakan bahasa yang sopan, jelas, dan mudah dipahami pelanggan.

Kedua, empati dan mendengarkan. Pahami kebutuhan dan keluhan pelanggan dengan mendengarkan secara aktif.

Ketiga, responsivitas. Tanggapi pertanyaan dan keluhan pelanggan dengan cepat dan tepat.

Keempat, solusi yang tepat. Berikan solusi yang sesuai dengan masalah yang dihadapi pelanggan.

Kelima, follow up. Pastikan pelanggan puas dengan solusi yang diberikan dan tanyakan feedback mereka.

Keenam, handling keluhan. Tangani keluhan dengan profesional dan jadikan sebagai kesempatan untuk memperbaiki layanan.`,
    lessons: [
      { id: 1, title: "Komunikasi Efektif", duration: "7 menit", completed: false },
      { id: 2, title: "Empati dan Mendengarkan", duration: "6 menit", completed: false },
      { id: 3, title: "Responsivitas", duration: "5 menit", completed: false },
      { id: 4, title: "Memberikan Solusi", duration: "7 menit", completed: false },
      { id: 5, title: "Follow Up", duration: "6 menit", completed: false },
      { id: 6, title: "Handling Keluhan", duration: "9 menit", completed: false }
    ]
  },
  "jejaring-usaha": {
    title: "Jejaring Usaha",
    description: "Membangun jaringan bisnis dan kemitraan yang menguntungkan",
    duration: "55 menit",
    videoUrl: "https://sample-videos.com/zip/10/mp4/SampleVideo_1280x720_2mb.mp4",
    transcription: `Selamat datang di modul Jejaring Usaha. Modul ini akan membahas cara membangun jaringan bisnis yang menguntungkan.

Pertama, identifikasi target networking. Tentukan siapa yang perlu Anda kenal untuk mengembangkan bisnis.

Kedua, event dan komunitas. Ikuti event bisnis, workshop, dan bergabung dengan komunitas yang relevan.

Ketiga, online networking. Manfaatkan LinkedIn dan platform profesional lainnya untuk membangun koneksi.

Keempat, value proposition. Siapkan elevator pitch yang jelas tentang nilai yang bisa Anda berikan.

Kelima, follow up dan maintenance. Jaga hubungan dengan koneksi bisnis secara berkala.

Keenam, kolaborasi dan partnership. Cari peluang kolaborasi yang saling menguntungkan.

Ketujuh, mentorship. Cari mentor yang bisa membimbing perkembangan bisnis Anda.

Kedelapan, menjadi resource. Jadilah sumber informasi dan bantuan untuk koneksi bisnis Anda.`,
    lessons: [
      { id: 1, title: "Target Networking", duration: "6 menit", completed: false },
      { id: 2, title: "Event dan Komunitas", duration: "7 menit", completed: false },
      { id: 3, title: "Online Networking", duration: "6 menit", completed: false },
      { id: 4, title: "Value Proposition", duration: "8 menit", completed: false },
      { id: 5, title: "Follow Up", duration: "5 menit", completed: false },
      { id: 6, title: "Kolaborasi", duration: "7 menit", completed: false },
      { id: 7, title: "Mentorship", duration: "6 menit", completed: false },
      { id: 8, title: "Menjadi Resource", duration: "5 menit", completed: false },
      { id: 9, title: "Case Study", duration: "5 menit", completed: false }
    ]
  }
};

export default function ModuleDetail() {
  const { moduleId } = useParams<{ moduleId: string }>();
  const [isPlaying, setIsPlaying] = useState(false);
  const [showTranscription, setShowTranscription] = useState(false);
  
  const module = moduleId ? MODULE_CONTENT[moduleId as keyof typeof MODULE_CONTENT] : null;

  if (!module) {
    return (
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <Navbar />
        <div className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto text-center">
          <h1 className="text-xl font-bold text-slate-900 mb-4">Modul tidak ditemukan</h1>
          <Link to="/e-learning" className="text-blue-600 hover:underline">
            Kembali ke E-Learning
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-28">
      <Navbar />
      
      <div className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link 
            to="/e-learning" 
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">{module.title}</h1>
            <p className="text-sm text-slate-600">{module.description}</p>
          </div>
        </div>

        {/* Video Section */}
        <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
          <div className="aspect-video bg-slate-900 rounded-lg mb-4 relative overflow-hidden">
            <div className="absolute inset-0 flex items-center justify-center">
              <button
                onClick={() => setIsPlaying(!isPlaying)}
                className="bg-white/90 hover:bg-white rounded-full p-4 transition-colors"
              >
                {isPlaying ? (
                  <Pause className="h-8 w-8 text-slate-900" />
                ) : (
                  <Play className="h-8 w-8 text-slate-900 ml-1" />
                )}
              </button>
            </div>
            <div className="absolute bottom-4 left-4 right-4">
              <div className="bg-black/50 text-white text-xs px-2 py-1 rounded">
                {module.duration}
              </div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-sm text-slate-600">
              <div className="flex items-center gap-1">
                <Clock className="h-4 w-4" />
                <span>{module.duration}</span>
              </div>
              <div className="flex items-center gap-1">
                <BookOpen className="h-4 w-4" />
                <span>{module.lessons.length} pelajaran</span>
              </div>
            </div>
            
            <button
              onClick={() => setShowTranscription(!showTranscription)}
              className="text-blue-600 text-sm font-medium hover:underline"
            >
              {showTranscription ? 'Sembunyikan' : 'Tampilkan'} Transkrip
            </button>
          </div>
        </div>

        {/* Transcription */}
        {showTranscription && (
          <div className="bg-white rounded-xl border border-slate-100 p-4 mb-6">
            <h3 className="font-semibold text-slate-900 mb-3">Transkrip Video</h3>
            <div className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {module.transcription}
            </div>
          </div>
        )}

        {/* Lessons List */}
        <div className="bg-white rounded-xl border border-slate-100 p-4">
          <h3 className="font-semibold text-slate-900 mb-4">Daftar Pelajaran</h3>
          
          <div className="space-y-3">
            {module.lessons.map((lesson, index) => (
              <div
                key={lesson.id}
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 transition-colors"
              >
                <div className="flex-shrink-0">
                  {lesson.completed ? (
                    <CheckCircle className="h-5 w-5 text-green-600" />
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-slate-300 flex items-center justify-center">
                      <span className="text-xs text-slate-600">{index + 1}</span>
                    </div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <h4 className="font-medium text-slate-900 line-clamp-1">{lesson.title}</h4>
                  <p className="text-sm text-slate-600">{lesson.duration}</p>
                </div>
                
                <ChevronRight className="h-4 w-4 text-slate-400" />
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
