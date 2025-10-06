import React, { useState, useEffect } from 'react';
import { Star, MapPin, Plus, MessageCircle, Navigation } from 'lucide-react';
import { useCart } from '../context/CartContext';
import { useToast } from '../context/ToastContext';
import type { Product } from '../types/product';
import { getAllProducts } from '../services/products';

interface PilihanDaerahStripProps {
  onAdd?: (itemId: string) => void;
}

type TabType = 'nearby' | 'popular' | 'new';

const money = (n: number) => n.toLocaleString("id-ID");

// Simple distance calculation (Haversine formula)
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 6371; // Earth's radius in kilometers
  const dLat = (lat2 - lat1) * Math.PI / 180;
  const dLon = (lon2 - lon1) * Math.PI / 180;
  const a = Math.sin(dLat/2) * Math.sin(dLat/2) +
    Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
    Math.sin(dLon/2) * Math.sin(dLon/2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
  return R * c;
}

// Mock location data for sellers (in real app, this would come from your database)
const sellerLocations: Record<string, { lat: number; lng: number; name: string }> = {
  'kopi-semendo': { lat: -3.8, lng: 103.8, name: 'Kebun Kopi Semendo' },
  'gula-aren': { lat: -3.9, lng: 103.9, name: 'Gula Aren Tradisional' },
  'kemplang': { lat: -3.7, lng: 103.7, name: 'Kemplang Palembang Asli' },
  'anyaman-purun': { lat: -3.6, lng: 103.6, name: 'Kerajinan Purun Lokal' },
  'dodol-kelapa': { lat: -3.8, lng: 103.8, name: 'Dodol Kelapa Semendo' },
  'serai-wangi': { lat: -3.5, lng: 103.5, name: 'Aromaterapi Serai Wangi' },
  'kerupuk-palembang': { lat: -3.7, lng: 103.7, name: 'Kemplang Palembang Asli' },
  'batik-kujur-kain': { lat: -3.4, lng: 103.4, name: 'Batik Muara Enim' },
  'batik-kujur-baju': { lat: -3.4, lng: 103.4, name: 'Batik Muara Enim' },
  'batik-kujur-selendang': { lat: -3.4, lng: 103.4, name: 'Batik Muara Enim' },
};

