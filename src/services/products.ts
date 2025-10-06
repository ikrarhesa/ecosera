// src/services/products.ts
import { Product } from "../types/product";

const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera"; // Placeholder image URL

// Function to load products and ensure data integrity
async function loadProductsJSON(): Promise<any[]> {
  try {
    const mod: any = await import("../data/products.json");  // Dynamically import JSON
    return mod.default || mod;  // Return the default export if it exists
  } catch (e) {
    console.error("Failed to load products.json", e);
    return [];  // Return an empty array if the fetch fails
  }
}

// Function to normalize the product data and ensure integrity
function normalize(raw: any): Product {
  const stockRaw = raw.stock ?? raw.inventory ?? raw.qty ?? null;
  const stockParsed = stockRaw == null ? 999 : Number.parseInt(String(stockRaw), 10);

  // Collect image URLs with a fallback
  const imgs = raw.images || (raw.thumb ? [raw.thumb] : [PLACEHOLDER]);  // Use thumb if images not available
  const primary = imgs[0] || PLACEHOLDER;

  const base: Product = {
    id: String(raw.id),
    name: String(raw.name || "Unknown Product"),  // Ensure product has a name
    price: Number(raw.price ?? 0),  // Ensure price is a number
    unit: String(raw.unit ?? "pcs"),  // Ensure unit is provided
    stock: Number.isFinite(stockParsed) ? stockParsed : 999,  // Ensure stock is a valid number
    image: primary,
    images: imgs,
    description: raw.description ?? "No description available",  // Default description if missing
    category: String(raw.category ?? "general"),  // Default category if missing
    sellerName: raw.sellerName ?? "UMKM Lokal",  // Default seller name
    sellerPhone: raw.sellerPhone ?? "",  // Default phone if missing
    location: raw.location ?? "Muara Enim",  // Default location
    rating: Number(raw.rating ?? 4.8),  // Default rating if missing
    sold: Number(raw.sold ?? 0),  // Default sold count if missing
    tags: Array.isArray(raw.tags) ? raw.tags : [],  // Ensure tags are an array
  };

  // Optional flags
  base.featured = !!raw.featured;
  base.available = raw.available !== false;

  return base;
}

// Function to fetch and normalize all products
export async function getAllProducts(): Promise<Product[]> {
  let cache: Product[] | null = null;
  let indexById: Map<string, Product> | null = null;

  if (cache) return cache;
  const data = await loadProductsJSON();
  
  // Filter out invalid products and ensure data integrity
  const filtered = data.filter((p: any) => p?.available !== false);

  // Normalize the product data to ensure consistency
  cache = filtered.map(normalize);
  indexById = new Map(cache.map(p => [p.id, p]));
  
  return cache;
}

// Function to get a product by its ID
export async function getProductById(id: string): Promise<Product | null> {
  const all = await getAllProducts();
  return all.find((product) => product.id === id) ?? null;
}

// Function to get related products based on category
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

// Function to get all images of a product (returns array of image URLs)
export function allImagesOf(p?: Product | null): string[] {
  if (!p) return [PLACEHOLDER];
  const arr = p.images?.length ? p.images : (p.image ? [p.image] : []);
  return arr.length ? arr : [PLACEHOLDER];
}

// Function to get the primary image of a product
export function primaryImageOf(p?: Product | null): string {
  if (!p) return PLACEHOLDER;
  return p.image || (p.images?.[0]) || PLACEHOLDER;
}

// Exporting additional required functions
export async function getFeaturedProducts(): Promise<Product[]> {
  const all = await getAllProducts();
  return all.filter((p: any) => p.featured);
}
