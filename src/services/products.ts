// src/services/products.ts
import { Product } from "../types/product";
import { supabase } from "../lib/supabase";

const PLACEHOLDER = "https://placehold.co/800x800/png?text=Ecosera";

// Cache seller names to avoid repeated lookups
const sellerCache: Record<string, { name: string; phone: string; address: string; lat?: number; lng?: number }> = {};
const productCache: Record<string, Product> = {};
let waClickCache: Record<string, number> | null = null;
let waClickCacheTime = 0;
const WA_CLICK_CACHE_TTL = 60_000; // 1 minute

let reviewsCache: Record<string, { count: number, totalRating: number }> | null = null;
let reviewsCacheTime = 0;
const REVIEWS_CACHE_TTL = 60_000; // 1 minute

export function getCachedProductBySlug(slug: string): Product | null {
  return productCache[slug] || null;
}

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

/**
 * Fetch wa_click counts from event_logs grouped by product_id.
 * Results are cached for 1 minute to avoid excessive queries.
 */
async function fetchWaClickCounts(forceRefresh = false): Promise<Record<string, number>> {
  const now = Date.now();
  if (!forceRefresh && waClickCache && now - waClickCacheTime < WA_CLICK_CACHE_TTL) {
    return waClickCache;
  }
  try {
    const { data, error } = await supabase
      .from("event_logs")
      .select("product_id")
      .eq("event_type", "wa_click");

    if (error) {
      console.error("[Products] Error fetching wa_click counts:", error);
      return waClickCache ?? {};
    }

    const counts: Record<string, number> = {};
    for (const row of data || []) {
      if (row.product_id) {
        counts[row.product_id] = (counts[row.product_id] || 0) + 1;
      }
    }
    waClickCache = counts;
    waClickCacheTime = now;
    return counts;
  } catch (err) {
    console.error("[Products] Unexpected error fetching wa_click counts:", err);
    return waClickCache ?? {};
  }
}

async function fetchAllReviews(forceRefresh = false): Promise<Record<string, { count: number, totalRating: number }>> {
  const now = Date.now();
  if (!forceRefresh && reviewsCache && now - reviewsCacheTime < REVIEWS_CACHE_TTL) {
    return reviewsCache;
  }
  try {
    const { data, error } = await supabase
      .from("reviews")
      .select("product_id, rating");

    if (error) {
      console.error("[Products] Error fetching reviews:", error);
      return reviewsCache ?? {};
    }

    const counts: Record<string, { count: number, totalRating: number }> = {};
    for (const row of data || []) {
      if (row.product_id && typeof row.rating === "number") {
        if (!counts[row.product_id]) counts[row.product_id] = { count: 0, totalRating: 0 };
        counts[row.product_id].count += 1;
        counts[row.product_id].totalRating += row.rating;
      }
    }
    reviewsCache = counts;
    reviewsCacheTime = now;
    return counts;
  } catch (err) {
    console.error("[Products] Unexpected error fetching reviews:", err);
    return reviewsCache ?? {};
  }
}

// Function to normalize the product data from Supabase
function normalize(raw: any): Product {
  const stockRaw = raw.stock ?? raw.inventory ?? raw.qty ?? null;
  const stockParsed = stockRaw == null ? 999 : Number.parseInt(String(stockRaw), 10);

  // Collect image URLs with a fallback
  const imgs = raw.images || (raw.image_url ? [raw.image_url] : raw.thumb ? [raw.thumb] : [PLACEHOLDER]);
  const primary = imgs[0] || PLACEHOLDER;

  const base: Product = {
    id: String(raw.id),
    slug: raw.slug ?? undefined,
    name: String(raw.name || "Unknown Product"),  // Ensure product has a name
    price: Number(raw.price ?? 0),  // Ensure price is a number
    unit: String(raw.unit ?? "pcs"),  // Ensure unit is provided
    stock: Number.isFinite(stockParsed) ? stockParsed : 999,  // Ensure stock is a valid number
    image: primary,
    images: imgs,
    description: raw.description ?? "No description available",  // Default description if missing
    category: String(raw.category ?? "general"),  // Primary category ID
    categories: Array.isArray(raw.categories) ? raw.categories : [String(raw.category ?? "general")], // All category IDs
    sellerName: raw._sellerName ?? raw.sellerName ?? "UMKM Lokal",
    sellerPhone: raw._sellerPhone ?? raw.sellerPhone ?? "",
    location: raw._sellerAddress ?? raw.location ?? "",
    sellerLat: raw._sellerLat ?? undefined,
    sellerLng: raw._sellerLng ?? undefined,
    rating: Number(raw.rating ?? 0),  // 0 = no real reviews yet
    sold: raw._waClicks ?? Number(raw.sold ?? 0),
    tags: Array.isArray(raw.tags) ? raw.tags : [],  // Ensure tags are an array
    seller_id: raw.seller_id ?? null,
  };

  // Optional flags
  base.featured = !!raw.featured;
  base.available = raw.is_active !== false;

  // Variants
  const variantsData = raw.product_variants || raw.variants;
  if (Array.isArray(variantsData)) {
    base.variants = variantsData.map((v: any) => ({
      id: v.id,
      variant_name: v.variant_name || v.name || "Pilihan",
      price_override: v.price_override != null ? Number(v.price_override) : null,
      stock: v.stock != null ? Number(v.stock) : null
    })).filter((v: any) => v.variant_name); // Only include variants with names
  }

  return base;
}

