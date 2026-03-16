import { useState, useEffect, useMemo } from "react";
import { useProducts } from "../context/ProductsContext";
import { getCategories, getCachedCategories } from "../services/categories";
import { calculateDistance, requestUserLocation } from "../utils/distance";

export function useHomeProducts() {
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [distance, setDistance] = useState("all");
  const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
  
  const cachedCats = useMemo(() => getCachedCategories(), []);
  const [categories, setCategories] = useState<{ id: string, name: string }[]>(() => {
    if (cachedCats) return [{ id: "all", name: "Semua" }, ...cachedCats];
    return [{ id: "all", name: "Semua" }];
  });
  
  const { products, loading } = useProducts();

  useEffect(() => {
    getCategories().then(data => {
      setCategories([{ id: "all", name: "Semua" }, ...data]);
    });
  }, []);

  useEffect(() => {
    if (distance !== "all" && !userLocation) {
      requestUserLocation().then(loc => {
        if (loc) setUserLocation(loc);
        else {
          setDistance("all");
        }
      });
    }
  }, [distance, userLocation]);

  const categoriesWithCounts = useMemo(() => {
    return categories.map(category => {
      if (category.id === "all") {
        return { ...category, count: products.length };
      }
      const count = products.filter(p => p.categories?.includes(category.id)).length;
      return { ...category, count };
    });
  }, [products, categories]);

  const filteredProducts = useMemo(() => {
    let filtered = [...products];

    if (selectedCategory !== "all") {
      filtered = filtered.filter(p => p.categories?.includes(selectedCategory));
    }

    if (distance !== "all" && userLocation) {
      let maxDist = Infinity;
      let minDist = 0;
      if (distance === "0-5") { maxDist = 5; }
      else if (distance === "5-10") { minDist = 5; maxDist = 10; }
      else if (distance === "10-20") { minDist = 10; maxDist = 20; }
      else if (distance === "20+") { minDist = 20; }

      filtered = filtered.filter(p => {
        if (p.sellerLat == null || p.sellerLng == null) return false;
        const dist = calculateDistance(userLocation.lat, userLocation.lng, p.sellerLat, p.sellerLng);
        return dist >= minDist && dist <= maxDist;
      });
    }

    return filtered;
  }, [products, selectedCategory, distance, userLocation]);

  return {
    products: filteredProducts,
    loading,
    categories: categoriesWithCounts,
    selectedCategory,
    setSelectedCategory,
    distance,
    setDistance,
    userLocation
  };
}
