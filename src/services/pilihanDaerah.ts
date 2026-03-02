import type { PilihanResponse, PilihanItem, PilihanSeller } from '../types/pilihanDaerah';

// Cache entry interface
type CacheEntry = {
  at: number;                // timestamp
  resp: PilihanResponse;     // last JSON
  etag?: string | null;      // weak or strong ETag
};

// Module-level cache
const CACHE = new Map<string, CacheEntry>();
const CACHE_TTL = 5 * 60 * 1000; // 5 minutes

// Helper function to create stable cache key
function cacheKey(params: Record<string, any>): string {
  const sortedKeys = Object.keys(params).sort();
  const sortedParams: Record<string, any> = {};
  sortedKeys.forEach(key => {
    if (params[key] !== undefined && params[key] !== null) {
      sortedParams[key] = params[key];
    }
  });
  return JSON.stringify(sortedParams);
}

// Helper function to add timeout to promises
async function withTimeout<T>(
  promise: Promise<T>, 
  ms: number, 
  signal?: AbortSignal
): Promise<T> {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), ms);
  
  // If external signal is provided, listen to it
  if (signal) {
    signal.addEventListener('abort', () => controller.abort());
  }
  
  try {
    const result = await Promise.race([
      promise,
      new Promise<never>((_, reject) => 
        controller.signal.addEventListener('abort', () => 
          reject(new Error('Request timeout'))
        )
      )
    ]);
    clearTimeout(timeoutId);
    return result;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
}

// Runtime validation helpers
function isValidPilihanItem(item: any): item is PilihanItem {
  return (
    typeof item === 'object' &&
    item !== null &&
    typeof item.id === 'string' &&
    typeof item.name === 'string' &&
    typeof item.price === 'number' &&
    typeof item.unit === 'string' &&
    (typeof item.stock === 'number' || item.stock === null) &&
    typeof item.image === 'string' &&
    typeof item.seller === 'object' &&
    item.seller !== null &&
    typeof item.seller.id === 'string' &&
    typeof item.seller.name === 'string' &&
    typeof item.seller.wa === 'string' &&
    ['order_again', 'staple', 'nearby'].includes(item.reason)
  );
}

function isValidPilihanResponse(data: any): data is PilihanResponse {
  return (
    typeof data === 'object' &&
    data !== null &&
    typeof data.region_label === 'string' &&
    ['order_again', 'staple', 'nearby'].includes(data.tab) &&
    Array.isArray(data.items)
  );
}

// Sanitize and normalize data
function sanitizeItem(item: PilihanItem): PilihanItem {
  return {
    ...item,
    name: item.name.trim(),
    image: item.image.trim(),
    seller: {
      ...item.seller,
      name: item.seller.name.trim(),
      wa: item.seller.wa.trim()
    }
  };
}

// Create fallback data when server returns empty items
function createFallbackItems(regionLabel: string): PilihanItem[] {
  const fallbackSeller: PilihanSeller = {
    id: 'fallback-seller',
    name: 'Local Seller',
    wa: '+6281234567890'
  };

  return [
    {
      id: 'fallback-1',
      name: 'Kopi Semendo (Fallback)',
      price: 45000,
      unit: '/250g',
      stock: 10,
      image: 'https://images.unsplash.com/photo-1447933601403-0c6688de566e?auto=format&fit=crop&w=800&h=800&q=70',
      seller: fallbackSeller,
      reason: 'nearby',
      distance_km: 2.5
    },
    {
      id: 'fallback-2',
      name: 'Gula Aren (Fallback)',
      price: 38000,
      unit: '/500g',
      stock: 15,
      image: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&h=800&q=70',
      seller: fallbackSeller,
      reason: 'nearby',
      distance_km: 3.2
    }
  ];
}

export async function fetchPilihanDaerah(params: {
  lat?: number;
  lng?: number;
  userId?: string;
  region?: string;
  tab?: 'order_again' | 'staple' | 'nearby';
  signal?: AbortSignal;
}): Promise<PilihanResponse> {
  // Check cache first
  const key = cacheKey(params);
  const entry = CACHE.get(key);
  
  // Offline fast-path
  const online = typeof navigator !== 'undefined' ? navigator.onLine !== false : true;
  if (!online) {
    if (entry && Date.now() - entry.at < CACHE_TTL) {
      return entry.resp;
    }
    throw new Error('Offline and no cached data available');
  }
  
  if (entry && Date.now() - entry.at < CACHE_TTL) {
    return entry.resp;
  }

  // Build URL with only existing parameters
  const urlParams = new URLSearchParams();
  if (params.lat !== undefined) urlParams.set('lat', params.lat.toString());
  if (params.lng !== undefined) urlParams.set('lng', params.lng.toString());
  if (params.userId !== undefined) urlParams.set('userId', params.userId);
  if (params.region !== undefined) urlParams.set('region', params.region);
  if (params.tab !== undefined) urlParams.set('tab', params.tab);

  const url = `/pilihan-daerah?${urlParams.toString()}`;

  try {
    // Build headers with ETag if available
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    };
    if (entry?.etag) {
      headers['If-None-Match'] = entry.etag;
    }

    // Create fetch promise with timeout
    const fetchPromise = fetch(url, {
      method: 'GET',
      headers,
      signal: params.signal
    });

    const response = await withTimeout(fetchPromise, 5000, params.signal);

    // Handle 304 Not Modified
    if (response.status === 304 && entry) {
      // Refresh timestamp to extend TTL
      entry.at = Date.now();
      return entry.resp;
    }

    if (!response.ok) {
      throw new Error(`HTTP ${response.status}: ${response.statusText}`);
    }

    let rawData;
    try {
      rawData = await response.json();
    } catch (parseError) {
      throw new Error('Invalid JSON response from server');
    }

    // Runtime validation
    if (!isValidPilihanResponse(rawData)) {
      throw new Error('Invalid response format from server');
    }

    // Validate and sanitize items
    const validItems: PilihanItem[] = [];
    for (const item of rawData.items) {
      if (isValidPilihanItem(item)) {
        validItems.push(sanitizeItem(item));
      }
    }

    // Create response object
    let responseData: PilihanResponse = {
      region_label: rawData.region_label,
      tab: rawData.tab,
      items: validItems
    };

    // Provide fallback if no items
    if (validItems.length === 0) {
      responseData = {
        region_label: rawData.region_label || 'Unknown Region',
        tab: params.tab || 'nearby',
        items: createFallbackItems(rawData.region_label || 'Unknown Region')
      };
    }

    // Read ETag from response
    const etag = response.headers.get('ETag');

    // Cache the result
    CACHE.set(key, {
      at: Date.now(),
      resp: responseData,
      etag
    });

    return responseData;

  } catch (error) {
    // If we have cached data (even if expired), return it as fallback
    if (entry) {
      return entry.resp;
    }

    // If no cache, provide basic fallback
    return {
      region_label: params.region || 'Unknown Region',
      tab: params.tab || 'nearby',
      items: createFallbackItems(params.region || 'Unknown Region')
    };
  }
}

export function clearPilihanCache(): void {
  CACHE.clear();
}
