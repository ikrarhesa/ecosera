export default function NotFound() {
  return (
    <div className="min-h-screen grid place-items-center bg-[#F6F8FC]">
      <div className="text-center p-6">
        <h1 className="text-2xl font-semibold text-slate-900">Halaman tidak ditemukan</h1>
        <p className="text-slate-600 mt-2">Cek kembali alamat atau kembali ke beranda.</p>
        <a href="/" className="inline-block mt-4 px-4 py-2 rounded-xl bg-blue-600 text-white">Kembali</a>
      </div>
    </div>
  );
}
