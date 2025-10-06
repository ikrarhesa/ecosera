export interface RegionBox {
  label: string;      // e.g., "Muara Enim"
  // bounding box in decimal degrees
  minLat: number; maxLat: number;
  minLng: number; maxLng: number;
}

// Coarse demo boxes, adjust later or replace with server reverse geocode:
const BOXES: RegionBox[] = [
  // South Sumatra examples, very rough boxes
  { label: 'Muara Enim',  minLat: -4.2, maxLat: -3.4, minLng: 103.5, maxLng: 104.3 },
  { label: 'Palembang',   minLat: -3.1, maxLat: -2.8, minLng: 104.6, maxLng: 104.9 },
  { label: 'Bangka',      minLat: -2.5, maxLat: -1.3, minLng: 105.0, maxLng: 106.1 },
];

export function resolveRegionLabel(lat?: number, lng?: number, fallback = 'Sekitar Kamu'): string {
  if (typeof lat !== 'number' || typeof lng !== 'number') return fallback;
  for (const b of BOXES) {
    if (lat >= b.minLat && lat <= b.maxLat && lng >= b.minLng && lng <= b.maxLng) {
      return b.label;
    }
  }
  return fallback;
}