export default function PilihanDaerahStripSimple({ onAdd }: PilihanDaerahStripProps) {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<TabType>('nearby');
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [locationPermission, setLocationPermission] = useState<'granted' | 'denied' | 'prompt'>('prompt');
  const { addToCart } = useCart();
  const { show: showToast } = useToast();

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
    getAllProducts().then(allProducts => {
      let filteredProducts: Product[] = [];
      
      switch (activeTab) {
        case 'nearby':
          if (userLocation) {
            // Sort by distance
            filteredProducts = allProducts
              .map(product => {
                const sellerLoc = sellerLocations[product.id];
                if (sellerLoc) {
                  const distance = calculateDistance(
                    userLocation.lat, userLocation.lng,
                    sellerLoc.lat, sellerLoc.lng
                  );
                  return { ...product, distance };
                }
                return { ...product, distance: 999 };
              })
              .sort((a, b) => (a as any).distance - (b as any).distance)
              .slice(0, 6);
          } else {
            filteredProducts = allProducts.slice(0, 6);
          }
          break;
        case 'popular':
          // Sort by sold count (most selling)
          filteredProducts = allProducts
            .sort((a, b) => b.sold - a.sold)
            .slice(0, 6);
          break;
        case 'new':
          // Sort by ID (assuming newer products have higher IDs) or by featured
          filteredProducts = allProducts
            .filter(p => p.featured)
            .sort((a, b) => b.id.localeCompare(a.id))
            .slice(0, 6);
          break;
      }
      
      setProducts(filteredProducts);
      setLoading(false);
    });
  }, [activeTab, userLocation]);

  const handleAddToCart = (product: Product) => {
    addToCart({
      id: product.id,
      name: product.name,
      price: product.price,
      thumb: product.thumb || product.image
    }, 1);
    
    // Show toast notification
    showToast(`${product.name} ditambahkan ke keranjang`);
    
    onAdd?.(product.id);
  };

  const getTabLabel = (tab: TabType) => {
    switch (tab) {
      case 'nearby': return 'Dekat Kamu';
      case 'popular': return 'Terlaris';
      case 'new': return 'Baru';
    }
  };

  const getTabDescription = (tab: TabType) => {
    switch (tab) {
      case 'nearby': return 'Produk dari penjual terdekat';
      case 'popular': return 'Produk terlaris minggu ini';
      case 'new': return 'Produk terbaru dari penjual pilihan';
    }
  };

  if (loading) {
    return (
      <div className="mb-3 mt-3">
        <div className="flex items-center justify-between mb-2">
          <h3 className="font-semibold">Pilihan Daerah</h3>
        </div>
        
        {/* Tab buttons skeleton */}
        <div className="flex gap-2 mb-2">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-8 w-20 bg-slate-200 rounded-full animate-pulse" />
          ))}
        </div>
        
        <div className="text-xs text-slate-600 mb-2">
          Memuat produk...
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
          {[1, 2, 3].map(i => (
            <div key={i} className="w-[156px] shrink-0 rounded-xl bg-white border border-slate-200 p-2">
              <div className="w-full aspect-square rounded-lg bg-slate-100 animate-pulse" />
              <div className="mt-2 h-4 bg-slate-200 rounded animate-pulse" />
              <div className="mt-1 h-3 bg-slate-200 rounded animate-pulse w-2/3" />
              <div className="mt-2 h-6 bg-slate-200 rounded animate-pulse" />
            </div>
          ))}
        </div>
      </div>
    );
  }

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
            className={`h-8 px-3 rounded-full border text-sm font-medium transition-colors ${
              activeTab === tab
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
      
      <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
        {products.map((product) => (
          <div key={product.id} className="w-[156px] shrink-0 rounded-xl bg-white border border-slate-200 p-2">
            {/* Image */}
            <div className="w-full aspect-square rounded-lg overflow-hidden">
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
            <div className="mt-2 text-sm line-clamp-2 text-slate-900">
              {product.name}
            </div>

            {/* Price */}
            <div className="mt-1 flex items-baseline">
              <span className="text-sm font-semibold text-blue-600">
                Rp {money(product.price)}
              </span>
              <span className="text-xs text-slate-600 ml-1">
                {product.unit}
              </span>
            </div>

            {/* Rating and Sold */}
            <div className="flex items-center gap-1 mt-1">
              <Star className="h-3 w-3 fill-yellow-400 text-yellow-400" />
              <span className="text-xs text-slate-600">{product.rating}</span>
              <span className="text-xs text-slate-400">•</span>
              <span className="text-xs text-slate-600">{product.sold} terjual</span>
            </div>

            {/* Location */}
            {product.location && (
              <div className="flex items-center gap-1 mt-1">
                <MapPin className="h-3 w-3 text-slate-500 flex-shrink-0" />
                <span className="text-xs text-slate-500 truncate">{product.location}</span>
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
                🔥 Terlaris
              </div>
            )}
            {activeTab === 'new' && (
              <div className="mt-1 inline-flex items-center text-[11px] px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                ✨ Baru
              </div>
            )}

            {/* Actions */}
            <div className="mt-2 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleAddToCart(product)}
                className="h-8 rounded-lg text-sm font-medium bg-blue-600 text-white hover:bg-blue-700 transition-colors"
              >
                <Plus className="h-3 w-3 mx-auto" />
              </button>
              <button
                className="h-8 rounded-lg text-sm font-medium bg-white text-slate-900 border border-slate-200 hover:bg-slate-50 transition-colors"
              >
                <MessageCircle className="h-3 w-3 mx-auto" />
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
