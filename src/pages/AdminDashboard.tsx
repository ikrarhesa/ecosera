import { useState, useEffect, useCallback } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
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
  const [metrics, setMetrics] = useState<ProductMetric[]>([]);
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
        .select("product_id, event_type, created_at");

      // Apply date range filter
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
      // preset === "all" → no filter

      const { data: events, error: fetchError } = await query;

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
  }, [preset, customFrom, customTo]);

  // Refetch when preset or custom dates change
  useEffect(() => {
    fetchMetrics();
  }, [fetchMetrics]);

  /* ── Range label for sub-text ─────────────────────────────── */
  const rangeLabel = (() => {
    switch (preset) {
      case "today": return "hari ini";
      case "7d": return "7 hari terakhir";
      case "30d": return "30 hari terakhir";
      case "custom": return `${customFrom} s/d ${customTo}`;
      default: return "semua waktu";
    }
  })();

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

      {/* ── Time Range Filter ──────────────────────────────────── */}
      <div className="mb-6 bg-white rounded-xl border border-slate-200/80 p-4">
        <div className="flex items-center gap-2 mb-3">
          <Calendar className="h-4 w-4 text-slate-400" />
          <span className="text-sm font-medium text-slate-600">Rentang Waktu</span>
        </div>

        {/* Preset buttons */}
        <div className="flex flex-wrap gap-2">
          {PRESETS.map((p) => (
            <button
              key={p.key}
              onClick={() => setPreset(p.key)}
              className="px-3.5 py-1.5 rounded-lg text-sm font-medium transition-all duration-150"
              style={
                preset === p.key
                  ? { backgroundColor: C.blue, color: "#fff" }
                  : { backgroundColor: "#F1F5F9", color: "#64748B" }
              }
            >
              {p.label}
            </button>
          ))}

          {/* Refresh button */}
          <button
            onClick={fetchMetrics}
            disabled={loading}
            className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium transition-all duration-150 flex items-center gap-1.5"
            style={{ backgroundColor: "#F1F5F9", color: "#64748B" }}
            title="Muat ulang data"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? "animate-spin" : ""}`} />
            Muat Ulang
          </button>
        </div>

        {/* Custom date inputs */}
        {preset === "custom" && (
          <div className="mt-3 flex flex-wrap items-center gap-3 pt-3 border-t border-slate-100">
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Dari</label>
              <input
                type="date"
                value={customFrom}
                onChange={(e) => setCustomFrom(e.target.value)}
                max={customTo}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
            <div className="flex items-center gap-2">
              <label className="text-xs text-slate-500 font-medium">Sampai</label>
              <input
                type="date"
                value={customTo}
                onChange={(e) => setCustomTo(e.target.value)}
                min={customFrom}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-blue-500/30 focus:border-blue-400"
              />
            </div>
          </div>
        )}
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
              sub={rangeLabel}
              icon={Package}
              accent={C.blue}
            />
            <KPICard
              label="Total Views"
              value={fmt(totalViews)}
              sub={rangeLabel}
              icon={Eye}
              accent="#16A34A"
            />
            <KPICard
              label="Total Klik WA"
              value={fmt(totalClicks)}
              sub={rangeLabel}
              icon={MousePointerClick}
              accent="#7C3AED"
            />
            <KPICard
              label="Rata-rata Konversi"
              value={pct(avgConversion)}
              sub={rangeLabel}
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
                {metrics.length} produk · {rangeLabel}
              </span>
            </div>

            {metrics.length === 0 ? (
              <p className="text-sm text-slate-500 py-10 text-center">
                Belum ada data metrik untuk rentang waktu ini.
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
