import { useState, useMemo, useEffect } from "react";
import { useSearchParams } from "react-router-dom";
import { useProducts } from "../context/ProductsContext";
import { calculateDistance, requestUserLocation } from "../utils/distance";

export const SORT_OPTIONS = [
  { id: "default", name: "Default" },
  { id: "price-low", name: "Harga Terendah" },
  { id: "price-high", name: "Harga Tertinggi" },
  { id: "rating", name: "Rating Tertinggi" },
  { id: "newest", name: "Terbaru" }
];

export const DISTANCE_OPTIONS = [
  { id: "all", name: "Semua Jarak" },
  { id: "0-5", name: "0-5 km" },
  { id: "5-10", name: "5-10 km" },
  { id: "10-20", name: "10-20 km" },
  { id: "20+", name: "20+ km" }
];

export const PRICE_RANGES = [
  { id: "all", name: "Semua Harga", min: 0, max: Infinity },
  { id: "0-50k", name: "Rp 0 - 50k", min: 0, max: 50000 },
  { id: "50k-100k", name: "Rp 50k - 100k", min: 50000, max: 100000 },
  { id: "100k-200k", name: "Rp 100k - 200k", min: 100000, max: 200000 },
  { id: "200k+", name: "Rp 200k+", min: 200000, max: Infinity }
];

export function useProductSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [localQuery, setLocalQuery] = useState(query);
  const [sortBy, setSortBy] = useState("default");
  const [distance, setDistance] = useState("all");
  const [priceRange, setPriceRange] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);

  const { products } = useProducts();

  // Sync with search params
  useEffect(() => {
    setLocalQuery(query);
  }, [query]);

  // Handle location request only when distance filter is used
  useEffect(() => {
    if (distance !== "all" && !userLocation) {
      requestUserLocation().then(loc => {
        if (loc) setUserLocation(loc);
        else {
          alert("Gagal mendapatkan lokasi. Pastikan GPS aktif dan izin diberikan.");
          setDistance("all");
        }
      });
    }
  }, [distance, userLocation]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    // Filter by live local query
    if (localQuery.trim()) {
      const q = localQuery.toLowerCase();
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(q) ||
        (product.description && product.description.toLowerCase().includes(q)) ||
        product.tags?.some(tag => tag.toLowerCase().includes(q)) ||
        (product.sellerName && product.sellerName.toLowerCase().includes(q))
      );
    } else {
      filtered = []; // If no search query, return empty list (or can be changed as needed)
    }

    // Filter by price range
    if (priceRange !== "all") {
      const range = PRICE_RANGES.find(r => r.id === priceRange);
      if (range) {
        filtered = filtered.filter(product =>
          product.price >= range.min && product.price <= range.max
        );
      }
    }

    // Filter by distance
    if (distance !== "all" && userLocation) {
      let maxDist = Infinity;
      let minDist = 0;
      if (distance === "0-5") { maxDist = 5; }
      else if (distance === "5-10") { minDist = 5; maxDist = 10; }
      else if (distance === "10-20") { minDist = 10; maxDist = 20; }
      else if (distance === "20+") { minDist = 20; }

      filtered = filtered.filter(product => {
        if (product.sellerLat == null || product.sellerLng == null) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, product.sellerLat, product.sellerLng);
        return dist >= minDist && dist <= maxDist;
      });
    }

    // Sort products
    switch (sortBy) {
      case "price-low":
        filtered.sort((a, b) => a.price - b.price);
        break;
      case "price-high":
        filtered.sort((a, b) => b.price - a.price);
        break;
      case "rating":
        filtered.sort((a, b) => (b.rating || 0) - (a.rating || 0));
        break;
      case "newest":
        filtered.sort((a, b) => b.id.localeCompare(a.id));
        break;
      default:
        break;
    }

    return filtered;
  }, [products, localQuery, sortBy, priceRange, distance, userLocation]);

  // Compute suggestions
  const suggestions = useMemo(() => (
    localQuery.trim()
      ? products.filter(p =>
        p.name.toLowerCase().includes(localQuery.toLowerCase()) ||
        (p.category || "").toLowerCase().includes(localQuery.toLowerCase()) ||
        (p.sellerName && p.sellerName.toLowerCase().includes(localQuery.toLowerCase()))
      ).slice(0, 2)
      : []
  ), [products, localQuery]);

  const resetFilters = () => {
    setSortBy("default");
    setDistance("all");
    setPriceRange("all");
  };

  const applyQuery = (q: string) => {
    setSearchParams({ q });
  };

  return {
    localQuery,
    setLocalQuery,
    sortBy,
    setSortBy,
    distance,
    setDistance,
    priceRange,
    setPriceRange,
    filteredProducts,
    suggestions,
    resetFilters,
    applyQuery
  };
}
