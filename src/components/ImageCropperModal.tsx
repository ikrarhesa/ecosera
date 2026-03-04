import { useState, useCallback } from "react";
import Cropper from "react-easy-crop";
import type { Area } from "react-easy-crop";
import { X, ZoomIn, ZoomOut, Check } from "lucide-react";
import { getCroppedImg } from "../lib/cropImage";

interface ImageCropperModalProps {
    imageSrc: string;
    aspect: number;
    onCropComplete: (croppedFile: File) => void;
    onCancel: () => void;
}

const C = { blue: "#0071DC", navy: "#041E42" };

export default function ImageCropperModal({
    imageSrc,
    aspect,
    onCropComplete,
    onCancel,
}: ImageCropperModalProps) {
    const [crop, setCrop] = useState({ x: 0, y: 0 });
    const [zoom, setZoom] = useState(1);
    const [croppedAreaPixels, setCroppedAreaPixels] = useState<Area | null>(null);
    const [processing, setProcessing] = useState(false);

    const onCropChange = useCallback((location: { x: number; y: number }) => {
        setCrop(location);
    }, []);

    const onZoomChange = useCallback((z: number) => {
        setZoom(z);
    }, []);

    const onCropCompleteHandler = useCallback(
        (_: Area, croppedPixels: Area) => {
            setCroppedAreaPixels(croppedPixels);
        },
        []
    );

    const handleApply = async () => {
        if (!croppedAreaPixels) return;
        setProcessing(true);
        try {
            const croppedFile = await getCroppedImg(imageSrc, croppedAreaPixels);
            onCropComplete(croppedFile);
        } catch (err) {
            console.error("Crop failed:", err);
        } finally {
            setProcessing(false);
        }
    };

    return (
        <div className="fixed inset-0 z-[9999] flex flex-col bg-black/90 backdrop-blur-sm">
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-black/60">
                <button
                    onClick={onCancel}
                    className="flex items-center gap-1.5 text-white/80 hover:text-white text-sm font-medium transition-colors"
                >
                    <X className="h-5 w-5" />
                    Batal
                </button>
                <h3 className="text-white font-semibold text-sm">Potong Gambar</h3>
                <button
                    onClick={handleApply}
                    disabled={processing || !croppedAreaPixels}
                    className="flex items-center gap-1.5 text-white text-sm font-semibold px-4 py-1.5 rounded-full transition-all disabled:opacity-40"
                    style={{ backgroundColor: C.blue }}
                >
                    {processing ? (
                        <div className="h-4 w-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    ) : (
                        <Check className="h-4 w-4" />
                    )}
                    Terapkan
                </button>
            </div>

            {/* Cropper area */}
            <div className="relative flex-1 min-h-0">
                <Cropper
                    image={imageSrc}
                    crop={crop}
                    zoom={zoom}
                    aspect={aspect}
                    onCropChange={onCropChange}
                    onZoomChange={onZoomChange}
                    onCropComplete={onCropCompleteHandler}
                    showGrid
                    style={{
                        containerStyle: { background: "#000" },
                        cropAreaStyle: {
                            border: "2px solid rgba(255,255,255,0.6)",
                            borderRadius: "8px",
                        },
                    }}
                />
            </div>

            {/* Zoom controls */}
            <div className="flex items-center justify-center gap-4 px-6 py-4 bg-black/60">
                <button
                    type="button"
                    onClick={() => setZoom((z) => Math.max(1, z - 0.1))}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <ZoomOut className="h-5 w-5" />
                </button>
                <input
                    type="range"
                    min={1}
                    max={3}
                    step={0.05}
                    value={zoom}
                    onChange={(e) => setZoom(Number(e.target.value))}
                    className="w-48 md:w-64 accent-blue-500 h-1.5 rounded-full appearance-none bg-white/20 cursor-pointer"
                    style={
                        {
                            "--tw-ring-color": C.blue,
                        } as React.CSSProperties
                    }
                />
                <button
                    type="button"
                    onClick={() => setZoom((z) => Math.min(3, z + 0.1))}
                    className="text-white/70 hover:text-white transition-colors"
                >
                    <ZoomIn className="h-5 w-5" />
                </button>
                <span className="text-white/50 text-xs font-mono min-w-[3rem] text-center">
                    {zoom.toFixed(1)}x
                </span>
            </div>

            {/* Hint */}
            <p className="text-center text-white/40 text-xs pb-3">
                Geser untuk memposisikan • Pinch atau slider untuk zoom
            </p>
        </div>
    );
}
