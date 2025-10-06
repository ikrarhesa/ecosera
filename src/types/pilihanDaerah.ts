export type PilihanTab = 'order_again' | 'staple' | 'nearby';

export interface PilihanSeller {
  id: string;
  name: string;
  wa: string; // E.164 like +62812...
}

export interface PilihanItem {
  id: string;
  name: string;
  price: number;
  unit: string; // e.g. "/250g"
  stock: number | null; // null for preorder
  image: string; // URL
  seller: PilihanSeller;
  reason: PilihanTab;
  distance_km?: number;
  prefill_chat?: string;
  analytics?: { impression_id?: string };
}

export interface PilihanResponse {
  region_label: string; // e.g. "Muara Enim"
  tab: PilihanTab;
  items: PilihanItem[];
}
