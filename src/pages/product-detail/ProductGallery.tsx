import React, { useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface ProductGalleryProps {
  images: string[];
  productName: string;
  accentColor: string;
  placeholder: string;
}

export const ProductGallery: React.FC<ProductGalleryProps> = ({
  images,
  productName,
  accentColor,
  placeholder
}) => {
  const galleryRef = useRef<HTMLDivElement>(null);
  const [idx, setIdx] = useState(0);

  const goTo = (i: number) => {
    const el = galleryRef.current;
    if (!el) return;
    const clamped = Math.max(0, Math.min(i, images.length - 1));
    el.scrollTo({ left: clamped * el.clientWidth, behavior: "smooth" });
    setIdx(clamped);
  };

  const onScroll = () => {
    const el = galleryRef.current;
    if (!el) return;
    const current = Math.round(el.scrollLeft / el.clientWidth);
    if (current !== idx) setIdx(current);
  };

  if (!images.length) return null;

  return (
    <>
      {/* Gallery Slider */}
      <div className="relative w-full bg-gray-50">
        <div
          ref={galleryRef}
          onScroll={onScroll}
          className="w-full overflow-x-auto snap-x snap-mandatory scroll-smooth"
          style={{ scrollbarWidth: "none" }}
        >
          <div className="flex w-full">
            {images.map((src, i) => (
              <div key={i} className="snap-center shrink-0 w-full aspect-square overflow-hidden bg-gray-100">
                <img
                  src={src}
                  alt={`${productName} - gambar ${i + 1}`}
                  className="h-full w-full object-cover"
                  loading={i === 0 ? "eager" : "lazy"}
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
                />
              </div>
            ))}
          </div>
        </div>

        {images.length > 1 && (
          <>
            <button
              onClick={() => goTo(idx - 1)}
              className="absolute left-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 border grid place-items-center"
              aria-label="Sebelumnya"
            >
              <ChevronLeft />
            </button>
            <button
              onClick={() => goTo(idx + 1)}
              className="absolute right-2 top-1/2 -translate-y-1/2 h-9 w-9 rounded-full bg-white/80 border grid place-items-center"
              aria-label="Selanjutnya"
            >
              <ChevronRight />
            </button>
          </>
        )}

        {images.length > 1 && (
          <div className="absolute bottom-2 left-0 right-0 flex items-center justify-center gap-1.5">
            {images.map((_, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-1.5 rounded-full ${i === idx ? "w-5" : "w-2.5"} transition-all`}
                style={{ backgroundColor: i === idx ? accentColor : "rgba(255,255,255,0.9)" }}
                aria-label={`Ke gambar ${i + 1}`}
              />
            ))}
          </div>
        )}
      </div>

      {/* Thumbnails */}
      {images.length > 1 && (
        <div className="mt-2 px-3">
          <div className="flex gap-2 overflow-x-auto pb-1" style={{ scrollbarWidth: "none" }}>
            {images.map((src, i) => (
              <button
                key={i}
                onClick={() => goTo(i)}
                className={`h-16 w-16 rounded-lg overflow-hidden border transition-all ${i === idx ? "" : ""}`}
                style={i === idx ? { outline: `2px solid ${accentColor}`, outlineOffset: 0 } : undefined}
                aria-label={`Pilih gambar ${i + 1}`}
              >
                <img src={src} alt={`thumb ${i + 1}`} className="h-full w-full object-cover" loading="lazy"
                  onError={(e) => { (e.currentTarget as HTMLImageElement).src = placeholder; }}
                />
              </button>
            ))}
          </div>
        </div>
      )}
    </>
  );
};
