import React from "react";
import { Link } from "react-router-dom";
import { Play, Clock, BookOpen, ArrowLeft } from "lucide-react";
import Navbar from "../components/Navbar";

// Module data
const MODULES = [
  {
    id: "fotografi-produk",
    title: "Fotografi Produk",
    description: "Pelajari teknik fotografi produk yang menarik untuk meningkatkan penjualan",
    duration: "45 menit",
    lessons: 8,
    thumbnail: "https://images.unsplash.com/photo-1606983340126-99ab4feaa64a?auto=format&fit=crop&w=400&h=300&q=70",
    progress: 0,
    difficulty: "Pemula"
  },
  {
    id: "digital-marketing",
    title: "Digital Marketing",
    description: "Strategi pemasaran digital untuk UMKM dan bisnis online",
    duration: "60 menit",
    lessons: 10,
    thumbnail: "https://images.unsplash.com/photo-1460925895917-afdab827c52f?auto=format&fit=crop&w=400&h=300&q=70",
    progress: 0,
    difficulty: "Menengah"
  },
  {
    id: "manajemen-keuangan",
    title: "Manajemen Keuangan Sederhana",
    description: "Cara mengelola keuangan bisnis dengan baik dan efisien",
    duration: "50 menit",
    lessons: 7,
    thumbnail: "https://images.unsplash.com/photo-1554224155-6726b3ff858f?auto=format&fit=crop&w=400&h=300&q=70",
    progress: 0,
    difficulty: "Pemula"
  },
  {
    id: "layanan-pelanggan",
    title: "Layanan Pelanggan",
    description: "Teknik memberikan layanan pelanggan yang memuaskan",
    duration: "40 menit",
    lessons: 6,
    thumbnail: "https://images.unsplash.com/photo-1556742049-0cfed4f6a45d?auto=format&fit=crop&w=400&h=300&q=70",
    progress: 0,
    difficulty: "Pemula"
  },
  {
    id: "jejaring-usaha",
    title: "Jejaring Usaha",
    description: "Membangun jaringan bisnis dan kemitraan yang menguntungkan",
    duration: "55 menit",
    lessons: 9,
    thumbnail: "https://images.unsplash.com/photo-1521737711867-e3b97375f902?auto=format&fit=crop&w=400&h=300&q=70",
    progress: 0,
    difficulty: "Menengah"
  }
];

export default function ELearning() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-28">
      <Navbar />
      
      <div className="px-4 pt-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <Link 
            to="/profile" 
            className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50"
          >
            <ArrowLeft className="h-5 w-5 text-slate-600" />
          </Link>
          <div>
            <h1 className="text-xl font-bold text-slate-900">E-Learning</h1>
            <p className="text-sm text-slate-600">Tingkatkan skill bisnis Anda</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-6">
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <BookOpen className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Modul</p>
            <p className="font-semibold text-slate-900">{MODULES.length}</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Clock className="h-6 w-6 text-green-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Total Durasi</p>
            <p className="font-semibold text-slate-900">4.5 jam</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Play className="h-6 w-6 text-purple-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Selesai</p>
            <p className="font-semibold text-slate-900">0/5</p>
          </div>
        </div>

        {/* Modules List */}
        <div className="space-y-4">
          <h2 className="text-lg font-semibold text-slate-900">Modul Pembelajaran</h2>
          
          {MODULES.map((module, index) => (
            <Link
              key={module.id}
              to={`/e-learning/${module.id}`}
              className="block bg-white rounded-xl border border-slate-100 p-4 hover:shadow-md transition-shadow"
            >
              <div className="flex gap-4">
                <div className="relative flex-shrink-0 w-20 h-20 bg-slate-100 rounded-lg overflow-hidden">
                  <img
                    src={module.thumbnail}
                    alt={module.title}
                    className="w-full h-full object-cover"
                  />
                  <div className="absolute inset-0 bg-black/20 flex items-center justify-center">
                    <Play className="h-6 w-6 text-white" />
                  </div>
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between mb-2">
                    <h3 className="font-semibold text-slate-900 line-clamp-1">{module.title}</h3>
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full ml-2 whitespace-nowrap">
                      {module.difficulty}
                    </span>
                  </div>
                  
                  <p className="text-sm text-slate-600 line-clamp-2 mb-2">{module.description}</p>
                  
                  <div className="flex items-center gap-4 text-xs text-slate-500">
                    <div className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      <span>{module.duration}</span>
                    </div>
                    <div className="flex items-center gap-1">
                      <BookOpen className="h-3 w-3" />
                      <span>{module.lessons} pelajaran</span>
                    </div>
                  </div>
                  
                  {/* Progress bar */}
                  <div className="mt-3">
                    <div className="flex items-center justify-between text-xs text-slate-600 mb-1">
                      <span>Progress</span>
                      <span>{module.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 rounded-full h-1.5">
                      <div 
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-300"
                        style={{ width: `${module.progress}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}
