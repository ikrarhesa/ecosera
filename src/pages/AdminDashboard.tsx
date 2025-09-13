import React, { useState, useMemo } from "react";
import { 
  Users, 
  Package, 
  ShoppingCart, 
  TrendingUp, 
  DollarSign, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BarChart3,
  Calendar,
  Filter
} from "lucide-react";
import BottomNavbar from "../components/BottomNavbar";

// Mock data - in real app, this would come from API
const MOCK_DATA = {
  totalUMKM: 156,
  activeProducts: 1247,
  totalInteractions: 3421,
  totalRevenue: 125000000,
  growthData: {
    umkm: { current: 156, previous: 142, growth: 9.9 },
    products: { current: 1247, previous: 1189, growth: 4.9 },
    interactions: { current: 3421, previous: 2890, growth: 18.4 },
    revenue: { current: 125000000, previous: 98000000, growth: 27.6 }
  },
  recentActivity: [
    { id: 1, type: "new_umkm", message: "UMKM Baru: Toko Kerajinan Purun", time: "2 jam lalu", value: "+1" },
    { id: 2, type: "new_product", message: "Produk Baru: Batik Kujur Kain", time: "4 jam lalu", value: "+3" },
    { id: 3, type: "sale", message: "Penjualan: Kopi Semendo 250g", time: "6 jam lalu", value: "Rp 450.000" },
    { id: 4, type: "interaction", message: "Interaksi Baru: 15 pembeli aktif", time: "8 jam lalu", value: "+15" }
  ],
  topUMKM: [
    { name: "Kebun Kopi Semendo", revenue: 25000000, products: 12, growth: 15.2 },
    { name: "Batik Muara Enim", revenue: 18500000, products: 8, growth: 22.1 },
    { name: "Gula Aren Tradisional", revenue: 12000000, products: 5, growth: 8.7 },
    { name: "Kerajinan Purun Lokal", revenue: 8500000, products: 15, growth: 12.3 }
  ],
  monthlyRevenue: [
    { month: "Jan", revenue: 85000000 },
    { month: "Feb", revenue: 92000000 },
    { month: "Mar", revenue: 98000000 },
    { month: "Apr", revenue: 105000000 },
    { month: "Mei", revenue: 112000000 },
    { month: "Jun", revenue: 125000000 }
  ]
};

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
};

const formatNumber = (num: number) => {
  return new Intl.NumberFormat('id-ID').format(num);
};

const GrowthIndicator = ({ growth, isPositive }: { growth: number; isPositive: boolean }) => (
  <div className={`flex items-center gap-1 text-sm ${isPositive ? 'text-green-600' : 'text-red-600'}`}>
    {isPositive ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />}
    <span className="font-medium">{Math.abs(growth)}%</span>
  </div>
);

const KPICard = ({ 
  title, 
  value, 
  growth, 
  icon: Icon, 
  color = "blue",
  isCurrency = false 
}: {
  title: string;
  value: number;
  growth: number;
  icon: React.ElementType;
  color?: string;
  isCurrency?: boolean;
}) => {
  const colorClasses = {
    blue: "bg-blue-500",
    green: "bg-green-500", 
    purple: "bg-purple-500",
    orange: "bg-orange-500"
  };

  return (
    <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
      <div className="flex items-center justify-between mb-3">
        <div className={`p-2 rounded-lg ${colorClasses[color as keyof typeof colorClasses]} text-white`}>
          <Icon className="h-5 w-5" />
        </div>
        <GrowthIndicator growth={growth} isPositive={growth > 0} />
      </div>
      <div>
        <p className="text-2xl font-bold text-slate-900 mb-1">
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </p>
        <p className="text-sm text-slate-600">{title}</p>
      </div>
    </div>
  );
};

const ActivityItem = ({ activity }: { activity: any }) => {
  const getIcon = (type: string) => {
    switch (type) {
      case "new_umkm": return <Users className="h-4 w-4 text-blue-500" />;
      case "new_product": return <Package className="h-4 w-4 text-green-500" />;
      case "sale": return <DollarSign className="h-4 w-4 text-purple-500" />;
      case "interaction": return <Activity className="h-4 w-4 text-orange-500" />;
      default: return <Activity className="h-4 w-4 text-slate-500" />;
    }
  };

  return (
    <div className="flex items-start gap-3 p-3 bg-white rounded-lg border border-slate-100">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 font-medium">{activity.message}</p>
        <p className="text-xs text-slate-500">{activity.time}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs font-medium text-slate-600">{activity.value}</span>
      </div>
    </div>
  );
};

const TopUMKMCard = ({ umkm }: { umkm: any }) => (
  <div className="bg-white rounded-lg p-4 border border-slate-100">
    <div className="flex items-start justify-between mb-2">
      <h4 className="font-medium text-slate-900 text-sm">{umkm.name}</h4>
      <GrowthIndicator growth={umkm.growth} isPositive={umkm.growth > 0} />
    </div>
    <div className="space-y-1">
      <p className="text-xs text-slate-600">Omzet: {formatCurrency(umkm.revenue)}</p>
      <p className="text-xs text-slate-600">Produk: {umkm.products} item</p>
    </div>
  </div>
);

