import { useState, useEffect, useCallback, useRef } from "react";
import {
  Eye,
  MousePointerClick,
  TrendingUp,
  Package,
  Calendar,
  RefreshCw,
  Download,
  ArrowUpRight,
  ArrowDownRight,
  Minus,
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
  category_ids: string[];
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
  daily_views: number[];
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

interface CategoryMetric {
  category_id: string;
  category_name: string;
  views: number;
  clicks: number;
}

interface BannerMetric {
  banner_id: string;
  banner_title: string;
  impressions: number;
  clicks: number;
  ctr: number | null;
}

type RangePreset = "today" | "7d" | "30d" | "all" | "custom";

/* ── Helpers ───────────────────────────────────────────────────────── */
const fmt = (n: number) => new Intl.NumberFormat("id-ID").format(n);
const pct = (v: number | null) =>
  v == null ? "–" : `${(v * 100).toFixed(1)}%`;

const todayISO = () => {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const daysAgoISO = (n: number) => {
  const d = new Date();
  d.setDate(d.getDate() - n);
  d.setHours(0, 0, 0, 0);
  return d.toISOString();
};

const toDateInput = (d: Date) => d.toISOString().split("T")[0];

/** Return ISO date string N days before a given ISO string */
const shiftISO = (isoStr: string, days: number) => {
  const d = new Date(isoStr);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

/* ── Preset labels ────────────────────────────────────────────────── */
const PRESETS: { key: RangePreset; label: string }[] = [
  { key: "today", label: "Hari Ini" },
  { key: "7d", label: "7 Hari" },
  { key: "30d", label: "30 Hari" },
  { key: "all", label: "Semua" },
  { key: "custom", label: "Kustom" },
];

/* ── Delta pill ───────────────────────────────────────────────────── */
function DeltaPill({ current, prev }: { current: number; prev: number }) {
  if (prev === 0) return null;
  const delta = ((current - prev) / prev) * 100;
  const up = delta >= 0;
  const Icon = Math.abs(delta) < 0.1 ? Minus : up ? ArrowUpRight : ArrowDownRight;
  return (
    <span
      className={`inline-flex items-center gap-0.5 text-[11px] font-bold px-1.5 py-0.5 rounded-full ${
        up ? "bg-green-50 text-green-700" : "bg-red-50 text-red-600"
      }`}
    >
      <Icon className="h-3 w-3" />
      {Math.abs(delta).toFixed(1)}%
    </span>
  );
}

/* ── KPI Card ──────────────────────────────────────────────────────── */
function KPICard({
  label,
  value,
  sub,
  icon: Icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  sub?: string;
  icon: React.ElementType;
  accent: string;
  delta?: React.ReactNode;
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
        <div className="flex items-end gap-2">
          <p className="text-2xl font-bold" style={{ color: C.navy }}>
            {value}
          </p>
          {delta}
        </div>
        {sub && <p className="text-xs text-slate-400 mt-1">{sub}</p>}
      </div>
    </div>
  );
}

/* ── Sparkline ─────────────────────────────────────────────────────── */
function Sparkline({ data, color }: { data: number[]; color: string }) {
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
}

/* ── CSV Export ────────────────────────────────────────────────────── */
function exportCSV(metrics: ProductMetric[], rangeLabel: string) {
  const header = ["Produk", "Product ID", "Views", "Klik WA", "Konversi (%)"];
  const rows = metrics.map((m) => [
    `"${m.product_name.replace(/"/g, '""')}"`,
    m.product_id,
    m.views,
    m.clicks,
    m.conversion_rate != null ? (m.conversion_rate * 100).toFixed(2) : "",
  ]);
  const csv = [header, ...rows].map((r) => r.join(",")).join("\n");
  const blob = new Blob(["\uFEFF" + csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = `ecosera-dashboard-${rangeLabel.replace(/\s+/g, "-")}.csv`;
  a.click();
  URL.revokeObjectURL(url);
}

/* ── Category inline bar ───────────────────────────────────────────── */
function CategoryBar({ name, views, maxViews }: { name: string; views: number; maxViews: number }) {
  const pctWidth = maxViews > 0 ? (views / maxViews) * 100 : 0;
  return (
    <div className="space-y-1">
      <div className="flex items-center justify-between text-xs">
        <span className="text-slate-700 font-medium truncate mr-2 max-w-[150px]">{name}</span>
        <span className="text-slate-500 font-mono flex-shrink-0">{fmt(views)}</span>
      </div>
      <div className="h-1.5 rounded-full bg-slate-100 overflow-hidden">
        <div
          className="h-full rounded-full transition-all duration-500"
          style={{ width: `${pctWidth}%`, backgroundColor: C.blue }}
        />
      </div>
    </div>
  );
}

/* ── Main Component ────────────────────────────────────────────────── */
export default function AdminDashboard() {
  const [productMetrics, setProductMetrics] = useState<ProductMetric[]>([]);
  const [prevProductMetrics, setPrevProductMetrics] = useState<ProductMetric[]>([]);
  const [storeMetrics, setStoreMetrics] = useState<StoreMetric[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [searchLogs, setSearchLogs] = useState<SearchLog[]>([]);
  const [categoryMetrics, setCategoryMetrics] = useState<CategoryMetric[]>([]);
  const [bannerMetrics, setBannerMetrics] = useState<BannerMetric[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  /* ── Time range state ─────────────────────────────────────── */
  const [preset, setPreset] = useState<RangePreset>("all");
  const [customFrom, setCustomFrom] = useState(toDateInput(new Date()));
  const [customTo, setCustomTo] = useState(toDateInput(new Date()));

  /* ── Compute date window bounds ───────────────────────────── */
  const getDateBounds = useCallback((): { from: string | null; to: string | null; prevFrom: string | null; prevTo: string | null } => {
    if (preset === "today") {
      const from = todayISO();
      const prevFrom = shiftISO(from, -1);
      return { from, to: null, prevFrom, prevTo: shiftISO(from, -1) };
    }
    if (preset === "7d") {
      const from = daysAgoISO(7);
      return { from, to: null, prevFrom: daysAgoISO(14), prevTo: from };
    }
    if (preset === "30d") {
      const from = daysAgoISO(30);
      return { from, to: null, prevFrom: daysAgoISO(60), prevTo: from };
    }
    if (preset === "custom") {
      const from = new Date(customFrom);
      from.setHours(0, 0, 0, 0);
      const to = new Date(customTo);
      to.setHours(23, 59, 59, 999);
      return { from: from.toISOString(), to: to.toISOString(), prevFrom: null, prevTo: null };
    }
    return { from: null, to: null, prevFrom: null, prevTo: null };
  }, [preset, customFrom, customTo]);

  /* ── Data fetcher ─────────────────────────────────────────── */
  const fetchMetrics = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const { from, to, prevFrom, prevTo } = getDateBounds();

      // Helper: build RPC params object (null means "no filter" in the SQL)
      const rpcArgs = (f: string | null, t: string | null) => ({
        from_ts: f ?? null,
        to_ts: t ?? null,
      });

      // Fire all 6 RPCs for current period + product/store metrics for prev period in parallel
      const [
        prodRes,
        prevProdRes,
        storeRes,
        dailyRes,
        searchRes,
        bannerRes,
        activityRes,
      ] = await Promise.all([
        supabase.rpc("get_product_metrics", rpcArgs(from, to)),
        prevFrom
          ? supabase.rpc("get_product_metrics", rpcArgs(prevFrom, prevTo))
          : Promise.resolve({ data: [], error: null }),
        supabase.rpc("get_store_metrics", rpcArgs(from, to)),
        supabase.rpc("get_seller_daily_views", rpcArgs(from, to)),
        supabase.rpc("get_search_logs", rpcArgs(from, to)),
        supabase.rpc("get_banner_metrics", rpcArgs(from, to)),
        supabase.rpc("get_recent_activity", { ...rpcArgs(from, to), row_limit: 10 }),
      ]);

      if (prodRes.error) {
        setError(prodRes.error.message);
        return;
      }

      // ── Collect all unique IDs for name resolution ─────────
      const prodRows: any[] = prodRes.data || [];
      const prevProdRows: any[] = prevProdRes.data || [];
      const storeRows: any[] = storeRes.data || [];
      const dailyRows: any[] = dailyRes.data || [];
      const activityRows: any[] = activityRes.data || [];

      const productIds = prodRows.map((r: any) => r.product_id);
      const prevProductIds = prevProdRows.map((r: any) => r.product_id);
      const allProductIds = Array.from(new Set([...productIds, ...prevProductIds]));
      const sellerIds = storeRows.map((r: any) => r.seller_id);
      const activityProductIds = activityRows
        .filter((r: any) => r.product_id)
        .map((r: any) => r.product_id);
      const activitySellerIds = activityRows
        .filter((r: any) => r.seller_id)
        .map((r: any) => r.seller_id);
      const allNameLookupProductIds = Array.from(
        new Set([...allProductIds, ...activityProductIds])
      );
      const allNameLookupSellerIds = Array.from(
        new Set([...sellerIds, ...activitySellerIds])
      );

      // ── Resolve names + categories in parallel ──────────────
      const [prodNameResult, sellerNameResult, categoryResult, prodCatResult] =
        await Promise.all([
          allNameLookupProductIds.length > 0
            ? supabase.from("products").select("id, name").in("id", allNameLookupProductIds)
            : Promise.resolve({ data: [] }),
          allNameLookupSellerIds.length > 0
            ? supabase.from("sellers").select("id, name").in("id", allNameLookupSellerIds)
            : Promise.resolve({ data: [] }),
          supabase.from("categories").select("id, name"),
          productIds.length > 0
            ? supabase.from("product_categories").select("product_id, category_id").in("product_id", productIds)
            : Promise.resolve({ data: [] }),
        ]);

      const prodNameMap: Record<string, string> = Object.fromEntries(
        (prodNameResult.data || []).map((p: any) => [p.id, p.name])
      );
      const sellerNameMap: Record<string, string> = Object.fromEntries(
        (sellerNameResult.data || []).map((s: any) => [s.id, s.name])
      );
      const categoryNameMap: Record<string, string> = Object.fromEntries(
        (categoryResult.data || []).map((c: any) => [c.id, c.name])
      );
      const prodCatMap: Record<string, string[]> = {};
      for (const pc of (prodCatResult.data || []) as any[]) {
        if (!prodCatMap[pc.product_id]) prodCatMap[pc.product_id] = [];
        prodCatMap[pc.product_id].push(pc.category_id);
      }

      // ── Map: product metrics ─────────────────────────────────
      const currentMetrics: ProductMetric[] = prodRows
        .filter((r: any) => prodNameMap[r.product_id])
        .map((r: any) => ({
          product_id: r.product_id,
          product_name: prodNameMap[r.product_id],
          category_ids: prodCatMap[r.product_id] || [],
          views: Number(r.views),
          clicks: Number(r.clicks),
          conversion_rate: Number(r.views) > 0 ? Number(r.clicks) / Number(r.views) : null,
        }))
        .sort((a, b) => b.views - a.views);

      setProductMetrics(currentMetrics);

      // ── Map: previous period (for KPI deltas) ───────────────
      setPrevProductMetrics(
        prevProdRows.map((r: any) => ({
          product_id: r.product_id,
          product_name: prodNameMap[r.product_id] || r.product_id,
          category_ids: [],
          views: Number(r.views),
          clicks: Number(r.clicks),
          conversion_rate: Number(r.views) > 0 ? Number(r.clicks) / Number(r.views) : null,
        }))
      );

      // ── Map: store metrics + sparklines ─────────────────────
      // Build per-seller daily view map from the dedicated daily RPC
      const sellerDailyMap: Record<string, Record<string, number>> = {};
      for (const row of dailyRows) {
        if (!sellerDailyMap[row.seller_id]) sellerDailyMap[row.seller_id] = {};
        sellerDailyMap[row.seller_id][row.day] = Number(row.views);
      }

      setStoreMetrics(
        storeRows
          .filter((r: any) => sellerNameMap[r.seller_id])
          .map((r: any) => {
            const dailyMap = sellerDailyMap[r.seller_id] || {};
            const sortedDays = Object.keys(dailyMap).sort();
            const last7 = sortedDays.slice(-7);
            const daily_views = last7.map((d) => dailyMap[d] || 0);
            return {
              seller_id: r.seller_id,
              seller_name: sellerNameMap[r.seller_id],
              views: Number(r.views),
              clicks: Number(r.clicks),
              conversion_rate: Number(r.views) > 0 ? Number(r.clicks) / Number(r.views) : null,
              daily_views,
            };
          })
          .sort((a, b) => b.views - a.views)
      );

      // ── Map: search logs ─────────────────────────────────────
      setSearchLogs(
        (searchRes.data || []).map((r: any) => ({
          query: r.query,
          count: Number(r.hit_count),
          results_count_avg: Number(r.avg_results),
        }))
      );

      // ── Map: activity feed ───────────────────────────────────
      setActivityLogs(
        activityRows.map((ev: any) => ({
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

      // ── Map: category breakdown (still client-side from product data) ──
      const catAgg: Record<string, { views: number; clicks: number }> = {};
      for (const pm of currentMetrics) {
        for (const cid of pm.category_ids) {
          if (!catAgg[cid]) catAgg[cid] = { views: 0, clicks: 0 };
          catAgg[cid].views += pm.views;
          catAgg[cid].clicks += pm.clicks;
        }
      }
      setCategoryMetrics(
        Object.entries(catAgg)
          .filter(([cid]) => categoryNameMap[cid])
          .map(([cid, data]) => ({
            category_id: cid,
            category_name: categoryNameMap[cid],
            views: data.views,
            clicks: data.clicks,
          }))
          .sort((a, b) => b.views - a.views)
          .slice(0, 8)
      );

      // ── Map: banner metrics ──────────────────────────────────
      setBannerMetrics(
        (bannerRes.data || []).map((r: any) => ({
          banner_id: r.banner_id,
          banner_title: r.banner_title,
          impressions: Number(r.impressions),
          clicks: Number(r.clicks),
          ctr: Number(r.impressions) > 0 ? Number(r.clicks) / Number(r.impressions) : null,
        }))
      );
    } catch (err) {
      console.error("[AdminDashboard] Unexpected error:", err);
      setError("Terjadi kesalahan saat memuat data.");
    } finally {
      setLoading(false);
    }
  }, [preset, customFrom, customTo, getDateBounds]);

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

  const showDelta = preset === "today" || preset === "7d" || preset === "30d";

  const totalViews = productMetrics.reduce((s, m) => s + (m.views || 0), 0);
  const totalClicks = productMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const totalProducts = productMetrics.length;
  const avgConversion =
    totalProducts > 0
      ? productMetrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / totalProducts
      : 0;

  const prevTotalViews = prevProductMetrics.reduce((s, m) => s + (m.views || 0), 0);
  const prevTotalClicks = prevProductMetrics.reduce((s, m) => s + (m.clicks || 0), 0);
  const prevTotalProducts = prevProductMetrics.length;
  const prevAvgConversion =
    prevTotalProducts > 0
      ? prevProductMetrics.reduce((s, m) => s + (m.conversion_rate || 0), 0) / prevTotalProducts
      : 0;

  // Ref to avoid exporting stale data
  const exportRef = useRef(productMetrics);
  exportRef.current = productMetrics;

  return (
    <div className="max-w-7xl mx-auto pb-12">
      {/* ── Header ── */}
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
            onClick={() => exportCSV(exportRef.current, rangeLabel)}
            disabled={loading || productMetrics.length === 0}
            className="px-4 py-2 rounded-lg text-sm font-medium border border-slate-200 bg-white hover:bg-slate-50 transition-colors flex items-center gap-2 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Download className="h-4 w-4 text-slate-500" />
            Export CSV
          </button>
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

      {/* ── Time Filter ── */}
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

      {/* ── Loading ── */}
      {loading && (
        <div className="flex items-center justify-center py-24">
          <div
            className="w-10 h-10 border-[3px] border-t-transparent rounded-full animate-spin"
            style={{ borderColor: C.blue, borderTopColor: "transparent" }}
          />
        </div>
      )}

      {/* ── Error ── */}
      {error && !loading && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-sm text-red-600 mb-8">
          {error}
        </div>
      )}

      {!loading && !error && (
        <div className="space-y-8">
          {/* ── KPI Cards ── */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            <KPICard
              label="Produk Terlacak"
              value={fmt(totalProducts)}
              sub={rangeLabel}
              icon={Package}
              accent={C.blue}
              delta={showDelta ? <DeltaPill current={totalProducts} prev={prevTotalProducts} /> : undefined}
            />
            <KPICard
              label="Total Views"
              value={fmt(totalViews)}
              sub={rangeLabel}
              icon={Eye}
              accent="#16A34A"
              delta={showDelta ? <DeltaPill current={totalViews} prev={prevTotalViews} /> : undefined}
            />
            <KPICard
              label="Total Klik WA"
              value={fmt(totalClicks)}
              sub={rangeLabel}
              icon={MousePointerClick}
              accent="#7C3AED"
              delta={showDelta ? <DeltaPill current={totalClicks} prev={prevTotalClicks} /> : undefined}
            />
            <KPICard
              label="Rata Konversi"
              value={pct(avgConversion)}
              sub={rangeLabel}
              icon={TrendingUp}
              accent="#EA580C"
              delta={showDelta ? <DeltaPill current={avgConversion * 100} prev={prevAvgConversion * 100} /> : undefined}
            />
          </div>

          <div className="grid lg:grid-cols-3 gap-8">
            {/* ── Left column (2/3) ── */}
            <div className="lg:col-span-2 space-y-8">
              {/* Top Produk */}
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Top Produk</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">
                    {productMetrics.length} Item
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
                      {productMetrics.slice(0, 10).map((m) => (
                        <tr key={m.product_id} className="hover:bg-slate-50/50 transition-colors">
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800 line-clamp-1">{m.product_name}</p>
                            <p className="text-[10px] text-slate-400 font-mono mt-0.5">{m.product_id.slice(0, 8)}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.views)}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(m.clicks)}</td>
                          <td className="px-5 py-3.5 text-right">
                            <span className={`text-xs font-bold ${m.clicks > 0 ? "text-green-600" : "text-slate-300"}`}>
                              {pct(m.conversion_rate)}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Performa Toko */}
              <div className="bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-sm">
                <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
                  <h3 className="font-bold text-slate-800">Performa Toko</h3>
                  <span className="text-xs font-medium px-2 py-1 bg-slate-100 rounded text-slate-500">
                    {storeMetrics.length} Toko
                  </span>
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
                          <td className="px-5 py-3.5">
                            <p className="font-medium text-slate-800">{s.seller_name}</p>
                          </td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(s.views)}</td>
                          <td className="px-5 py-3.5 text-right font-mono text-slate-600">{fmt(s.clicks)}</td>
                          <td className="px-5 py-3.5 flex justify-center">
                            <Sparkline data={s.daily_views.length >= 2 ? s.daily_views : [0, s.views]} color={C.blue} />
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Produk Perlu Perhatian */}
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
                        .filter((m) => (m.views || 0) > 5 && (m.conversion_rate || 0) < 0.05)
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
                      {productMetrics.filter((m) => (m.views || 0) > 5 && (m.conversion_rate || 0) < 0.05).length === 0 && (
                        <tr>
                          <td colSpan={4} className="px-5 py-8 text-center text-slate-400 italic">
                            Semua produk menunjukkan performa konversi yang sehat (di atas 5%).
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* ── Right column (1/3) ── */}
            <div className="space-y-8">
              {/* Pencarian Populer */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Pencarian Populer
                  <span className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full uppercase">
                    Top {searchLogs.length}
                  </span>
                </h3>
                {searchLogs.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">Belum ada data pencarian.</p>
                ) : (
                  <div className="space-y-3">
                    {searchLogs.map((log, idx) => {
                      const isZeroResult = log.results_count_avg < 1;
                      return (
                        <div key={idx} className="flex items-center justify-between group">
                          <div
                            className={`px-3 py-2 rounded-lg transition-colors flex-1 mr-3 ${
                              isZeroResult
                                ? "bg-red-50 group-hover:bg-red-100"
                                : "bg-slate-50 group-hover:bg-blue-50"
                            }`}
                          >
                            <div className="flex items-center gap-2 flex-wrap">
                              <p className="text-sm font-medium text-slate-700">"{log.query}"</p>
                              {isZeroResult && (
                                <span className="text-[10px] font-bold text-red-600 bg-red-100 px-1.5 py-0.5 rounded-full uppercase tracking-wide flex-shrink-0">
                                  0 Hasil
                                </span>
                              )}
                            </div>
                            <p className="text-[10px] text-slate-400 mt-0.5">
                              {isZeroResult
                                ? "⚠️ Tidak ada produk ditemukan"
                                : `Avg. ${log.results_count_avg.toFixed(1)} hasil`}
                            </p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-bold text-slate-800">{fmt(log.count)}</p>
                            <p className="text-[10px] text-slate-400 uppercase tracking-tighter">Hits</p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              {/* Views per Kategori */}
              {categoryMetrics.length > 0 && (
                <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                  <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                    Views per Kategori
                    <span className="text-[10px] font-bold text-purple-600 bg-purple-50 px-2 py-0.5 rounded-full uppercase">
                      {categoryMetrics.length} Kategori
                    </span>
                  </h3>
                  <div className="space-y-3">
                    {categoryMetrics.map((cat) => (
                      <CategoryBar
                        key={cat.category_id}
                        name={cat.category_name}
                        views={cat.views}
                        maxViews={categoryMetrics[0].views}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* Performa Banner */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4 flex items-center justify-between">
                  Performa Banner
                  <span className="text-[10px] font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-full uppercase">
                    {bannerMetrics.length > 0 ? `${bannerMetrics.length} Banner` : 'Belum ada data'}
                  </span>
                </h3>
                {bannerMetrics.length === 0 ? (
                  <p className="text-sm text-slate-400 italic">
                    Data akan muncul setelah banner dilihat atau diklik.
                  </p>
                ) : (
                  <div className="space-y-3">
                    {bannerMetrics.map((b) => (
                      <div key={b.banner_id} className="group">
                        <div className="flex items-start justify-between gap-2 mb-1.5">
                          <p className="text-[13px] font-medium text-slate-800 line-clamp-1 flex-1">{b.banner_title}</p>
                          <span className={`text-[11px] font-bold px-1.5 py-0.5 rounded flex-shrink-0 ${
                            b.ctr != null && b.ctr > 0.05
                              ? 'bg-green-50 text-green-700'
                              : 'bg-slate-100 text-slate-500'
                          }`}>
                            {b.ctr != null ? `${(b.ctr * 100).toFixed(1)}% CTR` : '–'}
                          </span>
                        </div>
                        <div className="flex items-center gap-3 text-[11px] text-slate-500">
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-blue-400" />
                            {fmt(b.impressions)} tayangan
                          </span>
                          <span className="flex items-center gap-1">
                            <span className="inline-block w-1.5 h-1.5 rounded-full bg-green-500" />
                            {fmt(b.clicks)} klik
                          </span>
                        </div>
                        {/* CTR progress bar */}
                        <div className="mt-1.5 h-1 rounded-full bg-slate-100 overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500"
                            style={{
                              width: `${Math.min((b.ctr || 0) * 100 * 5, 100)}%`,
                              backgroundColor: (b.ctr || 0) > 0.05 ? '#16A34A' : C.blue,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Aktivitas Terbaru */}
              <div className="bg-white rounded-xl border border-slate-200/80 p-5 shadow-sm">
                <h3 className="font-bold text-slate-800 mb-4">Aktivitas Terbaru</h3>
                <div className="space-y-6 relative before:absolute before:left-[11px] before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-100">
                  {activityLogs.map((log) => {
                    const date = new Date(log.created_at);
                    const timeStr = date.toLocaleTimeString("id", { hour: "2-digit", minute: "2-digit" });
                    let title = "";
                    let sub = "";
                    let color = C.blue;

                    if (log.event_type === "product_view") {
                      title = "Melihat Produk";
                      sub = log.product_name || "Produk tidak dikenal";
                    } else if (log.event_type === "wa_click") {
                      title = "Klik WhatsApp";
                      sub = log.product_name || "Produk tidak dikenal";
                      color = "#16A34A";
                    } else if (log.event_type === "search_perform") {
                      title = "Mencari";
                      sub = `"${log.search_query}"`;
                      color = "#7C3AED";
                    }

                    return (
                      <div key={log.id} className="relative pl-8 group">
                        <div
                          className="absolute left-0 top-1.5 w-[23px] h-[23px] rounded-full border-4 border-white shadow-sm ring-1 ring-slate-100 flex items-center justify-center z-10"
                          style={{ backgroundColor: color }}
                        >
                          <div className="w-1 h-1 bg-white rounded-full" />
                        </div>
                        <div>
                          <div className="flex items-center justify-between gap-2">
                            <p className="text-[13px] font-bold text-slate-800">{title}</p>
                            <span className="text-[10px] font-medium text-slate-400 whitespace-nowrap">{timeStr}</span>
                          </div>
                          <p className="text-xs text-slate-500 mt-0.5 line-clamp-1 group-hover:text-slate-900 transition-colors">
                            {sub}
                          </p>
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
