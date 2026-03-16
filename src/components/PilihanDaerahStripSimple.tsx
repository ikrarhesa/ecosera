import { useState, useEffect } from 'react';
import { Star, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useProducts } from '../context/ProductsContext';


import { formatCurrencyIDR, km } from '../utils/format';
import { haversineKm } from '../utils/geo';
import { UI } from '../config/ui';

type TabType = 'nearby' | 'popular' | 'new';

export default function PilihanDaerahStripSimple() {
  const { products: allProducts, loading: contextLoading } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(() => {
    try {
      const cached = localStorage.getItem('ecosera_user_location');
      return cached ? JSON.parse(cached) : null;
    } catch {
      return null;
    }
  });

  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>(() => {
    try {
      return (localStorage.getItem('ecosera_location_permission') as 'granted' | 'denied' | 'prompt') || 'prompt';
    } catch {
      return 'prompt';
    }
  });

  // Request location permission
  useEffect(() => {
    if (locationPermission === 'prompt') {
      if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition(
          (position) => {
            const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
            setUserLocation(loc);
            setLocationPermission('granted');
            try {
              localStorage.setItem('ecosera_user_location', JSON.stringify(loc));
              localStorage.setItem('ecosera_location_permission', 'granted');
            } catch { }
          },
          (error) => {
            console.log('Location permission denied:', error);
            setLocationPermission('denied');
            const defaultLoc = { lat: -3.8, lng: 103.8 };
            setUserLocation(defaultLoc);
            try {
              localStorage.setItem('ecosera_user_location', JSON.stringify(defaultLoc));
              localStorage.setItem('ecosera_location_permission', 'denied');
            } catch { }
          }
        );
      } else {
        setLocationPermission('denied');
        const defaultLoc = { lat: -3.8, lng: 103.8 };
        setUserLocation(defaultLoc);
        try {
          localStorage.setItem('ecosera_user_location', JSON.stringify(defaultLoc));
          localStorage.setItem('ecosera_location_permission', 'denied');
        } catch { }
      }
    }
  }, [locationPermission]);

  useEffect(() => {
    if (contextLoading) return;

    let filteredProducts: Product[] = [];

    switch (activeTab) {
      case 'nearby':
        if (userLocation) {
          // Sort by distance using real seller coordinates
          filteredProducts = [...allProducts]
            .map(product => {
              const hasCoords = product.sellerLat != null && product.sellerLng != null;
              if (hasCoords) {
                const distance = haversineKm(
                  userLocation.lat, userLocation.lng,
                  product.sellerLat!, product.sellerLng!
                );
                return { ...product, distance };
              }
              return { ...product, distance: Infinity };
            })
            .sort((a, b) => (a as any).distance - (b as any).distance)
            .slice(0, 6);
        } else {
          filteredProducts = [...allProducts].slice(0, 6);
        }
        break;
      case 'popular':
        // Sort by sold count (most selling)
        filteredProducts = [...allProducts]
          .sort((a, b) => (b.sold || 0) - (a.sold || 0))
          .slice(0, 6);
        break;
      case 'new':
        // Sort by created_at if available, else by ID
        filteredProducts = [...allProducts]
          .sort((a, b) => {
            const dateA = (a as any).created_at ? new Date((a as any).created_at).getTime() : 0;
            const dateB = (b as any).created_at ? new Date((b as any).created_at).getTime() : 0;
            if (dateA !== dateB) return dateB - dateA;
            return b.id.localeCompare(a.id);
          })
          .slice(0, 6);
        break;
    }

    setProducts(filteredProducts);
  }, [activeTab, userLocation, allProducts, contextLoading]);


  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'nearby': return 'Dekat Kamu';
      case 'popular': return 'Paling Laris';
      case 'new': return 'Paling Baru';
    }
  };

  const getTabDescription = (tab: TabType) => {
    switch (tab) {
      case 'nearby': return 'Produk dari penjual terdekat';
      case 'popular': return 'Produk paling laris minggu ini';
      case 'new': return 'Produk paling baru dari penjual pilihan';
    }
  };

  const [minLoading, setMinLoading] = useState(contextLoading);

  useEffect(() => {
    let timer: any;
    if (contextLoading) {
      timer = setTimeout(() => setMinLoading(false), 800);
    } else {
      setMinLoading(false);
    }
    return () => timer && clearTimeout(timer);
  }, [contextLoading]);

  if (contextLoading || minLoading) {
    return (
      <div className="mb-6 mt-2 p-[14px] rounded-2xl bg-white border border-slate-100 animate-pulse">
        <div className="h-6 w-32 bg-slate-200 rounded mb-4" />
        <div className="flex gap-2.5 mb-4">
          {[1, 2, 3].map(i => <div key={i} className="h-8 w-24 bg-slate-200 rounded-full" />)}
        </div>
        <div className="h-4 w-48 bg-slate-200 rounded mb-4" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[122px] shrink-0 aspect-[1/1.6] bg-slate-200 rounded-xl" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 mt-2 p-[14px] rounded-2xl bg-gradient-to-br from-blue-50/80 to-blue-100/50 border border-blue-100/50 shadow-sm">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-bold text-blue-900 text-lg">Pilihan Daerah</h3>
      </div>

      {/* Tab buttons - Horizontal scrollable to prevent wrapping on mobile */}
      <div className="flex gap-2.5 mb-3 overflow-x-auto scrollbar-hide -mx-1 px-1">
        {(['nearby', 'popular', 'new'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-[34px] px-4 shrink-0 rounded-full border text-xs font-bold transition-all whitespace-nowrap ${activeTab === tab
              ? 'text-white border-blue-600 shadow-sm shadow-blue-200/50'
              : 'bg-white/80 text-blue-800 border-blue-100/50 hover:bg-white hover:border-blue-200'
              }`}
            style={activeTab === tab ? { backgroundColor: UI.BRAND.PRIMARY, borderColor: UI.BRAND.PRIMARY } : undefined}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="text-xs text-blue-800/80 mb-3 font-medium">
        {getTabDescription(activeTab)}
        {activeTab === 'nearby' && locationPermission === 'denied' && (
          <span className="text-orange-600 ml-2">• Lokasi tidak tersedia</span>
        )}
      </div>

      {/* Location permission request for nearby tab */}
      {activeTab === 'nearby' && locationPermission === 'denied' && (
        <div className="mb-2 p-2 bg-orange-50 border border-orange-200 rounded-lg">
          <div className="flex items-center gap-2">
            <Navigation className="h-4 w-4 text-orange-600" />
            <span className="text-xs text-orange-700">
              Izinkan akses lokasi untuk melihat produk terdekat
            </span>
            <button
              onClick={() => {
                if (navigator.geolocation) {
                  navigator.geolocation.getCurrentPosition(
                    (position) => {
                      const loc = { lat: position.coords.latitude, lng: position.coords.longitude };
                      setUserLocation(loc);
                      setLocationPermission('granted');
                      try {
                        localStorage.setItem('ecosera_user_location', JSON.stringify(loc));
                        localStorage.setItem('ecosera_location_permission', 'granted');
                      } catch { }
                    },
                    () => {
                      setLocationPermission('denied');
                      try {
                        localStorage.setItem('ecosera_location_permission', 'denied');
                      } catch { }
                    }
                  );
                }
              }}
              className="text-xs text-orange-600 underline hover:text-orange-800"
            >
              Coba lagi
            </button>
          </div>
        </div>
      )}

      <div className="flex gap-[11px] overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.slug || product.id}`} className="block w-[122px] shrink-0 rounded-xl bg-white border border-slate-200 p-2 hover:border-blue-300 transition-colors shadow-sm">
            {/* Image */}
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={product.image || UI.PLACEHOLDER}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = UI.PLACEHOLDER;
                }}
              />
            </div>

            {/* Name */}
            <div className="mt-2 text-xs font-bold truncate text-slate-900">
              {product.name}
            </div>

            {/* Price */}
            <div className="mt-0.5 flex items-baseline truncate">
              <span className="text-[12px] font-bold" style={{ color: UI.BRAND.PRIMARY }}>
                {formatCurrencyIDR(product.price)}
              </span>
              <span className="text-[10px] text-slate-500 ml-0.5 truncate">
                /{product.unit}
              </span>
            </div>

            {/* Rating and Sold */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-[11px] text-slate-600">{product.rating}</span>
              <span className="text-[10px] text-slate-400">•</span>
              <span className="text-[11px] text-slate-600 truncate">{product.sold}</span>
            </div>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-1 mt-1 w-full">
                <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-[11px] text-slate-500 truncate min-w-0 flex-1">{product.location}</span>
              </div>
            )}

            {/* Tab-specific badges */}
            {activeTab === 'nearby' && (product as any).distance && (
              <div className="mt-1.5 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700 font-medium">
                <Navigation className="h-3 w-3 mr-1" />
                {km((product as any).distance)}
              </div>
            )}
            {activeTab === 'popular' && (
              <div className="mt-1.5 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-medium whitespace-nowrap">
                🔥 Laris
              </div>
            )}
            {activeTab === 'new' && (
              <div className="mt-1.5 inline-flex items-center text-[10px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700 font-medium whitespace-nowrap">
                ✨ Baru
              </div>
            )}

          </Link>
        ))}
      </div>
    </div>
  );
}
