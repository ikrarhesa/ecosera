import React, { useState } from "react";
import { ArrowLeft, Upload, MapPin, Phone, Store } from "lucide-react";
import { useNavigate } from "react-router-dom";
import Navbar from "../components/Navbar";

export default function AddProduct() {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    name: "",
    price: "",
    category: "",
    description: "",
    sellerName: "",
    sellerPhone: "",
    location: "Muara Enim, Sumsel",
    unit: "pcs"
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Implement actual product submission logic
    alert("Produk berhasil ditambahkan! (Fitur ini akan terintegrasi dengan backend)");
    navigate("/etalase");
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  return (
    <>
      <Navbar />
      
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        {/* Header */}
        <div className="px-4 pt-3 pb-2 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <div className="flex items-center gap-3 mb-4">
            <button
              onClick={() => navigate(-1)}
              className="rounded-xl p-2 bg-white border border-slate-200 hover:bg-slate-50"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-semibold text-slate-900">Tambah Produk</h1>
              <p className="text-sm text-slate-600">Jual produk UMKM Anda</p>
            </div>
          </div>
        </div>

        {/* Form */}
        <div className="px-4 max-w-md md:max-w-lg lg:max-w-xl mx-auto">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Product Image Upload */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <label className="block text-sm font-medium text-slate-900 mb-2">
                Foto Produk
              </label>
              <div className="border-2 border-dashed border-slate-300 rounded-xl p-6 text-center">
                <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm text-slate-600">Upload foto produk</p>
                <p className="text-xs text-slate-500">PNG, JPG hingga 10MB</p>
              </div>
            </div>

            {/* Product Information */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900 mb-3">Informasi Produk</h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Produk *
                  </label>
                  <input
                    type="text"
                    name="name"
                    value={formData.name}
                    onChange={handleChange}
                    placeholder="Contoh: Kopi Semendo Robusta"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Harga (Rp) *
                    </label>
                    <input
                      type="number"
                      name="price"
                      value={formData.price}
                      onChange={handleChange}
                      placeholder="45000"
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                      required
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-700 mb-1">
                      Satuan
                    </label>
                    <select
                      name="unit"
                      value={formData.unit}
                      onChange={handleChange}
                      className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    >
                      <option value="pcs">Pcs</option>
                      <option value="kg">Kg</option>
                      <option value="gram">Gram</option>
                      <option value="liter">Liter</option>
                      <option value="pack">Pack</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Kategori *
                  </label>
                  <select
                    name="category"
                    value={formData.category}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  >
                    <option value="">Pilih kategori</option>
                    <option value="kopi">Kopi</option>
                    <option value="snack">Snack</option>
                    <option value="minuman">Minuman</option>
                    <option value="kerajinan">Kerajinan</option>
                    <option value="sembako">Sembako</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Deskripsi
                  </label>
                  <textarea
                    name="description"
                    value={formData.description}
                    onChange={handleChange}
                    placeholder="Deskripsikan produk Anda..."
                    rows={3}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Seller Information */}
            <div className="bg-white rounded-2xl border border-slate-100 p-4">
              <h3 className="font-semibold text-slate-900 mb-3 flex items-center gap-2">
                <Store className="h-4 w-4 text-blue-600" />
                Informasi Penjual
              </h3>
              
              <div className="space-y-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Toko/UMKM *
                  </label>
                  <input
                    type="text"
                    name="sellerName"
                    value={formData.sellerName}
                    onChange={handleChange}
                    placeholder="Contoh: Kebun Kopi Semendo"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nomor HP *
                  </label>
                  <input
                    type="tel"
                    name="sellerPhone"
                    value={formData.sellerPhone}
                    onChange={handleChange}
                    placeholder="081234567890"
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                    required
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Lokasi
                  </label>
                  <input
                    type="text"
                    name="location"
                    value={formData.location}
                    onChange={handleChange}
                    className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:ring-2 focus:ring-blue-200 focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200"
            >
              Tambahkan Produk
            </button>
          </form>
        </div>
      </div>
    </>
  );
}
