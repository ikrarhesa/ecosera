// src/services/products.ts
import { Product } from "../types/product";
<<<<<<< HEAD

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
=======
import { supabase } from "../lib/supabase";

const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera";

// Cache seller names to avoid repeated lookups
const sellerCache: Record<string, { name: string; phone: string; address: string; lat?: number; lng?: number }> = {};

async function fetchSellerInfo(sellerId: string) {
  if (!sellerId) return null;
  if (sellerCache[sellerId]) return sellerCache[sellerId];
  const { data } = await supabase
    .from("sellers")
    .select("name, phone, address, latitude, longitude, social_media")
    .eq("id", sellerId)
    .single();
  if (data) {
    // Prefer social_media.whatsapp over the legacy phone column
    const social = (data.social_media as Record<string, string> | null) ?? {};
    const waPhone = social.whatsapp?.trim() || data.phone || "";
    sellerCache[sellerId] = {
      name: data.name,
      phone: waPhone,
      address: data.address || "",
      lat: data.latitude ?? undefined,
      lng: data.longitude ?? undefined,
    };
  }
  return sellerCache[sellerId] || null;
}

// Function to normalize the product data from Supabase
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
function normalize(raw: any): Product {
  const stockRaw = raw.stock ?? raw.inventory ?? raw.qty ?? null;
  const stockParsed = stockRaw == null ? 999 : Number.parseInt(String(stockRaw), 10);

  // Collect image URLs with a fallback
<<<<<<< HEAD
  const imgs = raw.images || (raw.thumb ? [raw.thumb] : [PLACEHOLDER]);  // Use thumb if images not available
=======
  const imgs = raw.images || (raw.image_url ? [raw.image_url] : raw.thumb ? [raw.thumb] : [PLACEHOLDER]);
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
  const primary = imgs[0] || PLACEHOLDER;

  const base: Product = {
    id: String(raw.id),
<<<<<<< HEAD
=======
    slug: raw.slug ?? undefined,
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
    name: String(raw.name || "Unknown Product"),  // Ensure product has a name
    price: Number(raw.price ?? 0),  // Ensure price is a number
    unit: String(raw.unit ?? "pcs"),  // Ensure unit is provided
    stock: Number.isFinite(stockParsed) ? stockParsed : 999,  // Ensure stock is a valid number
    image: primary,
    images: imgs,
    description: raw.description ?? "No description available",  // Default description if missing
    category: String(raw.category ?? "general"),  // Default category if missing
<<<<<<< HEAD
    sellerName: raw.sellerName ?? "UMKM Lokal",  // Default seller name
    sellerPhone: raw.sellerPhone ?? "",  // Default phone if missing
    location: raw.location ?? "Muara Enim",  // Default location
    rating: Number(raw.rating ?? 4.8),  // Default rating if missing
    tags: Array.isArray(raw.tags) ? raw.tags : [],  // Ensure tags are an array
=======
    sellerName: raw._sellerName ?? raw.sellerName ?? "UMKM Lokal",
    sellerPhone: raw._sellerPhone ?? raw.sellerPhone ?? "",
    location: raw._sellerAddress ?? raw.location ?? "",
    sellerLat: raw._sellerLat ?? undefined,
    sellerLng: raw._sellerLng ?? undefined,
    rating: Number(raw.rating ?? 4.8),  // Default rating if missing
    sold: Number(raw.sold ?? 0),  // Default sold count if missing
    tags: Array.isArray(raw.tags) ? raw.tags : [],  // Ensure tags are an array
    seller_id: raw.seller_id ?? null,
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
  };

  // Optional flags
  base.featured = !!raw.featured;
<<<<<<< HEAD
  base.available = raw.available !== false;
=======
  base.available = raw.is_active !== false;
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a

  return base;
}

// Function to fetch and normalize all products
export async function getAllProducts(): Promise<Product[]> {
<<<<<<< HEAD
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
=======
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching all products from Supabase", error);
      return [];
    }

    // Enrich with seller names
    const products = data || [];
    const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))];
    await Promise.all(sellerIds.map(fetchSellerInfo));

    return products.map((raw: any) => {
      const info = sellerCache[raw.seller_id];
      const category = raw.product_categories?.[0]?.category_id || "general";
      return normalize({ ...raw, category, _sellerName: info?.name, _sellerPhone: info?.phone, _sellerAddress: info?.address, _sellerLat: info?.lat, _sellerLng: info?.lng });
    });
  } catch (err) {
    console.error("Unexpected error fetching all products:", err);
    return [];
  }
}

// Function to get a product by its Slug
export async function getProductBySlug(slug: string): Promise<Product | null> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id)")
      .eq("slug", slug)
      .single();

    if (error) {
      console.error(`Error fetching product with slug ${slug}:`, error);
      return null;
    }
    if (!data) return null;

    // Enrich with seller name
    const info = await fetchSellerInfo(data.seller_id);
    const category = data.product_categories?.[0]?.category_id || "general";
    return normalize({ ...data, category, _sellerName: info?.name, _sellerPhone: info?.phone, _sellerAddress: info?.address, _sellerLat: info?.lat, _sellerLng: info?.lng });
  } catch (err) {
    console.error("Unexpected error fetching product:", err);
    return null;
  }
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
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
<<<<<<< HEAD
  const all = await getAllProducts();
  return all.filter((p: any) => p.featured);
=======
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id)")
      .eq("featured", true)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    const products = data || [];
    const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))];
    await Promise.all(sellerIds.map(fetchSellerInfo));

    return products.map((raw: any) => {
      const info = sellerCache[raw.seller_id];
      const category = raw.product_categories?.[0]?.category_id || "general";
      return normalize({ ...raw, category, _sellerName: info?.name, _sellerPhone: info?.phone, _sellerAddress: info?.address, _sellerLat: info?.lat, _sellerLng: info?.lng });
    });
  } catch (err) {
    console.error("Unexpected error fetching featured products:", err);
    return [];
  }
}

// ---- Reviews Feature ----

export interface ProductReview {
  id?: string;
  product_id: string;
  reviewer_name: string;
  contact_info: string;
  rating: number;
  comment?: string;
  created_at?: string;
}

export async function getProductReviews(productId: string): Promise<ProductReview[]> {
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("*")
      .eq("product_id", productId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("Error fetching reviews:", error);
      return [];
    }
    return data || [];
  } catch (err) {
    console.error("Unexpected error fetching reviews:", err);
    return [];
  }
}

export async function submitProductReview(review: ProductReview): Promise<boolean> {
  try {
    const { error } = await supabase.from("reviews").insert([
      {
        product_id: review.product_id,
        reviewer_name: review.reviewer_name,
        contact_info: review.contact_info,
        rating: review.rating,
        comment: review.comment || ""
      }
    ]);

    if (error) {
      console.error("Error submitting review:", error);
      return false;
    }
    return true;
  } catch (err) {
    console.error("Unexpected error submitting review:", err);
    return false;
  }
>>>>>>> ace37154b74ca81d6b98d7a167b33475f2748f4a
}
