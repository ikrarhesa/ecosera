import React, { useState, useMemo } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { Search as SearchIcon, Filter, ArrowLeft, Store } from "lucide-react";
import { Link } from "react-router-dom";
import ProductCard from "../components/ProductCard";
import { useProducts } from "../context/ProductsContext";
import { calculateDistance, requestUserLocation } from "../utils/distance";

/* ===== Sort Options ===== */
const SORT_OPTIONS = [
    { id: "default", name: "Default" },
    { id: "price-low", name: "Harga Terendah" },
    { id: "price-high", name: "Harga Tertinggi" },
    { id: "rating", name: "Rating Tertinggi" },
    { id: "newest", name: "Terbaru" }
];

const DISTANCE_OPTIONS = [
    { id: "all", name: "Semua Jarak" },
    { id: "0-5", name: "0-5 km" },
    { id: "5-10", name: "5-10 km" },
    { id: "10-20", name: "10-20 km" },
    { id: "20+", name: "20+ km" }
];

const PRICE_RANGES = [
    { id: "all", name: "Semua Harga", min: 0, max: Infinity },
    { id: "0-50k", name: "Rp 0 - 50k", min: 0, max: 50000 },
    { id: "50k-100k", name: "Rp 50k - 100k", min: 50000, max: 100000 },
    { id: "100k-200k", name: "Rp 100k - 200k", min: 100000, max: 200000 },
    { id: "200k+", name: "Rp 200k+", min: 200000, max: Infinity }
];

