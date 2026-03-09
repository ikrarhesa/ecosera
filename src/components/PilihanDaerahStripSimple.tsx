import { useState, useEffect } from 'react';
import { Star, MapPin, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';
import type { Product } from '../types/product';
import { useProducts } from '../context/ProductsContext';


type TabType = 'nearby' | 'popular' | 'new';

const money = (n: number) => n.toLocaleString("id-ID");

// Haversine distance calculation (km)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371;
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon / 2) * Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return R * c;
}

export default function PilihanDaerahStripSimple() {
  const { products: allProducts, loading: contextLoading } = useProducts();
  const [products, setProducts] = useState<Product[]>([]);
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');

  // Request location permission
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
          setLocationPermission('granted');
        },
        (error) => {
          console.log('Location permission denied:', error);
          setLocationPermission('denied');
          // Set default location (Muara Enim area)
          setUserLocation({ lat: -3.8, lng: 103.8 });
        }
      );
    } else {
      setLocationPermission('denied');
      setUserLocation({ lat: -3.8, lng: 103.8 }); // Default to Muara Enim
    }
  }, []);

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
                const distance = calculateDistance(
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

  if (contextLoading) return null; // Return nothing while waiting, the parent Home page has its own skeleton loader anyway

  return (
    <div className="mb-3 mt-3">
      <div className="flex items-center justify-between mb-2">
        <h3 className="font-semibold">Pilihan Daerah</h3>
      </div>

      {/* Tab buttons */}
      <div className="flex gap-2 mb-2">
        {(['nearby', 'popular', 'new'] as TabType[]).map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`h-8 px-3 rounded-full border text-sm font-medium transition-colors ${activeTab === tab
              ? 'bg-blue-600 text-white border-transparent'
              : 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50'
              }`}
          >
            {getTabLabel(tab)}
          </button>
        ))}
      </div>

      <div className="text-xs text-slate-600 mb-2">
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
                      setUserLocation({
                        lat: position.coords.latitude,
                        lng: position.coords.longitude
                      });
                      setLocationPermission('granted');
                    },
                    () => setLocationPermission('denied')
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

      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide px-1 -mx-1">
        {products.map((product) => (
          <Link key={product.id} to={`/product/${product.slug || product.id}`} className="block w-[156px] shrink-0 rounded-xl bg-white border border-slate-200 p-2 hover:border-blue-300 transition-colors">
            {/* Image */}
            <div className="w-full aspect-square rounded-lg overflow-hidden bg-slate-100">
              <img
                src={product.image || "https://placehold.co/800x800/png?text=Ecosera"}
                alt={product.name}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  (e.currentTarget as HTMLImageElement).src = "https://placehold.co/800x800/png?text=Ecosera";
                }}
              />
            </div>

            {/* Name */}
            <div className="mt-2 text-sm font-medium truncate text-slate-900">
              {product.name}
            </div>

            {/* Price */}
            <div className="mt-1 flex items-baseline">
              <span className="text-sm font-bold text-blue-600">
                Rp {money(product.price)}
              </span>
              <span className="text-[10px] text-slate-500 ml-1 truncate">
                / {product.unit}
              </span>
            </div>

            {/* Rating and Sold */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-600">{product.rating}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">{product.sold} tertarik</span>
            </div>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-1 mt-1 w-full">
                <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate min-w-0 flex-1">{product.location}</span>
              </div>
            )}

            {/* Tab-specific badges */}
            {activeTab === 'nearby' && (product as any).distance && (
              <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-blue-100 text-blue-700">
                <Navigation className="h-3 w-3 mr-1" />
                {(product as any).distance.toFixed(1)} km
              </div>
            )}
            {activeTab === 'popular' && (
              <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-green-100 text-green-700">
                🔥 Paling Laris
              </div>
            )}
            {activeTab === 'new' && (
              <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                ✨ Paling Baru
              </div>
            )}

          </Link>
        ))}
      </div>
    </div>
  );
}
