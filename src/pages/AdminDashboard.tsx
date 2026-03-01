import React, { useState, useEffect } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
  BarChart3,
  LogOut,
  Megaphone
} from "lucide-react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { supabase } from "../lib/supabase";

// ── Types ─────────────────────────────────────────────────────────────
interface ProductMetric {
  product_id: string;
  views: number;
  clicks: number;
  conversion_rate: number | null;
}

// ── Helpers ───────────────────────────────────────────────────────────
const formatNumber = (num: number) =>
  new Intl.NumberFormat("id-ID").format(num);

const formatPercent = (val: number | null) =>
  val == null ? "–" : `${(val * 100).toFixed(1)}%`;

// ── KPI Card ──────────────────────────────────────────────────────────
const KPICard = ({
  title,
  value,
  icon: Icon,
  color = "blue",
  isMobile = false
}: {
  title: string;
  value: string;
  icon: React.ElementType;
  color?: string;
  isMobile?: boolean;
}) => {
  const colorClasses: Record<string, string> = {
    blue: "bg-blue-500/20 text-blue-600",
    green: "bg-green-500/20 text-green-600",
    purple: "bg-purple-500/20 text-purple-600",
    orange: "bg-orange-500/20 text-orange-600"
  };

  return (
    <div
      className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300 ${isMobile ? "p-3" : "p-4"
        }`}
    >
      <div className={`flex items-center justify-between ${isMobile ? "mb-2" : "mb-3"}`}>
        <div
          className={`rounded-lg ${colorClasses[color] || colorClasses.blue} backdrop-blur-sm ${isMobile ? "p-1.5" : "p-2"
            }`}
        >
          <Icon className={`${isMobile ? "h-4 w-4" : "h-5 w-5"}`} />
        </div>
      </div>
      <div>
        <p className={`font-bold text-slate-900 mb-1 ${isMobile ? "text-lg" : "text-2xl"}`}>
          {value}
        </p>
        <p className={`text-slate-600 ${isMobile ? "text-xs" : "text-sm"}`}>{title}</p>
      </div>
    </div>
  );
};

// ── Main Component ────────────────────────────────────────────────────
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const { signOut } = useAuth();
  const handleLogout = async () => { await signOut(); };

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        const { data, error: rpcError } = await supabase.rpc("admin_product_metrics");
        if (rpcError) {
          console.error("[AdminDashboard] RPC error:", rpcError);
          setError(rpcError.message);
        } else {
          setMetrics((data as ProductMetric[]) || []);
        }
      } catch (err) {
        console.error("[AdminDashboard] Unexpected error:", err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  // Derived KPIs
  const totalProducts = metrics.length;
  const totalViews = metrics.reduce((s, m) => s + (m.views || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const avgConversion =
    totalProducts > 0
      ? metrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / totalProducts
      : 0;

  const kpiData = [
    { title: "Produk Terlacak", value: formatNumber(totalProducts), icon: Package, color: "blue" },
    { title: "Total Views", value: formatNumber(totalViews), icon: Eye, color: "green" },
    { title: "Total Klik WA", value: formatNumber(totalClicks), icon: MousePointerClick, color: "purple" },
    { title: "Rata-rata Konversi", value: formatPercent(avgConversion), icon: TrendingUp, color: "orange" }
  ];

  return (
    <div className="min-h-screen relative overflow-hidden pb-8">
      {/* Background */}
      <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
        <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
        <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
        <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-25" />
      </div>

      <div className="relative z-10 px-4 pt-4 max-w-7xl mx-auto">
        {/* Header */}
        <div
          className="relative overflow-hidden rounded-2xl p-4 mb-6"
          style={{
            background:
              "linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)"
          }}
        >
          <div
            className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
            style={{
              backgroundImage: 'url("/images/header-pattern.svg")',
              backgroundSize: "50%"
            }}
          />
          <div className="relative z-10">
            <div className={`flex items-center justify-between mb-2 ${isMobile ? "flex-col gap-3" : ""}`}>
              <div className="flex items-center gap-3">
                <BarChart3 className={`text-white ${isMobile ? "h-7 w-7" : "h-9 w-9"}`} />
                <h1 className={`font-bold text-white ${isMobile ? "text-xl" : "text-2xl"}`}>
                  Dashboard Admin
                </h1>
              </div>
              <div className="flex items-center gap-2">
                <Link
                  to="/admin/shops"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all text-white text-sm font-medium"
                >
                  <Package className="h-4 w-4" />
                  <span className="hidden sm:inline">Kelola Toko</span>
                  <span className="sm:hidden">Toko</span>
                </Link>
                <Link
                  to="/admin/marketing"
                  className="flex items-center gap-2 px-3 sm:px-4 py-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all text-white text-sm font-medium"
                >
                  <Megaphone className="h-4 w-4" />
                  <span className="hidden sm:inline">Kelola Promo</span>
                  <span className="sm:hidden">Promo</span>
                </Link>
                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-500/20 backdrop-blur-sm border border-red-400/30 hover:bg-red-500/30 transition-all text-white text-sm"
                  title="Keluar"
                >
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            </div>
            <p className={`text-white/90 ${isMobile ? "text-sm" : ""}`}>
              Ringkasan performa produk Ecosera (data real dari event_logs)
            </p>
          </div>
        </div>

        {/* Loading / Error */}
        {loading && (
          <div className="text-center py-12 text-slate-600">Memuat data metrik…</div>
        )}
        {error && (
          <div className="rounded-xl bg-red-50 border border-red-200 p-4 mb-6 text-red-700 text-sm">
            {error}
          </div>
        )}

        {!loading && !error && (
          <>
            {/* KPI Cards */}
            <div className={`grid gap-3 mb-6 ${isMobile ? "grid-cols-2" : "grid-cols-4"}`}>
              {kpiData.map((kpi, i) => (
                <KPICard key={i} {...kpi} isMobile={isMobile} />
              ))}
            </div>

            {/* Product Metrics Table */}
            <div className="bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 p-4">
              <h3 className={`font-semibold text-slate-900 mb-4 ${isMobile ? "text-sm" : ""}`}>
                Metrik per Produk
              </h3>

              {metrics.length === 0 ? (
                <p className="text-sm text-slate-500 py-4 text-center">
                  Belum ada data metrik. Pastikan event_logs sudah terisi.
                </p>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 text-left text-slate-600">
                        <th className="pb-2 pr-4 font-medium">Product ID</th>
                        <th className="pb-2 pr-4 font-medium text-right">Views</th>
                        <th className="pb-2 pr-4 font-medium text-right">Klik WA</th>
                        <th className="pb-2 font-medium text-right">Konversi</th>
                      </tr>
                    </thead>
                    <tbody>
                      {metrics.map((m) => (
                        <tr
                          key={m.product_id}
                          className="border-b border-slate-100 hover:bg-white/50 transition-colors"
                        >
                          <td className="py-2 pr-4 font-mono text-xs text-slate-700 truncate max-w-[180px]">
                            {m.product_id}
                          </td>
                          <td className="py-2 pr-4 text-right tabular-nums">
                            {formatNumber(m.views)}
                          </td>
                          <td className="py-2 pr-4 text-right tabular-nums">
                            {formatNumber(m.clicks)}
                          </td>
                          <td className="py-2 text-right tabular-nums">
                            {formatPercent(m.conversion_rate)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