// Function to fetch and normalize all products
export async function getAllProducts(): Promise<Product[]> {
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id), product_variants(*)")
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching all products from Supabase", error);
      return [];
    }

    // Enrich with seller names + wa_click counts + reviews
    const products = data || [];
    const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))];
    const [, waClicks, reviews] = await Promise.all([
      Promise.all(sellerIds.map(fetchSellerInfo)),
      fetchWaClickCounts(),
      fetchAllReviews(),
    ]);

    const result = products.map((raw: any) => {
      const info = sellerCache[raw.seller_id];
      const categories = raw.product_categories?.map((pc: any) => pc.category_id) || [];
      const primaryCategory = categories[0] || "general";

      let calculatedRating = raw.rating ?? 0;
      if (reviews[raw.id]) {
        calculatedRating = Number((reviews[raw.id].totalRating / reviews[raw.id].count).toFixed(1));
      }

      const normalized = normalize({
        ...raw,
        category: primaryCategory,
        categories,
        _sellerName: info?.name,
        _sellerPhone: info?.phone,
        _sellerAddress: info?.address,
        _sellerLat: info?.lat,
        _sellerLng: info?.lng,
        _waClicks: waClicks[raw.id] ?? 0,
        rating: calculatedRating
      });
      if (normalized.slug) {
        productCache[normalized.slug] = normalized;
      }
      return normalized;
    });
    return result;
  } catch (err) {
    console.error("Unexpected error fetching all products:", err);
    return [];
  }
}

// Function to get a product by its Slug
export async function getProductBySlug(slugOrId: string): Promise<Product | null> {
  try {
    // Check if input is a UUID
    const isId = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(slugOrId);

    let query = supabase
      .from("products")
      .select("*, product_categories(category_id), product_variants(*)");

    if (isId) {
      query = query.eq("id", slugOrId);
    } else {
      query = query.eq("slug", slugOrId);
    }

    const { data, error } = await query.single();

    if (error) {
      console.error(`Error fetching product ${slugOrId}:`, error);
      return null;
    }
    if (!data) return null;

    // Enrich with seller name + wa_click count + reviews
    const [info, waClicks, reviews] = await Promise.all([
      fetchSellerInfo(data.seller_id),
      fetchWaClickCounts(),
      fetchAllReviews(),
    ]);
    const categories = data.product_categories?.map((pc: any) => pc.category_id) || [];
    const primaryCategory = categories[0] || "general";

    let calculatedRating = data.rating ?? 0;
    if (reviews[data.id]) {
      calculatedRating = Number((reviews[data.id].totalRating / reviews[data.id].count).toFixed(1));
    }

    const normalized = normalize({
      ...data,
      category: primaryCategory,
      categories,
      _sellerName: info?.name,
      _sellerPhone: info?.phone,
      _sellerAddress: info?.address,
      _sellerLat: info?.lat,
      _sellerLng: info?.lng,
      _waClicks: waClicks[data.id] ?? 0,
      rating: calculatedRating
    });

    if (normalized.slug) {
      productCache[normalized.slug] = normalized;
    }

    return normalized;
  } catch (err) {
    console.error("Unexpected error fetching product:", err);
    return null;
  }
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
  try {
    const { data, error } = await supabase
      .from("products")
      .select("*, product_categories(category_id), product_variants(*)")
      .eq("featured", true)
      .eq("is_active", true);

    if (error) {
      console.error("Error fetching featured products:", error);
      return [];
    }

    const products = data || [];
    const sellerIds = [...new Set(products.map((p: any) => p.seller_id).filter(Boolean))];
    const [, waClicks, reviews] = await Promise.all([
      Promise.all(sellerIds.map(fetchSellerInfo)),
      fetchWaClickCounts(),
      fetchAllReviews(),
    ]);

    return products.map((raw: any) => {
      const info = sellerCache[raw.seller_id];
      const categories = raw.product_categories?.map((pc: any) => pc.category_id) || [];
      const primaryCategory = categories[0] || "general";

      let calculatedRating = raw.rating ?? 0;
      if (reviews[raw.id]) {
        calculatedRating = Number((reviews[raw.id].totalRating / reviews[raw.id].count).toFixed(1));
      }

      return normalize({
        ...raw,
        category: primaryCategory,
        categories,
        _sellerName: info?.name,
        _sellerPhone: info?.phone,
        _sellerAddress: info?.address,
        _sellerLat: info?.lat,
        _sellerLng: info?.lng,
        _waClicks: waClicks[raw.id] ?? 0,
        rating: calculatedRating
      });
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

    // Invalidate reviews cache
    reviewsCache = null;

    return true;
  } catch (err) {
    console.error("Unexpected error submitting review:", err);
    return false;
  }
}
