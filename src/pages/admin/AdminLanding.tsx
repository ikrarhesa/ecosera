import { Layout } from "lucide-react";

export default function AdminLanding() {
    return (
        <div className="p-8 pb-32">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h1 className="text-2xl font-bold text-slate-800 flex items-center gap-2">
                        <Layout className="h-6 w-6 text-blue-600" />
                        Manajemen Landing Page
                    </h1>
                    <p className="text-slate-500 mt-1">
                        Kelola konten dan tampilan halaman utama
                    </p>
                </div>
            </div>

            <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center shadow-sm">
                <div className="w-16 h-16 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
                    <Layout className="h-8 w-8" />
                </div>
                <h2 className="text-xl font-bold text-slate-800 mb-2">Mulai Dari Awal</h2>
                <p className="text-slate-500 max-w-md mx-auto">
                    Visual builder telah di-reset. Anda dapat mulai membangun struktur baru untuk manajemen landing page di sini.
                </p>
            </div>
        </div>
    );
}
