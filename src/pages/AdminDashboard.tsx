import { useState, useEffect } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
} from "lucide-react";
import { supabase } from "../lib/supabase";

/* ── Walmart palette ──────────────────────────────────────────────── */
const C = {
  blue: "#0071DC",
  blueDark: "#004C91",
  blueLight: "#E6F1FB",
  yellow: "#FFC220",
  navy: "#041E42",
  bg: "#F5F6F8",
};

/* ── Types ─────────────────────────────────────────────────────────── */
interface ProductMetric {
  product_id: string;
  product_name: string;
  views: number;
  clicks: number;
  conversion_rate: number | null;
}

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const pct = (v: number | null) =>
  v == null ? "–" : `${(v * 100).toFixed(1)}%`;

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
}) {
  return (
    <div className="bg-white rounded-xl border border-slate-200/80 p-5 flex flex-col justify-between min-h-[130px] hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between mb-3">
        <span className="text-[13px] font-medium text-slate-500">{label}</span>
        <div
          className="w-8 h-8 rounded-lg flex items-center justify-center"
          style={{ backgroundColor: accent + "18" }}
        >
          <Icon className="h-4 w-4" style={{ color: accent }} />
        </div>
      </div>
      <div>
        <p className="text-2xl font-bold" style={{ color: C.navy }}>
          {value}
        </p>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    (async () => {
      setLoading(true);
      setError(null);
      try {
        // Fetch all event_logs directly instead of relying on missing RPC
        const { data: events, error: fetchError } = await supabase
          .from("event_logs")
          .select("product_id, event_type");

        if (fetchError) {
          console.error("[AdminDashboard] event_logs fetch error:", fetchError);
          setError(fetchError.message);
        } else {
          // Aggregate views & clicks per product_id
          const agg: Record<string, { views: number; clicks: number }> = {};
          for (const ev of events || []) {
            if (!ev.product_id) continue;
            if (!agg[ev.product_id]) agg[ev.product_id] = { views: 0, clicks: 0 };
            if (ev.event_type === "product_view") agg[ev.product_id].views++;
            if (ev.event_type === "wa_click") agg[ev.product_id].clicks++;
          }

          const ids = Object.keys(agg);
          let nameMap: Record<string, string> = {};
          if (ids.length > 0) {
            const { data: products } = await supabase
              .from("products")
              .select("id, name")
              .in("id", ids);
            if (products) {
              nameMap = Object.fromEntries(
                products.map((p: any) => [p.id, p.name])
              );
            }
          }

          setMetrics(
            ids.map((pid) => ({
              product_id: pid,
              product_name: nameMap[pid] || "–",
              views: agg[pid].views,
              clicks: agg[pid].clicks,
              conversion_rate:
                agg[pid].views > 0
                  ? agg[pid].clicks / agg[pid].views
                  : null,
            }))
          );
        }
      } catch (err) {
        console.error("[AdminDashboard] Unexpected error:", err);
        setError("Terjadi kesalahan saat memuat data.");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  /* Derived KPIs */
  const totalProducts = metrics.length;
  const totalViews = metrics.reduce((s, m) => s + (m.views || 0), 0);
  const totalClicks = metrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const avgConversion =
    totalProducts > 0
      ? metrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) /
      totalProducts
      : 0;

  return (
    <div className="max-w-7xl mx-auto">
      {/* ── Page heading ──────────────────────────────────────── */}
      <div className="mb-6 md:mb-8">
        <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>
          Dashboard
        </h1>
        <p className="text-sm text-slate-500 mt-1">
          Ringkasan performa produk Ecosera
        </p>
      </div>

      {/* ── Loading / Error ───────────────────────────────────── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-8 h-8 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: C.blue, borderTopColor: "transparent" }}
          />
        </div>
      )}

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600">
          {error}
        </div>
      )}

      {!loading && !error && (
        <>
          {/* ── KPI Cards ───────────────────────────────────────── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            <KPICard
              label="Produk Terlacak"
              value={fmt(totalProducts)}
              icon={Package}
              accent={C.blue}
            />
            <KPICard
              label="Total Views"
              value={fmt(totalViews)}
              sub="dari event_logs"
              icon={Eye}
              accent="#16A34A"
            />
            <KPICard
              label="Total Klik WA"
              value={fmt(totalClicks)}
              icon={MousePointerClick}
              accent="#7C3AED"
            />
            <KPICard
              label="Rata-rata Konversi"
              value={pct(avgConversion)}
              icon={TrendingUp}
              accent="#EA580C"
            />
          </div>

          {/* ── Metrics Table ─────────────────────────────────── */}
          <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden">
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <h3
                className="font-semibold text-[15px]"
                style={{ color: C.navy }}
              >
                Metrik per Produk
              </h3>
              <span className="text-xs text-slate-400">
                {metrics.length} produk
              </span>
            </div>

            {metrics.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center">
                Belum ada data metrik. Pastikan event_logs sudah terisi.
              </p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="text-left text-[12px] uppercase tracking-wider text-slate-400 border-b border-slate-100">
                      <th className="px-5 py-3 font-medium">ID</th>
                      <th className="px-5 py-3 font-medium">Nama Produk</th>
                      <th className="px-5 py-3 font-medium text-right">
                        Views
                      </th>
                      <th className="px-5 py-3 font-medium text-right">
                        Klik WA
                      </th>
                      <th className="px-5 py-3 font-medium text-right">
                        Konversi
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {metrics.map((m, i) => (
                      <tr
                        key={m.product_id || i}
                        className="border-b border-slate-50 hover:bg-slate-50/60 transition-colors"
                      >
                        <td
                          className="px-5 py-3.5 font-mono text-[11px] text-slate-400"
                          title={m.product_id || ""}
                        >
                          {m.product_id
                            ? `${m.product_id.slice(0, 8)}…`
                            : "–"}
                        </td>
                        <td className="px-5 py-3.5 font-medium text-slate-800">
                          {m.product_name}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                          {fmt(m.views)}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums text-slate-700">
                          {fmt(m.clicks)}
                        </td>
                        <td className="px-5 py-3.5 text-right tabular-nums">
                          <span
                            className={`inline-block px-2 py-0.5 rounded-full text-xs font-medium ${(m.conversion_rate || 0) > 0
                              ? "bg-green-50 text-green-700"
                              : "text-slate-400"
                              }`}
                          >
                            {pct(m.conversion_rate)}
                          </span>
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
  );
}