export default function AdminDashboard() {
  const [timeRange, setTimeRange] = useState("30d");
  const [isMobile] = useState(window.innerWidth < 768);

  const kpiData = [
    {
      title: "Total UMKM",
      value: MOCK_DATA.totalUMKM,
      growth: MOCK_DATA.growthData.umkm.growth,
      icon: Users,
      color: "blue"
    },
    {
      title: "Produk Aktif",
      value: MOCK_DATA.activeProducts,
      growth: MOCK_DATA.growthData.products.growth,
      icon: Package,
      color: "green"
    },
    {
      title: "Interaksi Pembeli",
      value: MOCK_DATA.totalInteractions,
      growth: MOCK_DATA.growthData.interactions.growth,
      icon: Activity,
      color: "purple"
    },
    {
      title: "Total Omzet",
      value: MOCK_DATA.totalRevenue,
      growth: MOCK_DATA.growthData.revenue.growth,
      icon: DollarSign,
      color: "orange",
      isCurrency: true
    }
  ];

  return (
    <>
      <BottomNavbar />
      <div className="min-h-screen bg-[#F6F8FC] pb-28">
        <div className="px-4 pt-4 max-w-7xl mx-auto">
          {/* Header */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <h1 className="text-2xl font-bold text-slate-900">Dashboard Admin</h1>
              <div className="flex items-center gap-2">
                <button className="p-2 rounded-lg bg-white border border-slate-200 hover:bg-slate-50">
                  <Filter className="h-4 w-4 text-slate-600" />
                </button>
                <select 
                  value={timeRange}
                  onChange={(e) => setTimeRange(e.target.value)}
                  className="px-3 py-2 text-sm border border-slate-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  <option value="7d">7 Hari</option>
                  <option value="30d">30 Hari</option>
                  <option value="90d">90 Hari</option>
                  <option value="1y">1 Tahun</option>
                </select>
              </div>
            </div>
            <p className="text-slate-600">Ringkasan performa platform Ecosera</p>
          </div>

          {/* KPI Cards */}
          <div className={`grid gap-4 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className={`grid gap-6 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {/* Recent Activity - Mobile: Full width, Desktop: 1/3 */}
            <div className={isMobile ? 'order-2' : ''}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Aktivitas Terbaru</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Lihat Semua
                  </button>
                </div>
                <div className="space-y-3">
                  {MOCK_DATA.recentActivity.slice(0, isMobile ? 3 : 4).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Top UMKM - Mobile: Full width, Desktop: 2/3 */}
            <div className={`${isMobile ? 'order-1' : 'col-span-2'}`}>
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-slate-900">Top UMKM</h3>
                  <button className="text-sm text-blue-600 hover:text-blue-700">
                    Lihat Semua
                  </button>
                </div>
                <div className={`grid gap-3 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
                  {MOCK_DATA.topUMKM.map((umkm, index) => (
                    <TopUMKMCard key={index} umkm={umkm} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Revenue Chart - Desktop only */}
          {!isMobile && (
            <div className="mt-6">
              <div className="bg-white rounded-xl p-6 shadow-sm border border-slate-100">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Tren Omzet Bulanan</h3>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    <span className="text-sm text-slate-600">6 Bulan Terakhir</span>
                  </div>
                </div>
                
                {/* Simple Bar Chart */}
                <div className="h-64 flex items-end justify-between gap-2">
                  {MOCK_DATA.monthlyRevenue.map((data, index) => {
                    const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                    const height = (data.revenue / maxRevenue) * 100;
                    
                    return (
                      <div key={index} className="flex-1 flex flex-col items-center">
                        <div 
                          className="w-full bg-gradient-to-t from-blue-500 to-blue-400 rounded-t-lg mb-2 transition-all duration-300 hover:from-blue-600 hover:to-blue-500"
                          style={{ height: `${height}%` }}
                        />
                        <span className="text-xs text-slate-600 font-medium">{data.month}</span>
                        <span className="text-xs text-slate-500 mt-1">
                          {formatCurrency(data.revenue).replace('Rp', '')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          )}

          {/* Mobile Summary Stats */}
          {isMobile && (
            <div className="mt-6">
              <div className="bg-white rounded-xl p-4 shadow-sm border border-slate-100">
                <h3 className="font-semibold text-slate-900 mb-4">Ringkasan Cepat</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center">
                    <p className="text-2xl font-bold text-blue-600">{MOCK_DATA.topUMKM.length}</p>
                    <p className="text-xs text-slate-600">Top UMKM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-2xl font-bold text-green-600">
                      {formatCurrency(MOCK_DATA.monthlyRevenue[MOCK_DATA.monthlyRevenue.length - 1].revenue).replace('Rp', '')}
                    </p>
                    <p className="text-xs text-slate-600">Omzet Bulan Ini</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </>
  );
}
