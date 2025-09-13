import { User, MapPin, Phone, Mail, Settings, Heart, Package, Star } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";

export default function Profile() {
  return (
    <>
      <BottomNavbar />
      <div className="min-h-screen bg-[#F6F8FC] pb-28">

      {/* Profile Info with Blue Gradient Background */}
      <div className="px-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div 
          className="relative overflow-hidden rounded-b-2xl p-4 mb-4"
          style={{
            background: 'linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)'
          }}
        >
          {/* Pattern Background */}
          <div 
            className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/header-pattern.svg")',
              backgroundSize: '50%'
            }}
          />
          
          {/* Content Layer */}
          <div className="relative z-10">
            <div className="flex items-center gap-3 mb-3">
              <div className="h-12 w-12 rounded-full bg-white/20 backdrop-blur-sm grid place-items-center">
                <User className="h-6 w-6 text-white" />
              </div>
              <div className="flex-1">
                        <h2 className="font-semibold text-white">Ikrar Hesa Prasetya</h2>
                <p className="text-sm text-white/80">Pelanggan Ecosera</p>
              </div>
            <div className="flex gap-2">
              <Link
                to="/e-learning"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
              >
                E-learning
              </Link>
              <Link
                to="/admin-dashboard"
                className="bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors border border-white/20"
              >
                Dashboard Admin
              </Link>
            </div>
            </div>
          
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-sm text-white/90">
                <MapPin className="h-4 w-4" />
                <span>Muara Enim, Sumatera Selatan</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Phone className="h-4 w-4" />
                <span>+62 812 3456 7890</span>
              </div>
              <div className="flex items-center gap-2 text-sm text-white/90">
                <Mail className="h-4 w-4" />
                <span>john.doe@email.com</span>
              </div>
            </div>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Package className="h-6 w-6 text-blue-600 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Pesanan</p>
            <p className="font-semibold text-slate-900">12</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Heart className="h-6 w-6 text-red-500 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Favorit</p>
            <p className="font-semibold text-slate-900">8</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-100 p-3 text-center">
            <Star className="h-6 w-6 text-yellow-500 mx-auto mb-1" />
            <p className="text-xs text-slate-600">Rating</p>
            <p className="font-semibold text-slate-900">4.8</p>
          </div>
        </div>

        {/* Menu Items */}
        <div className="space-y-2">
          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-blue-50 grid place-items-center">
                <Package className="h-4 w-4 text-blue-600" />
              </div>
              <span className="font-medium text-slate-900">Riwayat Pesanan</span>
            </div>
            <span className="text-slate-400">›</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-red-50 grid place-items-center">
                <Heart className="h-4 w-4 text-red-600" />
              </div>
              <span className="font-medium text-slate-900">Produk Favorit</span>
            </div>
            <span className="text-slate-400">›</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-green-50 grid place-items-center">
                <MapPin className="h-4 w-4 text-green-600" />
              </div>
              <span className="font-medium text-slate-900">Alamat Pengiriman</span>
            </div>
            <span className="text-slate-400">›</span>
          </div>

          <div className="bg-white rounded-xl border border-slate-100 p-4 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="h-8 w-8 rounded-lg bg-slate-50 grid place-items-center">
                <Settings className="h-4 w-4 text-slate-600" />
              </div>
              <span className="font-medium text-slate-900">Pengaturan</span>
            </div>
            <span className="text-slate-400">›</span>
          </div>
        </div>
      </div>
      </div>
    </>
  );
}
