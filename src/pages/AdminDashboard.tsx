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
    { month: "Jan", revenue: 85000000, umkm: 142, products: 1189, interactions: 2890 },
    { month: "Feb", revenue: 92000000, umkm: 145, products: 1201, interactions: 3120 },
    { month: "Mar", revenue: 98000000, umkm: 148, products: 1215, interactions: 3250 },
    { month: "Apr", revenue: 105000000, umkm: 151, products: 1230, interactions: 3380 },
    { month: "Mei", revenue: 112000000, umkm: 153, products: 1238, interactions: 3400 },
    { month: "Jun", revenue: 125000000, umkm: 156, products: 1247, interactions: 3421 }
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
  isCurrency = false,
  isMobile = false
}: {
  title: string;
  value: number;
  growth: number;
  icon: React.ElementType;
  color?: string;
  isCurrency?: boolean;
  isMobile?: boolean;
}) => {
  const colorClasses = {
    blue: "bg-blue-500/20 text-blue-600",
    green: "bg-green-500/20 text-green-600", 
    purple: "bg-purple-500/20 text-purple-600",
    orange: "bg-orange-500/20 text-orange-600"
  };

  return (
    <div className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300 ${isMobile ? 'p-3' : 'p-4'}`}>
      <div className={`flex items-center justify-between ${isMobile ? 'mb-2' : 'mb-3'}`}>
        <div className={`rounded-lg ${colorClasses[color as keyof typeof colorClasses]} backdrop-blur-sm ${isMobile ? 'p-1.5' : 'p-2'}`}>
          <Icon className={`${isMobile ? 'h-4 w-4' : 'h-5 w-5'}`} />
        </div>
        <GrowthIndicator growth={growth} isPositive={growth > 0} />
      </div>
      <div>
        <p className={`font-bold text-slate-900 mb-1 ${isMobile ? 'text-lg' : 'text-2xl'}`}>
          {isCurrency ? formatCurrency(value) : formatNumber(value)}
        </p>
        <p className={`text-slate-600 ${isMobile ? 'text-xs' : 'text-sm'}`}>{title}</p>
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
    <div className="flex items-start gap-3 p-3 bg-white/60 backdrop-blur-sm rounded-lg border border-white/30 hover:bg-white/80 transition-all duration-300">
      <div className="flex-shrink-0 mt-0.5">
        {getIcon(activity.type)}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-slate-900 font-medium">{activity.message}</p>
        <p className="text-xs text-slate-500">{activity.time}</p>
      </div>
      <div className="flex-shrink-0">
        <span className="text-xs font-medium text-slate-600 bg-white/50 px-2 py-1 rounded-full">{activity.value}</span>
      </div>
    </div>
  );
};

const TopUMKMCard = ({ umkm }: { umkm: any }) => (
  <div className="bg-white/70 backdrop-blur-md rounded-lg p-4 border border-white/20 hover:bg-white/80 transition-all duration-300 shadow-lg">
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
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  // Handle window resize
  React.useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

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
      <div className="min-h-screen relative overflow-hidden pb-28">
        {/* Background with gradient and blurry blobs */}
        <div className="absolute inset-0 bg-gradient-to-br from-blue-50 via-blue-100 to-blue-200">
          {/* Blurry blue blobs */}
          <div className="absolute top-0 -left-4 w-72 h-72 bg-blue-400 rounded-full mix-blend-multiply filter blur-xl opacity-25"></div>
          <div className="absolute top-0 -right-4 w-72 h-72 bg-blue-500 rounded-full mix-blend-multiply filter blur-xl opacity-25"></div>
          <div className="absolute -bottom-8 left-20 w-72 h-72 bg-blue-300 rounded-full mix-blend-multiply filter blur-xl opacity-25"></div>
          <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-blue-600 rounded-full mix-blend-multiply filter blur-xl opacity-25"></div>
        </div>
        
        <div className="relative z-10 px-4 pt-4 max-w-7xl mx-auto">
          {/* Header with Blue Gradient Background */}
          <div 
            className="relative overflow-hidden rounded-2xl p-4 mb-6"
            style={{
              background: 'linear-gradient(129deg, rgba(34, 84, 197, 1) 28%, rgba(69, 193, 255, 1) 100%)'
            }}
          >
            {/* Pattern Background */}
            <div
              className="absolute inset-0 opacity-20 bg-cover bg-center bg-no-repeat"
              style={{
                backgroundImage: 'url("/images/header-pattern.svg")',
                backgroundSize: '50%'
              }}
            />
            
            {/* Content Layer */}
            <div className="relative z-10">
              <div className={`flex items-center justify-between mb-2 ${isMobile ? 'flex-col gap-3' : ''}`}>
                <div className="flex items-center gap-3">
                  <img 
                    src="/images/ecosera-logo-white.svg" 
                    alt="Ecosera Logo" 
                    className={`${isMobile ? 'h-8 w-8' : 'h-10 w-10'}`}
                  />
                  <h1 className={`font-bold text-white ${isMobile ? 'text-xl' : 'text-2xl'}`}>Dashboard Admin</h1>
                </div>
                <div className={`flex items-center gap-2 ${isMobile ? 'w-full justify-between' : ''}`}>
                  <button className="p-2 rounded-lg bg-white/20 backdrop-blur-sm border border-white/30 hover:bg-white/30 transition-all duration-300">
                    <Filter className="h-4 w-4 text-white" />
                  </button>
                  <select 
                    value={timeRange}
                    onChange={(e) => setTimeRange(e.target.value)}
                    className={`text-sm border border-white/30 rounded-lg bg-white/20 backdrop-blur-sm focus:ring-2 focus:ring-white/50 focus:border-transparent transition-all duration-300 text-white ${isMobile ? 'px-2 py-1 text-xs flex-1' : 'px-3 py-2'}`}
                    style={{ color: 'white' }}
                  >
                    <option value="7d" style={{ color: '#1f2937' }}>7 Hari</option>
                    <option value="30d" style={{ color: '#1f2937' }}>30 Hari</option>
                    <option value="90d" style={{ color: '#1f2937' }}>90 Hari</option>
                    <option value="1y" style={{ color: '#1f2937' }}>1 Tahun</option>
                  </select>
                </div>
              </div>
              <p className={`text-white/90 ${isMobile ? 'text-sm' : ''}`}>Ringkasan performa platform Ecosera</p>
            </div>
          </div>

          {/* KPI Cards */}
          <div className={`grid gap-3 mb-6 ${isMobile ? 'grid-cols-2' : 'grid-cols-4'}`}>
            {kpiData.map((kpi, index) => (
              <KPICard key={index} {...kpi} isMobile={isMobile} />
            ))}
          </div>

          {/* Main Content Grid */}
          <div className={`grid gap-4 ${isMobile ? 'grid-cols-1' : 'grid-cols-3'}`}>
            {/* Recent Activity - Mobile: Full width, Desktop: 1/3 */}
            <div className={isMobile ? 'order-2' : ''}>
              <div className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300 ${isMobile ? 'p-3' : 'p-4'}`}>
                <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                  <h3 className={`font-semibold text-slate-900 ${isMobile ? 'text-sm' : ''}`}>Aktivitas Terbaru</h3>
                  <button className={`text-blue-600 hover:text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Lihat Semua
                  </button>
                </div>
                <div className={`space-y-2 ${isMobile ? '' : 'space-y-3'}`}>
                  {MOCK_DATA.recentActivity.slice(0, isMobile ? 3 : 4).map((activity) => (
                    <ActivityItem key={activity.id} activity={activity} />
                  ))}
                </div>
              </div>
            </div>

            {/* Top UMKM - Mobile: Full width, Desktop: 2/3 */}
            <div className={`${isMobile ? 'order-1' : 'col-span-2'}`}>
              <div className={`bg-white/70 backdrop-blur-md rounded-xl shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300 ${isMobile ? 'p-3' : 'p-4'}`}>
                <div className={`flex items-center justify-between ${isMobile ? 'mb-3' : 'mb-4'}`}>
                  <h3 className={`font-semibold text-slate-900 ${isMobile ? 'text-sm' : ''}`}>Top UMKM</h3>
                  <button className={`text-blue-600 hover:text-blue-700 ${isMobile ? 'text-xs' : 'text-sm'}`}>
                    Lihat Semua
                  </button>
                </div>
                <div className={`grid gap-2 ${isMobile ? 'grid-cols-1' : 'grid-cols-2'}`}>
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
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-6 shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300">
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-lg font-semibold text-slate-900">Tren Omzet Bulanan</h3>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="h-5 w-5 text-slate-600" />
                    <span className="text-sm text-slate-600">6 Bulan Terakhir</span>
                  </div>
                </div>
                
                {/* Enhanced Bar Chart with Multiple Metrics */}
                <div className="space-y-6">
                  {/* Revenue Chart */}
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="text-sm font-medium text-slate-700">Omzet (Rupiah)</h4>
                      <span className="text-xs text-slate-500">Total: {formatCurrency(MOCK_DATA.monthlyRevenue.reduce((sum, d) => sum + d.revenue, 0))}</span>
                    </div>
                    
                    {/* Bar Chart */}
                    <div className="h-48 flex items-end justify-between gap-2 mb-4">
                      {MOCK_DATA.monthlyRevenue.map((data, index) => {
                        const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                        const height = Math.max((data.revenue / maxRevenue) * 100, 15); // Minimum 15% height
                        const isLatest = index === MOCK_DATA.monthlyRevenue.length - 1;
                        
                        return (
                          <div key={index} className="flex-1 flex flex-col items-center group">
                            <div className="relative w-full h-48 flex items-end">
                              <div 
                                className={`w-full rounded-t-lg transition-all duration-300 group-hover:shadow-lg ${
                                  isLatest 
                                    ? 'bg-gradient-to-t from-blue-600 to-blue-500' 
                                    : 'bg-gradient-to-t from-blue-400 to-blue-300'
                                }`}
                                style={{ height: `${height}%` }}
                              />
                              <div className="absolute -top-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                                <div className="bg-slate-800 text-white text-xs px-2 py-1 rounded whitespace-nowrap">
                                  {formatCurrency(data.revenue)}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs text-slate-600 font-medium mt-2">{data.month}</span>
                            <span className="text-xs text-slate-500 mt-1">
                              {formatCurrency(data.revenue).replace('Rp', '').replace(',', '.')}
                            </span>
                          </div>
                        );
                      })}
                    </div>

                    {/* Line Chart */}
                    <div className="h-32 relative">
                      <svg className="w-full h-full" viewBox="0 0 400 120">
                        <defs>
                          <linearGradient id="lineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" stopColor="#3B82F6" />
                            <stop offset="100%" stopColor="#1D4ED8" />
                          </linearGradient>
                        </defs>
                        <polyline
                          fill="none"
                          stroke="url(#lineGradient)"
                          strokeWidth="3"
                          points={MOCK_DATA.monthlyRevenue.map((data, index) => {
                            const x = (index / (MOCK_DATA.monthlyRevenue.length - 1)) * 350 + 25;
                            const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                            const y = 100 - ((data.revenue / maxRevenue) * 80) + 10;
                            return `${x},${y}`;
                          }).join(' ')}
                        />
                        {MOCK_DATA.monthlyRevenue.map((data, index) => {
                          const x = (index / (MOCK_DATA.monthlyRevenue.length - 1)) * 350 + 25;
                          const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                          const y = 100 - ((data.revenue / maxRevenue) * 80) + 10;
                          const isLatest = index === MOCK_DATA.monthlyRevenue.length - 1;
                          
                          return (
                            <circle
                              key={index}
                              cx={x}
                              cy={y}
                              r="4"
                              fill={isLatest ? "#1D4ED8" : "#3B82F6"}
                              className="hover:r-6 transition-all duration-300"
                            />
                          );
                        })}
                      </svg>
                    </div>
                  </div>

                  {/* Additional Metrics */}
                  <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-200">
                    <div className="text-center">
                      <div className="text-2xl font-bold text-blue-600 mb-1">
                        {MOCK_DATA.monthlyRevenue[MOCK_DATA.monthlyRevenue.length - 1].umkm}
                      </div>
                      <div className="text-xs text-slate-600">UMKM Aktif</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-green-600 mb-1">
                        {MOCK_DATA.monthlyRevenue[MOCK_DATA.monthlyRevenue.length - 1].products}
                      </div>
                      <div className="text-xs text-slate-600">Produk Aktif</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold text-purple-600 mb-1">
                        {formatNumber(MOCK_DATA.monthlyRevenue[MOCK_DATA.monthlyRevenue.length - 1].interactions)}
                      </div>
                      <div className="text-xs text-slate-600">Interaksi</div>
                    </div>
                  </div>

                  {/* Growth Indicators */}
                  <div className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-slate-600">Omzet</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-slate-600">UMKM</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
                        <span className="text-slate-600">Interaksi</span>
                      </div>
                    </div>
                    <div className="text-slate-500">
                      Rata-rata pertumbuhan: +12.5%
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Mobile Revenue Chart & Summary */}
          {isMobile && (
            <div className="mt-4 space-y-4">
              {/* Mobile Revenue Chart */}
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Tren Omzet</h3>
                <div className="h-32 relative">
                  <svg className="w-full h-full" viewBox="0 0 300 100">
                    <defs>
                      <linearGradient id="mobileLineGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#3B82F6" />
                        <stop offset="100%" stopColor="#1D4ED8" />
                      </linearGradient>
                    </defs>
                    <polyline
                      fill="none"
                      stroke="url(#mobileLineGradient)"
                      strokeWidth="2"
                      points={MOCK_DATA.monthlyRevenue.map((data, index) => {
                        const x = (index / (MOCK_DATA.monthlyRevenue.length - 1)) * 250 + 25;
                        const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                        const y = 80 - ((data.revenue / maxRevenue) * 60) + 10;
                        return `${x},${y}`;
                      }).join(' ')}
                    />
                    {MOCK_DATA.monthlyRevenue.map((data, index) => {
                      const x = (index / (MOCK_DATA.monthlyRevenue.length - 1)) * 250 + 25;
                      const maxRevenue = Math.max(...MOCK_DATA.monthlyRevenue.map(d => d.revenue));
                      const y = 80 - ((data.revenue / maxRevenue) * 60) + 10;
                      const isLatest = index === MOCK_DATA.monthlyRevenue.length - 1;
                      
                      return (
                        <circle
                          key={index}
                          cx={x}
                          cy={y}
                          r="3"
                          fill={isLatest ? "#1D4ED8" : "#3B82F6"}
                        />
                      );
                    })}
                  </svg>
                </div>
                <div className="flex justify-between text-xs text-slate-500 mt-2">
                  <span>Jan</span>
                  <span>Feb</span>
                  <span>Mar</span>
                  <span>Apr</span>
                  <span>Mei</span>
                  <span>Jun</span>
                </div>
              </div>

              {/* Mobile Summary Stats */}
              <div className="bg-white/70 backdrop-blur-md rounded-xl p-3 shadow-lg border border-white/20 hover:bg-white/80 transition-all duration-300">
                <h3 className="font-semibold text-slate-900 text-sm mb-3">Ringkasan Cepat</h3>
                <div className="grid grid-cols-2 gap-3">
                  <div className="text-center">
                    <p className="text-xl font-bold text-blue-600">{MOCK_DATA.topUMKM.length}</p>
                    <p className="text-xs text-slate-600">Top UMKM</p>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-bold text-green-600">
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
