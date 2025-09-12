import type { Product } from "../types/product";

let cache: Product[] | null = null;
let indexById: Map<string, Product> | null = null;

const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera";

/** Load products.json from the src/data directory */
async function loadProductsJSON(): Promise<any[]> {
  try {
    const mod: any = await import("../data/products.json");  // Dynamically import JSON
    return mod.default || mod;  // Return the default export if it exists
  } catch (e) {
    console.error("Failed to load products.json", e);
    return [];  // Return an empty array if there's an error
  }
}

/** Kumpulkan semua kemungkinan field gambar, lalu dedupe */
function collectImages(raw: any): string[] {
  const buckets: (string | string[] | null | undefined)[] = [
    raw.images, raw.photos, raw.gallery, raw.thumbnails, raw.pictures,
    raw.media, raw.assets,
    raw.images?.urls, // kadang nested
    [raw.thumbnail], [raw.cover], [raw.image], [raw.img], [raw.url], [raw.photo],
  ];
  const flat = buckets.flat().filter(Boolean) as string[];
  const seen = new Set<string>();
  const out: string[] = [];
  for (const s of flat) {
    const v = String(s).trim();
    if (!v) continue;
    if (!seen.has(v)) { seen.add(v); out.push(v); }
  }
  return out;
}

/** Normalisasi 1 item */
function normalize(raw: any): Product {
  const stockRaw = raw.stock ?? raw.inventory ?? raw.qty ?? null;
  const stockParsed = stockRaw == null ? 999 : Number.parseInt(String(stockRaw), 10);

  const imgs = collectImages(raw);
  const primary = imgs[0] ?? PLACEHOLDER;

  const base: Product = {
    id: String(raw.id),
    name: String(raw.name),
    price: Number(raw.price ?? 0),
    unit: String(raw.unit ?? "pcs"),
    stock: Number.isFinite(stockParsed) ? stockParsed : 999,
    image: primary,
    images: imgs,
    description: raw.description ?? "",
    category: String(raw.category ?? "general"),
    sellerName: raw.sellerName ?? raw.seller ?? "UMKM Lokal",
    sellerPhone: raw.sellerPhone ?? raw.phone ?? "",
    location: raw.location ?? "Muara Enim",
    rating: Number(raw.rating ?? 4.8),
    tags: Array.isArray(raw.tags) ? raw.tags : [],
  };

  // pass-through flags opsional
  (base as any).featured = !!raw.featured;
  if (typeof raw.available !== "undefined") (base as any).available = raw.available !== false;

  return base;
}

/** Helpers untuk komponen */
export function primaryImageOf(p?: Product | null): string {
  if (!p) return PLACEHOLDER;
  return (p.images && p.images[0]) || p.image || PLACEHOLDER;
}
export function allImagesOf(p?: Product | null): string[] {
  if (!p) return [PLACEHOLDER];
  const arr = p.images?.length ? p.images : (p.image ? [p.image] : []);
  return arr.length ? arr : [PLACEHOLDER];
}

/** Load sekali dari /data/products.json dan cache (hanya available !== false) */
export async function getAllProducts(): Promise<Product[]> {
  if (cache) return cache;
  const data = await loadProductsJSON();
  const filtered = data.filter((p: any) => p?.available !== false);
  cache = filtered.map(normalize);
  indexById = new Map(cache.map(p => [p.id, p]));
  return cache;
}

export function invalidateProductsCache() { cache = null; indexById = null; }

export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p: any) => !!(p as any).featured);
}

export async function getProductById(id: string): Promise<Product | null> {
  if (indexById) return indexById.get(id) ?? null;
  const all = await getAllProducts();
  return all.find(p => p.id === id) ?? null;
}

export async function searchProducts(q: string): Promise<Product[]> {
  const all = await getAllProducts();
  const s = (q ?? "").trim().toLowerCase();
  if (!s) return all;
  const contains = (v?: string) => (v ? v.toLowerCase().includes(s) : false);
  return all.filter(p =>
    contains(p.name) ||
    contains(p.id) ||
    contains(p.category) ||
    contains(p.sellerName) ||
    contains(p.location) ||
    (p.tags?.some(t => (t ?? "").toLowerCase().includes(s)) ?? false)
  );
}

export async function getRelatedProducts(category: string, excludeId?: string, limit = 8): Promise<Product[]> {
  const all = await getAllProducts();
  const base = all.filter(p => p.id !== excludeId);
  const main = excludeId ? all.find(x => x.id === excludeId) : null;
  const mainTags = new Set((main?.tags ?? []).map(t => (t ?? "").toLowerCase()));

  const score = (p: Product) => {
    let sc = 0;
    if (category && p.category === category) sc += 2;
    if (p.tags?.length && mainTags.size) {
      let shared = 0;
      for (const t of p.tags) {
        if (mainTags.has((t ?? "").toLowerCase())) { shared++; if (shared >= 3) break; }
      }
      sc += shared;
    }
    if ((p.stock ?? 0) <= 0) sc -= 2;
    return sc;
  };

  return base
    .map(p => ({ p, s: score(p) }))
    .filter(x => x.s > -2)
    .sort((a, b) => {
      if (b.s !== a.s) return b.s - a.s;
      const sa = a.p.stock ?? 0, sb = b.p.stock ?? 0;
      if (sb !== sa) return sb - sa;
      const ra = a.p.rating ?? 0, rb = b.p.rating ?? 0;
      return rb - ra;
    })
    .slice(0, limit)
    .map(x => x.p);
}

export async function getProductsByCategory(category: string, limit = 24): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter(p => p.category === category).slice(0, limit);
}
