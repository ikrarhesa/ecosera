import { User, MapPin, Phone, Mail, Settings, Heart, Package, Star } from "lucide-react";
import { Link } from "react-router-dom";

export default function Profile() {
  return (
    <div className="min-h-screen bg-[#F6F8FC] pb-28">

      {/* Header */}
      <div className="px-4 pt-3 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
        <div className="flex items-center gap-3 mb-4">
          <div className="h-16 w-16 rounded-full bg-blue-100 grid place-items-center">
            <User className="h-8 w-8 text-blue-600" />
          </div>
          <div>
            <h1 className="text-lg font-semibold text-slate-900">Profil Saya</h1>
            <p className="text-sm text-slate-600">Kelola akun dan preferensi</p>
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
  );
}
