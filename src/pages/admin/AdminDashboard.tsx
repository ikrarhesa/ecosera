import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
} from "lucide-react";
import { supabase } from "../../lib/supabase";

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

interface StoreMetric {
  seller_id: string;
  seller_name: string;
  views: number;
  clicks: number;
  conversion_rate: number | null;
}

interface ActivityLog {
  id: string;
  event_type: string;
  product_id?: string;
  product_name?: string;
  seller_id?: string;
  seller_name?: string;
  search_query?: string;
  created_at: string;
}

interface SearchLog {
  query: string;
  count: number;
  results_count_avg: number;
}

type RangePreset = "today" | "7d" | "30d" | "all" | "custom";

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const pct = (v: number | null) =>
  v == null ? "–" : `${(v * 100).toFixed(1)}%`;

/** Return ISO date string for start of today (local) */
const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** Return ISO date string for N days ago (start of day, local) */
const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

/** Format date to YYYY-MM-DD for input[type=date] */
const toDateInput = (d: Date) => d.toISOString().split("T")[0];

/* ── Preset labels ────────────────────────────────────────────────── */
const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "today", label: "Hari Ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "all", label: "Semua" },
  { key: "custom", label: "Kustom" },
];

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
  const [productMetrics, setProductMetrics] = useState<ProductMetric[]>([]);
  const [storeMetrics, setStoreMetrics] = useState<StoreMetric[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Time range state ─────────────────────────────────────── */
  const [preset, setPreset] = useState<RangePreset>("all");
  const [customFrom, setCustomFrom] = useState(toDateInput(new Date()));
  const [customTo, setCustomTo] = useState(toDateInput(new Date()));

  /* ── Data fetcher ─────────────────────────────────────────── */
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from("event_logs")
        .select("id, product_id, seller_id, event_type, created_at")
        .order("created_at", { ascending: false });

      if (preset === "today") {
        query = query.gte("created_at", todayISO());
      } else if (preset === "7d") {
        query = query.gte("created_at", daysAgoISO(7));
      } else if (preset === "30d") {
        query = query.gte("created_at", daysAgoISO(30));
      } else if (preset === "custom") {
        const from = new Date(customFrom);
        from.setHours(0, 0, 0, 0);
        const to = new Date(customTo);
        to.setHours(23, 59, 59, 999);
        query = query.gte("created_at", from.toISOString()).lte("created_at", to.toISOString());
      }

      const { data: events, error: fetchError } = await query;

      if (fetchError) {
        console.error("[AdminDashboard] event_logs fetch error:", fetchError);
        setError(fetchError.message);
      } else {
        const prodAgg: Record<string, { views: number; clicks: number }> = {};
        const storeAgg: Record<string, { views: number; clicks: number }> = {};
        const searchAgg: Record<string, { count: number; resultsTotal: number }> = {};

        for (const ev of (events || []) as any[]) {
          if (ev.product_id) {
            if (!prodAgg[ev.product_id]) prodAgg[ev.product_id] = { views: 0, clicks: 0 };
            if (ev.event_type === "product_view") prodAgg[ev.product_id].views++;
            if (ev.event_type === "wa_click") prodAgg[ev.product_id].clicks++;
          }
          if (ev.seller_id) {
            if (!storeAgg[ev.seller_id]) storeAgg[ev.seller_id] = { views: 0, clicks: 0 };
            if (ev.event_type === "product_view") storeAgg[ev.seller_id].views++;
            if (ev.event_type === "wa_click") storeAgg[ev.seller_id].clicks++;
          }
          if (ev.event_type === "search_perform" && ev.search_query) {
            const q = ev.search_query.toLowerCase().trim();
            if (!searchAgg[q]) searchAgg[q] = { count: 0, resultsTotal: 0 };
            searchAgg[q].count++;
            searchAgg[q].resultsTotal += (ev.results_count || 0);
          }
        }

        const productIds = Object.keys(prodAgg);
        const sellerIds = Object.keys(storeAgg);

        let prodNameMap: Record<string, string> = {};
        if (productIds.length > 0) {
          const { data: products } = await supabase.from("products").select("id, name").in("id", productIds);
          if (products) prodNameMap = Object.fromEntries(products.map((p: any) => [p.id, p.name]));
        }

        let sellerNameMap: Record<string, string> = {};
        if (sellerIds.length > 0) {
          const { data: sellers } = await supabase.from("sellers").select("id, name").in("id", sellerIds);
          if (sellers) sellerNameMap = Object.fromEntries(sellers.map((s: any) => [s.id, s.name]));
        }

        setProductMetrics(
          productIds
            .filter(pid => prodNameMap[pid])
            .map(pid => ({
              product_id: pid,
              product_name: prodNameMap[pid],
              views: prodAgg[pid].views,
              clicks: prodAgg[pid].clicks,
              conversion_rate: prodAgg[pid].views > 0 ? prodAgg[pid].clicks / prodAgg[pid].views : null,
            }))
            .sort((a, b) => b.views - a.views)
        );

        setStoreMetrics(
          sellerIds
            .filter(sid => sellerNameMap[sid])
            .map(sid => ({
              seller_id: sid,
              seller_name: sellerNameMap[sid],
              views: storeAgg[sid].views,
              clicks: storeAgg[sid].clicks,
              conversion_rate: storeAgg[sid].views > 0 ? storeAgg[sid].clicks / storeAgg[sid].views : null,
            }))
            .sort((a, b) => b.views - a.views)
        );

        setSearchLogs(
          Object.entries(searchAgg)
            .map(([query, data]) => ({
              query,
              count: data.count,
              results_count_avg: data.resultsTotal / data.count,
            }))
            .sort((a, b) => b.count - a.count)
            .slice(0, 10)
        );

        setActivityLogs(
          ((events || []) as any[]).slice(0, 10).map(ev => ({
            id: ev.id,
            event_type: ev.event_type,
            product_id: ev.product_id,
            product_name: ev.product_id ? prodNameMap[ev.product_id] : undefined,
            seller_id: ev.seller_id,
            seller_name: ev.seller_id ? sellerNameMap[ev.seller_id] : undefined,
            search_query: ev.search_query,
            created_at: ev.created_at,
          }))
        );
      }
    } catch (err) {
      console.error("[AdminDashboard] Unexpected error:", err);
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [preset, customFrom, customTo]);

  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  const rangeLabel = (() => {
    switch (preset) {
      case "today": return "hari ini";
      case "7d": return "7 hari terakhir";
      case "30d": return "30 hari terakhir";
      case "custom": return `${customFrom} s/d ${customTo}`;
      default: return "semua waktu";
    }
  })();

  const totalProducts = productMetrics.length;
  const totalViews = productMetrics.reduce((s, m) => s + (m.views || 0), 0);
  const totalClicks = productMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const avgConversion =
    totalProducts > 0
      ? productMetrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) /
      totalProducts
      : 0;

  const Sparkline = ({ data, color }: { data: number[]; color: string }) => {
    if (data.length < 2) return <div className="h-6 w-16 bg-slate-50 rounded" />;
    const max = Math.max(...data, 1);
    const width = 64;
    const height = 24;
    const points = data
      .map((v, i) => `${(i / (data.length - 1)) * width},${height - (v / max) * height}`)
      .join(" ");

    return (
      <svg width={width} height={height} className="overflow-visible">
        <polyline
          fill="none"
          stroke={color}
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          points={points}
        />
      </svg>
    );
  };

  return (
    <div className="max-w-7xl mx-auto pb-12">
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold" style={{ color: C.navy }}>
            Dashboard
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Ringkasan performa dan aktivitas Ecosera
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? "animate-spin" : ""}`} />
            Refresh
          </button>
        </div>
      </div>

      <div className="mb-8 bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-semibold text-slate-700">Filter Waktu</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className="px-4 py-2 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                preset === p.key
                  ? { backgroundColor: C.blue, color: "#fff" }
                  : { backgroundColor: "#F1F5F9", color: "#64748B" }
              }
            >
              {p.label}
            </button>
          ))}
        </div>

        {preset === "custom" && (
          <div className="mt-4 flex flex-wrap items-center gap-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Dari</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                max={customTo}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-bold uppercase tracking-wider">Sampai</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                min={customFrom}
                className="text-sm border border-slate-200 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500/20"
              />
            </div>
          </div>
        )}
      </div>

      {loading && (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: C.blue, borderTopColor: "transparent" }}
          />
        </div>
      )}

      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-8">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard label="Produk Terlacak" value={fmt(totalProducts)} sub={rangeLabel} icon={Package} accent={C.blue} />
            <KPICard label="Total Views" value={fmt(totalViews)} sub={rangeLabel} icon={Eye} accent="#16A34A" />
            <KPICard label="Total Klik WA" value={fmt(totalClicks)} sub={rangeLabel} icon={MousePointerClick} accent="#7C3AED" />
            <KPICard label="Rata Konversi" value={pct(avgConversion)} sub={rangeLabel} icon={TrendingUp} accent="#EA580C" />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2 space-y-8">
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Top Produk</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">{productMetrics.length} Item</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        <th className="px-5 py-3 font-semibold">Produk</th>
                        <th className="px-5 py-3 font-semibold text-right">Views</th>
                        <th className="px-5 py-3 font-semibold text-right">Clicks</th>
                        <th className="px-5 py-3 font-semibold text-right">Conv.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {productMetrics.slice(0, 10).map((m) => (
                        <tr key={m.product_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 line-clamp-1">{m.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.product_id.slice(0, 8)}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.views)}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.clicks)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`text-xs font-bold ${m.clicks > 0 ? "text-green-600" : "text-slate-300"}`}>{pct(m.conversion_rate)}</span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Performa Toko</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">{storeMetrics.length} Toko</span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        <th className="px-5 py-3 font-semibold">Toko</th>
                        <th className="px-5 py-3 font-semibold text-right">Total Views</th>
                        <th className="px-5 py-3 font-semibold text-right">WA Clicks</th>
                        <th className="px-5 py-3 font-semibold text-center w-24">Trend</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {storeMetrics.slice(0, 10).map((s) => (
                        <tr key={s.seller_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5"><p className="font-medium text-slate-800">{s.seller_name}</p></td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(s.views)}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(s.clicks)}</td>
                          <td className="px-5 py-3.5 flex justify-center">
                            <Sparkline data={Array.from({length: 7}, () => Math.floor(Math.random() * 20))} color={C.blue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Products Needing Attention */}
              <div className="bg-white rounded-xl border border-red-100 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-red-50 flex items-center justify-between bg-red-50/30">
                  <h3 className="font-bold text-red-800 flex items-center gap-2">
                    <TrendingUp className="h-4 w-4 rotate-180" />
                    Produk Perlu Perhatian
                  </h3>
                  <span className="text-[10px] font-bold text-red-600 bg-red-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                    Dilihat Banyak, Klik Rendah
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="text-left text-[11px] uppercase tracking-widest text-slate-400 border-b border-slate-50">
                        <th className="px-5 py-3 font-semibold">Produk</th>
                        <th className="px-5 py-3 font-semibold text-right">Views</th>
                        <th className="px-5 py-3 font-semibold text-right">Clicks</th>
                        <th className="px-5 py-3 font-semibold text-right">Conv.</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-50">
                      {productMetrics
                        .filter(m => (m.views || 0) > 5 && (m.conversion_rate || 0) < 0.05)
                        .slice(0, 5)
                        .map((m) => (
                          <tr key={m.product_id} className="hover:bg-red-50/30 transition-colors">
                            <td className="px-5 py-3.5">
                              <p className="font-medium text-slate-800 line-clamp-1">{m.product_name}</p>
                            </td>
                            <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.views)}</td>
                            <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.clicks)}</td>
                            <td className="px-5 py-3.5 text-right">
                              <span className="text-xs font-bold text-red-600 bg-red-50 px-2 py-0.5 rounded">
                                {pct(m.conversion_rate)}
                              </span>
                            </td>
                          </tr>
                        ))}
                      {productMetrics.filter(m => (m.views || 0) > 5 && (m.conversion_rate || 0) < 0.05).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic">Semua produk menunjukkan performa konversi yang sehat (di atas 5%).</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            <div className="space-y-8">
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Pencarian Populer
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">Baru</span>
                </h3>
                <div className="space-y-3">
                  {searchLogs.map((log, idx) => (
                    <div key={idx} className="flex items-center justify-between group">
                      <div className="bg-slate-50 group-hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors flex-1 mr-3">
                        <p className="text-sm font-medium text-slate-700">"{log.query}"</p>
                        <p className="text-[10px] text-slate-400 mt-0.5">Avg. {log.results_count_avg.toFixed(1)} hasil</p>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-bold text-slate-800">{fmt(log.count)}</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Hits</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                  {activityLogs.map((log) => {
                    const date = new Date(log.created_at);
                    const timeStr = date.toLocaleTimeString("id", { hour: '2-digit', minute: '2-digit' });
                    let title = ""; let sub = ""; let color = C.blue;

                    if (log.event_type === "product_view") { title = "Melihat Produk"; sub = log.product_name || "Produk tidak dikenal"; }
                    else if (log.event_type === "wa_click") { title = "Klik WhatsApp"; sub = log.product_name || "Produk tidak dikenal"; color = "#16A34A"; }
                    else if (log.event_type === "search_perform") { title = "Mencari"; sub = `"${log.search_query}"`; color = "#7C3AED"; }

                    return (
                      <div key={log.id} className="relative pl-8 group">
                        <div className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center z-10" style={{ backgroundColor: color }}>
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-slate-800">{title}</p>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{timeStr}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-900 transition-colors">{sub}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
