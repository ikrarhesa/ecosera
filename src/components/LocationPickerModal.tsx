import React, { useState, useEffect, useCallback } from "react";
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { X, Search, MapPin, Navigation, Check, Copy, Loader2 } from "lucide-react";

// Fix Leaflet icon issue
// @ts-ignore
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png",
    iconUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
});

interface LocationPickerModalProps {
    initialLat?: number | null;
    initialLng?: number | null;
    onSelect: (lat: number, lng: number) => void;
    onClose: () => void;
}

function MapEvents({ onLocationSelect }: { onLocationSelect: (lat: number, lng: number) => void }) {
    useMapEvents({
        click(e) {
            onLocationSelect(e.latlng.lat, e.latlng.lng);
        },
    });
    return null;
}

function ChangeView({ center, zoom }: { center: [number, number]; zoom?: number }) {
    const map = useMap();
    useEffect(() => {
        map.setView(center, zoom || map.getZoom());
    }, [center, zoom, map]);
    return null;
}

export default function LocationPickerModal({
    initialLat,
    initialLng,
    onSelect,
    onClose,
}: LocationPickerModalProps) {
    const defaultPos: [number, number] = [-3.650, 103.774]; // Muara Enim default
    const [pos, setPos] = useState<[number, number]>(
        initialLat && initialLng ? [initialLat, initialLng] : defaultPos
    );
    const [zoom, setZoom] = useState(13);
    const [searchQuery, setSearchQuery] = useState("");
    const [isSearching, setIsSearching] = useState(false);
    const [searchResults, setSearchResults] = useState<any[]>([]);
    const [showResults, setShowResults] = useState(false);
    const [pasteValue, setPasteValue] = useState("");
    const [isPasting, setIsPasting] = useState(false);

    // Sync position if initial values change (e.g. from external source)
    useEffect(() => {
        if (initialLat && initialLng) {
            setPos([initialLat, initialLng]);
        }
    }, [initialLat, initialLng]);

    const handleSearch = async (e?: any) => {
        if (e?.preventDefault) e.preventDefault();
        if (!searchQuery.trim()) return;

        setIsSearching(true);
        try {
            const response = await fetch(
                `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
                    searchQuery
                )}`
            );
            const data = await response.json();
            setSearchResults(data || []);
            setShowResults(true);
            if (data && data.length === 0) {
                alert("Lokasi tidak ditemukan.");
            }
        } catch (err) {
            console.error("Search error:", err);
            alert("Terjadi kesalahan saat mencari lokasi.");
        } finally {
            setIsSearching(false);
        }
    };

    const handleSelectResult = (result: any) => {
        setPos([parseFloat(result.lat), parseFloat(result.lon)]);
        setZoom(15);
        setSearchQuery(result.display_name);
        setShowResults(false);
    };

    const handlePaste = (val: string) => {
        setPasteValue(val);
        // Regex to match "lat, lng" or "lat lng"
        const match = val.match(/(-?\d+\.?\d*)\s*[, ]\s*(-?\d+\.?\d*)/);
        if (match) {
            const lat = parseFloat(match[1]);
            const lng = parseFloat(match[2]);
            if (!isNaN(lat) && !isNaN(lng)) {
                setPos([lat, lng]);
                setZoom(15);
                setIsPasting(true);
                setTimeout(() => setIsPasting(false), 2000);
            }
        }
    };

    const handleUseCurrentLocation = () => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    setPos([position.coords.latitude, position.coords.longitude]);
                    setZoom(16);
                },
                () => alert("Gagal mendapatkan lokasi saat ini.")
            );
        } else {
            alert("Geolocation tidak didukung oleh browser ini.");
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
            <div className="bg-white w-full max-w-2xl rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header */}
                <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between bg-white">
                    <div>
                        <h3 className="text-lg font-bold text-slate-800">Pilih Lokasi</h3>
                        <p className="text-xs text-slate-500">Cari atau klik pada peta untuk menentukan posisi</p>
                    </div>
                    <button
                        onClick={onClose}
                        className="p-2 hover:bg-slate-100 rounded-full transition-colors"
                    >
                        <X className="h-5 w-5 text-slate-500" />
                    </button>
                </div>

                {/* Toolbar */}
                <div className="p-4 bg-slate-50 border-b border-slate-100 space-y-3">
                    {/* Search */}
                    <div className="relative">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Cari kota, jalan, atau tempat..."
                                value={searchQuery}
                                onChange={(e) => {
                                    setSearchQuery(e.target.value);
                                    if (showResults) setShowResults(false);
                                }}
                                onKeyDown={(e) => {
                                    if (e.key === "Enter") {
                                        e.preventDefault();
                                        handleSearch(e as any);
                                    }
                                }}
                                className="w-full pl-10 pr-24 py-2.5 bg-white border border-slate-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all"
                            />
                            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                            <button
                                type="button"
                                onClick={handleSearch}
                                disabled={isSearching}
                                className="absolute right-1.5 top-1/2 -translate-y-1/2 px-4 py-1.5 bg-blue-600 text-white rounded-lg text-xs font-semibold hover:bg-blue-700 disabled:opacity-50 transition-colors flex items-center gap-2"
                            >
                                {isSearching ? <Loader2 className="h-3 w-3 animate-spin" /> : "Cari"}
                            </button>
                        </div>


                        {/* Search Results Dropdown */}
                        {showResults && searchResults.length > 0 && (
                            <div className="absolute top-full left-0 right-0 mt-2 bg-white border border-slate-200 rounded-xl shadow-lg z-50 max-h-60 overflow-y-auto divide-y divide-slate-100">
                                {searchResults.map((result, idx) => (
                                    <button
                                        key={idx}
                                        type="button"
                                        onClick={() => handleSelectResult(result)}
                                        className="w-full text-left px-4 py-2.5 hover:bg-slate-50 transition-colors focus:bg-slate-50 outline-none"
                                    >
                                        <p className="text-sm font-medium text-slate-800 line-clamp-1">{result.display_name.split(",")[0]}</p>
                                        <p className="text-xs text-slate-500 line-clamp-1">{result.display_name}</p>
                                    </button>
                                ))}
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {/* Quick Paste */}
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Paste koordinat (contoh: -3.650, 103.774)"
                                value={pasteValue}
                                onChange={(e) => handlePaste(e.target.value)}
                                className={`w-full pl-10 pr-10 py-2 bg-white border ${isPasting ? "border-green-500 ring-2 ring-green-500/10" : "border-slate-200"} rounded-xl text-xs focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all`}
                            />
                            <Copy className="absolute left-3.5 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-slate-400" />
                            {isPasting && (
                                <Check className="absolute right-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-green-500" />
                            )}
                        </div>

                        {/* Use Current Location */}
                        <button
                            onClick={handleUseCurrentLocation}
                            className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-slate-200 rounded-xl text-xs font-semibold text-slate-700 hover:bg-slate-50 transition-colors"
                        >
                            <Navigation className="h-3.5 w-3.5 text-blue-500" />
                            Gunakan Lokasi Saya
                        </button>
                    </div>
                </div>

                {/* Map */}
                <div className="flex-1 min-h-[300px] relative">
                    <MapContainer
                        center={pos}
                        zoom={zoom}
                        style={{ height: "100%", width: "100%" }}
                        className="z-10"
                    >
                        <TileLayer
                            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                        />
                        <Marker position={pos} />
                        <MapEvents onLocationSelect={(lat, lng) => setPos([lat, lng])} />
                        <ChangeView center={pos} zoom={zoom} />
                    </MapContainer>

                    {/* Coordinates Overlay */}
                    <div className="absolute bottom-4 left-4 z-20 bg-white/90 backdrop-blur shadow-lg rounded-lg px-3 py-2 border border-slate-200 pointer-events-none">
                        <div className="flex items-center gap-3 text-[10px] font-mono text-slate-600">
                            <div>
                                <span className="text-slate-400 mr-1">LAT:</span>
                                {pos[0].toFixed(6)}
                            </div>
                            <div className="w-px h-3 bg-slate-200" />
                            <div>
                                <span className="text-slate-400 mr-1">LNG:</span>
                                {pos[1].toFixed(6)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 border-t border-slate-100 bg-slate-50 flex items-center justify-end gap-3">
                    <button
                        onClick={onClose}
                        className="px-5 py-2 text-sm font-semibold text-slate-600 hover:text-slate-800 transition-colors"
                    >
                        Batal
                    </button>
                    <button
                        onClick={() => onSelect(pos[0], pos[1])}
                        className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold shadow-lg shadow-blue-500/20 hover:bg-blue-700 hover:shadow-blue-500/30 transition-all active:scale-[0.98]"
                    >
                        Simpan Lokasi
                    </button>
                </div>
            </div>
        </div>
    );
}