export default function Search() {
    const [searchParams, setSearchParams] = useSearchParams();
    const navigate = useNavigate();
    const query = searchParams.get("q") || "";

    const [localQuery, setLocalQuery] = useState(query);
    const [isFocused, setIsFocused] = useState(false);
    const [sortBy, setSortBy] = useState("default");
    const [distance, setDistance] = useState("all");
    const [priceRange, setPriceRange] = useState("all");
    const [showFilters, setShowFilters] = useState(false);
    const [userLocation, setUserLocation] = useState<{ lat: number; lng: number } | null>(null);
    const containerRef = React.useRef<HTMLFormElement>(null);

    const { products } = useProducts();

    React.useEffect(() => {
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

    // Close suggestions when clicking outside
    React.useEffect(() => {
        function handleClickOutside(event: MouseEvent) {
            if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
                setIsFocused(false);
            }
        }
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSearchSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        if (localQuery.trim()) {
            setSearchParams({ q: localQuery });
        }
    };

    // Filter and sort products
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
            filtered = []; // If no search query, maybe show nothing or popular items
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
                if (product.sellerLat == null || product.sellerLng == null) return false; // Ignore products without location
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
    const suggestions = localQuery.trim()
        ? products.filter(p =>
            p.name.toLowerCase().includes(localQuery.toLowerCase()) ||
            (p.category || "").toLowerCase().includes(localQuery.toLowerCase()) ||
            (p.sellerName && p.sellerName.toLowerCase().includes(localQuery.toLowerCase()))
        ).slice(0, 2) // Limit to 2 suggestions
        : [];

    return (
        <div className="min-h-screen bg-[#F6F8FC] pb-28">
            {/* Search Header */}
            <div className="sticky top-0 z-20 bg-white border-b border-slate-200 shadow-sm">
                <div className="px-4 py-3 pb-2 flex items-center gap-3">
                    <button onClick={() => navigate(-1)} className="p-2 -ml-2 rounded-xl text-slate-700 hover:bg-slate-100">
                        <ArrowLeft className="h-5 w-5" />
                    </button>

                    <form ref={containerRef} onSubmit={handleSearchSubmit} className="flex-1 flex items-center gap-3">
                        <div className="relative flex-1">
                            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none z-10">
                                <SearchIcon className="h-4 w-4 text-slate-400" />
                            </div>
                            <input
                                type="text"
                                placeholder="Cari produk..."
                                value={localQuery}
                                onFocus={() => setIsFocused(true)}
                                onChange={(e) => {
                                    setLocalQuery(e.target.value);
                                    setIsFocused(true);
                                }}
                                autoFocus
                                className="w-full pl-10 pr-4 py-2.5 bg-slate-100 border-none rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 relative z-0"
                            />

                            {/* Suggestions Dropdown */}
                            {isFocused && localQuery.trim().length > 0 && suggestions.length > 0 && (
                                <div className="absolute top-full left-0 right-0 mt-2 bg-white rounded-xl shadow-lg border border-slate-100 overflow-hidden z-[100]">
                                    <div className="py-2">
                                        {suggestions.map(product => (
                                            <Link
                                                key={product.id}
                                                to={`/product/${product.slug || product.id}`}
                                                className="flex items-center gap-3 px-4 py-2 hover:bg-slate-50 transition-colors border-b border-slate-50 last:border-0"
                                            >
                                                <div className="w-10 h-10 rounded-lg bg-slate-100 overflow-hidden shrink-0 border border-slate-200">
                                                    <img
                                                        src={product.image || "https://placehold.co/800x800/png?text=Ecosera"}
                                                        alt={product.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                </div>
                                                <div className="flex-1 min-w-0">
                                                    <h4 className="text-sm font-medium text-slate-900 truncate">{product.name}</h4>
                                                    <div className="flex items-center gap-2 mt-0.5">
                                                        <span className="text-xs font-semibold text-blue-600">Rp {product.price.toLocaleString("id-ID")}</span>
                                                        {product.sellerName && (
                                                            <span className="text-[10px] text-slate-500 flex items-center gap-0.5 truncate border-l border-slate-300 pl-2">
                                                                <Store className="h-3 w-3 shrink-0" /> {product.sellerName}
                                                            </span>
                                                        )}
                                                    </div>
                                                </div>
                                            </Link>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </form>

                    <button
                        onClick={() => setShowFilters(true)}
                        className="p-2.5 rounded-xl bg-slate-100 text-slate-700 hover:bg-slate-200 transition-colors flex-shrink-0"
                    >
                        <Filter className="h-5 w-5" />
                    </button>
                </div>
            </div>

            <main className="px-4 pt-4">
                {/* Results Info */}
                <div className="flex items-center justify-between mb-4">
                    <h3 className="font-semibold text-slate-900">
                        {localQuery ? `Hasil pencarian "${localQuery}"` : "Ketik untuk mencari"}
                    </h3>
                    {localQuery && (
                        <span className="text-sm text-slate-600">{filteredProducts.length} produk</span>
                    )}
                </div>

                {/* Product Grid */}
                <div className="grid grid-cols-2 gap-3">
                    {filteredProducts.map((p) => (
                        <ProductCard key={p.id} product={p} />
                    ))}
                </div>

                {localQuery && filteredProducts.length === 0 && (
                    <div className="text-center py-16">
                        <SearchIcon className="h-12 w-12 text-slate-300 mx-auto mb-3" />
                        <p className="text-slate-600 font-medium">Tidak ada hasil yang ditemukan</p>
                        <p className="text-slate-400 text-sm mt-1">Coba gunakan kata kunci lain</p>
                    </div>
                )}
            </main>

            {/* Advanced Filters Modal Overlay */}
            <div
                className={`fixed inset-0 z-50 bg-slate-900/50 backdrop-blur-sm transition-opacity left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "opacity-100" : "opacity-0 pointer-events-none"}`}
                onClick={() => setShowFilters(false)}
            />

            {/* Advanced Filters Bottom Sheet */}
            <div
                className={`fixed inset-x-0 bottom-0 z-50 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-[cubic-bezier(0.32,0.72,0,1)] left-1/2 -translate-x-1/2 w-full max-w-md md:max-w-lg lg:max-w-xl ${showFilters ? "translate-y-0" : "translate-y-full"}`}
            >
                <div className="flex justify-center pt-3 pb-1" onClick={() => setShowFilters(false)}>
                    <div className="w-12 h-1.5 bg-slate-200 rounded-full" />
                </div>

                <div className="p-5 overflow-y-auto max-h-[80vh]">
                    <div className="flex items-center justify-between mb-6">
                        <h4 className="font-bold text-lg text-slate-900">Filter Pencarian</h4>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="w-8 h-8 flex items-center justify-center rounded-full bg-slate-100 text-slate-500 hover:bg-slate-200 transition-colors"
                        >
                            ×
                        </button>
                    </div>

                    <div className="space-y-6">
                        {/* Sort Options */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">Urutkan Berdasarkan</label>
                            <div className="grid grid-cols-2 gap-2">
                                {SORT_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setSortBy(option.id)}
                                        className={`py-2.5 px-3 text-sm rounded-xl border text-center transition-colors ${sortBy === option.id
                                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                                            }`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Distance Options (UI only for now, logic in Feature 6) */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">Jarak Lokasi</label>
                            <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
                                {DISTANCE_OPTIONS.map((option) => (
                                    <button
                                        key={option.id}
                                        onClick={() => setDistance(option.id)}
                                        className={`py-2 px-3 text-sm rounded-xl border text-center transition-colors ${distance === option.id
                                            ? "border-blue-500 bg-blue-50 text-blue-700 font-medium"
                                            : "border-slate-200 bg-white text-slate-600 hover:border-blue-200"
                                            }`}
                                    >
                                        {option.name}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Price Range */}
                        <div>
                            <label className="block text-sm font-semibold text-slate-900 mb-3">Rentang Harga</label>
                            <div className="flex flex-col gap-2">
                                {PRICE_RANGES.map((option) => (
                                    <label
                                        key={option.id}
                                        className={`flex items-center p-3 rounded-xl border cursor-pointer transition-colors ${priceRange === option.id
                                            ? "border-blue-500 bg-blue-50"
                                            : "border-slate-200 bg-white hover:border-blue-200"
                                            }`}
                                    >
                                        <input
                                            type="radio"
                                            name="priceRange"
                                            value={option.id}
                                            checked={priceRange === option.id}
                                            onChange={(e) => setPriceRange(e.target.value)}
                                            className="w-4 h-4 text-blue-600 border-slate-300 focus:ring-blue-500"
                                        />
                                        <span className={`ml-3 text-sm ${priceRange === option.id ? "text-blue-700 font-medium" : "text-slate-700"}`}>
                                            {option.name}
                                        </span>
                                    </label>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="mt-8 mb-2 gap-3 flex">
                        <button
                            onClick={() => {
                                setSortBy("default");
                                setDistance("all");
                                setPriceRange("all");
                            }}
                            className="px-4 py-3 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                        >
                            Reset
                        </button>
                        <button
                            onClick={() => setShowFilters(false)}
                            className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-xl transition-colors shadow-sm shadow-blue-200"
                        >
                            Terapkan Filter
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
