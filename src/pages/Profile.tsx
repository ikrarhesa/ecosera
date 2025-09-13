import { User, MapPin, Phone, Mail, Settings, Heart, Package, Star, Edit3 } from "lucide-react";
import { Link } from "react-router-dom";
import BottomNavbar from "../components/BottomNavbar";
import ProfileHeader from "../components/ProfileHeader";

export default function Profile() {
  return (
    <>
      <ProfileHeader />
      <BottomNavbar />
      <div className="min-h-screen bg-[#F6F8FC] pb-28">

      {/* Profile Section */}
      <div className="px-4 pt-4 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="flex items-center gap-4 mb-6">
          {/* Profile Picture with Edit Icon */}
          <div className="relative">
            <div className="h-20 w-20 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 grid place-items-center">
              <User className="h-10 w-10 text-white" />
            </div>
            <button className="absolute -bottom-1 -right-1 h-6 w-6 bg-black rounded-full flex items-center justify-center">
              <Edit3 className="h-3 w-3 text-white" />
            </button>
          </div>
          
          {/* User Info */}
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-xl font-bold text-slate-900">ikrarhesaa</h1>
              <div className="flex items-center gap-1 bg-gradient-to-r from-yellow-400 to-yellow-500 text-white px-2 py-1 rounded-full text-xs font-medium">
                <span>Gold</span>
                <span>›</span>
              </div>
            </div>
            <div className="flex gap-4 text-sm text-slate-600">
              <span>6 Pengikut</span>
              <span>155 Mengikuti</span>
            </div>
          </div>
        </div>
      </div>

      {/* Profile Info */}
      <div className="px-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="bg-white rounded-2xl border border-slate-100 p-4 mb-4">
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-full bg-blue-50 grid place-items-center">
              <User className="h-6 w-6 text-blue-600" />
            </div>
            <div className="flex-1">
              <h2 className="font-semibold text-slate-900">John Doe</h2>
              <p className="text-sm text-slate-600">Pelanggan Ecosera</p>
            </div>
            <Link
              to="/e-learning"
              className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors"
            >
              E-learning
            </Link>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <MapPin className="h-4 w-4" />
              <span>Muara Enim, Sumatera Selatan</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Phone className="h-4 w-4" />
              <span>+62 812 3456 7890</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600">
              <Mail className="h-4 w-4" />
              <span>john.doe@email.com</span>
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
